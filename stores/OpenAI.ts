import * as http from "http";
import https from "https";
import { Message, truncateMessages } from "./Message";
import encoder from "@nem035/gpt-3-encoder";
import axios from "axios";
import { notifications } from "@mantine/notifications";

const countTokens = (text: string) => encoder.encode(text).length;

export function assertIsError(e: any): asserts e is Error {
  if (!(e instanceof Error)) {
    throw new Error("Not an error");
  }
}

async function fetchFromAPI(endpoint: string, key: string) {
  try {
    const res = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
    return res;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error(e.response?.data);
    }
    throw e;
  }
}

export async function testKey(key: string): Promise<boolean | undefined> {
  try {
    const res = await fetchFromAPI("https://api.openai.com/v1/models", key);
    return res.status === 200;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response!.status === 401) {
        return false;
      }
    }
  }
}

export async function fetchModels(key: string): Promise<string[]> {
  try {
    const res = await fetchFromAPI("https://api.openai.com/v1/models", key);
    return res.data.data.map((model: any) => model.id);
  } catch (e) {
    return [];
  }
}

export async function _streamCompletion(
  payload: string,
  apiKey: string,
  abortController?: AbortController,
  callback?: ((res: http.IncomingMessage) => void) | undefined,
  errorCallback?: ((res: http.IncomingMessage, body: string) => void) | undefined
) {
  const req = http.request(
  // const req = https.request(
    {      
      // hostname: "api.openai.com",
      // port: 443,
      // path: "/v1/chat/completions",     
      hostname: "127.0.0.1",
      port: 5000,
      path: "/stream",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: abortController?.signal,
    },
    (res) => {
      console.log("res!!!")
      console.log(res)
      console.log(res.statusCode)
      if (res.statusCode !== 200) {
        let errorBody = "";
        res.on("data", (chunk) => {
          console.log("on data")
          console.log(chunk)
          errorBody += chunk;
        });
        res.on("end", () => {
          console.log("on end")
          // console.log(chunk)

          errorCallback?.(res, errorBody);
        });
        return;
      }
      debugger
      callback?.(res);
    }
  );

  req.write(payload);

  req.end();
}

interface ChatCompletionParams {
  model: string;
  temperature: number;
  top_p: number;
  n: number;
  stop: string;
  max_tokens: number;
  presence_penalty: number;
  frequency_penalty: number;
  logit_bias: string;
}

const paramKeys = [
  "model",
  "temperature",
  "top_p",
  "n",
  "stop",
  "max_tokens",
  "presence_penalty",
  "frequency_penalty",
  "logit_bias",
];

export async function streamCompletion(
  messages: Message[],
  params: ChatCompletionParams,
  apiKey: string,
  abortController?: AbortController,
  callback?: ((res: http.IncomingMessage) => void) | undefined,
  endCallback?: ((tokensUsed: number) => void) | undefined,
  errorCallback?: ((res: http.IncomingMessage, body: string) => void) | undefined
) {
  const submitMessages = truncateMessages(messages, 4096 - params.max_tokens);
  console.log(`Sending ${submitMessages.length} messages:`);
  console.log(submitMessages.map((m) => m.content.slice(0, 50)).join("\n"));

  // Pick all params in paramKeys
  const submitParams = Object.fromEntries(
    Object.entries(params).filter(([key]) => paramKeys.includes(key))
  );

  const payload = JSON.stringify({
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
    ...{
      ...submitParams,
      logit_bias: JSON.parse(params.logit_bias || "{}"),
    },
  });

  let buffer = "";
  const successCallback = (res: http.IncomingMessage) => {
    console.log("successCallback before on data")
    res.on("data", (chunk) => {
      console.log("successCallback after on data")
      if (abortController?.signal.aborted) {
        res.destroy();
        endCallback?.(0);
        return;
      }
      console.log("CHUNK!!!")
      console.log(chunk)
      const allMessages = chunk.toString().split("\n\n");
      console.log(allMessages) // This is the returned message!!!
      for (const message of allMessages) {
        const cleaned = message.toString().slice(5);
        if (cleaned === "[DONE]") {
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch (e) {
          return;
        }

        const content = parsed.choices[0]?.delta?.content;
        if (content === undefined) {
          continue;
        }
        buffer += content;
        callback?.(content);
      }
    });

    res.on("end", () => {
      console.log("on endddddd")
      const tokensUsed =
        countTokens(submitMessages.map((m) => m.content).join("\n")) +
        countTokens(buffer);
      endCallback?.(tokensUsed);
    });
  };

  return _streamCompletion(
    payload,
    apiKey,
    abortController,
    successCallback,
    errorCallback
  );
}

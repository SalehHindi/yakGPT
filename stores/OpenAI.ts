import * as http from "http";
import https from "https";
import { Message, truncateMessages } from "./Message";
import encoder from "@nem035/gpt-3-encoder";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { useUser } from '@auth0/nextjs-auth0/client';

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
  callback?: ((res: any) => void) | undefined,
  errorCallback?: ((res: any, body: string) => void) | undefined
) {
  const req = https.request(
  // const req = https.request(
    {      
      hostname: "app.alumin.ai",
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
      // debugger
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
  activeChatId?: String, 
  userId?: String,
  abortController?: AbortController,
  callback?: ((res: any) => void) | undefined,
  endCallback?: ((tokensUsed: number) => void) | undefined,
  errorCallback?: ((res: any, body: string) => void) | undefined
) {
  // alert("hi")
  // console.log("User")
  // console.log(user)

  const submitMessages = truncateMessages(messages, 4096 - params.max_tokens);
  console.log(`Sending ${submitMessages.length} messages:`);
  console.log(submitMessages.map((m) => m.content.slice(0, 50)).join("\n"));

  // Pick all params in paramKeys
  const submitParams = Object.fromEntries(
    Object.entries(params).filter(([key]) => paramKeys.includes(key))
  );

  const payload = JSON.stringify({
    chatId: activeChatId,
    userId: userId,
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
    ...{
      ...submitParams,
      logit_bias: JSON.parse(params.logit_bias || "{}"),
    },
  });

  let buffer = "";
  const successCallback = (res: any) => {
    console.log("successCallback before on data")
    res.on("data", (chunk:any) => {
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
     
    //   [
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\" from\"},\"index\":0,\"finish_reason\":null}]}",
    //     ""
    // ]

    //   [
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\" \"},\"index\":0,\"finish_reason\":null}]}",
    //     ""
    // ]

    //   [
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\"178\"},\"index\":0,\"finish_reason\":null}]}",
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\"9\"},\"index\":0,\"finish_reason\":null}]}",
    //     ""
    // ]

    //   [
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\"-\"},\"index\":0,\"finish_reason\":null}]}",
    //     ""
    // ]

    //   [
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\"179\"},\"index\":0,\"finish_reason\":null}]}",
    //     ""
    // ]

    //   [
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\"7\"},\"index\":0,\"finish_reason\":null}]}",
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{\"content\":\".\"},\"index\":0,\"finish_reason\":null}]}",
    //     ""
    //   ]


    //   [
    //     "data: {\"id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",\"object\":\"chat.completion.chunk\",\"created\":1680383676,\"model\":\"gpt-3.5-turbo-0301\",\"choices\":[{\"delta\":{},\"index\":0,\"finish_reason\":\"stop\"}]}",
    //     "data: [DONE]",
    //     ""
    //   ]      


    // 
    // 
    // 
    // My response: 
      // "{\"data\": {\"id\": \"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\", \"object\": \"chat.completion.chunk\", \"created\": 1680383676, \"model\": \"gpt-3.5-turbo-0301\", \"choices\": [{\"delta\": {\"content\": \"next chunk!!\"}, \"index\": 0, \"finish_reason\": null}]}}"
      for (const message of allMessages) {
        console.log("message")
        console.log(message)
        const cleaned = "\{\"" + message.toString().slice(2);
        console.log("cleaned")
        console.log(cleaned)
        if (cleaned === "[DONE]") {
          return;
        }

        // WTFF is going on here???
        let parsed;
        let content
        try {
          parsed = JSON.parse(cleaned).data;
          console.log("waterfall")
          console.log(parsed)
          console.log(parsed.choices[0])
          console.log(parsed.choices[0]?.delta)
          console.log(parsed.choices[0]?.delta?.content)
          content = parsed.choices[0]?.delta?.content;
  
          console.log("PARSED")

          try {
            content = message
          } catch (e) {
            console.log("ERROR2")
            console.log(e)

            content = ""
  
          }
        } catch (e) {
          console.log("ERROR1")
          console.log(e)
          return;
        }

        if (content === undefined) {
          continue;
        }
        buffer += content;
        console.log("BUFFER+=")
        console.log(buffer)
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

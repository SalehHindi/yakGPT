from flask_cors import CORS
import os
from flask import Flask, jsonify, send_from_directory, request, Response, stream_with_context
from flask_cors import CORS
import os
import json
import time

import pickle
import openai

import requests
import json
import sseclient


# from langchain import OpenAI
from langchain.agents import Tool
from langchain.memory import ConversationBufferMemory
from langchain.memory import ChatMessageHistory
from langchain.utilities import GoogleSearchAPIWrapper
from langchain.agents import initialize_agent

from langchain import OpenAI, ConversationChain, LLMChain, PromptTemplate
from langchain.memory import ConversationBufferWindowMemory


"""Util that calls Google Search."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Extra, root_validator
from langchain.utils import get_from_dict_or_env

from langchain.llms import PromptLayerOpenAI
import promptlayer
promptlayer.api_key = "pl_2165376193707c1ecd2b9044bfee557c"
openai.api_key = "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"

# OPENAI_API_KEY="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" GOOGLE_API_KEY="AIzaSyCZ-U4cMFOToCg2U4l2WPFyWi3zr76Oepk" GOOGLE_CSE_ID="e5882f618fe364ab2" flask run --port 5000

def save_chat(chat_id, chat_history):
    with open(f"chat_id_{chat_id}.txt", 'wb') as file:
        pickle.dump(chat_history, file)

def load_chat(chat_id):
    with open(f"chat_id_{chat_id}.txt", 'rb') as file:
        loaded_list = pickle.load(file)
        return loaded_list

def run_chat(chat_history):
    pass

app = Flask(__name__)
CORS(app)

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Hello from the Flask backend!"})

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    if path != "" and os.path.exists(os.path.join(".", path)):
        return send_from_directory("../", path)
    else:
        return send_from_directory("../", "index.html")

@app.route("/chat", methods=['POST'])
def chat():
    # TODO:
    # chat history is prompt: XXX, message:[ "", role: "human/AI" ]}
    # history is a list of valid chunks
    # Add vanilla gpt-3.5-turbo
    # 
    if request.method == 'POST':
        data = request.get_json()

        chat_id = data.get('chatId')
        chat_history = data.get('chat_history')
        # Really, chat_history should be a list of valid chunks like
        # Thought:
        # Action:
        # Observation:

        # Then you add memory all together
        new_message = data.get('new_message')


        search = GoogleSearchAPIWrapper()
        tools = [
            Tool(
                name = "Current Search",
                func=search.run,
                description="useful for when you need to answer any factual questions"
            ),
        ]

        memory = ConversationBufferMemory(memory_key="chat_history")

        # memory = ConversationBufferMemory()

        # for i, message in enumerate(chat_history.get("messages")):
        #     if i%2==0:
        #         memory.chat_memory.add_user_message(message)
        #     else:
        #         memory.chat_memory.add_ai_message(message)
        


        # memory.load_memory_variables({})

        # dicts = messages_to_dict(history.messages)
        # new_messages = messages_from_dict(dicts)

        llm = PromptLayerOpenAI(temperature=0, pl_tags=["fintainium", chat_id])
        # llm=OpenAI(temperature=0)

        # This is the promot the agent chain is using
        # initialize_agent calls the agent loader which loads "conversational-react-description": https://github.com/hwchase17/langchain/blob/master/langchain/agents/initialize.py
        # "conversational-react-description" ponts to ConversationalAgent: https://github.com/hwchase17/langchain/blob/master/langchain/agents/loading.py
        # ConversationalAgent uses: https://github.com/hwchase17/langchain/blob/master/langchain/agents/conversational/base.py
        # conversational prompt: https://github.com/hwchase17/langchain/blob/master/langchain/agents/conversational/prompt.py

        # TODO: Add agent from config file
        agent_chain = initialize_agent(tools, llm, agent="conversational-react-description", verbose=True, memory=memory)

        # chat chain
        # chat chain
        # chat chain
        # template = """Assistant is a large language model trained by OpenAI.

        # Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

        # Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

        # Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

        # {history}
        # Human: {human_input}
        # Assistant:"""

        # prompt = PromptTemplate(
        #     input_variables=["history", "human_input"], 
        #     template=template
        # )

        # chatgpt_chain = LLMChain(
        #     llm=llm, 
        #     prompt=prompt, 
        #     verbose=True, 
        #     memory=memory,
        # )
        # output = chatgpt_chain.predict(human_input="I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English I will do so by putting text inside curly brackets {like this}. My first command is pwd.")
        # print(output)



        # Handle from POST Request
        # user_input = "hello world"
        response = agent_chain.run(input=new_message)

        return response

@app.route("/chat2", methods=['POST'])
def chat2():
    if request.method == 'POST':
        data = request.get_json()

        chat_id = data.get('chatId')
        chat_history = data.get('chat_history')
        new_message = data.get('new_message')

        memory = ConversationBufferMemory(memory_key="history")

        # memory.chat_memory.add_system_message(prompt)
        for i, message in enumerate(chat_history.get("messages")):
            if i%2==0:
                memory.chat_memory.add_user_message(message)
            else:
                memory.chat_memory.add_ai_message(message)
        chat_history = memory.load_memory_variables({}).get("history")

        # import pdb; pdb.set_trace()
        llm = PromptLayerOpenAI(temperature=0, pl_tags=["fintainium", chat_id])

        template = """Assistant is a large language model trained by OpenAI.

        Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

        Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

        Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

        {history}
        Human: {human_input}
        AI:"""

        prompt = PromptTemplate(
            input_variables=["history", "human_input"], 
            template=template
        )

        conversationChain = ConversationChain(
            llm=llm, 
            verbose=True, 
            memory=memory,
            # prompt=prompt,
        )
        output = conversationChain.predict(
            input=new_message
        )
        print(output)
        return output


@app.route("/chat3", methods=['POST'])
def chat3():
    # Meant to directly implement gpt-3.5-turbo
    # input should be [{role: X, content: Y}]
    if request.method == 'POST':
        data = request.get_json()

        import pdb; 

        chat_id = data.get('chatId')
        chat_history = data.get('chat_history')
        new_message = data.get('new_message')

        all_messages = chat_history + [{"role": "user", "content": new_message }]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=all_messages,
        )

        assistant_message = {
            "role": response.choices[0].message.role,
            "content": response.choices[0].message.content,
        }
        all_messages += assistant_message

        pdb.set_trace()

        # TODO: add new message as system
        # TODO: return all messages
    
        save_chat(chat_id, all_messages)

        
        return json.dumps(all_messages)


@app.route("/chat-history", methods=['GET'])
def chat_history():
    if request.method == 'GET':
        chat_id = request.args.get('chatId')

        if chat_id:
            chat_history = load_chat(chat_id)
            # import pdb;pdb.set_trace()
            return json.dumps(chat_history)

    return json.dumps("")

def number_stream():
    number = 0
    while number < 4:
        yield f"Heck!!!\n"
        number += 1
        time.sleep(1)


def performRequestWithStreaming():
    reqUrl = 'https://api.openai.com/v1/completions'
    reqHeaders = {
        'Accept': 'text/event-stream',
        'Authorization': 'Bearer ' + API_KEY
    }
    reqBody = {
      "model": "gpt-3.5-turbo",
      "prompt": "What is Python?",
      "max_tokens": 100,
      "temperature": 0,
      "stream": True,
    }
    request = requests.post(reqUrl, stream=True, headers=reqHeaders, json=reqBody)
    client = sseclient.SSEClient(request)
    for event in client.events():
        if event.data != '[DONE]':
            yield json.loads(event.data)['choices'][0]['text']


@app.route('/stream', methods=["POST"])
def stream_response():
    print("Hit streammmm")
    data = request.get_json()
    messages = data.get("messages", [])
    # import pdb; pdb.set_trace()

    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", 
        messages = messages
    )
    assistant_response = completion.choices[0].message.content
    message = {
        "role": "assistant",
        "message": assistant_response,
    }
    # import pdb; pdb.set_trace()

    # return Response(stream_with_context(number_stream()), content_type='application/json')
    return Response(stream_with_context(assistant_response), content_type='application/json')

# @app.route("/chat-history-save", methods=['POST'])
# def chat_history_save():
#     if request.method == 'POST':
#         data = request.get_json()

#         chat_id = data.get('chatId')
#         chat_history = data.get('chat_history')

#         save_chat(chat_id, chat_history)


# This is what is sent to OpenAI Completions which is what should be sent to me
# {
#     "messages": [
#         {
#             "role": "system",
#             "content": "I’m having trouble with a scene in my screenplay where a person has a conversation with a Therapist.\n\n Description: World-class therapist with a specialization in Cognitive Behavioral Therapy\n\nI have written all of the person's lines already, but I haven’t written any of the lines for the Therapist. So what I’d like to do is give you the person’s lines, and have you provide a response for the Therapist.\nI’ll give you the person’s lines one at a time, so only give me a single line of dialogue from the Therapist each time, and then wait for me to tell you the next line from the person, and we’ll simply repeat that process until the scene is complete.\n\nStay in character!\n\nThe person’s first line is:\n\nHello\n"
#         },
#         {
#             "role": "assistant",
#             "content": "Hello, how are you feeling today?"
#         },
#         {
#             "role": "user",
#             "content": "Eanie Meani minie"
#         },
#         {
#             "role": "assistant",
#             "content": ""
#         }
#     ],
#     "stream": true,
#     "model": "gpt-3.5-turbo",
#     "temperature": 1,
#     "top_p": 1,
#     "n": 1,
#     "stop": "",
#     "max_tokens": 1024,
#     "presence_penalty": 0,
#     "frequency_penalty": 0,
#     "logit_bias": {}
# }



if __name__ == '__main__':
    app.run(port=5000)


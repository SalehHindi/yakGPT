from flask_cors import CORS, cross_origin
import os
from flask import Flask, jsonify, send_from_directory, request, Response, stream_with_context
import os
import json
import time
import datetime

import pickle

import requests
import json
import sseclient

import pdb

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
openai = promptlayer.openai

# TODO: This should be in an env and per user
promptlayer.api_key = ""
openai.api_key = ""


chatTemplate1 = """Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

{history}
Assistant:"""



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

        llm = PromptLayerOpenAI(temperature=0, pl_tags=["fintech", chat_id])
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
        llm = PromptLayerOpenAI(temperature=0, pl_tags=["fintech", chat_id])

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
    chatId = data.get("chatId", 'chatIdUnknown')
    model = data.get("model", 'gpt-3.5-turbo')
    userId = data.get("userId", "Saleh1"),

    current_date = datetime.datetime.now()
    formatted_date = current_date.strftime('%Y-%m-%d')
    epoch_time = int(current_date.timestamp())

    completion = openai.ChatCompletion.create(
        model=model, 
        messages = messages,
        # stream=True
        pl_tags=[f"User: {userId}", model, formatted_date, chatId], # TODO: Should add dev, prod, model    
    )
    assistant_response = completion.choices[0].message.content

    resp = {"data": {
        "id": "chatcmpl-70cqSAME6tnj64Sv7Mpf--------STFU",
        "object": "chat.completion.chunk",
        "created": epoch_time,
        "model": "gpt-3.5-turbo-0301",
        "choices": [
            {
                "delta": {"content": assistant_response},
                "index": 0,
                "finish_reason": 'null? ',
            }
        ],
    }}

    # This is what gets returned from openAI streaming request. Note that we are streaming and returning a
    # [
    # data: {\
    #     "id\":\"chatcmpl-70cqSAME6tnj64Sv7Mpfcw1GxT3gu\",
    #     \"object\":\"chat.completion.chunk\",
    #     \"created\":1680383676,
    #     \"model\":\"gpt-3.5-turbo-0301\",
    #     \"choices\":[
    #         {\"delta\":{
    #             \"content\":\" from\"
    #         },
    #         \"index\":0,
    #         \"finish_reason\":null}
    #     ]
    # }
    # ]

    # return Response(stream_with_context(number_stream()), content_type='application/json')
    # return Response(stream_with_context(json.dumps(resp)), content_type='application/json')
    return Response(json.dumps(resp), content_type='application/json')


@app.route('/agent', methods=["POST"])
def agent_respond():
    # This is for chats processed by not chat models, like text-davinci-003
    # requests come in as the following
    # 
    # {'chatId': 'chat12345',
    #  'frequency_penalty': 0,
    #  'logit_bias': {},
    #  'max_tokens': 1024,
    #  'messages': [{'content': 'Who is there?', 'role': 'assistant'},
    #               {'content': 'As an AI language model, I am a computer program, '
    #                           'so I don\'t "exist" in the physical sense. However, '
    #                           'I am here and ready to assist you! How can I help '
    #                           'you today?',
    #                'role': 'user'},
    #               {'content': 'Who is mike tyson?', 'role': 'assistant'},
    #               {'content': 'Mike Tyson is a retired American professional boxer '
    #                           'who is considered one of the greatest heavyweight '
    #                           'boxers of all time. He was born on June 30, 1966, '
    #                           'in Brooklyn, New York, and had a career spanning '
    #                           'from 1985 to 2005. Tyson held multiple heavyweight '
    #                           'titles, including the WBA, WBC, and IBF titles, and '
    #                           'was known for his powerful punching and aggressive '
    #                           'fighting style. He retired with a record of 50 '
    #                           'wins, 6 losses, and 2 no contests. Tyson is also '
    #                           'known for his tumultuous personal life and various '
    #                           'legal issues, as well as his later career as an '
    #                           'actor and media personality.',
    #                'role': 'user'},
    #               {'content': 'Hello?', 'role': 'assistant'},
    #               {'content': 'Hello! How may I assist you today?', 'role': 'user'},
    #               {'content': 'Hello?', 'role': 'assistant'},
    #               {'content': 'Hello there! How can I assist you today?',
    #                'role': 'user'},
    #               {'content': 'Hey?', 'role': 'assistant'},
    #               {'content': '', 'role': 'user'},
    #               {'content': 'Bob saget?', 'role': 'user'},
    #               {'content': '', 'role': 'assistant'}],
    #  'model': 'gpt-3.5-turbo',
    #  'n': 1,
    #  'presence_penalty': 0,
    #  'stop': '',
    #  'stream': True,
    #  'temperature': 1,
    #  'top_p': 1}
    # 
    # 
    # And then I need to format it into a chatbot and then output the result in the same resp shape as chat-gpt

    print("Hit stream 22")
    data = request.get_json()
    messages = data.get("messages", [])
    chatId = data.get("chatId", 'chatIdUnknown')
    model = data.get("model", 'text-davinci-003')
    userId = "Saleh"

    current_date = datetime.datetime.now()
    formatted_date = current_date.strftime('%Y-%m-%d')
    epoch_time = int(current_date.timestamp())

    # TODO: Should system prompt actually be the prompt?
    history = "" # TODO: Limit messages so it's only ~2k tokens    
    for message in messages[:-1]: # skip the last message bc it is blank
        if message['role'] == "assistant":
            history += f"Human: {message['content']}\n"
        elif message['role'] == "user":
            history += f"Assistant: {message['content']}\n"
        else: # system?
            pass

        
    prompt = PromptTemplate(
        input_variables=["history"], 
        template=chatTemplate1
    )

    llm = PromptLayerOpenAI(
        temperature=0, 
        pl_tags=[f"User:{userId}", model, formatted_date, chatId], # TODO: Should add dev, prod, model
    )

    chain = LLMChain(llm=llm, prompt=prompt)

    assistant_response = chain.run(
        # human_input="I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English I will do so by putting text inside curly brackets {like this}. My first command is pwd.",
        history=history
    )

    resp = {"data": {
        "id": "chatcmpl-70cqSAME6tnj64Sv7Mpf--------STFU",
        "object": "chat.completion.chunk",
        "created": epoch_time,
        "model": "text-davinci-003",
        "choices": [
            {
                "delta": {"content": assistant_response},
                "index": 0,
                "finish_reason": 'null? ',
            }
        ],
    }}

    return Response(stream_with_context(json.dumps(resp)), content_type='application/json')

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


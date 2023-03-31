import sys

import promptlayer
from langchain.llms import PromptLayerOpenAI
import openai

promptlayer.api_key = "pl_2165376193707c1ecd2b9044bfee557c"
openai = promptlayer.openai

# Read input from stdin
for line in sys.stdin:
    # Process input
    print(f"You entered: {line.strip()}")

    log_file = line.strip()


    SYSTEM_PROMPT1 = ""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content" : SYSTEM_PROMPT1},
            {"role": "user", "content" : f"You are a Stack Overflow Post. You are given an error message from a Python flask program. Please explain what the following error means and propose 3 fixes along with the tools you should use for each fix.\n{log_file}"},
        ],
        pl_tags=["test-observability", "1"]
    )

    assistant_message = {
        "role": response.choices[0].message.role,
        "content": response.choices[0].message.content,
    }

    print(f"Terminal Output:\n\n")
    print(log_file)
    print(f"LLM Output:\n\n")
    print(response.choices[0].message.content)

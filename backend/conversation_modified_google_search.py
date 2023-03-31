import openai

from langchain import OpenAI
from langchain.agents import Tool
from langchain.memory import ConversationBufferMemory
# from langchain.utilities import GoogleSearchAPIWrapper
from langchain.agents import initialize_agent

"""Util that calls Google Search."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Extra, root_validator
from langchain.utils import get_from_dict_or_env

from langchain.llms import PromptLayerOpenAI
import promptlayer
promptlayer.api_key = ""





# Google Search API Key
# https://console.cloud.google.com/apis/credentials

# my_cse_id
# http://www.google.com/cse/ -- all web
# <script async src="https://cse.google.com/cse.js?cx=e5882f618fe364ab2">
# </script>
# <div class="gcse-search"></div>


class GoogleSearchAPIWrapper(BaseModel):
    """Wrapper for Google Search API.
    """

    search_engine: Any  #: :meta private:
    google_api_key: Optional[str] = None
    google_cse_id: Optional[str] = None
    k: int = 10

    class Config:
        """Configuration for this pydantic object."""

        extra = Extra.forbid

    def _google_search_results(self, search_term: str, **kwargs: Any) -> List[dict]:
        print(f"_google_search_results.search_term: {search_term}")

        search_term_updated = f"site:linkedin.com inurl:'posts' {search_term}"
        print(f"_google_search_results.search_term_updated: {search_term_updated}")

        # This is how you add time ranges
        time_range = "7d"
        res = (
            self.search_engine.cse()
            .list(
                q=search_term_updated,
                cx=self.google_cse_id, 
                dateRestrict=time_range,
                **kwargs
            )
            .execute()
        )
        return res.get("items", [])

    @root_validator()
    def validate_environment(cls, values: Dict) -> Dict:
        """Validate that api key and python package exists in environment."""
        google_api_key = get_from_dict_or_env(
            values, "google_api_key", "GOOGLE_API_KEY"
        )
        values["google_api_key"] = google_api_key

        google_cse_id = get_from_dict_or_env(values, "google_cse_id", "GOOGLE_CSE_ID")
        values["google_cse_id"] = google_cse_id

        try:
            from googleapiclient.discovery import build

        except ImportError:
            raise ImportError(
                "google-api-python-client is not installed. "
                "Please install it with `pip install google-api-python-client`"
            )

        service = build("customsearch", "v1", developerKey=google_api_key)
        values["search_engine"] = service

        return values

    # Is the idea to pass in kwargs like dateRestrict=time_range to be able to define the chain how you want?
    # What would be the generalizable and composable way to do this? 
    # Like if I had my own google tricks "insite:<> etc" how can I code this?
    # Maybe I define a base query, with adjustable date range, etc?
    # https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
    def run(self, query: str) -> str:
        print(f"run.query: {query}")
        """Run query through GoogleSearch and parse result."""
        snippets = []
        results = self._google_search_results(query, num=self.k)
        if len(results) == 0:
            return "No good Google Search Result was found"
        for result in results:
            if "snippet" in result:
                snippets.append(result["snippet"])

        return " ".join(snippets)

    def results(self, query: str, num_results: int) -> List[Dict]:
        """Run query through GoogleSearch and return metadata.

        Args:
            query: The query to search for.
            num_results: The number of results to return.

        Returns:
            A list of dictionaries with the following keys:
                snippet - The description of the result.
                title - The title of the result.
                link - The link to the result.
        """
        metadata_results = []
        results = self._google_search_results(query, num=num_results)
        if len(results) == 0:
            return [{"Result": "No good Google Search Result was found"}]
        for result in results:
            metadata_result = {
                "title": result["title"],
                "link": result["link"],
            }
            if "snippet" in result:
                metadata_result["snippet"] = result["snippet"]
            metadata_results.append(metadata_result)

        return metadata_results


search = GoogleSearchAPIWrapper()
tools = [
    Tool(
        name = "Current Search",
        func=search.run,
        description="useful for when you need to answer any factual questions"
    ),
]
# How can I specify a query like "site:linkedin.com inurl:posts {query}?"

memory = ConversationBufferMemory(memory_key="chat_history")

llm = PromptLayerOpenAI(temperature=0, pl_tags=["fintainium"])
# llm=OpenAI(temperature=0)

# This is the promot the agent chain is using
# initialize_agent calls the agent loader which loads "conversational-react-description": https://github.com/hwchase17/langchain/blob/master/langchain/agents/initialize.py
# "conversational-react-description" ponts to ConversationalAgent: https://github.com/hwchase17/langchain/blob/master/langchain/agents/loading.py
# ConversationalAgent uses: https://github.com/hwchase17/langchain/blob/master/langchain/agents/conversational/base.py
# conversational prompt: https://github.com/hwchase17/langchain/blob/master/langchain/agents/conversational/prompt.py

# TODO: Add agent from config file
agent_chain = initialize_agent(tools, llm, agent="conversational-react-description", verbose=True, memory=memory)


while True:
    user_input = input("User:")
    agent_chain.run(input=user_input)




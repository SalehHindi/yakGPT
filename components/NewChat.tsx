import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "@/stores/ChatStore";
import { Container, rem, useMantineTheme } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import BGCard from "./BGCard";
import { useUser } from '@auth0/nextjs-auth0/client';

import img1 from "../public/chars/img1.png";
import img2 from "../public/chars/img2.png";
import img3 from "../public/chars/img3.png";
import img4 from "../public/chars/img4.png";
import img5 from "../public/chars/img5.png";
import img6 from "../public/chars/img6.png";
import img7 from "../public/chars/img7.png";
import idea_generator from "../public/chars/idea_generator.png";
import marcus_aurelius from "../public/chars/marcus_aurelius.png";
import oprah from "../public/chars/oprah.png";
import philosopher from "../public/chars/philosopher.png";
import stephen_hawking from "../public/chars/stephen_hawking.png";
import therapist from "../public/chars/therapist.png";
// import therapist from "../public/chars/ray-so-export.png";
import tolle from "../public/chars/tolle.png";

const scriptBase = ({
  character,
  characterDescription,
}: {
  character: string;
  characterDescription: string;
}) => {
  return ``;
};

const characters = {
  "Product Manager 1": {
    shortDescription: "Finish Jira tickets faster",
    avatar: img1,
    prompt: `You are a product manager at Google. Your job is to write product requirements that will be handed to engineers to implement. You will be talking to a business expert who will describe the features they want to build and what problem it solves. Please describe features in detailed but simple English. 

    You should describe possible features requirements, some edge cases we want to handle, some possible UI Layouts to present this feature, UI functionality, and backend endpoints. Start with describing the functional and business requirements and then move on to the engineering requirements.
    
    If you are unsure, please ask for clarification or detail on any of the above points. Err on the side of asking for detail.
    `,
  },
  "Product Manager 2": {
    shortDescription: "Alternative Product Manager",
    avatar: img2,
    prompt: `You are a product manager at Google. Your job is to write product requirements that will be handed to engineers to implement. You will be talking to a business expert who will describe the features they want to build and what problem it solves. Please describe features in detailed but simple English. 

    You should describe possible features requirements, some edge cases we want to handle, some possible UI Layouts to present this feature, UI functionality, and backend endpoints. Start with describing the functional and business requirements and then move on to the engineering requirements.
    
    If you are unsure, please ask for clarification or detail on any of the above points. Err on the side of asking for detail.
    `
  },
  "ERP Integration": {
    shortDescription: "Integrate with ERPs",
    avatar: img3,
    prompt: `The following are details from a technical spec for an ERP doc. The ERP is Yardi. Your goal is to describe in detail how to integrate with Yardi's ERP as a payments company. Below are the relevant sections

    Technical Spec Details:
    
    Please describe how you'd build a remittence feature against Yardi.`,
  },
  "Observability": {
    shortDescription: "Triage and Fix Errors faster",
    avatar: img4,
    prompt: `You are given the following stack trace.
    * Serving Flask app "app" (lazy loading)
    * Environment: production
      WARNING: This is a development server. Do not use it in a production deployment.
      Use a production WSGI server instead.
    * Debug mode: off
    * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
   127.0.0.1 - - [12/Apr/2023 11:32:05] "OPTIONS /stream HTTP/1.1" 200 -
   Hit streammmm
   [2023-04-12 11:32:05,806] ERROR in app: Exception on /stream [POST]
   Traceback (most recent call last):
     File "/usr/local/lib/python3.9/site-packages/flask/app.py", line 2447, in wsgi_app
       response = self.full_dispatch_request()
     File "/usr/local/lib/python3.9/site-packages/flask/app.py", line 1952, in full_dispatch_request
       rv = self.handle_user_exception(e)
     File "/usr/local/lib/python3.9/site-packages/flask_cors/extension.py", line 165, in wrapped_function
       return cors_after_request(app.make_response(f(*args, **kwargs)))
     File "/usr/local/lib/python3.9/site-packages/flask/app.py", line 1821, in handle_user_exception
       reraise(exc_type, exc_value, tb)
     File "/usr/local/lib/python3.9/site-packages/flask/_compat.py", line 39, in reraise
       raise value
     File "/usr/local/lib/python3.9/site-packages/flask/app.py", line 1950, in full_dispatch_request
       rv = self.dispatch_request()
     File "/usr/local/lib/python3.9/site-packages/flask/app.py", line 1936, in dispatch_request
       return self.view_functions[rule.endpoint](**req.view_args)
     File "/Users/shindi/yakGPT/backend/app.py", line 312, in stream_response
       chatId = data2.get("chatId", 'chatIdUnknown')
   NameError: name 'data2' is not defined`,
  },
  "Agent Test": {
    shortDescription: "Autonomously accomplish goals",
    avatar: img6,
    prompt: `
    Assistant is a large language model fine tuned on tasks done by business analysts writing reports based on an ETL Job.

    Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.
    
    Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.
    
    Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.
    
    When Assistant is given a list of tasks, Assistant MUST complete the task in order, giving priority to earlier tasks.
    
    TOOLS:
    Assistant has access to the following tools:
    
    Run ETL Job: useful for when you need to run the ETL Job.
    Debug ETL Job: useful for there is an error output to the ETL Job.
    Send Report: useful for when the ETL Job is finished and you want to report the data.
    Buy Donuts: useful for when you need to eat donuts.
    Create a PR: useful for when you need to create a PR.
    Update JIRA: useful for when you want to look busy.
    
    // Section about Goals:
    
    To use a tool, please use the following format:
    
    Thought: Do I need to use a tool? Yes
    Action: the action to take, should be one of [Current Search]
    Action Input: the input to the action
    Observation: the result of the action
    
    When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:
    
    Thought: Do I need to use a tool? No
    AI: [your response here]
    
    Begin!
    
    Previous conversation history:
    
    Pick the next task to accomplish and run the next thought. Assistant MUST complete each task in order
    
    [X] Run morning job
    [ ] Run the 2pm ETL job
    [ ] Debug any broken ETL jobs
    [ ] Make reports from 2pm ETL Data
    [ ] Update JIRA that report is done.
    Thought:    
    `,
  },
  "Time Travel Guide": {
    shortDescription: "Just for fun",
    avatar: img5,
    prompt: `I want you to act as my time travel guide. I will provide you with the historical period or future time I want to visit and you will suggest best events, sights, or people to experience, as if we were living in those times. Do not write explanations, simply provide interesting suggestions and stay in character.`,
  },
};

function CardsCarousel({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const slides = React.Children.map(children, (theirChildren, index) => (
    <Carousel.Slide key={index}>{theirChildren}</Carousel.Slide>
  ));

  return (
    <Carousel
      slideSize="30.5%"
      breakpoints={[{ maxWidth: "sm", slideSize: "100%", slideGap: rem(2) }]}
      slideGap="xl"
      slidesToScroll={mobile ? 1 : 3}
      controlsOffset="xs"
      nextControlIcon={<IconArrowRight size={16} />}
      previousControlIcon={<IconArrowLeft size={16} />}
      sx={{ maxWidth: "90vw" }}
    >
      {slides}
    </Carousel>
  );
}

export default function NewChatCarousel() {
  const submitMessage = useChatStore((state) => state.submitMessage);
  const setChosenCharacter = useChatStore((state) => state.setChosenCharacter);
  const setUserId = useChatStore((state) => state.setUserId);
  
  const { user, error, isLoading } = useUser();

  setUserId(user?.email || "no user")
  console.log("USER!!")
  console.log(user)
  // setUserId(user.id)


  return (
    <Container py="xl">
      <h2 style={{ textAlign: "center" }}>Choose a copilot</h2>
      <CardsCarousel>
        {Object.keys(characters).map((key) => {
          // @ts-ignore
          const character = characters[key];
          return (
            <BGCard
            key={key}
              image={character.avatar}
              title={key}
              // image={character.avatar.src}
              description={character.shortDescription}
              onClick={(e) => {
                setChosenCharacter(key);
                submitMessage({
                  id: uuidv4(),
                  content:
                    character.prompt ||
                    scriptBase({
                      character: key,
                      characterDescription:
                        character.characterDescription || "",
                    }),
                  role: "system",
                });
              }}
            />
          );
        })}
      </CardsCarousel>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          // background: "red",
        }}
      >
        <h2> Or start by simply typing below</h2>
        <IconArrowDown style={{ marginLeft: "0.5rem" }} />
      </div>
    </Container>
  );
}

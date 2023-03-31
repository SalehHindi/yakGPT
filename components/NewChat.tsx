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

import dalai_lama from "../public/chars/dalai_lama.png";
import debate from "../public/chars/debate.png";
import elon_musk from "../public/chars/elon_musk.png";
import expert from "../public/chars/expert.png";
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
  return `I’m having trouble with a scene in my screenplay where a person has a conversation with a ${character}.

 ${characterDescription && `Description: ${characterDescription}`}

I have written all of the person's lines already, but I haven’t written any of the lines for the ${character}. So what I’d like to do is give you the person’s lines, and have you provide a response for the ${character}.
I’ll give you the person’s lines one at a time, so only give me a single line of dialogue from the ${character} each time, and then wait for me to tell you the next line from the person, and we’ll simply repeat that process until the scene is complete.

Stay in character!

The person’s first line is:

Hello
`;
};

const characters = {
  "Jira Tickets": {
    shortDescription: "Finish Jira tickets faster",
    avatar: expert,
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
    `
  },
  "ERP Integration": {
    shortDescription: "Test 1",
    avatar: idea_generator,
    prompt: `
    
    `
  },
  "File Jobs": {
    shortDescription: "Debug and fix file jobs",
    characterDescription:
      "World-class therapist with a specialization in Cognitive Behavioral Therapy",
    avatar: therapist,
  },
  "API Builder": {
    shortDescription: "Brainstorming",
    avatar: idea_generator,
    prompt: `:`,
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

  return (
    <Container py="xl">
      <h2 style={{ textAlign: "center" }}> Choose a prompt...</h2>
      <CardsCarousel>
        {Object.keys(characters).map((key) => {
          // @ts-ignore
          const character = characters[key];
          return (
            <BGCard
              key={key}
              title={key}
              image={character.avatar.src}
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
        }}
      >
        <h2> Or start by simply typing below</h2>
        <IconArrowDown style={{ marginLeft: "0.5rem" }} />
      </div>
    </Container>
  );
}

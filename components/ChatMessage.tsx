import {
  ActionIcon,
  Avatar,
  createStyles,
  getStylesRef,
  MantineTheme,
  MediaQuery,
} from "@mantine/core";

import { useState, useRef } from 'react';

import { useChatStore } from "@/stores/ChatStore";
import { IconEdit, IconRepeat, IconSettings } from "@tabler/icons-react";
import MessageDisplay from "./MessageDisplay";

import UserIcon from "./UserIcon";
import AssistantIcon from "./AssistantIcon";
import { Message } from "@/stores/Message";

import CustomContextMenu from './CustomContextMenu';


const useStyles = createStyles((theme: MantineTheme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",

    [`@media (min-width: ${theme.breakpoints.sm})`]: {
      paddingBottom: "5em",
    },
  },
  chatContainer: {
    overflowY: "scroll",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: 0,
    [`@media (min-width: ${theme.breakpoints.md})`]: {
      paddingLeft: theme.spacing.xl,
      paddingRight: theme.spacing.xl,
    },

    [`&:hover .${getStylesRef("button")}`]: {
      opacity: 1,
    },
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[3]
    }`,
  },
  message: {
    borderRadius: theme.radius.sm,
    paddingLeft: theme.spacing.xs,
    paddingRight: theme.spacing.xs,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    display: "inline-block",
    maxWidth: "800px",
    wordWrap: "break-word",
    fontSize: theme.fontSizes.sm,
    width: "100%",
  },
  userMessageContainer: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[8]
        : theme.colors.gray[1],
  },
  botMessageContainer: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.dark[1],
  },
  userMessage: {
    // All children that are textarea should have color white
    "& textarea": {
      fontSize: "inherit",
      marginInlineStart: "0px",
      marginInlineEnd: "0px",
    },
  },
  botMessage: {},
  actionIcon: {
    ref: getStylesRef("button"),

    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
  },
  textArea: {
    width: "100%",
  },
  messageDisplay: {
    marginLeft: theme.spacing.md,
  },
  messageWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  topOfMessage: {
    alignSelf: "start",
    marginTop: theme.spacing.sm,
  },
}));

export default function ChatDisplay({ message }: { message: Message }) {
  const { classes, cx } = useStyles();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const outerDivRef = useRef(null);
  

  const setEditingMessage = useChatStore((state) => state.setEditingMessage);
  const pushToTalkMode = useChatStore((state) => state.pushToTalkMode);
  const regenerateAssistantMessage = useChatStore(
    (state) => state.regenerateAssistantMessage
  );

  const handleMainAction = (message: Message) => {
    if (message.role === "assistant") {
      regenerateAssistantMessage(message);
    } else {
      setEditingMessage(message);
    }
  };

  const onContextMenu = (event: any) => {
    event.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: event.clientX-210, y: event.clientY-35 });
  };

  const onClick = (event: any) => {
    if (outerDivRef.current && true) {
      setShowContextMenu(false);
    }
  };

  const onCustomContextMenuClick = (event: any) => {
    setShowContextMenu(false);
  };  
  

  return (
    <div
      key={message.id}
      className={cx(
        classes.messageContainer,
        message.role === "user"
          ? classes.userMessageContainer
          : classes.botMessageContainer
      )}
      // onContextMenu={onContextMenu}
      // onClick={onClick}    
    >
      <div
        className={cx(
          classes.message,
          message.role === "user" ? classes.userMessage : classes.botMessage
        )}
      >
        <div className={classes.messageWrapper}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <MediaQuery smallerThan="md" styles={{ display: "none" }}>
              <div className={classes.topOfMessage}>
                <Avatar size="sm">
                  {message.role === "system" ? (
                    <IconSettings />
                  ) : message.role === "assistant" ? (
                    <AssistantIcon />
                  ) : (
                    <UserIcon />
                  )}
                </Avatar>
              </div>
            </MediaQuery>

            <MessageDisplay
              message={message}
              className={classes.messageDisplay}
            />
          </div>
          {!(message.role !== "assistant" && pushToTalkMode) && (
            <ActionIcon
              className={cx(classes.actionIcon, classes.topOfMessage)}
              onClick={() => handleMainAction(message)}
              color="gray"
            >
              {message.role === "assistant" ? <IconRepeat /> : <IconEdit />}
            </ActionIcon>
          )}
        </div>
      </div>
      <CustomContextMenu
        showContextMenu={showContextMenu}
        contextMenuPosition={contextMenuPosition}
        onClick={onCustomContextMenuClick}
      />

    </div>
  );
}

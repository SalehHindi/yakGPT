import React, { useState, useCallback } from 'react';
import {
    ActionIcon,
    createStyles,
    getStylesRef,
    MantineTheme,
} from "@mantine/core";
import { useChatStore } from "@/stores/ChatStore";
import { v4 as uuidv4 } from "uuid";


const useStyles = createStyles((theme: MantineTheme) => ({
  whatever: {
    // background: "white",

    '&:hover': {
      background: "papayawhip",
    },
  },    
}))


interface Props {
    showContextMenu: boolean;
    contextMenuPosition: any;
}

function CustomContextMenu({ showContextMenu, contextMenuPosition}: any) {
    const { classes, theme } = useStyles();

    const submitMessage = useChatStore((state) => state.submitMessage);

    console.log("context menu:")
    console.log(showContextMenu)
    console.log(contextMenuPosition)


    const onCopyClick = (event: any) => {
      
    }
    const onExpandClick = (event: any) => {

      const highlightedText = window?.getSelection()?.toString()

      submitMessage({
        id: uuidv4(),
        content: `Can you expand on the following text:\n${highlightedText}`,
        role: "user",
      });
    }
    const onMoreExamplesClick = (event: any) => {
      const highlightedText = window?.getSelection()?.toString()

      submitMessage({
        id: uuidv4(),
        content: `Can you provide more examples of the following text:\n${highlightedText}`,
        role: "user",
      });

    }
    const onAddToJiraClick = (event: any) => {
      alert("connect Jira integration")
    }

    const onAgent = (event: any) => {
      async function callEvery12Seconds() {
        alert("Thinking")
        // const highlightedText = window?.getSelection()?.toString()

        submitMessage({
          id: uuidv4(),
          content: `Thought:`,
          role: "user",
        });
  
        await new Promise(resolve => setTimeout(resolve, 12000)); // Wait for 12 seconds
        // Your async function code here
        console.log('Called every 12 seconds');
        callEvery12Seconds(); // Call the function again to repeat after 12 seconds
      }
      callEvery12Seconds(); // Start the initial call
      


    }
 

    return (
    <div>
      {showContextMenu && (
        <div id="chat12345" style={{ 
            position: 'absolute', 
            top: contextMenuPosition.y, 
            left: contextMenuPosition.x, 
            background: 'burlywood',
            fontSize: '12px',
            padding: '10px',
            boxShadow: '0px 0px 16px 5px rgba(0,0,0,0.1)',
            borderRadius: '7px',
            color: 'black',
        }}>
        {/* <div style={{ position: 'absolute', top: contextMenuPosition.y, left: contextMenuPosition.x }}> */}
          <div>
            <div id="copy" className={classes.whatever} style={{borderBottom: "1px solid beige"}} onClick={onCopyClick}>Copy</div>
            <div id="expand" className={classes.whatever} style={{borderBottom: "1px solid beige"}} onClick={onExpandClick}>Expand</div>
            <div id="more-examples" className={classes.whatever} style={{borderBottom: "1px solid beige"}} onClick={onMoreExamplesClick}>More Examples</div>
            <div id="agent" className={classes.whatever} style={{borderBottom: "1px solid beige"}} onClick={onAgent}>Agent</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomContextMenu;

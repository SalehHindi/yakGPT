import React, { useState, useCallback } from 'react';
import {
    ActionIcon,
    createStyles,
    getStylesRef,
    MantineTheme,
  } from "@mantine/core";
  


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

    console.log("context menu:")
    console.log(showContextMenu)
    console.log(contextMenuPosition)
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
            <div id="copy" className={classes.whatever} style={{borderBottom: "1px solid beige"}} onClick={() => {}}>Copy</div>
            <div id="expand" className={classes.whatever} style={{borderBottom: "1px solid beige"}} onClick={() => {}}>Expand</div>
            <div id="add-to-jira" className={classes.whatever} style={{borderBottom: "1px solid beige"}} onClick={() => {}}>Add to JIRA</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomContextMenu;

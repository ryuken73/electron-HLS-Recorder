import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField, SmallButton}  from '../template/smallComponents';

export default function SaveDirectory(props) {
    const {saveDirectory, recorderStatus} = props;
    const {onClickSelectSaveDirectory} = props;
    const inRecording = recorderStatus !== 'stopped';
    
    const location = {
        title: <Typography variant="body1">Save Directory</Typography>,
        content: (
            <React.Fragment>
                <Box width="100%">
                    <SmallMarginTextField
                        variant="outlined"
                        margin="dense"
                        value={saveDirectory}                        
                        mt={"0px"}
                        mb={"0px"}
                        bgcolor={"#2d2f3b"}
                        textalign={"left"}
                    ></SmallMarginTextField>
                </Box>
                <Box textAlign="center">
                    <SmallButton 
                        size="small" 
                        color="secondary" 
                        variant={"contained"} 
                        mt={"0px"}
                        mb={"0px"}
                        bgcolor={"#191d2e"}
                        onClick={onClickSelectSaveDirectory}
                        disabled={inRecording}
                    >Change</SmallButton>
                </Box>
            </React.Fragment>
        )
    }
    return (
        <BorderedList 
            title={location.title} 
            content={location.content} 
            bgcolor={"#232738"}
        ></BorderedList>
    )
}

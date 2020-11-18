import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField}  from '../template/smallComponents';

export default function Title(props) {
    console.log('rerender Title:', props)
    const {channelName, recorderStatus, duration} = props;
    const inRecording = recorderStatus !== 'stopped';
    const channel = {
        title: <Typography variant="body1">{channelName}</Typography>,
        content: (
            <Box width="100%"> 
                <SmallMarginTextField 
                    width="100%"
                    variant="outlined"
                    margin="dense"
                    bgcolor={inRecording ? "maroon" : "black"}
                    value={duration}
                    fontSize={"20px"}
                ></SmallMarginTextField> 
            </Box>
        ) 
    }
    return (
        <BorderedList 
            title={channel.title} 
            content={channel.content} 
            color={"white"}
            border={0}
            ml={"3px"}
            my={"0px"}
            bgcolor={"fixed"}
        ></BorderedList>
    )
}

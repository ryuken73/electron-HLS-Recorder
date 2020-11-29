import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField}  from '../template/smallComponents';

function Title(props) {
    // console.log('rerender Title:', props)
    const {channelName, recorderStatus, duration} = props;
    const inRecording = recorderStatus === 'started';
    const inTransition = recorderStatus === 'starting' || recorderStatus === 'stopping';
    const bgColors = {
        'starting': 'crimson',
        'started': 'maroon',
        'stopping': '#590000',
        'stopped': 'black'
    }
    // const bgColor = inRecording ? "maroon" : inTransition ? "crimson" : "black"
    const bgColor = bgColors[recorderStatus];
    // console.log('&&&&&&',inTransition, inRecording, bgColor)
    const channel = {
        title: <Typography variant="body1">{channelName}</Typography>,
        content: (
            <Box width="100%"> 
                <SmallMarginTextField 
                    width="100%"
                    variant="outlined"
                    margin="dense"
                    bgcolor={bgColor}
                    value={duration}
                    fontSize={"20px"}
                ></SmallMarginTextField> 
            </Box>
        ) 
    }
    return (
        <BorderedList 
            title={channel.title} 
            titlewidth={"115px"}
            content={channel.content} 
            color={"white"}
            border={0}
            ml={"3px"}
            my={"0px"}
            bgcolor={"fixed"}
        ></BorderedList>
    )
}

export default  React.memo(Title)
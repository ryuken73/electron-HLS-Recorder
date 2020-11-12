import React from 'react'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import BorderedList from './template/BorderedList';
import {SmallButton}  from './template/smallComponents';


export default function ClipContainer(props) {
    const {clipFullName, currentClip, clipName, playClip} = props;
    const onClickClip = () => {
        playClip(clipFullName);
    }
    const onPlaying = (clipFullName === currentClip)
    const clipPreview = {
        title: <Typography variant="body1">{clipName}</Typography>,
        content: (
            <Box textAlign="center">
                <SmallButton 
                    size="small" 
                    color="secondary" 
                    variant={"contained"} 
                    mt={"0px"}
                    mb={"0px"}
                    bgcolor={"#191d2e"}
                    onClick={onClickClip}
                    minWidth={"75px"}
                >{onPlaying ? "Playing": "Preview"}</SmallButton>
            </Box>
        )
    }
    return (
        <BorderedList 
            title={clipPreview.title} 
            content={clipPreview.content} 
            bgcolor={onPlaying ? "snow" :"#232738"}
        ></BorderedList>
    )
}

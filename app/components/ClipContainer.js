import React from 'react'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import BorderedList from './template/BorderedList';
import {SmallButton, SmallPaddingIconButton, SmallPaddingButton}  from './template/smallComponents';
import CloseIcon from '@material-ui/icons/Close';

export default function ClipContainer(props) {
    const {clipFullName, currentClip, clipName, playClip, removeClip} = props;
    const onClickClip = () => {
        playClip(clipFullName);
    }
    const onPlaying = (clipFullName === currentClip)
    const deleteClip = () => {
        removeClip(clipFullName);
    }
    const clipPreview = {
        title: (   
            <Box display="flex" alignItems="center">
                <SmallPaddingIconButton onClick={deleteClip} padding="1px" size="small">
                    <CloseIcon fontSize={"small"}></CloseIcon>
                </SmallPaddingIconButton>
                <Box fontSize="11px" fontFamily="Roboto, Helvetica, Arial, sans-serif">{clipName}</Box>
            </Box>         
        ),
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
                    fontSize={"10px"}
                >{onPlaying ? "SELECTED": "Preview"}</SmallButton>
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

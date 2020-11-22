import React from 'react'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Zoom from '@material-ui/core/Zoom';
import Slide from '@material-ui/core/Slide';
import BorderedList from './template/BorderedList';
import {SmallButton, SmallPaddingIconButton, SmallPaddingButton}  from './template/smallComponents';
import CloseIcon from '@material-ui/icons/Close';

export default function ClipContainer(props) {
    const {clipFullName, currentClip, clipName, playClip, removeFromList} = props;
    const [checkin, setCheckin] = React.useState(true);
    const [willRemoved, setWillRemoved] = React.useState(false);
    const onClickClip = () => {
        playClip(clipFullName);
    }
    const onPlaying = (clipFullName === currentClip)
    const deleteClip = () => {
        // setWillRemoved(true);
        setCheckin(false)
        setTimeout(() => {
            removeFromList(clipFullName);
        },300)
    }
    const backgroundColor = willRemoved ? 'darkcyan' : onPlaying ? "snow" : "#232738";

    const clipPreview = {
        title: (   
            <Box display="flex" alignItems="center">
                <SmallPaddingIconButton onClick={deleteClip} padding="1px" size="small">
                    <CloseIcon fontSize={"small"}></CloseIcon>
                </SmallPaddingIconButton>
                <Box fontSize="10px" fontFamily="Roboto, Helvetica, Arial, sans-serif">{clipName}</Box>
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
                    minwidth={"75px"}
                    fontSize={"10px"}
                >{onPlaying ? "SELECTED": "Preview"}</SmallButton>
            </Box>
        )
    }
    const ClipList = () => {
        return (
            <BorderedList 
                title={clipPreview.title} 
                content={clipPreview.content} 
                bgcolor={backgroundColor}
            ></BorderedList>
        )
    }
    return (
        // <Zoom in={checkin} timeout={1000}>
        <Slide direction="right" in={checkin} timeout={500} mountOnEnter unmountOnExit>
            {/* <SmallButton>111</SmallButton> */}
            <div>
                <ClipList></ClipList>
            </div>
            {/*  */}
        </Slide>
        // </Zoom>
    )
}

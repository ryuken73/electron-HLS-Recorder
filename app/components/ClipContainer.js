import React from 'react'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Zoom from '@material-ui/core/Zoom';
import Slide from '@material-ui/core/Slide';
import BorderedList from './template/BorderedList';
import {BasicLink} from './template/basicComponents';
import {SmallButton, SmallPaddingIconButton, SmallPaddingButton}  from './template/smallComponents';
import CloseIcon from '@material-ui/icons/Close';

const {remote} = require('electron');

function ClipContainer(props) {
    const {clipFullName, clipId, clipTitle, currentClip, clipName, playClip, removeFromList, previewDisable} = props;
    console.log(`rerender ClipContainer`, clipFullName, previewDisable)
    const [checkin, setCheckin] = React.useState(true);
    const [willRemoved, setWillRemoved] = React.useState(false);
    const onClickClip = () => {
        playClip(clipFullName, clipTitle);
    }
    const onPlaying = (clipFullName === currentClip)
    const deleteClip = () => {
        // setWillRemoved(true);
        setCheckin(false)
        setTimeout(() => {
            removeFromList(clipFullName, clipId);
        },300)
    }
    const onClickClipName = () => {
        remote.shell.showItemInFolder(clipFullName);
    }
    const backgroundColor = willRemoved ? 'darkcyan' : onPlaying ? "snow" : "#232738";

    const clipPreview = {
        subject: (   
            <Box display="flex" alignItems="center">
                <SmallPaddingIconButton onClick={deleteClip} padding="1px" size="small">
                    <CloseIcon fontSize={"small"}></CloseIcon>
                </SmallPaddingIconButton>
                <Box fontSize="10px" fontFamily="Roboto, Helvetica, Arial, sans-serif">
                    {previewDisable ? clipName : 
                    (<BasicLink href="#" onClick={onClickClipName}>
                        {clipName}
                    </BasicLink>)}
                </Box>
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
                    disabled={previewDisable}
                >{onPlaying ? "SELECTED": "Preview"}</SmallButton>
            </Box>
        )
    }
    const ClipList = () => {
        return (
            <BorderedList 
                subject={clipPreview.subject} 
                content={clipPreview.content} 
                bgcolor={backgroundColor}
            ></BorderedList>
        )
    }
    return (
        // <Zoom in={checkin} timeout={1000}>
        <Slide direction="right" in={checkin} timeout={{enter:500, exit:200}} mountOnEnter unmountOnExit>
            {/* <SmallButton>111</SmallButton> */}
            <div>
                <ClipList></ClipList>
            </div>
            {/*  */}
        </Slide>
        // </Zoom>
    )
}

export default React.memo(ClipContainer)
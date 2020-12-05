import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import HLSPlayer from './HLSPlayer';
import ClipContainer from './ClipContainer';
import utils from '../utils';
import defaults from '../config/defaults';
import path from 'path';

const {baseDirectory} = defaults;
function PreviewContainer(props) {
    // const {clips, removeClip, setPlaybackRateStore, getPlaybackRateStore} = props;
    const {clips, removeClip,} = props;
    const [currentUrl, setCurrentUrl] = React.useState('');
    const [player, setPlayer] = React.useState(null);
    const [type, setType] = React.useState('video/mp4');
    const [titleElement, setTitleElement] = React.useState('Default Overlay Content');
    console.log('re-render PreviewContainer', clips)

    const playClip = (clipFullName, clipTitle) => {
        console.log('playClip', clipFullName)
        setCurrentUrl(clipFullName);
        if(path.extname(clipFullName) === 'mp4'){
            setType('video/mp4');
        }
        const titleElement = document.createElement('div');
        titleElement.innerHTML = clipTitle;
        titleElement.style = "color:black;font-weight:bold";
        setTitleElement(titleElement);
    }

    return (
        <SectionWithFullHeight height="1" maxWidth="368px" maxHeight="770px">
            <Box m="3px" border={3} borderColor={"black"}>
                <HLSPlayer 
                    url={currentUrl} 
                    type={type}
                    controls={true}
                    autoplay={true}
                    width={330}
                    player={player}
                    setPlayer={setPlayer}
                    overlayContent={titleElement}
                    enableOverlay={true}
                ></HLSPlayer>
            </Box>
            <BorderedBox bgcolor="#2d2f3b" height="100%" ml="0px" mr="0px" overflow="auto">
                {clips.map(clip => 
                    <ClipContainer 
                        key={clip.mp4Name} 
                        clip={clip}
                        clipId={clip.clipId}
                        clipFullName={clip.mp4Name} 
                        clipTitle={clip.title}
                        removeFromList={removeClip} 
                        currentClip={currentUrl} 
                        clipName={path.basename(clip.mp4Name)} 
                        playClip={playClip}
                        previewDisable={!clip.mp4Converted}
                    ></ClipContainer>)}
            </BorderedBox>
        </SectionWithFullHeight>     
    )
}

export default React.memo(PreviewContainer)
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
export default function PreviewContainer(props) {
    const {clips, removeClip} = props;
    const [currentUrl, setCurrentUrl] = React.useState('');
    const [type, setType] = React.useState('video/mp4');

    const playClip = (clip) => {
        console.log('playClip', clip)
        setCurrentUrl(clip)
        if(path.extname(clip) === 'mp4'){
            setType('video/mp4');
        }
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
                ></HLSPlayer>
            </Box>
            <BorderedBox bgcolor="#2d2f3b" height="100%" ml="0px" mr="0px" overflow="auto">
                {clips.map(clip => <ClipContainer key={clip} clipFullName={clip} removeFromList={removeClip} currentClip={currentUrl} clipName={path.basename(clip)} playClip={playClip}></ClipContainer>)}
            </BorderedBox>
        </SectionWithFullHeight>     
    )
}
import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import HLSPlayer from './HLSPlayer';
import cctvs from '../config/cctvs';
import utils from '../utils';
import defaults from '../config/defaults';
import path from 'path';

const {baseDirectory} = defaults;
export default function PreviewContainer(props) {
    const {clips} = props;
    const [currentUrl, setCurrentUrl] = React.useState('');
    let type = 'application/x-mpegURL';
    if(path.extname(currentUrl) === 'mp4'){
        type = 'video/mp4'
    }

    return (
        <SectionWithFullHeight height="1" maxWidth="368px">
            <HLSPlayer 
                url={currentUrl} 
                type={type}
                control={true}
                autoplay={false}
            ></HLSPlayer>
            <BorderedBox bgcolor="#2d2f3b" height="100%">
                {clips.map(clip => <Box>{clip}</Box>)}
            </BorderedBox>
        </SectionWithFullHeight>     
    )
}
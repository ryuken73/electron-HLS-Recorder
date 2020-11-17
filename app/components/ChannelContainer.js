import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import HLSPlayer from './HLSPlayer';
import {cctvs, webUrls} from '../config/cctvs';
import utils from '../utils';
import defaults from '../config/defaults';
import path from 'path';

const {baseDirectory} = defaults;
export default function ChannelContainer(props) {
    const {order, channelName, clips, setClip} = props;
    console.log('rerender:', channelName)
    const streamUrl = cctvs[order] ? cctvs[order].url : '';
    const [currentUrl, setCurrentUrl] = React.useState(streamUrl);
    const [saveDirectory, setSaveDirectory] = React.useState(path.join(baseDirectory, channelName));
    const [mountPlayer, setMountPlayer] = React.useState(true);
    const [playbackMode, setPlaybackMode] = React.useState(false);
    const type = path.extname(currentUrl) === '.mp4' ? 'video/mp4':'application/x-mpegURL';

    React.useEffect(() => {
        async function mkdir(){
            try {
                await utils.file.makeDirectory(saveDirectory);
            } catch (err) {
                console.error(err);
            }
        }
        mkdir();
        setInterval(() => {
            setMountPlayer(false)
            setMountPlayer(true)
        },600000)

    },[])

    return (
        <SectionWithFullHeight width="800px">
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" border={3} borderColor={playbackMode ? 'red':'black'}>
                    {mountPlayer && <HLSPlayer channelName={channelName} url={currentUrl} type={type} controls={true} autoplay={true}></HLSPlayer>}
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl 
                        cctvs={cctvs}
                        channelName={channelName}
                        currentUrl={currentUrl} 
                        saveDirectory={saveDirectory}
                        setCurrentUrl={setCurrentUrl}
                        setSaveDirectory={setSaveDirectory}
                        setPlaybackMode={setPlaybackMode}
                        clips={clips}
                        setClip={setClip}
                    ></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}
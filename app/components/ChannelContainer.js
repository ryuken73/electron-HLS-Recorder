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
    const {order, channelName, clips, setClip, store} = props;
    console.log('rerender:', channelName);
    // store.get(`src.${order}`, cctvs[order].url )
    // const streamUrl = cctvs[order] ? cctvs[order].url : '';
    const defaultUrl =  cctvs[order].url;
    const streamUrl = store.get(`src.${order}`, defaultUrl);
    const [currentUrl, setCurrentUrl] = React.useState(streamUrl);
    const defaultDirectory = path.join(baseDirectory, channelName);
    const initialDirectory = store.get(`directory.${order}`, defaultDirectory);
    const [saveDirectory, setSaveDirectory] = React.useState(initialDirectory);
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
        // setInterval(() => {
        //     setMountPlayer(false)
        //     setMountPlayer(true)
        // },600000)
    },[])

    const changeUrl = url => {
        setCurrentUrl(url);
        store.set(`src.${order}`, url);
    }

    const changeDirectory = directory => {
        setSaveDirectory(directory);
        store.set(`directory.${order}`, directory)
    }

    return (
        <SectionWithFullHeight width="750px">
            {/* <Box display="flex" mx={"10px"} my={"3px"}> */}
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" border={3} borderColor={playbackMode ? 'red':'black'}>
                    {mountPlayer && <HLSPlayer channelName={channelName} url={currentUrl} type={type} controls={false} autoplay={true}></HLSPlayer>}
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl 
                        cctvs={cctvs}
                        channelName={channelName}
                        currentUrl={currentUrl} 
                        saveDirectory={saveDirectory}
                        changeUrl={changeUrl}
                        setCurrentUrl={setCurrentUrl}
                        changeDirectory={changeDirectory}
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
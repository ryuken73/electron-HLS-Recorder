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
function ChannelContainer(props) {
    const {order, channelName, clips, setClip, intervals, setIntervals, store} = props;
    const {setClipStore, setIntervalStore} = props;
    const defaultUrl =  cctvs[order].url;
    const streamUrl = store.get(`src.${order}`, defaultUrl);
    const [currentUrl, setCurrentUrl] = React.useState(streamUrl);
    const defaultInterval = {title:'10 Minutes', milliseconds:600000};
    const interval = store.get(`intervals.${order}`, defaultInterval)
    const [currentInterval, setCurrentInterval] = React.useState(interval);
    const defaultDirectory = path.join(baseDirectory, channelName);
    const initialDirectory = store.get(`directory.${order}`, defaultDirectory);
    const [saveDirectory, setSaveDirectory] = React.useState(initialDirectory);
    const [mountPlayer, setMountPlayer] = React.useState(true);
    const [playbackMode, setPlaybackMode] = React.useState(false);
    const type = path.extname(currentUrl) === '.mp4' ? 'video/mp4':'application/x-mpegURL';
    console.log('rerender:', channelName, currentUrl);

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

    const reMountPlayer = React.useCallback(() => {
        console.log(`remount player : ${channelName}`)
        setMountPlayer(false);
        setMountPlayer(true)
    },[])

    const setCurrentUrlStore = url => {
        setCurrentUrl(url);
        store.set(`src.${order}`, url);
    }

    const setSaveDirectoryStore = directory => {
        setSaveDirectory(directory);
        store.set(`directory.${order}`, directory)
    }

    const setCurrentIntervalStore = interval => {
        setIntervals(interval);
        store.set(`interval.${order}`, interval)
    }

    return (
        <SectionWithFullHeight width="750px">
            {/* <Box display="flex" mx={"10px"} my={"3px"}> */}
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" border={3} borderColor={playbackMode ? 'red':'black'}>
                    {mountPlayer && 
                    <HLSPlayer 
                        channelName={channelName} 
                        url={currentUrl} 
                        type={type}
                        controls={false} 
                        autoplay={true} 
                        reMountPlayer={reMountPlayer}
                    ></HLSPlayer>}
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl 
                        cctvs={cctvs}
                        intervals={intervals}
                        channelName={channelName}
                        currentUrl={currentUrl} 
                        currentInterval={currentInterval}
                        saveDirectory={saveDirectory}
                        setCurrentUrlStore={setCurrentUrlStore}
                        setCurrentUrl={setCurrentUrl}
                        setCurrentInterval={setCurrentInterval}
                        setSaveDirectoryStore={setSaveDirectoryStore}
                        setSaveDirectory={setSaveDirectory}
                        setPlaybackMode={setPlaybackMode}
                        clips={clips}
                        setClip={setClip}
                        setClipStore={setClipStore}
                        intervals={intervals}
                        setIntervals={setIntervals}
                        setIntervalStore={setIntervalStore}
                    ></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}

export default React.memo(ChannelContainer);
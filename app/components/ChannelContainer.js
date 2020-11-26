import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import {SmallPaddingIconButton}  from './template/smallComponents';
import RefreshIcon from '@material-ui/icons/Refresh';

import HLSPlayer from './HLSPlayer';
import {cctvs, webUrls} from '../config/cctvs';
import utils from '../utils';
import defaults from '../config/defaults';
import path from 'path';

const {baseDirectory} = defaults;
function ChannelContainer(props) {
    const {channelNumber, channelName, clips, setClip, intervals, store} = props;
    const {setClipStore} = props;
    const defaultUrl =  cctvs[channelNumber] ? cctvs[channelNumber].url : '';
    const defaultInterval = 3600000;
    const streamUrl = store.get(`src.${channelNumber}`, defaultUrl);
    const initialInterval = store.get(`interval.${channelNumber}`, defaultInterval);
    const [currentUrl, setCurrentUrl] = React.useState(streamUrl);
    const [currentInterval, setCurrentInterval] = React.useState(initialInterval);
    // const interval = store.get(`intervals.${channelNumber}`, defaultInterval)
    const defaultDirectory = path.join(baseDirectory, channelName);
    const initialDirectory = store.get(`directory.${channelNumber}`, defaultDirectory);
    const [saveDirectory, setSaveDirectory] = React.useState(initialDirectory);
    const [mountPlayer, setMountPlayer] = React.useState(true);
    const [playbackMode, setPlaybackMode] = React.useState(false);
    const [player, setPlayer] = React.useState(null);
    const type = path.extname(currentUrl) === '.mp4' ? 'video/mp4':'application/x-mpegURL';
    console.log('rerender:', channelName, currentUrl, player);

    React.useEffect(() => {
        async function mkdir(){
            try {
                await utils.file.makeDirectory(saveDirectory);
            } catch (err) {
                console.error(err);
            }
        }
        mkdir();
    },[])

    const refreshPlayer = React.useCallback(() => {
        // const currentSource = player.currentSource();
        if(player === null) {
            console.log('player is null. not refresh!')
            return;
        }
        const srcObject = {
            src: currentUrl,
            type,
            handleManifestRedirects: true,
        }
        player.src(srcObject)
    }, [player, currentUrl]);

    const setCurrentUrlStore = url => {
        setCurrentUrl(url);
        store.set(`src.${channelNumber}`, url);
    }

    const setSaveDirectoryStore = directory => {
        setSaveDirectory(directory);
        store.set(`directory.${channelNumber}`, directory)
    }

    const setCurrentIntervalStore = interval => {
        setCurrentInterval(interval);
        console.log(`^^^ save interval`, interval);
        store.set(`interval.${channelNumber}`, interval)
    }

    return (
        <SectionWithFullHeight width="800px">
            {/* <Box display="flex" mx={"10px"} my={"3px"}> */}
            <Box display="flex" alignItems="flex-start">
                <SmallPaddingIconButton padding="1px" size="small">
                    <RefreshIcon color="secondary" fontSize={"small"} onClick={refreshPlayer}></RefreshIcon>
                </SmallPaddingIconButton>
                <BorderedBox display="flex" alignContent="center" flexGrow="1" border={3} borderColor={playbackMode ? 'red':'black'}>
                    {mountPlayer && 
                    <HLSPlayer 
                        channelName={channelName} 
                        url={currentUrl} 
                        type={type}
                        controls={false} 
                        autoplay={true} 
                        player={player}
                        setPlayer={setPlayer}
                        refreshPlayer={refreshPlayer}
                    ></HLSPlayer>}
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl 
                        cctvs={cctvs}
                        intervals={intervals}
                        channelName={channelName}
                        currentUrl={currentUrl} 
                        setCurrentUrl={setCurrentUrl}
                        setCurrentUrlStore={setCurrentUrlStore}
                        currentInterval={currentInterval}
                        setCurrentInterval={setCurrentInterval}
                        setCurrentIntervalStore={setCurrentIntervalStore}
                        saveDirectory={saveDirectory}
                        setSaveDirectoryStore={setSaveDirectoryStore}
                        setSaveDirectory={setSaveDirectory}
                        setPlaybackMode={setPlaybackMode}
                        clips={clips}
                        setClip={setClip}
                        setClipStore={setClipStore}
                        // intervals={intervals}
                        // setIntervals={setIntervals}
                        // setIntervalStore={setIntervalStore}
                    ></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}

export default React.memo(ChannelContainer);
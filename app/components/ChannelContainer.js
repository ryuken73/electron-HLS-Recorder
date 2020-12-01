import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import {SmallPaddingIconButton}  from './template/smallComponents';
import RefreshIcon from '@material-ui/icons/Refresh';
const {defaultCCTVs} = require('../config/cctvs.json');

import HLSPlayer from './HLSPlayer';
import utils from '../utils';
import defaults from '../config/defaults';
import path from 'path';
import log, { levels } from 'electron-log';

const {baseDirectory} = defaults;

const getInitialValues = (channelLogger, channelName, channelNumber) => {
    const Store = require('electron-store');
    const store = new Store();    
    // store.delete('cctvs')
    // let cctvs = store.get(`cctvs`, null);
    // if(cctvs === null){
    //     channelLogger.info(`no previously saved cctvs. initialize cctvs in store [${cctvs}]`);
    //     cctvs = defaultCCTVs;
    //     // store.set('cctvs', defaultCCTVs);
    // }
    const cctvs = defaultCCTVs;
    const defaultUrl =  cctvs[channelNumber] ? cctvs[channelNumber].url : '';
    const defaultTitle = cctvs[channelNumber] ? cctvs[channelNumber].title : '';
    const defaultInterval = 3600000;
    const streamUrl = store.get(`src.${channelNumber}`, defaultUrl);
    const title = store.get(`title.${channelNumber}`, defaultTitle);
    const initialInterval = store.get(`interval.${channelNumber}`, defaultInterval);
    const defaultDirectory = path.join(baseDirectory, channelName);
    const initialDirectory = store.get(`directory.${channelNumber}`, defaultDirectory);
    const initialType = path.extname(streamUrl) === '.mp4' ? 'video/mp4':'application/x-mpegURL';
    const initialTitleElement = document.createElement('div');
    initialTitleElement.innerHTML = title;
    initialTitleElement.style = "color:black;font-weight:bold";
    return {
        cctvs,
        streamUrl, 
        title, 
        initialInterval, 
        initialDirectory,
        initialType,
        initialTitleElement,
        store
    }
}


function ChannelContainer(props) {
    const {channelNumber, channelName, clips, setClip} = props;
    const {setClipStore} = props;
    const createLogger = channelName => {
        return {
            info: (msg) => {
                log.info(`[${channelName}][ChannelContainer]${msg}`)
            }
        }
    }    
    const channelLogger = createLogger(channelName);
    const {
        cctvs,
        streamUrl, 
        title, 
        initialInterval, 
        initialDirectory,
        initialType,
        initialTitleElement,
        store,
    } = getInitialValues(channelLogger, channelName, channelNumber)

    const [currentUrl, setCurrentUrl] = React.useState(streamUrl);
    const [currentTitle, setCurrentTitle] = React.useState(title);
    const [currentInterval, setCurrentInterval] = React.useState(initialInterval);
    const [saveDirectory, setSaveDirectory] = React.useState(initialDirectory);
    const [mountPlayer, setMountPlayer] = React.useState(true);
    const [mountChannelControl, setMountChannelControl] = React.useState(true);
    const [playbackMode, setPlaybackMode] = React.useState(false);
    const [player, setPlayer] = React.useState(null);
    const [type, setType] = React.useState(initialType);
    const [titleElement, setTitleElement] = React.useState(initialTitleElement);
    channelLogger.info(`rerender: ${channelName}: ${currentUrl}`);

    const resetPlayer = () => {
        channelLogger.info('restPlayer() execute')
        const {
            cctvs,
            streamUrl, 
            title, 
            initialInterval, 
            initialDirectory,
            initialTitleElement,
        } = getInitialValues(channelLogger, channelName, channelNumber);
        setCurrentUrl(streamUrl);
        setCurrentTitle(title);
        setCurrentInterval(initialInterval);
        setSaveDirectory(initialDirectory);
        setTitleElement(initialTitleElement);
        setPlaybackMode(false);
    }

    const setSaveDirectoryStore = directory => {
        setSaveDirectory(directory);
        store.set(`directory.${channelNumber}`, directory)
    }
    const setCurrentUrlStore = url => {
        setCurrentUrl(url)
        setTitleElement(currentElement => {
            const title = store.get(`title.${channelNumber}`);
            const nextElement = document.createElement('div');
            nextElement.innerHTML = title;
            nextElement.style = "color:black;font-weight:bold";
            return nextElement;
        })
        store.set(`src.${channelNumber}`, url);
    }
    const setCurrentTitleStore = title => {
        setCurrentTitle(title);
        store.set(`title.${channelNumber}`, title);
    }
    const setCurrentIntervalStore = interval => {
        setCurrentInterval(interval);
        channelLogger.info(`save interval: ${interval}`);
        store.set(`interval.${channelNumber}`, interval)
    }

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
        if(player === null) {
            channelLogger.info('player is null. not refresh!')
            return;
        }
        const srcObject = {
            src: currentUrl,
            type,
            handleManifestRedirects: true,
        }
        player.src(srcObject)
    }, [player, currentUrl]);



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
                        overlayContent={titleElement}
                        enableOverlay={true}
                    ></HLSPlayer>}
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    {mountChannelControl &&
                    <ChannelControl 
                        cctvs={cctvs}
                        channelName={channelName}
                        channelNumber={channelNumber}
                        currentUrl={currentUrl} 
                        setCurrentUrl={setCurrentUrl}
                        setCurrentTitle={setCurrentTitle}
                        setCurrentUrlStore={setCurrentUrlStore}
                        setCurrentTitleStore={setCurrentTitleStore}
                        currentInterval={currentInterval}
                        setCurrentInterval={setCurrentInterval}
                        setCurrentIntervalStore={setCurrentIntervalStore}
                        saveDirectory={saveDirectory}
                        setSaveDirectoryStore={setSaveDirectoryStore}
                        setSaveDirectory={setSaveDirectory}
                        setPlaybackMode={setPlaybackMode}
                        setMountChannelControl={setMountChannelControl}
                        setMountPlayer={setMountPlayer}
                        resetPlayer={resetPlayer}
                    ></ChannelControl>}
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}

export default React.memo(ChannelContainer);
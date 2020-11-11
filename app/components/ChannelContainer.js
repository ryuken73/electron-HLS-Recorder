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
    const {order, channelName, clips, setClip, useWebUrls=false} = props;
    console.log('rerender:', channelName, useWebUrls)
    const [currentUrl, setCurrentUrl] = React.useState(cctvs[order].url);
    const [saveDirectory, setSaveDirectory] = React.useState(path.join(baseDirectory, channelName));

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

    return (
        <SectionWithFullHeight width="900px">
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" >
                    <HLSPlayer channelName={channelName} url={currentUrl} controls={true} autoplay={true}></HLSPlayer>
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl 
                        cctvs={cctvs}
                        channelName={channelName}
                        currentUrl={currentUrl} 
                        saveDirectory={saveDirectory}
                        setCurrentUrl={setCurrentUrl}
                        setSaveDirectory={setSaveDirectory}
                        clips={clips}
                        setClip={setClip}
                    ></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}
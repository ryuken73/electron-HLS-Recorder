import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import HLSPlayer from './HLSPlayer';

export default function ChannelContainer() {
    return (
        <SectionWithFullHeight width="900px">
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" >
                    <HLSPlayer src="d:/temp/cctv/stream.m3u8"></HLSPlayer>
                </BorderedBox>
                <BorderedBox display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}
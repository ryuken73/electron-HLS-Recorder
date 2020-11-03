import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import HLSPlayer from './HLSPlayer';

const src = 'https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA==';
// const src = 'd:/temp/cctv/stream.m3u8'
export default function ChannelContainer() {
    return (
        <SectionWithFullHeight width="900px">
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" >
                    <HLSPlayer src={src}></HLSPlayer>
                </BorderedBox>
                <BorderedBox display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}
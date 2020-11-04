import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import HLSPlayer from './HLSPlayer';

const initialUrl = 'https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA==';
export default function ChannelContainer() {
    const [url, setUrl] = React.useState(initialUrl);
    return (
        <SectionWithFullHeight width="900px">
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" >
                    <HLSPlayer src={url} setUrl={setUrl}></HLSPlayer>
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl currentUrl={url} setUrl={setUrl}></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}
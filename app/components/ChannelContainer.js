import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import BorderedBox from './template/BorderedBox';
import ChannelControl from './ChannelControl';
import SectionWithFullHeight from './template/SectionWithFullHeight';
import HLSPlayer from './HLSPlayer';

// const initialUrl = 'https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA==';
// const initialUrl = 'https://cctvsec.ktict.co.kr/9967/18K2VXgcUTnVklZg6zyPwbLSXYDtSnZMuH5LjkidcAZ+s06yKlFBe0fL8i7ywcEcGcnsCN8bUr6YDpMaTKupqA==';
// const initialUrl = 'https://cctvsec.ktict.co.kr/9969/yS5hqESl1h3lDyHenHKZwjyV0cTQrKL/W7+XJ7yT++B8tTHu7XgfkT9SdQ+xS69KeLIQEDz2snB3pCArK+aixg==';
// const initialUrl = 'https://cctvsec.ktict.co.kr/9971/JZPSStTa9uhQihw1KwlqrXkOapWH8QK3jnJ6KjGLzeT9ZB6LOT9s45jHRinV5amDLf4V+V1jWGihdkpIylY1aQ==';
const initialUrl = 'd:/temp/cctv/stream.m3u8';
export default function ChannelContainer() {
    const [url, setUrl] = React.useState(initialUrl);
    return (
        <SectionWithFullHeight width="900px">
            <Box display="flex">
                <BorderedBox display="flex" alignContent="center" flexGrow="1" >
                    <HLSPlayer url={url}></HLSPlayer>
                </BorderedBox>
                <BorderedBox bgcolor="#2d2f3b" display="flex" alignContent="center" flexGrow="1" width="1">
                    <ChannelControl currentUrl={url} setUrl={setUrl}></ChannelControl>
                </BorderedBox>
            </Box>
        </SectionWithFullHeight>     
    )
}
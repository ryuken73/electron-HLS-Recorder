import React from 'react';
import AppMain from './AppMain';
import AppRecorder from './AppRecorder';
import log from 'electron-log';
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.file.maxSize = 10485760;

const {remote} = require('electron');

const parseQuery = queryString => {
    const queryArray = queryString.replace(/^\?/,'').split('&');
    return queryArray.reduce((parsed, queryParam) => {
        const key = queryParam.split('=')[0];
        const value = queryParam.split('=')[1];
        // console.log('**',key,value)
        log.info('**',key,value)
        parsed[key] = value;
        return parsed
    },{})
}

const INITIAL_CHANNEL_COUNT = 2;
const query = parseQuery(location.search);
const isMainWindow = query.child !== 'true';
const isChildWindow = !isMainWindow;
const channelCount = INITIAL_CHANNEL_COUNT;

log.info('^^^', query)

export default function App() {
    return (
        <React.Fragment>
            {isMainWindow && <AppMain></AppMain>}
            {isChildWindow && <AppRecorder></AppRecorder>}
        </React.Fragment>
    )
}

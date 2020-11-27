import React from 'react';
import AppMain from './AppMain';
import AppRecorder from './AppRecorder';

const {remote} = require('electron');

const parseQuery = queryString => {
    const queryArray = queryString.replace(/^\?/,'').split('&');
    return queryArray.reduce((parsed, queryParam) => {
        const key = queryParam.split('=')[0];
        const value = queryParam.split('=')[1];
        console.log('**',key,value)
        parsed[key] = value;
        return parsed
    },{})
}

const INITIAL_CHANNEL_COUNT = 2;
const query = parseQuery(location.search);
const isMainWindow = query.child !== 'true';
const isChildWindow = !isMainWindow;
const channelCount = INITIAL_CHANNEL_COUNT;

console.log('^^^', query)

export default function App() {
    return (
        <React.Fragment>
            {isMainWindow && <AppMain></AppMain>}
            {isChildWindow && <AppRecorder></AppRecorder>}
        </React.Fragment>
    )
}

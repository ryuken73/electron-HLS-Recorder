import React from 'react';
import AppMain from './AppMain';
import AppRecorder from './AppRecorder';
import log from 'electron-log';
const fs = require('fs');
const utils = require('../utils');
const path = require('path');

log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.file.maxSize = 10485760;
log.transports.file.level = 'info';
log.transports.console.level = 'info';
log.transports.file.archiveLog = file => {
    file = file.toString();
    const info = path.parse(file);
    const dayString = utils.date.getString(new Date(),{});
    try {
      fs.renameSync(file, path.join(info.dir, info.name + dayString + '.' + info.ext));
    } catch (e) {
      console.warn('Could not rotate log', e);
    }
  }

const {remote} = require('electron');

const parseQuery = queryString => {
    const queryArray = queryString.replace(/^\?/,'').split('&');
    return queryArray.reduce((parsed, queryParam) => {
        const key = queryParam.split('=')[0];
        const value = queryParam.split('=')[1];
        // console.log('**',key,value)
        parsed[key] = value;
        return parsed
    },{})
}

const INITIAL_CHANNEL_COUNT = 2;
const query = parseQuery(location.search);
const isMainWindow = query.child !== 'true';
const isChildWindow = !isMainWindow;
const channelCount = INITIAL_CHANNEL_COUNT;

export default function App() {
    return (
        <React.Fragment>
            {isMainWindow && <AppMain></AppMain>}
            {isChildWindow && <AppRecorder></AppRecorder>}
        </React.Fragment>
    )
}

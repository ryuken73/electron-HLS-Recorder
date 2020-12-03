import React from 'react';
// import AppMain from './AppMain';
import AppMainContainer from '../containers/AppMainContainer';
import AppRecorder from './AppRecorder';
const fs = require('fs');
const utils = require('../utils');
const electronUtil = require('../lib/electronUtil');
const path = require('path');

electronUtil.initElectronLog({});

const {remote} = require('electron');
const queryString = location.search.replace(/^\?/,'');
const queryObject = utils.string.toObject(queryString, /*itemSep*/ '&', /*keySep*/ '=');
const isMainWindow = queryObject.child !== 'true';
const isChildWindow = !isMainWindow;

export default function App() {
    return (
        <React.Fragment>
            {isMainWindow && <AppMainContainer></AppMainContainer>}
            {isChildWindow && <AppRecorder></AppRecorder>}
        </React.Fragment>
    )
}

/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import path from 'path';
// const path = require('path')
import { forwardToRenderer, triggerAlias, replayActionMain } from 'electron-redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import * as modules from './modules';

const logger = createLogger({
  level: 'info',
  collapsed: true
});

const middlewares = [thunk, logger];

  // get reducers
const reducers = combineReducers({
  ...modules
});

const composeEnhancers = compose;

const store = createStore(reducers, composeEnhancers(
  applyMiddleware(
    triggerAlias,
    ...middlewares,
    forwardToRenderer
  )
));

replayActionMain(store);

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }
  // const {width,height} = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    show: false,
    width: 400,
    height: 900,
    x:50,
    y:50,
    title: 'HLS Recorder [Main]',
    backgroundColor: '#252839',
    minimizable: false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});

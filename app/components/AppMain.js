import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import FullHeightContainer from './template/FullHeightContainer';
import FirstChildSection from './template/FirstChildSection';
import HLSPlayer from './HLSPlayer';
import ChannelContainer from './ChannelContainer';
import PreviewContainer from './PreviewContainer';
import utils from '../utils';
import {BasicButton} from './template/basicComponents';
import SelectComponent from './template/SelectComponent';
const {getAbsolutePath} = require('../lib/electronUtil')
const {m3u8ToFileArray} = require('../lib/tsFileUtil');
const {convertMP4} = require('../lib/RecordHLS_ffmpeg');
const fs = require('fs');
const rimraf = require('rimraf')
const log = require('electron-log');
const {remote} = require('electron');

import defaults from '../config/defaults';
const {maxClips=3000} = defaults;
const {maxPreviewClips=17} = defaults;
// const {deleteTSFiles=false} = defaults;
// const {deleteEvenDurationChanged=false} = defaults;

const theme = createMuiTheme({
  typography: {
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      fontSize: 12,
      fontWeight: 500,
    }
  },
});

const appLog = (() => {
  return {
      debug : msg => log.debug(`[AppMain]${msg}`),
      info : msg => log.info(`[AppMain]${msg}`),
      warn : msg => log.warn(`[AppMain]${msg}`),
      error : msg => log.error(`[AppMain]${msg}`)
    }
})()

const Store = require('electron-store');
const store = new Store({watch: true});

function App(props) {
  appLog.info('re-rerendered!')
  const {savedClips} = props;
  console.log(props)
  const {setClipStore, deleteClip} = props.AppMainAction;
  let initialClips;
  React.useEffect(() => {
    initialClips = savedClips;
    const oldVersionType = initialClips.length > 0 && initialClips.some(clip => typeof(clip) === 'string');
    if(oldVersionType) {
      appLog.info('^^^app has old version clips in store. resetting clips value to []....');
      setClipStore({savedClips:[]});
    }
  },[])
  // const defaultClips = [];
  const defaultInterval = {title:'1 Hour', milliseconds:3600000};

  // const clipsFromStore = store.get(`clips`, defaultClips);
  // const oldVersionType = clipsFromStore.length > 0 && clipsFromStore.some(clip => typeof(clip) === 'string');
  // if(oldVersionType) {
  //   appLog.info('^^^app has old version clips in store. resetting clips value to []....');
  //   initialClips = defaultClips;
  //   store.set('clips', defaultClips);
  // }
  const initialPlayerCount = store.get(`playerCount`, 4);
  const [currentPlayerCount, setCurrentPlayerCount] = React.useState(initialPlayerCount);
  // const [clips, setClip] = React.useState(initialClips);
  const [channels, setUsedChannel] = React.useState([]);
  const [openInProgress, setOpenInProgress] = React.useState(false);

  const getUnusedChannels = count => {
    const results = [];
    for(let i=1; results.length !== count; i++){
      if(!channels.includes(i)) results.push(i)
    }
    return results;
  }

  const { BrowserWindow } = remote;
  const url = require('url');
  const path = require('path');

  const onClickButton = () => {
    const playerWindowHeight = {
      4: 900,
      2: 520,
      1: 280
    }
    setOpenInProgress(true);
    const nextChannels = getUnusedChannels(currentPlayerCount)
    const win = new BrowserWindow({
        height: playerWindowHeight[currentPlayerCount],
        width: 850,
        title: 'HLS Recoder [Recorder]',
        x: 434 + channels.length * 20,
        y: 50 + channels.length * 5,
        backgroundColor: '#252839',
        show: false,
        minimizable: false,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
      },
    })
    win.once('show', () => {
      setOpenInProgress(false);
      setUsedChannel(prevChannels => {
        return [...prevChannels, ...nextChannels];
      })
    })
    win.once('close', () => {
      setUsedChannel(prevChannels => {
        return [...prevChannels].filter(channel => !nextChannels.includes(channel))
      })
    })
    win.show();
    win.loadURL(
      url.format({
        pathname: getAbsolutePath('appRecorder.html',false),
        protocol: 'file:',
        slashes: true,
        query: {
          child: true,
          channels: nextChannels.join(':')
        },
      })
    )
  }

  const playerCount = [
    {label:1, value:1},
    {label:2, value:2},
    {label:4, value:4},
  ]

  const onChangeSelect = (event) => {
    const playerCount = event.target.value;
    setCurrentPlayerCount(playerCount);
    store.set('playerCount', playerCount);
  }

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" height="100%">
        <PreviewContainer 
          clips={savedClips.slice(0, maxPreviewClips)} 
          removeClip={deleteClip}
          // setPlaybackRateStore={setPlaybackRateStore}
          // getPlaybackRateStore={getPlaybackRateStore}
        ></PreviewContainer>
      </Box>
      <Box display="flex">
        <Box width="50%" mr="5px">
          <BasicButton 
            bgcolor={"#191d2e"} 
            onClick={onClickButton}
            color="secondary" 
            variant={"contained"} 
            ml={"0px"}
            width={"100%"}
            disabled={openInProgress}
          >open new window
          </BasicButton>
        </Box>
        <Box width="50%">
          <SelectComponent
            currentItem={currentPlayerCount}
            menuItems={playerCount}
            onChangeSelect={onChangeSelect} 
            selectColor={'#232738'}
            fontcolor={"white"}
          >
          </SelectComponent>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
   
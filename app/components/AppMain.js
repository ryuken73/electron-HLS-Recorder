import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button'
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import FullHeightContainer from './template/FullHeightContainer';
import FirstChildSection from './template/FirstChildSection';
import HLSPlayer from './HLSPlayer';
import ChannelContainer from './ChannelContainer';
import PreviewContainer from './PreviewContainer';
import utils from '../utils';
import {BasicButton} from './template/basicComponents'
const {getAbsolutePath} = require('../lib/electronUtil')
const {remote} = require('electron');

const channelPrefix = 'channel';
const start=1;
const stop=4;
const generateChannelNames = (start, stop) => {
  const results = [];
  for(let i=start ; i <= stop ; i++){
    results.push(`${channelPrefix}${i}`)
  }
  return results;
}
const channelNames = generateChannelNames(start, stop)


const Store = require('electron-store');
const store = new Store({watch: true});

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

const intervals = [

]

function App() {
  const defaultClips = [];
  const defaultInterval = {title:'1 Hour', milliseconds:3600000};
  const initialClips = store.get(`clips`, defaultClips);
  const [clips, setClip] = React.useState(initialClips);
  const [channels, setUsedChannel] = React.useState([]);
  const [openInProgress, setOpenInProgress] = React.useState(false);

  const getUnusedChannels = count => {
    const results = [];
    for(let i=1; results.length !== count; i++){
      if(!channels.includes(i)) results.push(i)
    }
    return results;
  }

  const setPlaybackRateStore = (playbackRate) => {
    console.log('$$$$$$$$$$$ set', playbackRate)
    store.set('playbackRate', playbackRate);
  }

  const getPlaybackRateStore = () => {
    const playbackRate = store.get('playbackRate', 3);
    console.log('$$$$$$$$$$$ get', playbackRate)
    return playbackRate
  }

  const removeClip = React.useCallback( async clipFullName => {
    console.log('########', clipFullName);
    try {
      await utils.file.delete(clipFullName);
    } catch(err) {
      // alert(err);
      console.error(err)
    } finally {
      setClip(oldClips => {
        const newClips = oldClips.filter(clip => clip !== clipFullName);
        store.set('clips', newClips);
        return newClips;
      })
    }

  }, [clips])

  React.useEffect(() => {
    store.onDidChange('clips', (clips) => {
      setClip(clips);
    })
  },[])

  const { BrowserWindow } = remote;
  const url = require('url');
  const path = require('path');
  console.log(`^^^dirname:${__dirname}`)
  console.log(`^^^2channels`, channels)

  const onClickButton = () => {
    setOpenInProgress(true);
    const nextChannels = getUnusedChannels(4)
    // console.log('^^^',getAbsolutePath('app.html',false), channels, nextChannels )
    console.log('^^^',getAbsolutePath('appRecorder.html',false), channels, nextChannels )
    const win = new BrowserWindow({
        height: 900,
        width: 850,
        title: 'HLS Recoder [Recorder]',
        x: 440 + channels.length * 20,
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
      console.log('^^^1', nextChannels);
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

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" height="100%">
        <PreviewContainer 
          clips={clips} 
          removeClip={removeClip}
          setPlaybackRateStore={setPlaybackRateStore}
          getPlaybackRateStore={getPlaybackRateStore}
        ></PreviewContainer>
      </Box>
      <BasicButton 
        bgcolor={"#191d2e"} 
        onClick={onClickButton}
        color="secondary" 
        variant={"contained"} 
        ml={"0px"}
        disabled={openInProgress}
      >open new window
      </BasicButton>
    </ThemeProvider>
  );
}

export default App;
   
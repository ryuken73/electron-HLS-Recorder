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
const {deleteTSFiles=false} = defaults;
const {deleteEvenDurationIncorrect=false} = defaults;

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

function App() {
  appLog.info('re-rerendered!')
  const defaultClips = [];
  const defaultInterval = {title:'1 Hour', milliseconds:3600000};
  const clipsFromStore = store.get(`clips`, defaultClips);
  let initialClips = clipsFromStore;
  const oldVersionType = clipsFromStore.length > 0 && clipsFromStore.some(clip => typeof(clip) === 'string');
  if(oldVersionType) {
    appLog.info('^^^app has old version clips in store. resetting clips value to []....');
    initialClips = defaultClips;
    store.set('clips', defaultClips);
  }
  const initialPlayerCount = store.get(`playerCount`, 4);
  const [currentPlayerCount, setCurrentPlayerCount] = React.useState(initialPlayerCount);
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
    store.set('playbackRate', playbackRate);
  }

  const getPlaybackRateStore = () => {
    const playbackRate = store.get('playbackRate', 1);
    return playbackRate
  }

  const removeClip = React.useCallback( async clipFullName => {
    try {
      await utils.file.delete(clipFullName);
    } catch(err) {
      console.error(err)
    } finally {
      setClip(oldClips => {
        appLog.info(`delete clip [${clipFullName}]`);
        const newClips = oldClips.filter(clip => clip.mp4Name !== clipFullName);
        store.set('clips', newClips);
        return newClips;
      })
    }

  }, [clips])

  React.useEffect(() => {
    const unsubscribe = store.onDidChange('clips', async (newClips, oldClips) => {
      appLog.info(`store changed![clips]`)
      setClip(newClips);
      if(newClips.length > oldClips.length || newClips.length === maxClips){
        appLog.info(`new clip encoded!`)
        // new clip added
        const newClip = newClips.find(clip => {
          return oldClips.every(oldClip => oldClip.clipId !== clip.clipId);
        })
        appLog.info(`new hls stream saved: ${newClip.hlsDirectory}`);
        if(newClip.mp4Converted == true){
          appLog.error(`new hls stream is already converted. just return : ${newClip.hlsDirectory}`)
          return;
        }
        const {hlsm3u8, hlsDirectory, channelName, mp4Name, saveDirectory,startTime, duration} = newClip;
        const tsFilesArray = await m3u8ToFileArray(newClip.hlsm3u8);
        const oneTSFile = path.join(hlsDirectory, `${channelName}.ts`);
        const result = await utils.file.concatFiles(tsFilesArray, oneTSFile);
        appLog.info(`new hls stream merged to one ts file: ${oneTSFile}`);
        try {
          const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
          const durationNew = await convertMP4(oneTSFile, mp4Name, ffmpegPath);
          if(durationNew === duration){
            appLog.info(`########## ts file's duration equals with converted mp4's duration ##########`);
            deleteTSFiles && rimraf(hlsDirectory, err => console.error(err));
          } else {
            deleteEvenDurationIncorrect && rimraf(hlsDirectory, err => console.error(err));
          }
          const durationSafeString = durationNew.replace(/:/g,';');  
          const mp4NameNew = path.join(saveDirectory, `${channelName}_${startTime}_[${durationSafeString}].mp4`);
          if(mp4Name !== mp4NameNew){
            appLog.warn(`converted mp4's duration differ from origial hls: original=${mp4Name} mp4 converted=${mp4NameNew}`);
            await fs.promises.rename(mp4Name, mp4NameNew);
          }
          appLog.info(`merged ts file successfully converted to mp4: ${mp4Name}`);
          const doneClip = {...newClip, duration: durationNew, mp4Name: mp4NameNew, mp4Converted: true};
          const currentClips = store.get('clips');
          const doneClips = currentClips.map(clip => {
            if(clip.clipId === doneClip.clipId){
              return doneClip
            }
            return clip
          })
          appLog.info(`save new Clip to list: ${mp4Name}`)
          setClip(doneClips)
          store.set('clips', doneClips);
        } catch (error) {
          appLog.error(error)
        }
      }
    })
    return () => {
      unsubscribe();
    }
  },[])

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
          clips={clips.slice(0, maxPreviewClips)} 
          removeClip={removeClip}
          setPlaybackRateStore={setPlaybackRateStore}
          getPlaybackRateStore={getPlaybackRateStore}
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
          >
          </SelectComponent>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
   
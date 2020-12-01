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
const {m3u8ToFileArray} = require('../lib/tsFileUtil');
const {convertMP4} = require('../lib/RecordHLS_ffmpeg');
const fs = require('fs');
const rimraf = require('rimraf')
const {remote} = require('electron');

import defaults from '../config/defaults';
const {maxClips=3000} = defaults;
const {maxPreviewClips=17} = defaults;
const {deleteTSFiles=false} = defaults;
const {deleteEvenDurationIncorrect=false} = defaults;


// const channelPrefix = 'channel';
// const start=1;
// const stop=4;
// const generateChannelNames = (start, stop) => {
//   const results = [];
//   for(let i=start ; i <= stop ; i++){
//     results.push(`${channelPrefix}${i}`)
//   }
//   return results;
// }
// const channelNames = generateChannelNames(start, stop)

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

const Store = require('electron-store');
const store = new Store({watch: true});

function App() {
  const defaultClips = [];
  const defaultInterval = {title:'1 Hour', milliseconds:3600000};
  const clipsFromStore = store.get(`clips`, defaultClips);
  let initialClips = clipsFromStore;
  const oldVersionType = clipsFromStore.length > 0 && clipsFromStore.some(clip => typeof(clip) === 'string');
  if(oldVersionType) {
    console.log('^^^app has old version clips in store. resetting clips value to []....');
    initialClips = defaultClips;
    store.set('clips', defaultClips);
  }
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
    // console.log('$$$$$$$$$$$ set', playbackRate)
    store.set('playbackRate', playbackRate);
  }

  const getPlaybackRateStore = () => {
    const playbackRate = store.get('playbackRate', 1);
    // console.log('$$$$$$$$$$$ get', playbackRate)
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
        console.log('$$$$ remove clip')
        const newClips = oldClips.filter(clip => clip.mp4Name !== clipFullName);
        store.set('clips', newClips);
        return newClips;
      })
    }

  }, [clips])

  React.useEffect(() => {
    const unsubscribe = store.onDidChange('clips', async (newClips, oldClips) => {
      console.log(`clips store changed!!`, newClips, oldClips)
      setClip(newClips);
      if(newClips.length > oldClips.length || newClips.length === maxClips){
        // new clip added
        console.log('new clip added!!')
        const newClip = newClips.find(clip => {
          return oldClips.every(oldClip => oldClip.clipId !== clip.clipId);
        })
        console.log(newClip)
        if(newClip.mp4Converted == true){
          return;
        }
        const {hlsm3u8, hlsDirectory, channelName, mp4Name, saveDirectory,startTime, duration} = newClip;
        const tsFilesArray = await m3u8ToFileArray(newClip.hlsm3u8);
        const oneTSFile = path.join(hlsDirectory, `${channelName}.ts`);
        const result = await utils.file.concatFiles(tsFilesArray, oneTSFile);
        try {
          const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
          const durationNew = await convertMP4(oneTSFile, mp4Name, ffmpegPath);
          if(durationNew === duration){
            console.log(`########## ts file's duration equals with converted mp4's duration ##########`);
            deleteTSFiles && rimraf(hlsDirectory, err => console.error(err));
          } else {
            deleteEvenDurationIncorrect && rimraf(hlsDirectory, err => console.error(err));
          }
          const durationSafeString = durationNew.replace(/:/g,';');  
          const mp4NameNew = path.join(saveDirectory, `${channelName}_${startTime}_[${durationSafeString}].mp4`);
          if(mp4Name !== mp4NameNew){
            await fs.promises.rename(mp4Name, mp4NameNew);
          }
          const doneClip = {...newClip, duration: durationNew, mp4Name: mp4NameNew, mp4Converted: true};
          const currentClips = store.get('clips');
          const doneClips = currentClips.map(clip => {
            if(clip.clipId === doneClip.clipId){
              return doneClip
            }
            return clip
          })
          setClip(doneClips)
          store.set('clips', doneClips);
        } catch (error) {
          console.log(error)
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
  console.log(`^^^dirname:${__dirname}`)
  console.log(`^^^2channels`, channels)
  console.log(`^^^clips`, clips)

  const onClickButton = () => {
    setOpenInProgress(true);
    const nextChannels = getUnusedChannels(4)
    // console.log('^^^',getAbsolutePath('app.html',false), channels, nextChannels )
    console.log('^^^',getAbsolutePath('appRecorder.html',false), channels, nextChannels )
    const win = new BrowserWindow({
        height: 900,
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
          clips={clips.slice(0, maxPreviewClips)} 
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
   
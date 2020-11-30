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
const {getAbsolutePath} = require('../lib/electronUtil')
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
const query = parseQuery(location.search);
const isMainWindow = query.child !== 'true';
const channelPrefix = 'channel';
const start = isMainWindow ? 1 : query.startChannel;
const stop = isMainWindow ? 4 : query.stopChannel;
const generateChannelNames = (start, stop) => {
  const results = [];
  for(let i=start ; i <= stop ; i++){
    results.push(`${channelPrefix}${i}`)
  }
  return results;
}
const channelNames = generateChannelNames(start, stop)


const Store = require('electron-store');
const store = new Store();

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

// const channelNames = [
//   'channel1',
//   'channel2',
//   'channel3',
//   'channel4',
//   // 'channel5'
// ]

const intervals = [

]

function App() {
  const defaultClips = [];
  const defaultInterval = {title:'1 Hour', milliseconds:3600000};
  const initialClips = store.get(`clips`, defaultClips);
  const [clips, setClip] = React.useState(initialClips);

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

  const setClipStore = clips => {
    // setClip(clips);
    store.set('clips', clips);
  }
  const { BrowserWindow } = remote;
  const url = require('url');
  const path = require('path');
  console.log(`^^^dirname:${__dirname}`)

  const onClickButton = () => {
    console.log('^^^',getAbsolutePath('app.html',false))
    const win = new BrowserWindow({
        height: 850,
        width: 1120,
        title: 'HLS Recoder [Child]',
        webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
      },
    })
    win.loadURL(
      url.format({
        pathname: getAbsolutePath('app.html',false),
        protocol: 'file:',
        slashes: true,
        query: {
          child: true,
          startChannel:5,
          stopChannel:8
        },
      })
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex">
        <Box>
          {channelNames.map((channelName, index) => (
            <ChannelContainer 
              key={index} 
              channelNumber={parseInt(channelName.replace(channelPrefix,''))} 
              channelName={channelName}
              clips={clips}
              setClip={setClip}
              setClipStore={setClipStore}
              store={store}
            ></ChannelContainer>
          ))}      
        </Box>
        {/* <Box>
          {channelNames.map((channelName, index) => (
            <ChannelContainer 
              key={index} 
              order={index} 
              channelName={channelName}
              clips={clips}
              setClip={setClip}
            ></ChannelContainer>
          ))}      
        </Box> */}
        <Box>
          <PreviewContainer clips={clips} removeClip={removeClip}></PreviewContainer>
        </Box>
      </Box>
      {isMainWindow && <Button onClick={onClickButton}>open new window</Button>}
    </ThemeProvider>
  );
}

export default App;
   
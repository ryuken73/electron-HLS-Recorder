import React from 'react';
import Box from '@material-ui/core/Box';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import FullHeightContainer from './template/FullHeightContainer';
import FirstChildSection from './template/FirstChildSection';
import HLSPlayer from './HLSPlayer';
import ChannelContainer from './ChannelContainer';
import PreviewContainer from './PreviewContainer';
import utils from '../utils';

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

const channelNames = [
  'channel1',
  'channel2',
  'channel3',
  'channel4',
  // 'channel5'
]

function App() {
  const defaultClips = [];
  const defaultIntervals = [];
  const initialClips = store.get(`clips`, defaultClips);
  const initialIntervals = store.get('intervals', defaultIntervals);
  const [clips, setClip] = React.useState(initialClips);
  const [intervals, setIntervals] = React.useState(initialIntervals);

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
    setClip(clips);
    store.set('clips', clips);
  }

  const setIntervalStore = intervals => {
    setIntervals(intervals);
    store.set('intervals', intervals);
  }

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex">
        <Box>
          {channelNames.map((channelName, index) => (
            <ChannelContainer 
              key={index} 
              order={index} 
              channelName={channelName}
              clips={clips}
              setClip={setClip}
              setClipStore={setClipStore}
              intervals={intervals}
              setIntervals={setIntervals}
              setIntervalStore={setIntervalStore}
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
    </ThemeProvider>
  );
}

export default App;
   
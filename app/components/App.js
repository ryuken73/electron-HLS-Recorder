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
  const initialClips = store.get(`clips`, defaultClips)
  const [clips, setClip] = React.useState(initialClips);

  const removeClip = React.useCallback( async clipFullName => {
    console.log('########', clipFullName);
    try {
      await utils.file.delete(clipFullName);
      setClip(oldClips => {
        const newClips = oldClips.filter(clip => clip !== clipFullName);
        store.set('clips', newClips);
        return newClips;
      })
    } catch(err) {
      alert(err);
    }

  }, [clips])

  const setClipStore = clips => {
    setClip(clips);
    store.set('clips', clips);
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
   
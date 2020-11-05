import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import FullHeightContainer from './template/FullHeightContainer';
import FirstChildSection from './template/FirstChildSection';
import HLSPlayer from './HLSPlayer';
import ChannelContainer from './ChannelContainer'

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
]

function App() {
  return (
    <ThemeProvider theme={theme}>    
      {channelNames.map((channelName, index) => (
        <ChannelContainer key={index} order={index} channelName={channelName}></ChannelContainer>
      ))}      
    </ThemeProvider>
  );
}

export default App;
   
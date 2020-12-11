import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button'
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import FullHeightContainer from './template/FullHeightContainer';
import FirstChildSection from './template/FirstChildSection';
import HLSPlayer from './HLSPlayer';
import ChannelContainer from './ChannelContainer';
import PreviewContainer from './PreviewContainer';
import ActionAll from './ActionAll';
import utils from '../utils';
const {remote} = require('electron');

const queryString = location.search.replace(/^\?/,'');
const queryObject = utils.string.toObject(queryString, /*itemSep*/ '&', /*keySep*/ '=');

const channelPrefix = 'channel';
const {channels='1:2:3:4'} = queryObject;
const channelNames = decodeURIComponent(channels).split(':').map(number => `${channelPrefix}${number}`);
const moreThanOneChannel = channelNames.length > 1;
const showActionAll = moreThanOneChannel;

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

function App() {
  const { BrowserWindow } = remote;
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex">
        <Box>
          {channelNames.map((channelName, index) => (
            <ChannelContainer 
              key={index} 
              channelNumber={parseInt(channelName.replace(channelPrefix,''))} 
              channelName={channelName}
              // store={store}  
            ></ChannelContainer>
          ))}     
          {showActionAll && 
          <Box ml={"25px"}>
            <ActionAll></ActionAll>
          </Box>}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default React.memo(App);
   
import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import FullHeightContainer from './template/FullHeightContainer';
import FirstChildSection from './template/FirstChildSection';
import HLSPlayer from './HLSPlayer';
// import Html5Player from './Html5Player';
import WebView from './WebView';
import ChannelContainer from './ChannelContainer'

const theme = createMuiTheme({
  typography: {
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      fontSize: 12,
      fontWeight: 500,
    },
    button: {
      // fontStyle: 'italic',
    },
  },
});
const players = [1]
const src = "https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA=="
function App() {
  const videoPlayers = []
  for(let i=0;i<players.length;i++){
    videoPlayers.push(<HLSPlayer src={src} key={players[i]} controls={true} autoplay={true} bigPlayButton={true}></HLSPlayer>);
    console.log(i)
  }
  console.log(videoPlayers)
  React.useEffect(() => {
    console.log('mounted')
  })

  return (
    <ThemeProvider theme={theme}>    
      <ChannelContainer></ChannelContainer>
    </ThemeProvider>
  );
}

export default App;
   
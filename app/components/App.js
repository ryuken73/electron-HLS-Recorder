import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import FullHeightContainer from './template/FullHeightContainer';
import FirstChildSection from './template/FirstChildSection';
import VideoPlayer from './VideoPlayer';
import WebView from './WebView';



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
const players = [1,2,3,4,5,6,7,8,9];

function App() {
  const videoPlayers = []
  for(let i=0;i<players.length;i++){
    videoPlayers.push(<VideoPlayer key={players[i]} controls={true} autoplay={true} bigPlayButton={true}></VideoPlayer>);
    console.log(i)
  }
  console.log(videoPlayers)
  React.useEffect(() => {
    console.log('mounted')
  })

  return (
    <ThemeProvider theme={theme}>
      {videoPlayers}
    </ThemeProvider>
  );
}

export default App;
   
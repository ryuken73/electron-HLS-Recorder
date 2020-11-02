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
// video.js can't follow 302 redirect. see below.
// * incorrect url is made based on initial url not redirected url
// correct : https://cctvsec.ktict.co.kr:8082/livekbs/9965/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9MTAvMjgvMjAyMCAzOjA0OjU0IFBNJmhhc2hfdmFsdWU9RXZnMGxLbk83QStabmt3aTF3TzRQUT09JnZhbGlkbWludXRlcz0xMjA=
// incorrect : https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/chunks.m3u8?nimblesessionid=66101573&wmsAuthSign=c2VydmVyX3RpbWU9MTEvMi8yMDIwIDY6NTU6MTEgQU0maGFzaF92YWx1ZT02VFFvZUIwa3FqbFgza2tpZ0pOYTFRPT0mdmFsaWRtaW51dGVzPTEyMA==
const src = "https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA=="
// const src = "d:/temp/cctv/stream.m3u8";
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
      {/* {videoPlayers} */}
      {/* <Html5Player></Html5Player> */}
      <ChannelContainer></ChannelContainer>
    </ThemeProvider>
  );
}

export default App;
   
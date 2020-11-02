import React from 'react';
import { Player } from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"; 

const Html5Player = () => {
    console.log('html5player')
    return (
        <Player
            playsInline
            // src="d:/temp/cctv_kbs.mp4"
            // src="d:/temp/cctv_rerender.mp4"
            src="d:/temp/cctv_transcoder.mp4"
            // src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
        >        
        </Player>
    );
};

export default Html5Player;
import React, { Component } from 'react';
// import VideoPlayer from 'react-video-js-player';
import VideoPlayer from './VideoPlayer'

const HLSPlayer = (props) => {
    const [player, setPlayer] = React.useState({});
    const {
        width=360, 
        height=205, 
        controls=false, 
        autoplay=true, 
        bigPlayButton=false, 
        bigPlayButtonCentered=false, 
        src
    } = props;

    // React.useEffect((() => {
    //     player.src({
    //         src: src,
    //         type: 'application/x-mpegURL',
    //         handleManifestRedirects: true
    //     })
    // }),[src]);

    const onPlayerReady = player => {
        console.log("Player is ready: ", player);
        setPlayer(player);
        player.muted(true);
        player.src({
            src: src,
            type: 'application/x-mpegURL',
            handleManifestRedirects: true
        })
        // const vhs = player.tech()
        // console.log(vhs)
        // console.log('playlist',vhs.playlists.media)
    }

    const onVideoPlay = duration => {
        console.log("Video played at: ", duration);
    }

    const onVideoPause = duration =>{
        console.log("Video paused at: ", duration);
    }

    const onVideoTimeUpdate = duration => {
        // console.log("Time updated: ", duration);
    }

    const onVideoSeeking = duration => {
        console.log("Video seeking: ", duration);
    }

    const onVideoSeeked = (from, to) => {
        console.log(`Video seeked from ${from} to ${to}`);
    }

    const onVideoEnd = () => {
        console.log("Video ended");
    }
    return (
        <div>
            <VideoPlayer
                controls={controls}
                src={src}
                // poster={this.state.video.poster}
                autoplay={autoplay}
                bigPlayButton={bigPlayButton}
                bigPlayButtonCentered={bigPlayButtonCentered}
                width={width}
                height={height}
                onReady={onPlayerReady}
                onPlay={onVideoPlay}
                onPause={onVideoPause}
                onTimeUpdate={onVideoTimeUpdate}
                onSeeking={onVideoSeeking}
                onSeeked={onVideoSeeked}
                onEnd={onVideoEnd}
                handleManifestRedirects={true}
            />
        </div>
    );
};

export default React.memo(HLSPlayer);
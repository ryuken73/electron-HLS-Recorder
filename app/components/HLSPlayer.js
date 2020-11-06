import React, { Component } from 'react';
// import VideoPlayer from 'react-video-js-player';
import VideoPlayer from './VideoPlayer'

const HLSPlayer = (props) => {
    const [player, setPlayer] = React.useState({});
    const {
        channelName,
        width=360, 
        height=205, 
        controls=false, 
        autoplay=true, 
        bigPlayButton=false, 
        bigPlayButtonCentered=false, 
        url
    } = props;
    console.log('rerender HLSPlayer:',channelName)

    const srcObject = {
        src: url,
        type: 'application/x-mpegURL',
        handleManifestRedirects: true
    }

    const onPlayerReady = player => {
        console.log("Player is ready: ", player);
        setPlayer(player);
        player.muted(true);
        player.src(srcObject)
        setInterval(() => {
            // console.log(player.duration());
            console.log(player.currentTime());
            console.log(player.ended());
            console.log(player.error());
            console.log(player.paused());
            // const timeRange = player.played();
            // const {length} = timeRange;
            // console.log(`${channelName}: ${timeRange.start()}-${timeRange.end()} : ${length}`)
        },1000)
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
                src={srcObject}
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
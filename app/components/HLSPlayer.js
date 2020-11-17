import React, { Component } from 'react';
// import VideoPlayer from 'react-video-js-player';
import VideoPlayer from './VideoPlayer'

const HLSPlayer = (props) => {
    // const [player, setPlayer] = React.useState({});
    const {
        channelName,
        width=320, 
        height=180, 
        controls=false, 
        autoplay=true, 
        bigPlayButton=false, 
        bigPlayButtonCentered=false, 
        url,
        type='application/x-mpegURL'
    } = props;
    console.log('rerender HLSPlayer:',channelName)



    const srcObject = {
        src: url,
        type,
        handleManifestRedirects: true,
    }

    const createLogger = channelName => {
        return msg => {
            console.log(`[${channelName}]`,msg)
        }
    }

    const channelLog = createLogger(channelName);

    const onPlayerReady = player => {
        console.log("Player is ready: ", player);
        // setPlayer(player);
        player.muted(true);
        // player.src(srcObject)
        /*
        setInterval(() => {
            console.log(player.duration());
            console.log(player.currentTime());
            console.log(player.readyState());
            console.log(player.networkState());

            // console.log(player.ended());
            // console.log(player.paused());
            // channelLog(`pastSeekEnd ${player.liveTracker.pastSeekEnd()}`)
            // channelLog(`isTracking ${player.liveTracker.isTracking()}`)
            // channelLog(`behindLiveEdge ${player.liveTracker.behindLiveEdge()}`)
            // channelLog(player.liveTracker)
        },10000)
        */
    }

    const onVideoPlay = duration => {
        channelLog("Video played at: ", duration);
    }

    const onVideoPause = duration =>{
        channelLog("Video paused at: ", duration);
    }

    const onVideoTimeUpdate = duration => {
        // channelLog("Time updated: ", duration);
    }

    const onVideoSeeking = duration => {
        channelLog("Video seeking: ", duration);
    }

    const onVideoSeeked = (from, to) => {
        channelLog(`Video seeked from ${from} to ${to}`);
    }

    const onVideoEnd = () => {
        channelLog("Video ended");
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
                liveui={true}
            />
        </div>
    );
};

export default React.memo(HLSPlayer);
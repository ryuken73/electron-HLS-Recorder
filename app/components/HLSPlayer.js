import React, { Component } from 'react';
import VideoPlayer from './VideoPlayer'

const HLSPlayer = (props) => {
    // const [player, setPlayer] = React.useState({});
    const {player, setPlayer, refreshPlayer=null} = props;
    const {
        channelName,
        width=320, 
        height=180, 
        controls=false, 
        autoplay=true, 
        bigPlayButton=false, 
        bigPlayButtonCentered=false, 
        url,
        type='application/x-mpegURL',
        reMountPlayer
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
        console.log("Player is ready: ",channelName, player);
        setPlayer(player);
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
        // channelLog("Video played at: ", duration);
    }

    const onVideoPause = duration =>{
        // channelLog("Video paused at: ", duration);
    }

    const onVideoTimeUpdate = duration => {
        // channelLog("Time updated: ", duration);
    }

    const onVideoSeeking = duration => {
        // channelLog("Video seeking: ", duration);
    }

    const onVideoSeeked = (from, to) => {
        // channelLog(`Video seeked from ${from} to ${to}`);
    }

    const onVideoError = (error) => {
        channelLog(error);
        if(url === '') return;
        // refreshPlayer()
    }

    const onVideoEnd = () => {
        // channelLog("Video ended");
    }
    const onVideoCanPlay = () => {
        channelLog('can play');
    }

    let refreshTimer = null;
    const onVideoEvent = eventName => {
        console.log(channelName, eventName)
        if(eventName === 'abort'){
            refreshTimer = setInterval(() => {
                console.log('timier triggered')
                refreshPlayer && refreshPlayer();
            },1000)
        }
        if(eventName === 'playing'){
            if(refreshTimer === null) return;
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }
        // alert(eventName)
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
                onCanPlay={onVideoCanPlay}
                onReady={onPlayerReady}
                onPlay={onVideoPlay}
                onPause={onVideoPause}
                onTimeUpdate={onVideoTimeUpdate}
                onSeeking={onVideoSeeking}
                onSeeked={onVideoSeeked}
                onError={onVideoError}
                onEnd={onVideoEnd}
                onEvent={onVideoEvent}
                handleManifestRedirects={true}
                liveui={true}
            />
        </div>
    );
};

export default React.memo(HLSPlayer);
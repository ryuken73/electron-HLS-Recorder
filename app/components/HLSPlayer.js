import { SettingsOverscanRounded, Store } from '@material-ui/icons';
import React, { Component } from 'react';
import VideoPlayer from './VideoPlayer';
import log from 'electron-log';

const HLSPlayer = (props) => {
    // const [player, setPlayer] = React.useState({});
    const {
        player, 
        setPlayer, 
        refreshPlayer=null, 
        setPlaybackRateStore=() => {},
        getPlaybackRateStore=() => 1,
        enableOverlay=true,
        overlayContent='Default Overlay Content'
    } = props;
    const {
        channelName='preview',
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

    log.info(`[${channelName}] rerender HLSPlayer:`,channelName);

    const srcObject = {
        src: url,
        type,
        handleManifestRedirects: true,
    }

    const createLogger = channelName => {
        return msg => {
            log.info(`[${channelName}]`,msg)
        }
    }

    const channelLog = createLogger(channelName);

    const onPlayerReady = player => {
        channelLog("Player is ready: ",channelName);
        setPlayer(player);
        const playbackRate = getPlaybackRateStore();
        player.playbackRate(playbackRate);
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
        channelLog(`error occurred: ${error.message}`);
        if(url === '') return;
        // refreshPlayer()
    }

    const onVideoEnd = () => {
        // channelLog("Video ended");
    }
    const onVideoCanPlay = () => {
        channelLog('can play');
        const playbackRate = getPlaybackRateStore();
        setPlayer(player => {
            player.playbackRate(playbackRate);
            return player
        })
    }

    const refreshHLSPlayer = () => {
        setPlayer(player => {
            channelLog(`refreshHLSPlayer : change hls src to ${url}`);
            const srcObject = {
                src: url,
                type,
                handleManifestRedirects: true,
            }
            player.src(srcObject)
            return player;
        })
    }

    let refreshTimer = null;
    const onVideoEvent = eventName => {
        channelLog(channelName, eventName)
        if(eventName === 'abort' && refreshPlayer !== null){
            refreshTimer = setInterval(() => {
                channelLog('timier triggered')
                refreshHLSPlayer();
            },2000)
            return
        } else if(eventName === 'abort' && refreshPlayer === null) {
            channelLog('abort but not refresh because refreshPlayer parameter is null');
            return
        }
        if(eventName === 'playing' || eventName === 'loadstart' || eventName === 'waiting'){
            if(refreshTimer === null) {
                channelLog('playing, loadstart or waiting event emitted. but do not clearTimeout(refreshTimer) because refreshTimer is null. exit')
                return;
            }
            channelLog('execute clearTimeout(refreshTimer)')
            clearTimeout(refreshTimer);
            refreshTimer = null;
            return
        }
        if(eventName === 'ratechange'){
            setPlayer(player => {
                // if ratechange occurred not manually but by changing media, just return
                if(player.readyState() === 0) return player;
                const currentPlaybackRate = player.playbackRate();
                setPlaybackRateStore(currentPlaybackRate);
                return player;
            })

        }
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
                enableOverlay={true}
                overlayContent={overlayContent}
            />
        </div>
    );
};

export default React.memo(HLSPlayer);
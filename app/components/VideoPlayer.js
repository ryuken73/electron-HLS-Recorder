import React, { Component } from 'react';
import VideoPlayer from 'react-video-js-player';

class VideoApp extends Component {
    player = {}
    state = {
        video: {
            // src: "https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA==",
            // src: "https://cctvsec.ktict.co.kr:8082/livekbs/9965/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9MTAvMjgvMjAyMCAzOjA0OjU0IFBNJmhhc2hfdmFsdWU9RXZnMGxLbk83QStabmt3aTF3TzRQUT09JnZhbGlkbWludXRlcz0xMjA="
            src: "d:/temp/cctv/stream.m3u8"
            // src: "https://cctvsec.ktict.co.kr:8082/livekbs/9965/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9MTAvMjgvMjAyMCAyOjAyOjQ1IFBNJmhhc2hfdmFsdWU9d3JXck1UWkQzc3N2bUI0YlAxWUp6UT09JnZhbGlkbWludXRlcz0xMjA=",
            // src : "https://cctvsec.ktict.co.kr:8082/livekbs/9965/chunks.m3u8?nimblesessionid=60380933&wmsAuthSign=c2VydmVyX3RpbWU9MTAvMjgvMjAyMCAxOjQ2OjM2IFBNJmhhc2hfdmFsdWU9bDg2cEw4Q3Q1SlVoQU9uR3RkTlJxUT09JnZhbGlkbWludXRlcz0xMjA=",
            // handleManifestRedirects: true,
            // poster: "http://www.example.com/path/to/video_poster.jpg"
        }
    }

    onPlayerReady(player){
        console.log("Player is ready: ", player);
        this.player = player;
        this.player.muted(true)

        this.player.src({
            src: this.state.video.src,
            type: 'application/x-mpegURL',
            handleManifestRedirects: true
        })
    }

    onVideoPlay(duration){
        console.log("Video played at: ", duration);
    }

    onVideoPause(duration){
        console.log("Video paused at: ", duration);
    }

    onVideoTimeUpdate(duration){
        // console.log("Time updated: ", duration);
    }

    onVideoSeeking(duration){
        console.log("Video seeking: ", duration);
    }

    onVideoSeeked(from, to){
        console.log(`Video seeked from ${from} to ${to}`);
    }

    onVideoEnd(){
        console.log("Video ended");
    }

    render() {
        const {width=320, height=210, controls=false, autoplay=true, bigPlayButton=false, bigPlayButtonCentered=false} = this.props
        const src="";
        console.log(width)
        return (
            <div>
                <VideoPlayer
                    controls={controls}
                    src={src}
                    // poster={this.state.video.poster}
                    autoplay={autoplay}
                    bigPlayButton={bigPlayButton}
                    bigPlayButtonCentered={bigPlayButtonCentered}
                    // handleManifestRedirects={true}
                    width={width}
                    height={height}
                    onReady={this.onPlayerReady.bind(this)}
                    onPlay={this.onVideoPlay.bind(this)}
                    onPause={this.onVideoPause.bind(this)}
                    onTimeUpdate={this.onVideoTimeUpdate.bind(this)}
                    onSeeking={this.onVideoSeeking.bind(this)}
                    onSeeked={this.onVideoSeeked.bind(this)}
                    onEnd={this.onVideoEnd.bind(this)}
                />
            </div>
        );
    }
}
export default VideoApp;
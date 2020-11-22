const EventEmitter = require('events');
const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// const hlsInputOptions = ['-dts_delta_threshold', 0] // fornt part of clip not playable
const hlsInputOptions = ['-dts_delta_threshold', 10];
const mp4Options = ['-acodec', 'copy', '-vcodec', 'copy'];;
const hlsOptions = ['-f','hls','-hls_time','2','-hls_list_size','10','-hls_flags','delete_segments','-g',25,'-sc_threshold',0,'-preset','ultrafast','-vsync',2];

class RecoderHLS extends EventEmitter {
    constructor(options){
        super();
        const {
            name='channel1',
            src='', 
            target='target.mp4', 
            enablePlayback=false, 
            localm3u8='./temp/stream.m3u8',
            ffmpegBinary='./ffmpeg.exe',
            renameDoneFile=false
        } = options;
        console.log(ffmpegBinary)
        this._name = name;
        this._src = src;
        this._target = target;
        this._createTime = Date.now();
        this._enablePlayback = enablePlayback;
        this._localm3u8 = localm3u8;
        this._ffmpegBinary = ffmpegBinary;
        this._renameDoneFile = renameDoneFile;
        ffmpeg.setFfmpegPath(this._ffmpegBinary);
        this.initialize();
    }

    initialize = () => {
        this._isPreparing = false;
        this._isRecording = false;
        this._bytesRecorded = 0;
        this._durationRecorded = '00:00:00.00';
        this._startTime = null;
        this._rStream = null;
        console.log('recoder initialized...')
    }

    get name() { return this._name }
    get src() { return this._src }
    get target() { return this._target }
    get enablePlayback() { return this._enablePlayback }
    get renameDoneFile() { return this._renameDoneFile }
    get isRecording() { return this._isRecording }
    get isPreparing() { return this._isPreparing }
    get startTime() { return this._startTime }
    get createTime() { return this._createTime }
    get bytesRecorded() { return this._bytesRecorded }
    get duration() { return this._durationRecorded }
    get rStream() { return this._rStream }
    get wStream() { return this._wStream }
    get command() { return this._command }
    get elapsed() { 
        const elapsedMS = Date.now() - this.startTime;
        // console.log(this.startTime, elapsedMS)
        return elapsedMS > 0 ? elapsedMS : 0;
    }
    get isBusy() { 
        // console.log(this.isRecording, this.isPreparing)
        return this.isRecording || this.isPreparing 
    }  
    set src(url) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._src = url;
    }
    set target(target) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._target = target;
    }   
    set command(cmd) { this._command = cmd }
    set isRecording(bool) { this._isRecording = bool }
    set isPreparing(bool) { this._isPreparing = bool }
    set startTime(date) { this._startTime = date }
    set createTime(date) { this._createTime = date }
    set rStream(stream) { this._rStream = stream }
    set wStream(stream) { this._wStream = stream }
    set localm3u8(m3u8) { this._localm3u8 = m3u8 }
    set bytesRecorded(bytes) { this._bytesRecorded = bytes }
    set duration(duration) { 
        this._durationRecorded = duration;
        this.emit('progress', {
            bytes: this.bytesRecorded,
            duration: this.duration
        })
    };

    onWriteStreamClosed = (error) => {
        console.log(`write stream closed : ${this.target}`);
        if(error){
            this.initialize();
            this.emit('error')
        }
        if(this._renameDoneFile) {
            const baseDir = path.dirname(this.target);
            const startTime = utils.date.getString(new Date(this.startTime),{});
            const duration = this.duration.replace(/:/g,';');     
            const newFname = `${this.name}_${startTime}_[${duration}].mp4`;
            const newFullPath = path.join(baseDir, newFname);
            fs.rename(this.target, newFullPath, err => {
                if(err) {
                    this.emit('error', err);
                    this.initialize();
                    return;
                    // throw new Error(err)
                }
                console.log(`change filename : ${this.target} to ${newFullPath}`)
                this.initialize();
                this.emit('end', newFullPath)
            });
        } else {
            this.initialize();
            this.emit('end', this.target)
        }

    }
    onReadStreamClosed = () => {
        console.log(`read stream closed : ${this.src}`);
    }
    startHandler = cmd => {
        console.log('started: ',cmd);
        this.isPreparing = false;
        this.isRecording = true;
        this.startTime = Date.now();
        this.emit('start', cmd);
    }
    progressHandler = event => {
        // this.bytesRecorded = this.wStream.bytesWritten;
        this.duration = event.timemark;
    }

    start = () => {
        if(this.isBusy) {
            console.log('already started!. stop first');
            throw new Error('already started!. stop first')
        }
        this.isPreparing = true;
        console.log('start encoding..', this.src);
        this.command = ffmpeg(this._src).inputOptions(hlsInputOptions).output(this.target).outputOptions(mp4Options);
        this.enablePlayback && this.command.output(this._localm3u8).outputOptions(hlsOptions);
        this.command
        .on('start', this.startHandler)
        .on('progress', this.progressHandler)
        .on('error', error => {
            console.error('ffmpeg error: ', error) ;
            this.onWriteStreamClosed(error);
        })
        .on('end', (stdout, stderr) => {
            console.log('ffmpeg end!')
            this.onWriteStreamClosed()
        })
        .run();
    }
    stop = () => {
        if(!this.isRecording){
            console.log('start recording first!.')
            throw new Error('start recording first!.')
        }
        this.command.ffmpegProc.stdin.write('q');
    }
    destroy = () => {}
}

const createHLSRecoder = options => {
    const {
        name= 'channel1',
        src= url,
        target='d:/temp/cctv_kbs_ffmpeg.mp4', 
        enablePlayack= true, 
        localm3u8= 'd:/temp/cctv/stream.m3u8',
        ffmpegBinary= 'd:/temp/cctv/ffmpeg.exe',
        renameDoneFile= true
    } = options;
    return new RecoderHLS(options);
}

module.exports = {
    createHLSRecoder
};













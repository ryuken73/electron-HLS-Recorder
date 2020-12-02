const EventEmitter = require('events');
const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const log = require('electron-log');

// const hlsInputOptions = ['-dts_delta_threshold', 0] // fornt part of clip not playable
const hlsInputOptions = ['-dts_delta_threshold', 10];
const mp4Options = ['-acodec', 'copy', '-vcodec', 'copy'];;
const hlsOptions = ['-f','hls', '-hls_time', 4, '-hls_list_size','0','-g',25,'-sc_threshold',0,'-preset','ultrafast','-vsync',2];
// const hlsOptions = ['-f','hls','-hls_time','8','-hls_list_size','10','-hls_flags','delete_segments','-g',25,'-sc_threshold',0,'-preset','ultrafast','-vsync',2];

const sameAsBefore = initialValue => {
    let previousValue = initialValue;
    return currentValue => {
        if(previousValue !== currentValue){
            previousValue = currentValue;
            return false;
        }
        return true;
    }
}

const successiveEvent = checkFunction => {
    let occurred = 0;
    return (value, limit) => {
        if(checkFunction(value)){
            occurred ++;
        } else {
            occurred = 0;
        }
        if(occurred === limit){
            return true;
        }
        log.info(`check successiveEvent : ${value} - ${occurred}`);
        return false;   
    }
}

// below is sington. move in the class
// const INITIAL_TIMEMARKER = '00:00:00.00';
// const checkFunction = sameAsBefore(INITIAL_TIMEMARKER);
// const checkSuccessiveEvent = successiveEvent(checkFunction)

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
        log.debug(ffmpegBinary)
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
        const INITIAL_TIMEMARKER = this._durationRecorded;
        this._startTime = null;
        this._rStream = null;
        const checkFunction = sameAsBefore(INITIAL_TIMEMARKER);
        this.checkSuccessiveEvent = successiveEvent(checkFunction)
        log.info(`[ffmpeg recorder][${this.name}]recoder initialized...`)
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
        log.info(`[ffmpeg recorder][${this.name}]write stream closed : ${this.target}`);
        if(error){
            // this.initialize();
            // not manually initialize
            // send error message to ChannelControl
            this.emit('error', error);
            return;
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
                log.info(`[ffmpeg recorder][${this.name}]change filename : ${this.target} to ${newFullPath}`)
                this.emit('end', this.target, this.startTime, this.duration)
                this.initialize();
            });
        } else {
            log.info(`[ffmpeg recorder][${this.name}]ended ${this.startTime}:${this.duration}`)
            this.emit('end', this.target, this.startTime, this.duration)
            this.initialize();
        }

    }
    onReadStreamClosed = () => {
        log.info(`[ffmpeg recorder][${this.name}]read stream closed : ${this.src}`);
    }
    startHandler = cmd => {
        log.info(`[ffmpeg recorder][${this.name}]started: ${cmd}`);
        this.isPreparing = false;
        this.isRecording = true;
        this.startTime = Date.now();
        this.emit('start', cmd);
    }
    progressHandler = event => {
        // this.bytesRecorded = this.wStream.bytesWritten;
        this.duration = event.timemark;
        log.info(`[ffmpeg recorder][${this.name}]duration: ${this.duration}`);
        const CRITICAL_SUCCESSIVE_OCCUR_COUNT = 5;
        const durationNotChanged = this.checkSuccessiveEvent(this.duration, CRITICAL_SUCCESSIVE_OCCUR_COUNT);
        log.info(`[ffmpeg recorder][${this.name}]value of durationNotChanged: ${durationNotChanged}, duration=${this.duration}`);
        if(durationNotChanged){
            log.error(`[ffmpeg recorder][${this.name}]duration not changed last ${CRITICAL_SUCCESSIVE_OCCUR_COUNT} times`)
            log.error(`[ffmpeg recorder][${this.name}]kill ffmpeg`)
            this.command.kill();
        }
    }

    start = () => {
        if(this.isBusy) {
            log.warn('already started!. stop first');
            throw new Error('already started!. stop first')
        }
        this.isPreparing = true;
        log.info(`[ffmpeg recorder][${this.name}]start encoding..`, this.src);
        // this.command = ffmpeg(this._src).inputOptions(hlsInputOptions).output(this.target).outputOptions(mp4Options);
        // this.enablePlayback && this.command.output(this._localm3u8).outputOptions(hlsOptions);
        this.command = ffmpeg(this._src).inputOptions(hlsInputOptions).output(this._localm3u8).outputOptions(hlsOptions);
        this.command
        .on('start', this.startHandler)
        .on('progress', this.progressHandler)
        .on('stderr', stderrLine => {
            log.info(`[ffmpeg stderr][${this.name}]${stderrLine}`);
        })
        .on('error', error => {
            log.error(`[ffmpeg stderr][${this.name}]ffmpeg error: `, error) ;
            this.onWriteStreamClosed(error);
        })
        .on('end', (stdout, stderr) => {
            log.info(`[ffmpeg recorder][${this.name}]ffmpeg end!`)
            log.info(`[ffmpeg stdout][${this.name}]`,stdout)
            log.info(`[ffmpeg stderr][${this.name}]`,stderr)
            this.onWriteStreamClosed()
        })
        .run();
    }
    stop = () => {
        if(!this.isRecording){
            log.warn(`[ffmpeg recorder][${this.name}]start recording first!. there may be premature ending of ffmpeg.`)
            this.emit('end', this.target, this.startTime, this.duration)
            this.initialize();
            // throw new Error('start recording first!.')  
            // "throw new Error" comment, because ffmpeg ended already case can be occurred and can make some trouble.
            // if that case happened, manual(or scheduled) stop can't be processed forever if throws error, 
            // because isRecording is already false...
            // initialization already processed, don't need do something. just return;
            return;
        }
        this.command.ffmpegProc.stdin.write('q');
    }
    destroy = () => {
        this.command && this.command.kill();
    }
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
    log.warn(`[ffmpeg recorder][${this.name}]create HLS Recorder!`);
    return new RecoderHLS(options);
}

const convertMP4 = (inFile, outFile, ffmpegPath) => {
    console.log(ffmpegPath)
    ffmpeg.setFfmpegPath(ffmpegPath);
    return new Promise((resolve, reject) => {
        const command = 
            ffmpeg(inFile)
            .outputOptions(['-c','copy']) 
            .output(outFile)
            .on('progress', progress => console.log(progress))
            .on('start', cmd => console.log('started: ',cmd))
            .on('error', error => {
                console.log(error);
                reject(error)
            })
            .on('end', (stdout, stderr) => {
                const regExp = new RegExp(/Duration: (\d\d:\d\d:\d\d.\d\d), start:/)
                const duration = regExp.exec(stderr)[1];
                resolve(duration)
            })

        command.run();
    })
}

module.exports = {
    createHLSRecoder,
    convertMP4
};













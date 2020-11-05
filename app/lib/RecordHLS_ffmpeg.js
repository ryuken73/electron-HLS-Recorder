const EventEmitter = require('events');
const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const mp4Options = ['-f','mp4','-movflags','+frag_custom+frag_keyframe'];;
const hlsOptions = ['-f','hls','-hls_time','4','-hls_list_size','5','-hls_flags','delete_segments',];

class RecoderHLS extends EventEmitter {
    constructor(options){
        super();
        const {
            name='channel1',
            src='', 
            target='target.mp4', 
            enablePlayback=false, 
            playbackList='./temp/stream.m3u8',
            ffmpegBinary='./ffmpeg.exe',
            renameDoneFile=false
        } = options;
        this._name = name;
        this._src = src;
        this._target = target;
        this._enablePlayback = enablePlayback;
        this._playbackList = playbackList;
        this._ffmpegBinary = ffmpegBinary;
        this._renameDoneFile = renameDoneFile;
        this.initialize();
    }

    initialize = () => {
        this._isPreparing = false;
        this._isRecording = false;
        this._bytesRecorded = 0;
        this._durationRecorded = '00:00:00.00';
        this._startTime = null;
        this._rStream = null;
        this._wStream = fs.createWriteStream(this.target);
        ffmpeg.setFfmpegPath(this._ffmpegBinary);
        this._command = ffmpeg(this._src).output(this._wStream).outputOptions(mp4Options);
        this.enablePlayback && this._command.output(this._playbackList).outputOptions(hlsOptions);
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
    get bytesRecorded() { return this._bytesRecorded }
    get duration() { return this._durationRecorded }
    get rStream() { return this._rStream }
    get wStream() { return this._wStream }
    get command() { return this._command }
    get elapsed() { 
        const elapsedMS = Date.now() - this.startTime;
        console.log(this.startTime, elapsedMS)
        return elapsedMS > 0 ? elapsedMS : 0;
    }
    get isBusy() { return this.isRecording || this.isPreparing }  
    set src(url) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._src = url;
        this.initialize();
    }
    set target(target) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._target = target;
        this.initialize();
    }   
    set isRecording(bool) { this._isRecording = bool }
    set isPreparing(bool) { this._isPreparing = bool }
    set startTime(date) { this._startTime = date }
    set rStream(stream) { this._rStream = stream }
    set wStream(stream) { this._wStream = stream }
    set bytesRecorded(bytes) { this._bytesRecorded = bytes }
    set duration(duration) { 
        this._durationRecorded = duration;
        this.emit('progress', {
            bytes: this.bytesRecorded,
            duration: this.duration
        })
    };

    onWriteStreamClosed = () => {
        console.log(`write stream closed : ${this.target}`);
        if(this._renameDoneFile) {
            const baseDir = path.dirname(this.target);
            const startTime = utils.date.getString(new Date(this.startTime),{});
            const duration = this.duration.replace(/:/g,';');     
            const newFname = `${this.name}_${startTime}_[${duration}].mp4`;
            const newFullPath = path.join(baseDir, newFname);
            fs.rename(this.target, newFullPath, err => {
                if(err) throw new Error(err);
                console.log(`change filename : ${this.target} to ${newFullPath}`)
                this.initialize();
                this.emit('end')
            });
        } else {
            this.initialize();
            this.emit('end')
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
        this.bytesRecorded = this.wStream.bytesWritten;
        this.duration = event.timemark;
    }

    start = () => {
        if(this.isBusy) {
            console.log('already started!. stop first');
            throw new Error('already started!. stop first')
        }
        this.isPreparing = true;
        console.log('start encoding..', this.src);
        this.wStream.on('ready', () => {
            console.log('wStream ready')
        })
        this.command
        .on('start', this.startHandler)
        .on('progress', this.progressHandler)
        .on('error', error => {
            console.log('ffmpeg error: ', error) ;
        })
        .run();
        this.wStream.on('close', this.onWriteStreamClosed);
    }
    stop = () => {
        if(!this.isRecording){
            console.log('start recording first!.')
            throw new Error('astart recording first!.')
        }
        this.command.kill(''); 
        this.isRecording = false;
        // this.wStream.end();
    }
    destroy = () => {}
}

// const url = 'https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA==';
// // const url = ' http://live.chosun.gscdn.com/live/_definst_/tvchosun3.stream/playlist.m3u8'
// const recorder = new RecoderHLS({
//     name: 'channel1',
//     src: url, 
//     target: 'd:/temp/cctv_kbs_ffmpeg.mp4', 
//     enablePlayback: true, 
//     playbackList: 'd:/temp/cctv/stream.m3u8',
//     ffmpegBinary: 'd:/temp/cctv/ffmpeg.exe',
//     renameDoneFile: true
// })

const createHLSRecoder = options => {
    const {
        name= 'channel1',
        src= url,
        target='d:/temp/cctv_kbs_ffmpeg.mp4', 
        enablePlayack= true, 
        playbackList= 'd:/temp/cctv/stream.m3u8',
        ffmpegBinary= 'd:/temp/cctv/ffmpeg.exe',
        renameDoneFile= true
    } = options;
    return new RecoderHLS(options);
}

module.exports = {
    createHLSRecoder
};

// const headerMessage = "enter command(start/stop/restart/debug/destroy):"
// const cmdInput = process.stdin
// console.log(headerMessage);
// console.log(utils.date.getString(new Date(),{}))
// const progressWriter = progress => console.log({...progress, elapsed: recorder.elapsed, ...process.memoryUsage()});
// cmdInput.on('data', data => {
//     const input = data.toString().replace(/(\r\n|\r|\n)/,'');
//     try {
//         switch(input){
//             case 'start':
//                 console.log('starting....');
//                 recorder.start();
//                 recorder.on('progress', progressWriter)
//                 break;
//             case 'stop':
//                 console.log('stopping...')
//                 recorder.stop();
//                 recorder.removeListener('progress', progressWriter)
//                 break;
//             case 'restart':
//                 recorder.once('end', () => {
//                     recorder.start();
//                 })
//                 recorder.stop();
//                 break;
//             case 'destroy':
//                 delete recorder
//                 break;
//             case 'debug':
//                 console.log(recorder)
//                 break;
//             default:
//                 console.log(headerMessage);
//                 break;
//         }
//     } catch (err) {
//         console.error(err)
//     }
// })













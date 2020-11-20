import React from 'react';
import Box from '@material-ui/core/Box';

import Title from './Title';
import Selection from './Selection';
import ManualUrl from './ManualUrl';
import SaveDirectory from './SaveDirectory';
import RecordButton from './RecordButton';
import ScheduleButton from './ScheduleButton';

import HLSRecorder from '../../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../../lib/electronUtil';
import path from 'path';

import utils from '../../utils';
async function mkdir(directory){
    try {
        await utils.file.makeDirectory(directory);
    } catch (err) {
        console.error(err);
    }
}

const { dialog } = require('electron').remote;

const initialDuration = '00:00:00.00';

function ChannleControl(props) {
    const {channelName, cctvs} = props;
    const {currentUrl="d:/temp/cctv/stream.m3u8", setCurrentUrl} = props;
    const {saveDirectory="d:/temp/cctv", setSaveDirectory} = props;
    const {setCurrentUrlStore, setSaveDirectoryStore} = props;
    const {clips, setClip, setClipStore} = props;
    const {setPlaybackMode} = props;

    const [duration, setDuration] = React.useState(initialDuration);
    const [urlTyped, setManualUrl] = React.useState('');
    const [recorder, setRecorder] = React.useState(null);
    const [previousUrl, setPreviousUrl] = React.useState('');
    const [inTransition, setInTransition] = React.useState(false);
    const [scheduledFunction, setScheduledFunction] = React.useState(null);
    const [scheduleTimer, setScheduleTimer] = React.useState({remainSeconds:0});
    const [scheduleStatus, setScheduleStatus] = React.useState('stopped');
    const [recorderStatus, setRecorderStatus] = React.useState('stopped');

    let localm3u8 = path.join(saveDirectory, `${channelName}_stream.m3u8`);
    // console.log('###rerender ChannelControl:currentUrl:', currentUrl)
    // console.log('###rerender ChannelControl:previousUrl:', previousUrl)

    React.useEffect(() => {
        const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
        const options = {
            name: channelName,
            src: currentUrl, 
            target: path.join(saveDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`), 
            enablePlayback: true, 
            localm3u8: path.join(saveDirectory, `${channelName}_stream.m3u8`),
            ffmpegBinary: ffmpegPath,
            renameDoneFile: true,
        }
        const recorder = HLSRecorder.createHLSRecoder(options);
        recorder.on('progress', progress => {
            // console.log({...progress, elapsed: recorder.elapsed, ...process.memoryUsage()});
            setDuration(progress.duration);
        })
        setRecorder(recorder);
        return () => {
            recorder.destroy();
            recorder = null;
        }
    },[])

    React.useEffect(() => {
        if(currentUrl === localm3u8){
            console.log('now playback. no need to change source of recorder');
            return;
        }
        // console.log('change currentUrl or saveDirectory,', currentUrl, saveDirectory, channelName)
        if(recorder !== null){
            // console.log(`change recorder.src from ${recorder.src} to ${currentUrl}`)
            recorder.src = currentUrl;
            const target = path.join(saveDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`);
            localm3u8 = path.join(saveDirectory, `${channelName}_stream.m3u8`);
            recorder.target = target;
            recorder.localm3u8 = localm3u8;
        }
    }, [currentUrl, saveDirectory, channelName])

    const onChange = type => {
        return event => {
            const {value} = event.target;
            type === 'manualUrl' && setManualUrl(value);
            type === 'url' && setCurrentUrlStore(value);
        }
    }    

    const onClickSetManualUrl = event => {
        console.log('change url manually : ',urlTyped);
        setCurrentUrl(urlTyped)
    };
    const onClickSelectSaveDirectory = () => {
        dialog.showOpenDialog(({properties:['openDirectory']}), filePaths=> {
            if(filePaths === undefined) return;
            setSaveDirectoryStore(filePaths[0]);      
        })
    };

    const startRecording = async () => {
        mkdir(saveDirectory);
        setInTransition(true);
        console.log(`${channelName} starting`)
        setRecorderStatus('starting');
        recorder.once('start', (cmd) => {
            setTimeout(() => {
                // console.log(`${channelName} started:`, inTransition, recorder.createTime)
                // console.log(`###start: ${currentUrl} : ${previousUrl}`)
                setRecorderStatus('started');
                setPreviousUrl(currentUrl);
                setCurrentUrl(localm3u8);
                setPlaybackMode(true);
                setInTransition(false);
            },3000);
        })
        recorder.start();
    }

    const stopRecording = () => {
        return new Promise((resolve, reject) => {
            try {
                console.log(`${channelName} stopping:`, inTransition, recorder.createTime)
                setRecorderStatus('stopping');
                setInTransition(true);
                recorder.once('end', clipName => {
                    console.log(`${channelName} stopped`)
                    // currentUrl value fixed when executed in schedule (in setInterval)
                    // if execute stopRecording() directly, currentUrl's value is correct (varies with setCurrentUrlStore)
                    // console.log(`###stop: ${currentUrl} : ${previousUrl}`)
                    setClip(prevClips => {
                        const newClips = [clipName, ...prevClips];
                        setClipStore(newClips);
                        return newClips;
                    });
                    setRecorderStatus('stopped');
                    setInTransition(false);
                    setDuration(initialDuration);
                    // setPreviousUrl('');
                    // setCurrentUrlStore(previousUrl);
                    setPreviousUrl(previousUrl => {
                        setCurrentUrl(previousUrl);
                        return '';
                    })
                    setPlaybackMode(false);
                    resolve(true);
                })
                recorder.once('error', (error) => {
                    // console.log('##previousUrl')
                    alert(error)
                    setRecorderStatus('stopped');
                    setInTransition(false);
                    setDuration(initialDuration);
                    setCurrentUrl(previousUrl => {
                        setCurrentUrl(previousUrl);
                        return '';
                    });
                    setPlaybackMode(false);
                    resolve(true);
                })
                recorder.stop();
            } catch (err) {
                console.error(err);
                setRecorderStatus('stopped');
                setInTransition(false);
                setDuration(initialDuration);
                setCurrentUrl(previousUrl);
                setPlaybackMode(false);
                resolve(true)
            }
        })
    }

    const startSchedule = async () => {
            console.log('### start schedule', recorder.createTime)
            // currentUrl, previousUrl value fixed!!
            setScheduleStatus('starting');
            if(recorder.isBusy) await stopRecording();
            startRecording()
            const scheduledFunction = setInterval( async () => {
                // not reflect changed url values (currentUrl and previousUrl is fixed)
                // console.log(`###in interval: ${currentUrl} : ${previousUrl}`)
                await stopRecording();
                startRecording()
            }, 1800000)
            setScheduledFunction(scheduledFunction);
            setScheduleStatus('started')
    }

    
    const stopSchedule = async () => {
            console.log('### stop schedule', recorder.createTime)
            setScheduleStatus('stopping')
            clearInterval(scheduledFunction);
            setScheduledFunction(null);
            // console.log('### recorder.isBusy:',recorder.isBusy)
            if(recorder.isBusy) {
                await stopRecording();
                setScheduleStatus('stopped')
            }
    }

    return (
        <Box display="flex" flexDirection="column" width={1}>
            <Title 
                channelName={channelName} 
                recorderStatus={recorderStatus}
                duration={duration} 
            ></Title>
            <Selection 
                currentUrl={currentUrl} 
                recorderStatus={recorderStatus}
                cctvs={cctvs} 
                onChange={onChange}
            ></Selection>
            <ManualUrl 
                urlTyped={urlTyped} 
                recorderStatus={recorderStatus}
                onClickSetManualUrl={onClickSetManualUrl}
                onChange={onChange}
            ></ManualUrl>
            <SaveDirectory 
                saveDirectory={saveDirectory} 
                recorderStatus={recorderStatus}
                onClickSelectSaveDirectory={onClickSelectSaveDirectory}
            ></SaveDirectory>
            <Box display="flex" justifyContent="flex-start" alignItems="baseline">
                <RecordButton
                    inTransition={inTransition}
                    scheduledFunction={scheduledFunction}
                    recorderStatus={recorderStatus}
                    onClickStartRecord={startRecording}    
                    onClickStopRecord={stopRecording}
                ></RecordButton>
                <ScheduleButton 
                    inTransition={inTransition}
                    scheduleStatus={scheduleStatus} 
                    scheduledFunction={scheduledFunction}
                    startSchedule={startSchedule}
                    stopSchedule={stopSchedule}
                ></ScheduleButton>

            </Box>
        </Box>
    )
}

export default React.memo(ChannleControl);
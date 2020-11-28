import React from 'react';
import Box from '@material-ui/core/Box';

import Title from './Title';
import Selection from './Selection';
import ManualUrl from './ManualUrl';
import SaveDirectory from './SaveDirectory';
import RecordButton from './RecordButton';
import ScheduleButton from './ScheduleButton';
import IntervalSelection from './IntervalSelection';

import HLSRecorder from '../../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../../lib/electronUtil';
import path from 'path';
import defaults from '../../config/defaults';
import utils from '../../utils';

const {maxClips=20} = defaults;

async function mkdir(directory){
    try {
        await utils.file.makeDirectory(directory);
    } catch (err) {
        console.error(err);
    }
}

const Store = require('electron-store');
const store = new Store({watch: true});

const { dialog } = require('electron').remote;

const initialDuration = '00:00:00.00';

function ChannleControl(props) {
    const {channelName, cctvs} = props;
    const {currentUrl="d:/temp/cctv/stream.m3u8", setCurrentUrl, setCurrentUrlStore} = props;
    const {currentTitle="", setCurrentTitle, setCurrentTitleStore} = props;
    const {currentInterval=600000, setCurrentInterval, setCurrentIntervalStore} = props;
    const {saveDirectory="d:/temp/cctv", setSaveDirectory} = props;
    const {setSaveDirectoryStore} = props;
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

    const defaultClips = [];
    const initialClips = store.get(`clips`, defaultClips);
    const [clips, setClip] = React.useState(initialClips);

    const setClipStore = React.useCallback( clips => {
        store.set('clips', clips);
    }, [])

    React.useEffect(() => {
        store.onDidChange('clips', (clips) => {
            setClip(clips);
        })
    },[])

    let localm3u8 = path.join(saveDirectory, `${channelName}_stream.m3u8`);
    const hlsSegmentsRegExp = new RegExp(`${channelName}_stream\\d.*.ts`);

    React.useEffect(() => {
        const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
        const options = {
            name: channelName,
            src: currentUrl, 
            target: path.join(saveDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`), 
            enablePlayback: true, 
            localm3u8,
            ffmpegBinary: ffmpegPath,
            renameDoneFile: true,
        }
        const recorder = HLSRecorder.createHLSRecoder(options);
        recorder.on('progress', progress => {
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
        if(recorder !== null){
            console.log(`change recorder.src from ${recorder.src} to ${currentUrl}`)
            recorder.src = currentUrl;
            const target = path.join(saveDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`);
            localm3u8 = path.join(saveDirectory, `${channelName}_stream.m3u8`);
            recorder.target = target;
            recorder.localm3u8 = localm3u8;
        }
    }, [currentUrl, saveDirectory, channelName])

    const getTitleFromUrl = React.useCallback((url) => {
        const matched = cctvs.find(cctv => cctv.url === url);
        return matched.title;
    }, [cctvs])

    const onChange = type => {
        return event => {
            const {value} = event.target;
            type === 'manualUrl' && setManualUrl(value);
            type === 'url' && setCurrentUrlStore(value);
            if(type === 'title') {
                const url = value;
                const title = getTitleFromUrl(url);
                setCurrentTitleStore(title);
            }
            type === 'interval' && setCurrentIntervalStore(value);
        }
    }    

    const onClickSetManualUrl = event => {
        console.log('change url manually : ',urlTyped);
        setCurrentUrl(urlTyped);
        setCurrentTitle(urlTyped);
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
                setRecorderStatus('started');
                setPreviousUrl(currentUrl);
                setCurrentUrl(localm3u8);
                setCurrentTitle(previousTitle => {
                    return previousTitle;
                });
                setPlaybackMode(true);
                setInTransition(false);
            },2000);
        })
        recorder.on('error', (error) => console.error(error))
        recorder.start();
    }

    const initialRecorder = () => {
        setRecorderStatus('stopped');
        setInTransition(false);
        setDuration(initialDuration);
        setPreviousUrl(previousUrl => {
            setCurrentUrl(previousUrl);
            setCurrentTitle(previousTitle => {
                return previousTitle;
            });
            return '';
        })
        setPlaybackMode(false);
    }

    const stopRecording = () => {
        return new Promise((resolve, reject) => {
            try {
                console.log(`${channelName} stopping:`, inTransition, recorder.createTime)
                setRecorderStatus('stopping');
                setInTransition(true);
                recorder.once('end', async clipName => {
                    console.log(`${channelName} stopped`)
                    // problem : currentUrl value fixed when executed in schedule (in setInterval)
                    //           if execute stopRecording() directly, currentUrl's value is correct (varies with setCurrentUrlStore)
                    // solution : use functional parameter of useState 
                    setClip(prevClips => {
                        const newClips = [clipName, ...prevClips].slice(0,maxClips)
                        setClipStore(newClips);
                        return newClips;
                    });
                    initialRecorder();
                    await utils.file.delete(localm3u8);
                    await utils.file.deleteFiles(saveDirectory, hlsSegmentsRegExp);
                    console.log(`${channelName} stopped`)
                        resolve(true);
                })
                recorder.once('error', (error) => {
                    alert(error)
                    initialRecorder();
                    resolve(true);
                })
                recorder.stop();
            } catch (err) {
                console.error(err);
                initialRecorder();
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
            }, currentInterval);
            setScheduledFunction(scheduledFunction);
            setScheduleStatus('started')
    }

    
    const stopSchedule = async () => {
            console.log('### stop schedule', recorder.createTime)
            setScheduleStatus('stopping')
            clearInterval(scheduledFunction);
            setScheduledFunction(null);
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
                <IntervalSelection
                    currentInterval={currentInterval}
                    recorderStatus={recorderStatus}
                    onChange={onChange}
                    inTransition={inTransition}
                    scheduleStatus={scheduleStatus} 
                    scheduledFunction={scheduledFunction}
                    startSchedule={startSchedule}
                    stopSchedule={stopSchedule}
                ></IntervalSelection>
            </Box>
        </Box>
    )
}

export default React.memo(ChannleControl);
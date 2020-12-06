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
import {HLStoMP4} from '../../lib/hlsToMp4';
import path from 'path';
import defaults from '../../config/defaults';
import utils from '../../utils';
import log from 'electron-log';

const rimraf = require('rimraf');

import { v4 as uuidv4 } from 'uuid';
import { convertMP4 } from '../../modules/appMain';

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
    const {savedClips} = props;
    const {insertClip, updateClip} = props.AppMainAction;
    const {channelName, channelNumber, cctvs} = props;
    const {currentUrl="d:/temp/cctv/stream.m3u8", setCurrentUrl, setCurrentUrlStore} = props;
    const {currentTitle="", setCurrentTitle, setCurrentTitleStore} = props;
    const {currentInterval=600000, setCurrentInterval, setCurrentIntervalStore} = props;
    const {saveDirectory="d:/temp/cctv", setSaveDirectory, setSaveDirectoryStore} = props;
    const {setPlaybackMode} = props;
    const {setMountPlayer, setMountChannelControl} = props;
    const {resetPlayer} = props;

    const [duration, setDuration] = React.useState(initialDuration);
    const [urlTyped, setManualUrl] = React.useState('');
    const [recorder, setRecorder] = React.useState(null);
    const [previousUrl, setPreviousUrl] = React.useState('');
    const [inTransition, setInTransition] = React.useState(false);
    const [scheduledFunction, setScheduledFunction] = React.useState(null);
    const [scheduleStatus, setScheduleStatus] = React.useState('stopped');
    const [recorderStatus, setRecorderStatus] = React.useState('stopped');
    const [autoStartSchedule, setAutoStartSchedule] = React.useState(false);

    const resetControl = ({restartSchedule=false}) => {
        channelLog.info(`resetControl() execute: restartSchedule = ${restartSchedule}`)
        setDuration(initialDuration);
        setManualUrl('');
        setRecorder(null);
        setPreviousUrl('');
        setInTransition(false);
        setScheduledFunction(func => {
            clearInterval(func);
            return null;
        })
        setScheduleStatus('stopped');
        setRecorderStatus('stopped');
        store.set(`mountByReset.${channelNumber}`, {value:true, restartSchedule});
    }

    const createLogger = channelName => {
        return {
            info: msg => {log.info(`[${channelName}][ChannelControl]${msg}`)},
            error: msg => {log.error(`[${channelName}][ChannelControl]${msg}`)}
        }
    }
    const channelLog = createLogger(channelName);

    let localm3u8 = path.join(saveDirectory, `${channelName}_stream.m3u8`);
    const hlsSegmentsRegExp = new RegExp(`${channelName}_stream\\d.*.ts`);

    React.useEffect(() => {
        channelLog.info(`Channel Control mounted!`)
        const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
        const options = {
            name: channelName,
            src: currentUrl, 
            target: path.join(saveDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`), 
            enablePlayback: true, 
            localm3u8,
            ffmpegBinary: ffmpegPath,
            renameDoneFile: false,
        }
        const recorder = HLSRecorder.createHLSRecoder(options);
        recorder.on('progress', progress => {
            setDuration(progress.duration);
        })
        recorder.on('error', (error) => {
            channelLog.error(`error occurred`);
            log.error(error);
            setScheduledFunction(scheduledFunction => {
                const restartSchedule = scheduledFunction !== null;
                resetControl({restartSchedule}) 
                return scheduledFunction;               
            })
            resetPlayer()
            setMountChannelControl(false)
        })
        setRecorder(recorder);
        return () => {
            channelLog.info(`Channel Control dismounted!`);
            recorder.destroy();
            setMountChannelControl(prevValue => {
                return true;
            })
        }
    },[])

    React.useEffect(() => {
        channelLog.info('mountByReset value check');
        const defaultValue =  {value:false, restartSchedule:false};
        const {value, restartSchedule} = store.get(`mountByReset.${channelNumber}`, defaultValue);
        channelLog.info(`mountByReset value = ${value}, restartSchedule=${restartSchedule}`)
        if(value === true && restartSchedule === true){
            channelLog.info('restart schedule!');
            setAutoStartSchedule(true);
            store.set(`mountByReset.${channelNumber}`, defaultValue)
        }
    },[])

    React.useEffect(() => {
        channelLog.info(`currentUrl changed : currentUrl=[${currentUrl}], loaclm3u8=[${localm3u8}]`)
        if(currentUrl === localm3u8){
            channelLog.info(`now playback. no need to change source of recorder`);
            return;
        }
        if(recorder !== null && recorder.isBusy === false){
            channelLog.info(`change currentUrl : ${currentUrl}`)
            recorder.src = currentUrl;
        }
    }, [currentUrl])

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
        channelLog.info(`change url manually : ${urlTyped}`);
        setCurrentUrl(urlTyped);
        setCurrentTitle(urlTyped);
    };

    const onClickSelectSaveDirectory = () => {
        dialog.showOpenDialog(({properties:['openDirectory']}), filePaths=> {
            if(filePaths === undefined) return;
            setSaveDirectoryStore(filePaths[0]);      
        })
    };

    const startRecording = () => {
        channelLog.info(`start startRecroding() recorder.createTime:${recorder.createTime}`)
        const randomString = uuidv4();
        const workingDirectory = path.join(saveDirectory, 'working', randomString);
        mkdir(workingDirectory);
        const target = path.join(workingDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`);
        localm3u8 = path.join(workingDirectory, `${channelName}_stream.m3u8`);
        recorder.target = target;
        recorder.localm3u8 = localm3u8;
        setInTransition(true);
        setRecorderStatus('starting');
        recorder.once('start', (cmd) => {
            channelLog.info(`recorder emitted start : ${cmd}`)
            setTimeout(() => {
                setRecorderStatus('started');
                setPreviousUrl(currentUrl);
                setCurrentUrl(localm3u8);
                setCurrentTitle(previousTitle => {
                    return previousTitle;
                });
                setPlaybackMode(true);
                setInTransition(false);
            },4000);
        })
        recorder.once('end', async (clipName, startTimestamp, duration) => {
            try {
                channelLog.info(`recorder emitted end (listener1): ${clipName}`)
                const endTimestamp = Date.now();
                const startTime = utils.date.getString(new Date(startTimestamp),{})
                const endTime = utils.date.getString(new Date(endTimestamp),{})
                const url = currentUrl;
                const title = getTitleFromUrl(url);
                const hlsDirectory = workingDirectory;
                const durationSafeString = duration.replace(/:/g,';'); 
                const mp4Name = path.join(saveDirectory, `${channelName}_${startTime}_[${durationSafeString}].mp4`);
                const clipId = `${channelName}_${startTime}_${endTime}`
                const hlsm3u8 = localm3u8;
                channelLog.info(channelNumber)
                channelLog.info(channelName)
                channelLog.info(startTime)
                channelLog.info(endTime)
                channelLog.info(startTimestamp)
                channelLog.info(endTimestamp)
                channelLog.info(url)
                channelLog.info(title)
                channelLog.info(hlsDirectory)
                channelLog.info(mp4Name)
                channelLog.info(duration)
                channelLog.info(clipId)
                channelLog.info(hlsm3u8)

                const clipData = {
                    clipId,
                    channelNumber,
                    channelName,
                    startTime,
                    endTime,
                    startTimestamp,
                    endTimestamp,
                    url,
                    title,
                    hlsDirectory,
                    mp4Name,
                    duration,
                    hlsm3u8,
                    saveDirectory,
                    mp4Converted:false
                }
                insertClip({clip: clipData});
                initialRecorder(); 
                const converted = await HLStoMP4(clipData);
                updateClip({clip: converted});                   
                if(converted === false) return;
                rimraf(hlsDirectory, err => {
                    if(err) {
                        channelLog.error(err);
                        channelLog.error(`delete working directory failed: ${hlsDirectory}`);
                        return
                    } 
                    channelLog.info(`delete working directory success: ${hlsDirectory}`);
                });
            } catch (error) {
                if(error){c
                    hannelLog.error(error)
                }
            }
        })
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
                channelLog.info(`start stopRecording(): inTransition: ${inTransition}, recorder.createTime:${recorder.createTime}`)
                setRecorderStatus('stopping');
                setInTransition(true);
                recorder.once('end', async clipName => {
                    channelLog.info(`recorder emitted end (listener2)`)
                    resolve(true);
                })
                recorder.stop();
            } catch (err) {
                channelLog.error(`error in stopRecording`)
                log.error(err);
                initialRecorder();
                resolve(true)
            }
        })
    }

    const startSchedule = async () => {
        channelLog.info(`### start schedule : recorder.createTime=${recorder.createTime}`)
        // currentUrl, previousUrl value fixed!!
        setAutoStartSchedule(false);
        setScheduleStatus('starting');
        if(recorder.isBusy) await stopRecording();
        startRecording()
        const scheduledFunction = setInterval( async () => {
            await stopRecording();
            startRecording()
        }, currentInterval);
        setScheduledFunction(scheduledFunction);
        setScheduleStatus('started')
    }

    
    const stopSchedule = async () => {
            channelLog.info(`### stop schedule : recorder.createTime=${recorder.createTime}`)
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
                    channelName={channelName} 
                    currentInterval={currentInterval}
                    recorderStatus={recorderStatus}
                    onChange={onChange}
                    inTransition={inTransition}
                    scheduleStatus={scheduleStatus} 
                    scheduledFunction={scheduledFunction}
                    startSchedule={startSchedule}
                    stopSchedule={stopSchedule}
                    autoStartSchedule={autoStartSchedule}
                ></IntervalSelection>
            </Box>
        </Box>
    )
}

export default React.memo(ChannleControl);
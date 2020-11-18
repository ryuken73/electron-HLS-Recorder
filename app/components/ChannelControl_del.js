import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from './template/BorderedList';
import {SmallMarginTextField, SmallPaddingSelect, SmallButton}  from './template/smallComponents';
import OptionSelectList from './template/OptionSelectList';
import HLSRecorder from '../lib/RecordHLS_ffmpeg';
import path from 'path';
import {getAbsolutePath} from '../lib/electronUtil';

const initialDuration = '00:00:00.00';
function ChannleControl(props) {
    const {channelName, cctvs} = props;
    const {currentUrl="d:/temp/cctv/stream.m3u8"} = props;
    const {saveDirectory="d:/temp/cctv"} = props;
    const {setPlaybackMode} = props;
    const {setCurrentUrl, setSaveDirectory, clips, setClip} = props;
    const [duration, setDuration] = React.useState(initialDuration);
    const [urlTyped, setManualUrl] = React.useState('');
    // const [recorder, setRecorder] = React.useState({});
    const [recorder, setRecorder] = React.useState({hlsRecorder:{}});
    const [previousUrl, setPreviousUrl] = React.useState('');
    const [isBusy, setIsBusy] = React.useState(false);
    const [scheduledTask, setScheduledTask] = React.useState(null);
    const [scheduleTimer, setScheduleTimer] = React.useState({remainSeconds:0});
    const [scheduleStatus, setScheduleStatus] = React.useState('stopped');
    const [recorderStatus, setRecorderStatus] = React.useState('stopped');

    const {remote} = require('electron');

    const buttonString = {
        'stopped' : 'start record',
        'starting' : 'starting...',
        'started' : 'stop record',
        'stopping' : 'stopping...'
    }

    const scheduleButtonString = {
        'stopped' : 'start schedule',
        'starting' : 'starting...',
        'started' : 'stop schedule',
        'stopping' : 'stopping...'       
    }

    const playbackList = path.join(saveDirectory, `${channelName}_stream.m3u8`);

    const progressWriter = progress => {
        console.log({...progress, elapsed: recorder.elapsed, ...process.memoryUsage()});
        setDuration(progress.duration);
    }

    React.useEffect(() => {
        if(currentUrl === playbackList){
            console.log('now playback. no need to recreate recorder');
            return;
        }
        console.log('change currentUrl or saveDirectory')
        const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
        console.log(ffmpegPath)
        const options = {
            name: channelName,
            src: currentUrl, 
            target: path.join(saveDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`), 
            enablePlayback: true, 
            playbackList: path.join(saveDirectory, `${channelName}_stream.m3u8`),
            ffmpegBinary: ffmpegPath,
            renameDoneFile: true,
        }
        const recorder = HLSRecorder.createHLSRecoder(options);
        recorder.on('progress', progressWriter)
        setRecorder({hlsRecorder:recorder});
    }, [currentUrl, saveDirectory])

    const onChange = type => {
        return event => {
            const {value} = event.target;
            type === 'manualUrl' && setManualUrl(value);
            type === 'url' && setCurrentUrl(value);
            type === 'directory' && setSaveDirectory(value)
            console.log(value)
        }
    }    
    const onClickSetManualUrl = event => {
        console.log('change url manually : ',urlTyped);
        setCurrentUrl(urlTyped)
    };
    const onClickSelectSaveDirectory = directory => {};

    const startRecording = recorder => {
        setIsBusy(true);
        console.log(`${channelName} starting`)
        setRecorderStatus('starting');
        recorder.once('start', (cmd) => {
            setTimeout(() => {
                console.log(`${channelName} started:`, recorder.isBusy, recorder.createTime)
                setRecorderStatus('started');
                setPreviousUrl(currentUrl);
                setCurrentUrl(playbackList);
                setPlaybackMode(true);
            },3000);
        })
        recorder.start();
    }

    const stopRecording = recorder => {
        return new Promise((resolve, reject) => {
            try {
                console.log(`${channelName} stopping:`, recorder.isBusy, recorder.createTime)
                setRecorderStatus('stopping');
                recorder.once('end', clipName => {
                    console.log(`${channelName} stopped`)
                    console.log('################################',previousUrl)
                    setClip( prevClips => [clipName, ...prevClips]);
                    setRecorderStatus('stopped');
                    setIsBusy(false);
                    setDuration(initialDuration);
                    setCurrentUrl(previousUrl);
                    setPlaybackMode(false);
                    resolve(true);
                })
                recorder.stop();
            } catch (err) {
                console.error(err);
                setRecorderStatus('stopped');
                setIsBusy(false);
                setDuration(initialDuration);
                setCurrentUrl(previousUrl);
                setPlaybackMode(false);
                resolve(true)
            }
        })
    }

    // const onClickRecord = (cmd) => {
    //     return () => {
    //         if(cmd === 'start'){
    //             startRecording(recorder);
    //         } else {
    //             stopRecording(recorder);
    //         }
    //     }
    // };

    const onClickStartRecord = (recorder) => {
        return ()  => {
            startRecording(recorder)
        }
    }

    const onClickStopRecord = (recorder) => {
        return ()  => {
            stopRecording(recorder)
        }
    }

    const startSchedule = recorder => {
        return  async () => {
            console.log('### start schedule', recorder.hlsRecorder.createTime)
            setScheduleStatus('starting');
            if(recorder.hlsRecorder.isBusy) await stopRecording(recorder.hlsRecorder);
            startRecording(recorder.hlsRecorder)
            const scheduledTask = setInterval( async () => {
                await stopRecording(recorder.hlsRecorder);
                startRecording(recorder.hlsRecorder)
            }, 20000)
            setScheduledTask(scheduledTask);
            setScheduleStatus('started')
        }
    }
    
    const stopSchedule = recorder => {
        return async () => {
            console.log('### stop schedule', recorder.hlsRecorder.createTime)
            setScheduleStatus('stopping')
            clearInterval(scheduledTask);
            setScheduledTask(null);
            console.log('### recorder.isBusy:',recorder.hlsRecorder.isBusy)
            if(recorder.hlsRecorder.isBusy) {
                await stopRecording(recorder.hlsRecorder);
                setScheduleStatus('stopped')
            }
        }
    }

    const channel = {
        title: <Typography variant="body1">{channelName}</Typography>,
        content: (
            <Box width="100%"> 
                <SmallMarginTextField 
                    width="100%"
                    variant="outlined"
                    margin="dense"
                    bgcolor={isBusy ? "maroon" : "black"}
                    value={duration}
                    fontSize={"20px"}
                    onChange={onChange('duraion')}
                ></SmallMarginTextField> 
            </Box>
        ) 
    }
    
    const manualUrl = {
        title: <Typography variant="body1">Manual URL</Typography>,
        content: (
            <React.Fragment>
                <Box width="100%">
                    <SmallMarginTextField
                        variant="outlined"
                        margin="dense"
                        value={urlTyped}                        
                        onChange={onChange('manualUrl')}
                        mt={"0px"}
                        mb={"0px"}
                        bgcolor={"#2d2f3b"}
                        textalign={"left"}
                        disabled={isBusy}
                    ></SmallMarginTextField>
                </Box>
                <Box textAlign="center">
                    <SmallButton 
                        size="small" 
                        color="secondary" 
                        variant={"contained"} 
                        mt={"0px"}
                        mb={"0px"}
                        bgcolor={"#191d2e"}
                        onClick={onClickSetManualUrl}
                        disabled={isBusy}
                    >Go</SmallButton>
                </Box>
            </React.Fragment>
        )
    }

    const location = {
        title: <Typography variant="body1">Save Directory</Typography>,
        content: (
            <React.Fragment>
                <Box width="100%">
                    <SmallMarginTextField
                        variant="outlined"
                        margin="dense"
                        value={saveDirectory}                        
                        onChange={onChange('directory')}
                        mt={"0px"}
                        mb={"0px"}
                        bgcolor={"#2d2f3b"}
                        textalign={"left"}
                    ></SmallMarginTextField>
                </Box>
                <Box textAlign="center">
                    <SmallButton 
                        size="small" 
                        color="secondary" 
                        variant={"contained"} 
                        mt={"0px"}
                        mb={"0px"}
                        bgcolor={"#191d2e"}
                        onClick={onClickSelectSaveDirectory}
                        disabled={isBusy}
                    >Change</SmallButton>
                </Box>
            </React.Fragment>
        )
    }
    
    const selectItems = cctvs.map(cctv => {
        return {
            value: cctv.url,
            label: cctv.title
        }
    })

    const inTransition = (recorderStatus==='starting'||recorderStatus==='stopping');

    return (
        <Box display="flex" flexDirection="column" width={1}>
            <BorderedList 
                title={channel.title} 
                content={channel.content} 
                color={"white"}
                border={0}
                ml={"3px"}
                my={"0px"}
                bgcolor={"fixed"}
            ></BorderedList>
            <OptionSelectList 
                subtitle='CCTV'
                minWidth='200px'
                currentItem={currentUrl}
                multiple={false}
                menuItems={selectItems}
                onChangeSelect={onChange('url')} 
                smallComponent={true}
                bgcolor={'#232738'}
                selectColor={"#2d2f3b"}
                disabled={isBusy}
            ></OptionSelectList>
            <BorderedList 
                title={manualUrl.title} 
                content={manualUrl.content}
                mb={"0px"} 
                bgcolor={"#232738"}
            ></BorderedList>
            <BorderedList 
                title={location.title} 
                content={location.content} 
                bgcolor={"#232738"}
            ></BorderedList>
            <Box display="flex" justifyContent="flex-start" alignItems="baseline">
                <SmallButton 
                    size="small" 
                    color="secondary" 
                    variant={"contained"} 
                    mt={"auto"}
                    mb={"5px"}
                    bgcolor={"#191d2e"}
                    height={"30px"}
                    minwidth={"120px"}
                    disabled={inTransition || scheduledTask !== null }
                    onClick={isBusy ? onClickStopRecord(recorder) : onClickStartRecord(recorder)}
                >{buttonString[recorderStatus]}</SmallButton>
                <SmallButton 
                    size="small" 
                    color="secondary" 
                    variant={"contained"} 
                    mt={"auto"}
                    mb={"5px"}
                    bgcolor={"#191d2e"}
                    height={"30px"}
                    minwidth={"130px"}
                    disabled={ (scheduleStatus==='starting'||scheduleStatus==='stopping')}
                    // onClick={ scheduledTask ===  null ? onClickScheduleButton('start') : onClickScheduleButton('stop')}
                    onClick={ scheduledTask ===  null ? startSchedule(recorder) : stopSchedule(recorder) }
                >{scheduleButtonString[scheduleStatus]}</SmallButton>
            </Box>
        </Box>
    )
}

export default React.memo(ChannleControl);
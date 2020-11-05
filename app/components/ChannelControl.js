import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from './template/BorderedList';
import {SmallMarginTextField, SmallPaddingSelect, SmallButton}  from './template/smallComponents';
import OptionSelectList from './template/OptionSelectList';
import HLSRecorder from '../lib/RecordHLS_ffmpeg';
import path from 'path';

const initialDuration = '00:00:00.00';
function ChannleControl(props) {
    const {channelName, cctvs} = props;
    const {currentUrl="d:/temp/cctv/stream.m3u8"} = props;
    const {saveDirectory="d:/temp/cctv"} = props;
    const {setCurrentUrl, setSaveDirectory} = props;
    const [duration, setDuration] = React.useState(initialDuration);
    const [urlTyped, setManualUrl] = React.useState('');
    const [recorder, setRecorder] = React.useState({});
    const [isBusy, setIsBusy] = React.useState(false);

    const playbackList = 'd:/temp/cctv/stream.m3u8'

    const progressWriter = progress => {
        console.log({...progress, elapsed: recorder.elapsed, ...process.memoryUsage()});
        setDuration(progress.duration);
    }
    React.useEffect(() => {
        const options = {
            name: channelName,
            src: currentUrl, 
            target: path.join(saveDirectory, `${channelName}_cctv_kbs_ffmpeg.mp4`), 
            enablePlayback: false, 
            playbackList: path.join(saveDirectory, `${channelName}_stream.m3u8`),
            ffmpegBinary: 'd:/temp/cctv/ffmpeg.exe',
            renameDoneFile: true
        }
        const recorder = HLSRecorder.createHLSRecoder(options);
        recorder.on('progress', progressWriter)
        setRecorder(recorder);
    }, [currentUrl])

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
    const onClickRecord = (cmd) => {
        return () => {
            if(cmd === 'start'){
                recorder.start();
                setIsBusy(recorder.isBusy);
                // setUrl(playbackList)
            } else {
                recorder.stop();
                setIsBusy(recorder.isBusy);
                setDuration(initialDuration);
            }
        }
    };

    const channel = {
        title: <Typography variant="body1">{channelName}</Typography>,
        content: (
            <Box width="100%"> 
                <SmallMarginTextField 
                    width="100%"
                    variant="outlined"
                    margin="dense"
                    bgcolor={"black"}
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
                        textAlign={"left"}
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
                        textAlign={"left"}
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
                minWidth='300px'
                currentItem={currentUrl}
                multiple={false}
                menuItems={selectItems}
                onChangeSelect={onChange('url')} 
                smallComponent={true}
                bgcolor={'#232738'}
                selectColor={"#2d2f3b"}
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
            <SmallButton 
                size="small" 
                color="secondary" 
                variant={"contained"} 
                mt={"auto"}
                mb={"5px"}
                bgcolor={"#191d2e"}
                height={"35px"}
                onClick={recorder.isBusy ? onClickRecord('stop') : onClickRecord('start')}
            >{recorder.isBusy ? "Stop Record" : "Start Recording"}</SmallButton>
        </Box>
    )
}

export default React.memo(ChannleControl);
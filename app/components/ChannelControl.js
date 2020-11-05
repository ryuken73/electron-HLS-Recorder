import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from './template/BorderedList';
import {SmallMarginTextField, SmallPaddingSelect, SmallButton}  from './template/smallComponents';
import OptionSelectList from './template/OptionSelectList';
import HLSRecorder from '../lib/RecordHLS_ffmpeg';

function ChannleControl(props) {
    const {currentUrl="d:/temp/cctv/stream.m3u8"} = props;
    const {duration='00:00:00.00'} = props;
    const {directory="d:/temp/cctv"} = props;
    const {setUrl} = props;
    const [urlTyped, setManualUrl] = React.useState('');
    const [recorder, setRecorder] = React.useState({});

    const progressWriter = progress => console.log({...progress, elapsed: recorder.elapsed, ...process.memoryUsage()});
    React.useEffect(() => {
        const options = {
            name: 'channel1',
            src: currentUrl, 
            target: 'd:/temp/cctv_kbs_ffmpeg.mp4', 
            enablePlayback: true, 
            playbackList: 'd:/temp/cctv/stream.m3u8',
            ffmpegBinary: 'd:/temp/cctv/ffmpeg.exe',
            renameDoneFile: true
        }
        const recoder = HLSRecoder.createHLSRecoder(options);
        recorder.on('progress', progressWriter)
        setRecorder(recorder);
    }, [currentUrl, directory])

    const onChange = type => {
        return (event) => {
            if(type === 'manualUrl'){
                setManualUrl(event.target.value)
            }
            console.log(event.target.value)
        }
    }    
    const onClickSetManualUrl = event => {
        console.log('change url manually : ',urlTyped);
        setUrl(urlTyped)
    };
    const onClickSelectSaveDirectory = directory => {};
    const onClickRecord = () => {
        recorder.start();
    };

    const channel = {
        title: <Typography variant="body1">Channel1</Typography>,
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
                        value={directory}                        
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
                subtitle='HLS urls'
                minWidth='300px'
                currentItem={currentUrl}
                multiple={false}
                menuItems={[
                    {value:'https://1/stream.m3u8', label:'1'},
                    {value:'https://2/stream.m3u8', label:'2'},
                    {value:'https://3/stream.m3u8', label:'3'},
                ]}
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
                onClick={onClickRecord}
            >Record</SmallButton>
        </Box>
    )
}

export default React.memo(ChannleControl);
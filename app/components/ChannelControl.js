import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from './template/BorderedList';
import {SmallMarginTextField, SmallPaddingSelect, SmallButton}  from './template/smallComponents';
import OptionSelectList from './template/OptionSelectList';

export default function ChannleControl(props) {
    const {currentUrl="d:/temp/cctv/stream.m3u8"} = props;
    const {duration='00:00:00.00'} = props;
    const {directory="d:/temp/cctv"} = props;
    const {filePatterns} = props;
    const onChange = type => {
        return (event) => {
            console.log(event.target.value)
        }
    }    
    const onClickSelectSaveDirectory = directory => {};

    const channel = {
        title: <Typography variant="body1">Channel1</Typography>,
        content: (
            <Box width="100%"> 
                <SmallMarginTextField 
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
    
    const location = {
        title: <Typography variant="body1">Save Directory</Typography>,
        content: (
            <React.Fragment>
                <Box width="120px">
                    <SmallMarginTextField
                        variant="outlined"
                        margin="dense"
                        value={directory}                        
                        onChange={onChange('directory')}
                        mt={"0px"}
                        mb={"0px"}
                    ></SmallMarginTextField>
                </Box>
                <Box width="50px" textAlign="center">
                    <SmallButton 
                        size="small" 
                        color="primary" 
                        variant={"contained"} 
                        mt={"0px"}
                        mb={"0px"}
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
            ></OptionSelectList>
            <BorderedList 
                title={location.title} 
                content={location.content}
                mb={"0px"} 
            ></BorderedList>
            <BorderedList 
                title={location.title} 
                content={location.content} 
            ></BorderedList>
        </Box>
    )
}

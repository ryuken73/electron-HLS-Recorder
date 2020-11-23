import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField, SmallButton}  from '../template/smallComponents';

function ManualUrl(props) {
    const {urlTyped, recorderStatus} = props;
    const {onClickSetManualUrl, onChange} = props;
    const inRecording = recorderStatus !== 'stopped';
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
                        disabled={inRecording}
                    ></SmallMarginTextField>
                </Box>
                <Box textAlign="center">
                    <SmallButton 
                        size="small" 
                        color="secondary" 
                        variant={"contained"} 
                        mt={"0px"}
                        mb={"0px"}
                        mr={"0px"}
                        minwidth={"70px"}
                        bgcolor={"#191d2e"}
                        onClick={onClickSetManualUrl}
                        disabled={inRecording}
                    >Go</SmallButton>
                </Box>
            </React.Fragment>
        )
    }
    return (
        <BorderedList 
            title={manualUrl.title} 
            titlewidth={"115px"}
            content={manualUrl.content}
            mb={"0px"} 
            bgcolor={"#232738"}
        ></BorderedList>
    )
}

export default React.memo(ManualUrl)
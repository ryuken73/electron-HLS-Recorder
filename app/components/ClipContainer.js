import React from 'react'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import BorderedList from './template/BorderedList';
import {SmallButton}  from './template/smallComponents';


export default function ClipContainer(props) {
    const {clipFullName, clipName, playClip} = props;
    const onClickClip = () => {
        playClip(clipFullName);
    }
    const clipPreview = {
        title: <Typography variant="body1">{clipName}</Typography>,
        content: (
            <Box textAlign="center">
                <SmallButton 
                    size="small" 
                    color="secondary" 
                    variant={"contained"} 
                    mt={"0px"}
                    mb={"0px"}
                    bgcolor={"#191d2e"}
                    onClick={onClickClip}
                >Preview</SmallButton>
            </Box>
        )
    }
    return (
        <BorderedList 
            title={clipPreview.title} 
            content={clipPreview.content} 
            bgcolor={"#232738"}
        ></BorderedList>
    )
}

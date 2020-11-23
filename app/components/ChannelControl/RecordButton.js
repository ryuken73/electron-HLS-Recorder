import React from 'react'
import {SmallButton}  from '../template/smallComponents';

const buttonString = {
    'stopped' : 'start record',
    'starting' : 'starting...',
    'started' : 'stop record',
    'stopping' : 'stopping...'
}

function RecordButton(props) {
    const {inTransition, scheduledFunction, recorderStatus} = props;
    const {onClickStopRecord, onClickStartRecord} = props
    const inRecording = recorderStatus !== 'stopped';
    return (
        <SmallButton 
            size="small" 
            color="secondary" 
            variant={"contained"} 
            mt={"auto"}
            mb={"5px"}
            ml={"3px"}
            bgcolor={recorderStatus === 'started' ? 'maroon' : '#191d2e'}
            height={"30px"}
            minwidth={"120px"}
            disabled={inTransition || scheduledFunction !== null }
            onClick={inRecording ? onClickStopRecord : onClickStartRecord}
        >{buttonString[recorderStatus]}</SmallButton>
    )
}

export default  React.memo(RecordButton)
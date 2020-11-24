import React from 'react'
import {SmallButton}  from '../template/smallComponents';

const scheduleButtonString = {
    'stopped' : 'start schedule',
    'starting' : 'starting...',
    'started' : 'stop schedule',
    'stopping' : 'stopping...'       
}

function ScheduleButton(props) {
    const {inTransition, scheduleStatus, scheduledFunction} = props;
    const {startSchedule, stopSchedule} = props;
    return (
        <SmallButton 
            size="small" 
            color="secondary" 
            variant={"contained"} 
            mt={"0px"}
            mb={"0px"}
            ml={"0px"}
            mr={"0px"}
            bgcolor={scheduleStatus === 'started' ? 'maroon' : '#191d2e'}
            minwidth={"130px"}
            disabled={ inTransition || (scheduleStatus==='starting'||scheduleStatus==='stopping')}
            onClick={ scheduledFunction ===  null ? startSchedule : stopSchedule }
        >{scheduleButtonString[scheduleStatus]}</SmallButton>
    )
}

export default React.memo(ScheduleButton)
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
            mt={"auto"}
            mb={"5px"}
            // ml={"auto"}
            ml={"0px"}
            mr={"3px"}
            bgcolor={scheduleStatus === 'started' ? 'maroon' : '#191d2e'}
            height={"30px"}
            minwidth={"130px"}
            disabled={ inTransition || (scheduleStatus==='starting'||scheduleStatus==='stopping')}
            // onClick={ scheduledFunction ===  null ? onClickScheduleButton('start') : onClickScheduleButton('stop')}
            onClick={ scheduledFunction ===  null ? startSchedule : stopSchedule }
        >{scheduleButtonString[scheduleStatus]}</SmallButton>
    )
}

export default React.memo(ScheduleButton)
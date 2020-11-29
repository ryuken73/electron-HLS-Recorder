import React from 'react';
import OptionSelectButton from '../template/OptionSelectButton';
import ScheduleButton from './ScheduleButton';
import log from 'electron-log';

const intervals = [
    {title: '1 Hour', milliseconds: 3600000},
    {title: '30 Minutes', milliseconds: 1800000},
    {title: '20 Minutes', milliseconds: 1200000},
    {title: '10 Minutes', milliseconds: 600000},
    {title: '5 Minutes', milliseconds: 300000},
    {title: '1 Minute', milliseconds: 60000}
]

function IntervalSelection(props) {
    const {channelName, currentInterval, recorderStatus} = props;
    const {inTransition, scheduleStatus, scheduledFunction} = props;
    const {startSchedule, stopSchedule} = props;
    const {onChange} = props;
    const {autoStartSchedule=false} = props;
    const inRecording = recorderStatus !== 'stopped';
    const selectItems = intervals.map(interval => {
        return {
            value: interval.milliseconds,
            label: interval.title
        }
    })

    React.useEffect(() => {
        autoStartSchedule && log.info(`[${channelName}]auto start schedule!!!`);
        autoStartSchedule && startSchedule();
    },[autoStartSchedule])

    const ButtonElement = () => {
        return <ScheduleButton
                inTransition={inTransition}
                scheduleStatus={scheduleStatus} 
                scheduledFunction={scheduledFunction}
                startSchedule={startSchedule}
                stopSchedule={stopSchedule}
            >
            </ScheduleButton>
    } 

    return (
        <OptionSelectButton 
            // subtitle='CCTV'
            // titlewidth={"115px"}
            FrontButton={ButtonElement}
            width="100%"
            currentItem={currentInterval}
            multiple={false}
            menuItems={selectItems}
            onChangeSelect={onChange('interval')} 
            smallComponent={true}
            bgcolor={'#232738'}
            selectColor={"#2d2f3b"}
            disabled={inRecording}
        ></OptionSelectButton>
    )
}

export default  React.memo(IntervalSelection)
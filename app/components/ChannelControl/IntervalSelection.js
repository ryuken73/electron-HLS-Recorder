import React from 'react';
import OptionSelectList from '../template/OptionSelectList';

function IntervalSelection(props) {
    const {currentInterval, intervals, recorderStatus} = props;
    const {onChange} = props;
    const inRecording = recorderStatus !== 'stopped';
    const selectItems = intervals.map(interval => {
        return {
            value: interval.milliseconds,
            label: interval.title
        }
    })
    return (
        <OptionSelectList 
            // subtitle='CCTV'
            // titlewidth={"115px"}
            width="100%"
            currentItem={currentInterval}
            multiple={false}
            menuItems={selectItems}
            onChangeSelect={onChange('interval')} 
            smallComponent={true}
            bgcolor={'#232738'}
            selectColor={"#2d2f3b"}
            disabled={inRecording}
        ></OptionSelectList>
    )
}

export default  React.memo(IntervalSelection)
import React from 'react';
import OptionSelectList from '../template/OptionSelectList';

export default function Selection(props) {
    const {currentUrl, cctvs, recorderStatus} = props;
    const {onChange} = props;
    const inRecording = recorderStatus !== 'stopped';
    const selectItems = cctvs.map(cctv => {
        return {
            value: cctv.url,
            label: cctv.title
        }
    })
    return (
        <OptionSelectList 
            subtitle='CCTV'
            titlewidth={"115px"}
            minWidth='200px'
            currentItem={currentUrl}
            multiple={false}
            menuItems={selectItems}
            onChangeSelect={onChange('url')} 
            smallComponent={true}
            bgcolor={'#232738'}
            selectColor={"#2d2f3b"}
            disabled={inRecording}
        ></OptionSelectList>
    )
}

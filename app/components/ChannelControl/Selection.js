import React from 'react';
import OptionSelectList from '../template/OptionSelectList';

function Selection(props) {
    const {currentUrl, cctvs, recorderStatus} = props;
    const {onChange} = props;
    const inRecording = recorderStatus !== 'stopped';
    const selectItems = cctvs.map(cctv => {
        return {
            value: cctv.url,
            label: cctv.title
        }
    })
    const onChangeSelect = React.useCallback((event) => {
        onChange('url')(event);
        onChange('title')(event);
    }, [onChange])

    return (
        <OptionSelectList 
            subtitle='CCTV'
            titlewidth={"115px"}
            minWidth='200px'
            currentItem={currentUrl}
            multiple={false}
            menuItems={selectItems}
            // onChangeSelect={onChange('url')} 
            onChangeSelect={onChangeSelect} 
            smallComponent={true}
            bgcolor={'#232738'}
            selectColor={"#2d2f3b"}
            disabled={inRecording}
        ></OptionSelectList>
    )
}

export default React.memo(Selection)
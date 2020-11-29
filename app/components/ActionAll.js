import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import BorderedList from './template/BorderedList';
import {SmallMarginTextField, SmallButton, SmallPaddingSelect}  from './template/smallComponents';


function ActionAll(props) {
    const {urlTyped, recorderStatus} = props;
    const {onClickSetManualUrl, onChange} = props;
    const inRecording = false;
    // const inRecording = recorderStatus !== 'stopped';
    const currentItem = "1 Hour";
    const multiple = false;
    const onChangeSelect = () => {};
    const selectColor = "#3a436e";
    const disabled = false;
    const menuItems = [];
    const smallComponent = true;
    const SelectComponent = smallComponent ? SmallPaddingSelect : Select;
    const minWidth = "100px"

    const manualUrl = {
        title: (<Box textAlign="center">
                    <Typography variant="body1">Apply All</Typography>
                </Box>),
        content: (
            <React.Fragment>
                <Box>
                    <SmallButton 
                        size="small" 
                        color="secondary" 
                        variant={"contained"} 
                        mt={"0px"}
                        mb={"2px"}
                        mr={"2px"}
                        minwidth={"124px"}
                        bgcolor={"#3a436e"}
                        onClick={onClickSetManualUrl}
                        disabled={inRecording}
                        fontSize={"10px"}
                        height={"30px"}
                        >Start Record All</SmallButton>
                </Box>
                <Box textAlign="center">
                    <SmallButton 
                        size="small" 
                        color="secondary" 
                        variant={"contained"} 
                        mt={"0px"}
                        mb={"2px"}
                        mr={"0px"}
                        minwidth={"135px"}
                        bgcolor={"#3a436e"}
                        onClick={onClickSetManualUrl}
                        disabled={inRecording}
                        fontSize={"10px"}
                        height={"30px"}
                        >Start Schedule All</SmallButton>
                </Box>
                <Box ml="5px" mr="2px" width="100%">
                    <FormControl style={{minWidth:minWidth, width:"100%"}}>
                        <SelectComponent
                            labelId="select-label" 
                            variant="outlined"
                            margin="dense"
                            value={currentItem}
                            multiple={multiple}
                            onChange={onChangeSelect}
                            bgcolor={selectColor}
                            disabled={disabled}
                        >
                            {menuItems.map((menuItem, index) => {
                                const {value, label} = menuItem;
                                return <MenuItem key={index} value={value}>{label}</MenuItem>
                            })}
                        </SelectComponent>
                    </FormControl>
                </Box>

            </React.Fragment>
        )
    }
    return (
        <BorderedList 
            title={manualUrl.title} 
            titlewidth={"315px"}
            content={manualUrl.content}
            mb={"0px"} 
            bgcolor={"#191d30"}
        ></BorderedList>
    )
}

export default React.memo(ActionAll)
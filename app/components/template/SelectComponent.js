import React from 'react'
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import BorderedList from './BorderedList';
import {SmallPaddingSelect}  from './smallComponents';


export default function SelectComponent(props) {
    const {
        minWidth, 
        currentItem, 
        menuItems=[], 
        onChangeSelect, 
        multiple=true, 
        bgcolor, 
        selectColor, 
        disabled=false,
        ml="2px"
    } = props;    
    const {small} = props;
    const SelectComponent = small ? SmallPaddingSelect : Select;
    return (
        <FormControl style={{minWidth:minWidth,width:"100%",marginTop:ml }}>
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
    )
}

import React from 'react'
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import BorderedList from './BorderedList';
import {SmallPaddingSelect}  from './smallComponents';


export default function OptionSelectButton(props) {
    const {FrontButton, minWidth, currentItem, menuItems, onChangeSelect, multiple=true, titlewidth="20%", bgcolor, selectColor, disabled=false} = props;
    const {smallComponent} = props;
    const SelectComponent = smallComponent ? SmallPaddingSelect : Select;
    const optionSelect = {
        subject: <FrontButton></FrontButton>,
        content: (
            <React.Fragment>
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
            </React.Fragment>
        )
    }
    return (
        <BorderedList 
            subject={optionSelect.subject} 
            titlewidth={titlewidth}
            content={optionSelect.content} 
            mb={0}
            mt={0}
            bgcolor={bgcolor}
            width="100%"
        ></BorderedList>
    )
}

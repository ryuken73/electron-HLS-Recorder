import {createAction, handleActions} from 'redux-actions';

const Store = require('electron-store');
const store = new Store();
// action types
const ADD_PAGE = 'imageList/ADD_PAGE';

// action creator
export const addPage = createAction(ADD_PAGE);

// initalState
const initialState = {

}

// reducer
export default handleActions({
    [ADD_PAGE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {pageIndex} = action.payload;
        const pageTitles = new Map(state.pageTitles);
        const pageImages = new Map(state.pageImages);
        const initialTitle = '';
        const initialImageData = [];
        pageTitles.set(pageIndex, initialTitle);
        pageImages.set(pageIndex, initialImageData);
        return {
            ...state,
            pageTitles,
            pageImages
        }
    }
}, initialState);
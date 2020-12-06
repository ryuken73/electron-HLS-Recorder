import {createAction, handleActions} from 'redux-actions';

const log = require('electron-log');
const appLog = (() => {
    return {
        debug : msg => log.debug(`[AppRecorder]${msg}`),
        info  : msg => log.info(`[AppRecorder]${msg}`),
        warn  : msg => log.warn(`[AppRecorder]${msg}`),
        error : msg => log.error(`[AppRecorder]${msg}`)
      }
})()

// action types
const INIT_CHANNELS = 'appRecorder/INIT_CHANNELS';
const SET_RECORDER_STATUS = 'appRecorder/SET_RECORDER_STATUS';
const SET_RECORDER_ACTION = 'appRecorder/SET_RECORDER_ACTION';

// action creator
export const initChannels = createAction(INIT_CHANNELS);
export const setRecorderStatus = createAction(SET_RECORDER_STATUS);
export const setRecorderAction = createAction(SET_RECORDER_ACTION);


// initalState
const initialState = {
    channelNames: [],
    channelStatuses: []
}

// reducer
export default handleActions({
    [INIT_CHANNELS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNames} = action.payload;
        const channelStatuses = channelNames.map(channelName => {
            return {
                channelName,
                recorderStatus:'stopped',
                recorderAction:'none'
            }
        })
        return {
            channelNames,
            channelStatuses
        }
    },
    [SET_RECORDER_STATUS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelName, recorderStatus} = action.payload;
        const channelStatuses = state.channelStatuses.map(channelStatus => {
            if(channelStatus.channelName === channelName){
                return {
                    ...channelStatus,
                    recorderStatus
                }
            }
            return channelStatus
        })
        return {
            ...state,
            channelStatus
        }
    },
    [SET_RECORDER_ACTION]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelName, recorderAction} = action.payload;
        const channelStatuses = state.channelStatuses.map(channelStatus => {
            if(channelStatus.channelName === channelName){
                return {
                    ...channelStatus,
                    recorderAction
                }
            }
            return channelStatus
        })
        return {
            ...state,
            channelStatus
        }
    },
}, initialState);
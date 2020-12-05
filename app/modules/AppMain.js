import {createAction, handleActions} from 'redux-actions';
const fs = require('fs');
const path = require('path');
const utils = require('../utils');
// const rimraf = require('rimraf');

// const {getAbsolutePath} = require('../lib/electronUtil');
// const {m3u8ToFileArray} = require('../lib/tsFileUtil');
// const {convertMP4} = require('../lib/RecordHLS_ffmpeg');
import defaults from '../config/defaults';
const {deleteTSFiles=false} = defaults;
const {deleteEvenDurationChanged=false} = defaults;

const log = require('electron-log');
const appLog = (() => {
    return {
        debug : msg => log.debug(`[AppMainModule]${msg}`),
        info  : msg => log.info(`[AppMainModule]${msg}`),
        warn  : msg => log.warn(`[AppMainModule]${msg}`),
        error : msg => log.error(`[AppMainModule]${msg}`)
      }
})()

const Store = require('electron-store');
const store = new Store();

// action types
const INSERT_CLIP = 'appMain/INSERT_CLIP';
const UPDATE_CLIP = 'appMain/UPDATE_CLIP';
const DELETE_CLIP = 'appMain/DELETE_CLIP';
const SET_CLIP_STORE = 'appMain/SET_CLIP_STORE';

// action creator
export const insertClip = createAction(INSERT_CLIP);
export const updateClip = createAction(UPDATE_CLIP);
export const deleteClip = createAction(DELETE_CLIP);
export const setClipStore = createAction(SET_CLIP_STORE);

// export const insertClip = insertedClip => (dispatch, getState) => {
//     try {
//         console.log('++++insertClip', insertedClip);
//         const state = getState();
//         const {savedClips} = state.appMain;
//         console.log('++++savedClips', savedClips);
//         const newClips = [insertedClip, ...savedClips];
//         store.set('clips', newClips);
//         dispatch(setClipStore({savedClips: newClips}));
//     } catch (err) {
//         console.error(err);
//         throw new Error(err)
//     }
// }



// export const updateClip = (updatedClip) => async (dispatch, getState) => {
//     const state = getState();
//     const {savedClips} = state.appMain;
//     const orignalClip = savedClips.find(clip => clip.clipId === updatedClip.clipId);
//     const updateApplied = {...orignalClip, ...updatedClip};
//     const newClips = savedClips.map(clip => {
//         if(clip.clipId === updatedClip.clipId){
//             return updateApplied;
//         }
//         return clip
//     })
//     store.set('clips', newClips);
//     dispatch(setClipStore({savedClips:newClips}));
// }

// export const deleteClip = (clipFullName, clipId) => async (dispatch, getState) => {
//     try {
//         await utils.file.delete(clipFullName);
//     } catch (err) {
//         console.error(err)
//     } finally {
//         const state = getState();
//         const {savedClips} = state.appMain;
//         const deletedClip = savedClips.find(clip => clip.clipId === clipId);
//         appLog.info(`deletedClip: ${deletedClip.mp4Name}`)
//         if(deletedClip === undefined){
//             return;
//         }
//         const newClips = savedClips.filter(clip => {
//             return clip.clipId !== clipId;
//         })
//         console.log('+++++', newClips)
//         store.set('clips', newClips);
//         dispatch(setClipStore({savedClips:newClips}));
//     }
// }

// initalState
const initialState = {
    savedClips: store.get('clips', [])
}
console.log(initialState)

// reducer
export default handleActions({
    [INSERT_CLIP]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {clip} = action.payload;
        const savedClips = [clip, ...state.savedClips]
        return {
            savedClips
        }
    },
    [UPDATE_CLIP]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {clip} = action.payload;
        const savedClips = state.savedClips.map(previousClip => {
            if(previousClip.clipId === clip.clipId) return clip;
            return previousClip;
        })
        return {
            savedClips
        }
    },
    [DELETE_CLIP]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {clip} = action.payload;
        const savedClips = state.savedClips.filter(previousClip => {
            return previousClip.clipId !== clip.clipId
        })
        return {
            savedClips
        }
    },   
    [SET_CLIP_STORE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {clips} = action.payload;
        return {
            savedClips: clips
        }
    },     
}, initialState);
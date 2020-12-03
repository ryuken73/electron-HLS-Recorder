import {createAction, handleActions} from 'redux-actions';
const path = require('path');
const utils = require('../utils');
const rimraf = require('rimraf');

const {getAbsolutePath} = require('../lib/electronUtil');
const {m3u8ToFileArray} = require('../lib/tsFileUtil');
const {convertMP4} = require('../lib/RecordHLS_ffmpeg');
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
const SET_CLIP_STORE = 'appMain/SET_CLIP_STORE';
const INSERT_CLIP_STORE = 'appMain/INSERT_CLIP_STORE';
const UPDATE_CLIP_STORE = 'appMain/UPDATE_CLIP_STORE';
const DELETE_CLIP_STORE = 'appMain/DELETE_CLIP_STORE';

// action creator
export const setClipStore = createAction(SET_CLIP_STORE);
export const insertClipStore = createAction(INSERT_CLIP_STORE);
export const updateClipStore = createAction(UPDATE_CLIP_STORE);
export const deleteClipStore = createAction(DELETE_CLIP_STORE);


export const insertClip = (insertedClip) => async (dispatch, getState) => {
    console.log('!!!!!! insertClip', insertedClip)
    dispatch(insertClipStore({insertedClip}));
    const {hlsm3u8, hlsDirectory, channelName, mp4Name, saveDirectory, startTime, duration} = insertedClip;
    const tsFilesArray = await m3u8ToFileArray(insertedClip.hlsm3u8);
    const oneTSFile = path.join(hlsDirectory, `${channelName}.ts`);
    const result = await utils.file.concatFiles(tsFilesArray, oneTSFile);
    appLog.info(`new hls stream merged to one ts file: ${oneTSFile}`);
    try {
        const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
        const durationNew = await convertMP4(oneTSFile, mp4Name, ffmpegPath);
        if(durationNew === duration){
            appLog.info(`########## ts file's duration equals with converted mp4's duration ##########`);
            deleteTSFiles && rimraf(hlsDirectory, err => appLog.error(err));
        } else {
            deleteEvenDurationChanged && rimraf(hlsDirectory, err => appLog.error(err));
        }
        const durationSafeString = durationNew.replace(/:/g,';');  
        const mp4NameNew = path.join(saveDirectory, `${channelName}_${startTime}_[${durationSafeString}].mp4`);
        if(mp4Name !== mp4NameNew){
                appLog.warn(`converted mp4's duration differ from origial hls: original=${mp4Name} mp4 converted=${mp4NameNew}`);
                await fs.promises.rename(mp4Name, mp4NameNew);
        }
        appLog.info(`new hls stream successfully converted to mp4: ${mp4Name}`);
        const updatedClip = {...insertedClip, duration: durationNew, mp4Name: mp4NameNew, mp4Converted: true};
        dispatch(updateClipStore({updatedClip}));

    } catch(error) {
        appLog.error('error occurred in insertClip')
        appLog.error(error)
    }
}

export const deleteClip = (clipFullName, clipId) => async (dispatch, getState) => {
    try {
        await utils.file.delete(clipFullName);
    } catch (err) {
        console.error(err)
    } finally {
        const {savedClips} = getState().appMain;
        const deletedClip = savedClips.find(clip => clip.clipId === clipId);
        dispatch(deleteClipStore({deletedClip}));
    }
}

// initalState
const initialState = {
    savedClips: store.get('clips', [])
}

// reducer
export default handleActions({
    [SET_CLIP_STORE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {savedClips} = action.payload;
        store.set('clips', savedClips);
        return {
            savedClips
        }
    },    
    [INSERT_CLIP_STORE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {insertedClip} = action.payload;
        const savedClips = [insertedClip, ...state.savedClips];
        store.set('clips', savedClips);
        return {
            savedClips
        }
    },
    [UPDATE_CLIP_STORE]: (state, action) => {
        console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {updatedClip} = action.payload;
        const orignalClip = state.savedClips.find(clip => clip.clipId === updatedClip.clipId);
        const updateApplied = {...orignalClip, ...updatedClip};
        const savedClips = state.savedClips.map(clip => {
            if(clip.clipId === updatedClip.clipId){
                return updateApplied;
            }
            return clip
        })
        store.set('clips', savedClips);
        return {
            savedClips
        }
    },   
    [DELETE_CLIP_STORE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {deletedClip} = action.payload;
        const savedClips = state.savedClips.filter(clip => {
            return clip.clipId !== deletedClip.clipId;
        })
        store.set('clips', savedClips);
        return {
            savedClips
        }
    },   
}, initialState);
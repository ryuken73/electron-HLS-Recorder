// @flow
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { connectRouter } from 'connected-react-router';
import { routerMiddleware } from 'connected-react-router';
import * as modules from '../modules';
import { forwardToMain, replayActionRenderer } from 'electron-redux';

const history = createHashHistory();
const reducers = combineReducers({
  router: connectRouter(history),
  ...modules
});

// const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);

// electron-store middleware
const Store = require('electron-store');
const electronStore = new Store();
const storeMiddleware = store => next => action => {
  console.log('$$$storeMiddleware start!');
  const result = next(action);
  // console.log('$$$storeMiddleware end!', store.getState());
  const state = store.getState();
  const {savedClips} = state.appMain;
  electronStore.set('clips', savedClips)
  return result;
}

const enhancer = applyMiddleware(forwardToMain, thunk, router, storeMiddleware);

function configureStore(initialState?: counterStateType) {
  // return createStore<*, counterStateType, *>(
  const store = createStore<*, counterStateType, *>(
    reducers,
    initialState,
    enhancer
  );
  replayActionRenderer(store);
  return store;
}


export default { configureStore, history };
 
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { connectRouter } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import * as modules from '../modules';
import { forwardToMain, replayActionRenderer } from 'electron-redux';

const history = createHashHistory();

const configureStore = (initialState) => {
  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });
  
  // Router Middleware
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
  // get reducers
  const reducers = combineReducers({
    router: connectRouter(history),
    ...modules
  });


  const middlewares = [thunk, logger, router, storeMiddleware];
  
  const devtools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const composeEnhancers = devtools || compose;

  const store = createStore(reducers, initialState, composeEnhancers(
    applyMiddleware(
      forwardToMain,
      ...middlewares
    )
  ));

  replayActionRenderer(store);

  // if (module.hot) {
  //   module.hot.accept(
  //     '../reducers',
  //     // eslint-disable-next-line global-require
  //     () => store.replaceReducer(require('../reducers').default)
  //   );
  // }
  return store;
  // const configure = (preloadedState) => createStore(reducers, preloadedState, composeEnhancers(
  //   applyMiddleware(...middlewares)
  // ));
}


export default {configureStore, history};
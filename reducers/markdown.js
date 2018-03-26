import { combineReducers } from 'redux';
import { mtoolbar } from './markdown-toolbar';
import { meditor } from './markdown-editor';
import { session } from './session';
import { topics } from './topics';

const reducers = combineReducers({ meditor, mtoolbar, session, topics });

export default reducers;

import { combineReducers } from 'redux';
import { mtoolbar } from './markdown-toolbar';
import { meditor } from './markdown-editor';
import { session } from './session';

const reducers = combineReducers({ meditor, mtoolbar, session });

export default reducers;

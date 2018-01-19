import { combineReducers } from 'redux';
import { mtoolbar } from './markdown-toolbar';
import { meditor } from './markdown-editor';

const reducers = combineReducers({ meditor, mtoolbar });

export default reducers;

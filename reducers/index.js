import { combineReducers } from 'redux';
import { excerpt } from './excerpt';
import { session } from './session';
import { notice } from './notice';

const reducers = combineReducers({
  excerpt,
  session,
  notice
});

export default reducers;

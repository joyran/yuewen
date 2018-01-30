import { combineReducers } from 'redux';
import { digest } from './digest';
import { session } from './session';
import { notice } from './notice';

const reducers = combineReducers({
  digest,
  session,
  notice
});

export default reducers;

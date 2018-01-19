import { combineReducers } from 'redux';
import { digest } from './digest';
import { session } from './session';

const reducers = combineReducers({
  digest,
  session
});

export default reducers;

import { createActions, handleActions } from 'redux-actions';

// ------------------------
// ACTIONS
// ------------------------
export const { readSessionSuccess } = createActions('READ_SESSION_SUCCESS');

// ------------------------
// REDUCERS
// ------------------------
export const session = handleActions({
  READ_SESSION_SUCCESS: (state, action) => ({
    ...state,
    uid: action.payload.uid,
    username: action.payload.username,
    avatar: action.payload.avatar,
    followedTags: action.payload.followedTags
  })
}, {});

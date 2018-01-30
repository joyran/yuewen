import { createActions, handleActions } from 'redux-actions';
import fetch from 'isomorphic-fetch';
import { message } from 'antd';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const { readSessionSuccess } = createActions('READ_SESSION_SUCCESS');


/**
 * 退出登录
 */
export const deleteSession = () => () => {
  return fetch('/api/v1/session', {
    credentials: 'include',
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(() => top.location = '/login')
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


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

import { createActions, handleActions } from 'redux-actions';
import fetch from 'isomorphic-fetch';
import { message } from 'antd';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readSessionSuccess,
  updateFollowedTopic,
  followUserSuccess
} = createActions(
  'READ_SESSION_SUCCESS',
  'UPDATE_FOLLOWED_TOPIC',
  'FOLLOW_USER_SUCCESS'
);


/**
 * 关注用户
 */
export const followUser = login => (dispatch) => {
  fetch(`/api/v1/user/following/${login}`, {
    credentials: 'include',
    method: 'put'
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(followUserSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};


/**
 * 取消关注用户
 */
export const unfollowUser = login => (dispatch) => {
  fetch(`/api/v1/user/following/${login}`, {
    credentials: 'include',
    method: 'delete'
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(followUserSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};


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
    ...action.payload
  }),

  UPDATE_FOLLOWED_TOPIC: (state, action) => ({
    ...state,
    ...action.payload
  }),

  FOLLOW_USER_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload
  })
}, {});

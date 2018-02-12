import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';
import { session } from './session';
import { notice } from './notice';
import { excerpt } from './excerpt';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readProfileSuccess
} = createActions(
  'READ_PROFILE_SUCCESS'
);

/**
 * 更新所有评论通知消息状态为已读
 */
export const updateAllCommentNoticeToView = () => () => {
  return fetch('/api/v1/notice/toview', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nid: 0, type: 'comment' })
  })
    .then(res => res.json())
    .then(() => {
      message.success('清空评论通知成功');
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const profile = handleActions({
  READ_PROFILE_SUCCESS: (state, action) => ({
    ...state,
    banner: action.payload.banner,
    avatar: action.payload.avatar,
    username: action.payload.username,
    bio: action.payload.bio,
    uid: action.payload._id
  })
}, {});

export const reducers = combineReducers({ session, profile, notice, excerpt });

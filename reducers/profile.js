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
  readProfileSuccess,
  updateProfileBanner,
  updateProfileAvatar
} = createActions(
  'READ_PROFILE_SUCCESS',
  'UPDATE_PROFILE_BANNER',
  'UPDATE_PROFILE_AVATAR'
);

/**
 * 裁剪头像
 */
export const cropAvatar = (width, height, x, y, filename) => () => {
  return fetch('/api/v1/upload/avatar/crop', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ width, height, x, y, filename })
  })
    .then(res => res.json())
    .then(() => {
      // dispatch(updateProfileAvatar(res.avatar));
      // 刷新页面
      location.reload();
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 裁剪封面图 banner
 */
export const cropBanner = (width, height, x, y, filename) => () => {
  return fetch('/api/v1/upload/banner/crop', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ width, height, x, y, filename })
  })
    .then(res => res.json())
    .then(() => {
      // dispatch(updateProfileBanner(res.banner));
      // 刷新页面
      location.reload();
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 删除文章封面图
 */
export const deleteBanner = filepath => () => {
  return fetch('/api/v1/upload/banner', {
    credentials: 'include',
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filepath })
  })
    .then((res) => {
      console.log(res);
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
    ...action.payload,
    uid: action.payload._id
  }),

  UPDATE_PROFILE_BANNER: (state, action) => ({
    ...state,
    banner: action.payload
  }),

  UPDATE_PROFILE_AVATAR: (state, action) => ({
    ...state,
    avatar: action.payload
  }),
}, {});

export const reducers = combineReducers({ session, profile, notice, excerpt });

/**
 * 话题广场
 */

import fetch from 'isomorphic-fetch';
import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { message } from 'antd';
import { session } from './session';
import { notice } from './notice';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readTopicsSuccess
} = createActions(
  'READ_TOPICS_SUCCESS'
);

/**
 * 读取所有话题
 */
export const readTopics = () => (dispatch, getState) => {
  const { page, per_page } = getState().topics;
  fetch(`/api/v1/topics?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readTopicsSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const topics = handleActions({
  READ_TOPICS_SUCCESS: (state, action) => ({
    ...state,
    has_more: action.payload.has_more,
    data: state.data.concat(action.payload.data),
    page: state.page + 1
  })
}, {});

export const reducers = combineReducers({ session, topics, notice });

/**
 * 文章摘录
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
  readTopicSuccess,
  readTopicFollowersSuccess,
  readTopicArticlesSuccess,
  followTopicSuccess
} = createActions(
  'READ_TOPIC_SUCCESS',
  'READ_TOPIC_FOLLOWERS_SUCCESS',
  'READ_TOPIC_ARTICLES_SUCCESS',
  'FOLLOW_TOPIC_SUCCESS'
);

/**
 * 读取话题文章
 */
export const readTopicArticles = () => (dispatch, getState) => {
  const { topic, articles } = getState().topic;

  fetch(`/api/v1/topic/${topic}/articles?page=${articles.page}&per_page=${articles.per_page}`, {
    credentials: 'include',
    method: 'get'
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readTopicArticlesSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};

/**
 * 读取话题关注者
 */
export const readTopicFollowers = () => (dispatch, getState) => {
  const { topic, followers } = getState().topic;

  fetch(`/api/v1/topic/${topic}/followers?page=${followers.page}&per_page=${followers.per_page}`, {
    credentials: 'include',
    method: 'get'
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readTopicFollowersSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};


/**
 * 关注话题
 */
export const followTopic = () => (dispatch, getState) => {
  const { topic, has_followed } = getState().topic;
  const method = has_followed ? 'delete' : 'put';

  fetch(`/api/v1/topic/${topic}/follow`, {
    credentials: 'include',
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(followTopicSuccess(res));
      if (has_followed) {
        message.success('取消关注话题成功');
      } else {
        message.success('关注话题成功');
      }
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const topic = handleActions({
  READ_TOPIC_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload
  }),

  READ_TOPIC_ARTICLES_SUCCESS: (state, action) => ({
    ...state,
    articles: {
      ...state.articles,
      data: state.articles.data.concat(action.payload.data),
      page: state.articles.page + 1,
      has_more: action.payload.has_more,
    }
  }),

  READ_TOPIC_FOLLOWERS_SUCCESS: (state, action) => ({
    ...state,
    followers: {
      ...state.followers,
      data: state.followers.data.concat(action.payload.data),
      page: state.followers.page + 1,
      has_more: action.payload.has_more,
    }
  }),

  FOLLOW_TOPIC_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload
  })
}, {});

export const reducers = combineReducers({ session, topic, notice });

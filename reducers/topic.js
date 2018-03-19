/**
 * 话题
 */

import fetch from 'isomorphic-fetch';
import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { message } from 'antd';
import { session, updateFollowedTopic } from './session';
import { notice } from './notice';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readTopicSuccess,
  readTopicFollowersSuccess,
  readTopicArticlesSuccess,
  resetTopicArticles,
  followTopicSuccess,
  swapSortby
} = createActions(
  'READ_TOPIC_SUCCESS',
  'READ_TOPIC_FOLLOWERS_SUCCESS',
  'READ_TOPIC_ARTICLES_SUCCESS',
  'RESET_TOPIC_ARTICLES',
  'FOLLOW_TOPIC_SUCCESS',
  'SWAP_SORTBY'
);

/**
 * 读取话题文章
 */
export const readTopicArticles = () => (dispatch, getState) => {
  const { topic, articles } = getState().topic;
  const { sort_by } = articles;

  fetch(`/api/v1/topic/${topic}/articles?page=${articles.page}&per_page=${articles.per_page}&sort_by=${sort_by}`, {
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
 * 参数: topic 话题
 * 参数: method 方法，delete 取消关注话题，put 关注话题
 */
export const followTopic = (topic, method) => (dispatch, getState) => {
  var followed_topics = getState().session.followed_topics;

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
      if (method === 'delete') {
        followed_topics.splice(followed_topics.findIndex(i => i === topic), 1);
        message.success('取消关注话题成功');
      } else {
        followed_topics = followed_topics.concat([topic]);
        message.success('关注话题成功');
      }
      dispatch(updateFollowedTopic({ followed_topics }));
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

  RESET_TOPIC_ARTICLES: state => ({
    ...state,
    articles: {
      ...state.articles,
      data: [],
      page: 1
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
  }),

  SWAP_SORTBY: state => ({
    ...state,
    articles: {
      ...state.articles,
      sort_by: state.articles.sort_by === 'time' ? 'heat' : 'time'
    }
  })
}, {});

export const reducers = combineReducers({ session, topic, notice });

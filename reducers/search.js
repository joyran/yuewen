import { createActions, handleActions } from 'redux-actions';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';
import { combineReducers } from 'redux';
import { session } from './session';
import { notice } from './notice';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  initSearch,
  searchArticleSuccess,
  searchUserSuccess,
  changeTab
} = createActions(
  'INIT_SEARCH',
  'SEARCH_ARTICLE_SUCCESS',
  'SEARCH_USER_SUCCESS',
  'CHANGE_TAB'
);

/**
 * 搜索文章
 */
export const searchArticle = () => (dispatch, getState) => {
  const { page, query } = getState().search;

  return fetch(`/api/v1/search/articles?q=${query}&page=${page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(searchArticleSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 搜索用户
 */
export const searchUser = () => (dispatch, getState) => {
  const { page, query } = getState().search;

  return fetch(`/api/v1/search/users?q=${query}&page=${page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(searchUserSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


// ------------------------
// REDUCERS
// ------------------------
export const search = handleActions({
  INIT_SEARCH: (state, action) => ({
    ...state,
    articles: { data: [] },
    users: { data: [] },
    query: action.payload,
    loading: false,
    page: 1
  }),

  SEARCH_ARTICLE_SUCCESS: (state, action) => ({
    ...state,
    articles: {
      data: state.articles.data.concat(action.payload.data),
      has_more: action.payload.has_more
    },
    loading: false,
    page: state.page + 1
  }),

  SEARCH_USER_SUCCESS: (state, action) => ({
    ...state,
    users: {
      data: state.users.data.concat(action.payload.data),
      has_more: action.payload.has_more
    },
    loading: false,
    page: state.page + 1
  }),

  CHANGE_TAB: state => ({
    ...state,
    articles: { data: [] },
    users: { data: [] },
    loading: true,
    page: 1
  })
}, {});

export const reducers = combineReducers({ session, search, notice });

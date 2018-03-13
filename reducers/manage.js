// 文章管理

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
  readArticlesSuccess
} = createActions(
  'READ_ARTICLES_SUCCESS'
);

export const readArticles = (current, pageSize) => (dispatch, getState) => {
  const { login } = getState().session;
  return fetch(`/api/v1/users/${login}/articles?page=${current}&per_page=${pageSize}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readArticlesSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


export const deleteArticle = aid => () => {
  return fetch(`/api/v1/articles/${aid}`, {
    credentials: 'include',
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.status === 204) {
        message.success('删除文章成功');
        top.location = '/manage';
      }
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const manage = handleActions({
  READ_ARTICLES_SUCCESS: (state, action) => ({
    ...state,
    articles: action.payload
  })
}, {});

export const reducers = combineReducers({ manage, session, notice });

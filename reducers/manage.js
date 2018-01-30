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
  readArticlesByUserSuccess
} = createActions(
  'READ_ARTICLES_BY_USER_SUCCESS'
);

export const deleteArticle = aid => (dispatch) => {
  return fetch('/api/v1/article', {
    credentials: 'include',
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aid })
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readArticlesByUserSuccess(res));
      message.success('删除成功');
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
  READ_ARTICLES_BY_USER_SUCCESS: (state, action) => ({
    ...state,
    articles: action.payload
  })
}, {});

export const reducers = combineReducers({ manage, session, notice });

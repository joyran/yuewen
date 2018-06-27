import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';
import { session } from './session';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readUsersSuccess,
  readArticlesSuccess,
  updateLoadingState,
} = createActions(
  'READ_USERS_SUCCESS',
  'READ_ARTICLES_SUCCESS',
  'UPDATE_LOADING_STATE'
);

/**
 * 读取用户
 */
export const readUsers = (page, per_page) => (dispatch) => {
  dispatch(updateLoadingState());

  return fetch(`/api/v1/admin/users?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readUsersSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 读取文章
 */
export const readArticles = (page, per_page) => (dispatch) => {
  dispatch(updateLoadingState());

  return fetch(`/api/v1/admin/articles?page=${page}&per_page=${per_page}`, {
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

// ------------------------
// REDUCERS
// ------------------------
export const admin = handleActions({
  READ_USERS_SUCCESS: (state, action) => ({
    ...state,
    data: action.payload.data,
    count: action.payload.count,
    loading: !state.loading,
  }),

  READ_ARTICLES_SUCCESS: (state, action) => ({
    ...state,
    data: action.payload.data,
    count: action.payload.count,
    loading: !state.loading,
  }),

  UPDATE_LOADING_STATE: state => ({
    loading: !state.loading
  })
}, {});

export const reducers = combineReducers({ session, admin });

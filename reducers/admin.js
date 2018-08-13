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
  readDataSuccess,
  updateLoadingState,
} = createActions(
  'READ_DATA_SUCCESS',
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
      dispatch(readDataSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 新增用户
 */
export const createUser = user => (dispatch) => {
  return fetch('/api/v1/admin/users', {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
    .then(() => {
      dispatch(readUsers(1, 10));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 恢复登录用户密码为默认值
 */
export const resetUserPassword = login => () => {
  return fetch(`/api/v1/admin/users/${login}/reset_password`, {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(() => {
      message.success('恢复密码成功');
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
      dispatch(readDataSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 删除文章
 */
export const deleteArticle = aid => (dispatch) => {
  return fetch(`/api/v1/admin/articles/${aid}`, {
    credentials: 'include',
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(() => {
      message.success('删除文章成功');
      dispatch(readArticles(1, 10));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 读取话题
 */
export const readTopics = (page, per_page) => (dispatch) => {
  dispatch(updateLoadingState());

  return fetch(`/api/v1/admin/topics?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readDataSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 新增话题
 */
export const createTopic = topic => (dispatch) => {
  return fetch('/api/v1/admin/topics', {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(topic)
  })
    .then(() => {
      dispatch(readTopics(1, 10));
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
  READ_DATA_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload,
    loading: !state.loading,
  }),

  UPDATE_LOADING_STATE: state => ({
    loading: !state.loading
  })
}, {});

export const reducers = combineReducers({ session, admin });

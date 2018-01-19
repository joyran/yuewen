import fetch from 'isomorphic-fetch';
import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { message } from 'antd';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const { loginStart, loginFailed } = createActions('LOGIN_START', 'LOGIN_FAILED');

/**
 * 登录 action 构造函数
 * @param username 用户名
 * @param password 密码
 * @param remember 下次自动登录，true or false
 */
export const signin = (username, password, remember) => (dispatch) => {
  dispatch(loginStart());
  return fetch('/api/v1/session', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
      remember
    })
  })
    .then(res => res.json())
    .then((res) => {
      if (res.status === 201) {
        // 验证成功跳转到主页
        location.href = '/';
      } else {
        // 验证失败提示用户错误消息
        message.error(res.msg, 5);
        dispatch(loginFailed());
      }
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
      dispatch(loginFailed());
    });
};

/**
 * 退出登录
 */
export const sigout = () => () => {
  return fetch('/api/v1/session', {
    credentials: 'include',
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.status === 204) {
        // 退出成功跳转到登录页面
        location.href = '/login';
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
const login = handleActions({
  LOGIN_START: () => ({
    loading: true,
    label: '正在登录...'
  }),

  LOGIN_FAILED: () => ({
    loading: false,
    label: '登录'
  })
}, {});


export const reducers = combineReducers({
  login
});

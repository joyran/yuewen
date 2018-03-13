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
  readUnviewNoticeSuccess,
  readAllNoticeSuccess,
  updateAllNoticeToViewSuccess
} = createActions(
  'READ_UNVIEW_NOTICE_SUCCESS',
  'READ_ALL_NOTICE_SUCCESS',
  'UPDATE_ALL_NOTICE_TO_VIEW_SUCCESS'
);

/**
 * 更新所有通知消息状态为已读
 */
export const updateAllNoticeToView = () => (dispatch, getState) => {
  const { login } = getState().session;
  return fetch(`/api/v1/users/${login}/received_notices/toview`, {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.status === 201) {
        dispatch(updateAllNoticeToViewSuccess());
        message.success('清空通知消息成功');
      } else {
        message.error('清空通知消息失败');
      }
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 更新通知消息状态为已读, 然后跳转到指定连接
 */
export const updateNoticeToView = (nid, link) => (dispatch, getState) => {
  const { login } = getState().session;
  return fetch(`/api/v1/users/${login}/received_notices/${nid}/toview`, {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (res.status === 201) {
        top.location = link;
      } else {
        message.error('更新通知消息状态为已读失败');
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
export const notice = handleActions({
  READ_UNVIEW_NOTICE_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload
  }),

  READ_ALL_NOTICE_SUCCESS: (state, action) => ({
    ...state,
    notices: action.payload
  }),

  UPDATE_ALL_NOTICE_TO_VIEW_SUCCESS: state => ({
    ...state,
    comments: [],
    likes: []
  })
}, {});

export const reducers = combineReducers({ session, notice });

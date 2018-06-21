/**
 * 文章摘录
 */

import fetch from 'isomorphic-fetch';
import { createActions, handleActions } from 'redux-actions';
import { message } from 'antd';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readExcerptsSuccess,
  changeTag
} = createActions(
  'READ_EXCERPTS_SUCCESS',
  'CHANGE_TAG'
);

/**
 * 读取用户发表或者收藏的文章摘录 excerpts
 * 参数: sortby create为发布的文章，collect为收藏的文章
 */
export const readExcerptsByUser = login => (dispatch, getState) => {
  const { page, sortby, per_page } = getState().excerpt;

  fetch(`/api/v1/users/${login}/excerpts/${sortby}?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get'
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readExcerptsSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const excerpt = handleActions({
  READ_EXCERPTS_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload,
    page: state.page + 1,
    data: state.data.concat(action.payload.data),
    loading: false
  }),

  // 点击 tag 标签，page 和 data 重置，loading 置为 true 是想显示 loading card
  CHANGE_TAG: (state, action) => ({
    ...state,
    sortby: action.payload,
    page: 1,
    data: [],
    loading: true,
    has_more: true
  })
}, {});

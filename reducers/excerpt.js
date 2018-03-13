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
  readExcerptsSuccessByServer,
  changeTag
} = createActions(
  'READ_EXCERPTS_SUCCESS',
  'READ_EXCERPTS_SUCCESS_BY_SERVER',
  'CHANGE_TAG'
);

/**
 * 根据文章标签 tag 读取文章摘录 excerpt
 */
export const readExcerptsByTag = () => (dispatch, getState) => {
  const excerpt = getState().excerpt;

  fetch(`/api/v1/excerpts/tag/${excerpt.tag}?page=${excerpt.page}&per_page=${excerpt.per_page}`, {
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

/**
 * 读取用户发表或者收藏的文章摘录 excerpts
 * 参数: sortby created为发布的文章，collected为收藏的文章
 */
export const readExcerptsByUser = sortby => (dispatch, getState) => {
  const excerpt = getState().excerpt;
  const { login } = getState().profile;

  fetch(`/api/v1/users/${login}/excerpts/${sortby}?page=${excerpt.page}&per_page=${excerpt.per_page}`, {
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
    excerpts: state.excerpts.concat(action.payload.excerpts),
    loading: false
  }),

  READ_EXCERPTS_SUCCESS_BY_SERVER: (state, action) => ({
    ...state,
    ...action.payload,
    page: state.page + 1    // page + 1
  }),

  // 点击 tag 标签，page 和 excerpts 重置，loading 置为 true 是想显示 loading card
  CHANGE_TAG: (state, action) => ({
    ...state,
    tag: action.payload,
    page: 1,
    excerpts: [],
    loading: true,
    has_more: true
  })
}, {});

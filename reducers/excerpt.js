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
  readExcerptsStart,
  readExcerptsSuccess,
  readExcerptsSuccessByServer,
  changeTag
} = createActions(
  'READ_EXCERPTS_START',
  'READ_EXCERPTS_SUCCESS',
  'READ_EXCERPTS_SUCCESS_BY_SERVER',
  'CHANGE_TAG'
);

/**
 * 根据文章标签 tag 读取文章摘录 excerpt
 */
export const readExcerptsByTag = () => (dispatch, getState) => {
  const { tag, skip, limit } = getState().excerpt;
  dispatch(readExcerptsStart());

  fetch(`/api/v1/excerpts/tag/${tag}?&skip=${skip}&limit=${limit}`, {
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
 * 根据用户 id 读取用户创建的文章摘录 excerpt
 */
export const readExcerptsByUserCreated = () => (dispatch, getState) => {
  const { skip, limit } = getState().excerpt;
  const { uid } = getState().profile;
  dispatch(readExcerptsStart());

  fetch(`/api/v1/excerpts/user/${uid}?sortby=created&skip=${skip}&limit=${limit}`, {
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
 * 根据用户 id 读取用户收藏的文章摘录 excerpt
 */
export const readExcerptsByUserCollected = () => (dispatch, getState) => {
  const { skip, limit } = getState().excerpt;
  const { uid } = getState().profile;
  dispatch(readExcerptsStart());

  fetch(`/api/v1/excerpts/user/${uid}?sortby=collected&skip=${skip}&limit=${limit}`, {
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
  READ_EXCERPTS_START: state => ({
    ...state,
    loading: true
  }),

  READ_EXCERPTS_SUCCESS: (state, action) => ({
    ...state,
    skip: state.skip + state.limit,
    dataSource: state.dataSource.concat(action.payload.dataSource),
    loading: false,
    hasMore: action.payload.hasMore,
    total: action.payload.total
  }),

  READ_EXCERPTS_SUCCESS_BY_SERVER: (state, action) => ({
    ...state,
    skip: state.skip + state.limit,
    dataSource: action.payload.dataSource,
    hasMore: action.payload.hasMore,
    total: action.payload.total,
    totalCreated: action.payload.totalCreated,
    totalCollected: action.payload.totalCollected
  }),

  // 点击 tag 标签，skip 和 dataSource 重置，loading 置为 true 是想显示 loading card
  CHANGE_TAG: (state, action) => ({
    ...state,
    tag: action.payload,
    skip: 0,
    dataSource: [],
    loading: true,
    hasMore: true
  })
}, {});

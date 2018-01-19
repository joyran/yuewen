import fetch from 'isomorphic-fetch';
import { createActions, handleActions } from 'redux-actions';
import { message } from 'antd';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readDigestsStart,
  readDigestsSuccess,
  readDigestsSuccessByServer,
  disableLoadButton,
  activeTag
} = createActions(
  'READ_DIGESTS_START',
  'READ_DIGESTS_SUCCESS',
  'READ_DIGESTS_SUCCESS_BY_SERVER',
  'DISABLE_LOAD_BUTTON',
  'ACTIVE_TAG'
);

export const readDigests = () => (dispatch, getState) => {
  const { skip, limit } = getState().digest;
  dispatch(readDigestsStart());

  fetch(`/api/v1/digests?skip=${skip}&limit=${limit}`, {
    credentials: 'include',
    method: 'get'
  })
    .then(res => res.json())
    .then((res) => {
      if (res.status === 200) {
        dispatch(readDigestsSuccess(res.digests));
      }

      // isEnd = true 表示全部加载完成
      if (res.isEnd) {
        dispatch(disableLoadButton());
      }
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const digest = handleActions({
  READ_DIGESTS_START: state => ({
    ...state,
    loadBtnDisableState: true,
    loadBtnLoadingState: true,
    loadBtnLabel: '正在拼命加载中...'
  }),

  READ_DIGESTS_SUCCESS: (state, action) => ({
    ...state,
    loadBtnDisableState: false,
    loadBtnLoadingState: false,
    loadBtnLabel: '加载更多',
    skip: state.skip + state.limit,
    digests: state.digests.concat(action.payload)
  }),

  READ_DIGESTS_SUCCESS_BY_SERVER: (state, action) => ({
    ...state,
    skip: state.skip + state.limit,
    digests: action.payload
  }),

  DISABLE_LOAD_BUTTON: state => ({
    ...state,
    loadBtnDisableState: true,
    loadBtnLoadingState: false,
    loadBtnLabel: '已经到底了'
  }),

  ACTIVE_TAG: (state, action) => ({
    ...state,
    activeTag: action.payload
  })
}, {});

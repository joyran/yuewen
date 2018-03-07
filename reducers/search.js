import { createActions, handleActions } from 'redux-actions';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  searchSuccess
} = createActions(
  'SEARCH_SUCCESS'
);

/**
 * 更新所有评论通知消息状态为已读
 */
export const search = keyword => (dispatch) => {
  return fetch(`/api/v1/search/${keyword}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(() => {
      dispatch(searchSuccess(res.hits));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


// ------------------------
// REDUCERS
// ------------------------
export const search = handleActions({
  SEARCH_SUCCESS: (state, action) => ({
    ...state,
    unviewComments: action.payload.unviewComments,
    unviewLikes: action.payload.unviewLikes,
    unviewCommentsCount: action.payload.unviewCommentsCount,
    unviewLikesCount: action.payload.unviewLikesCount,
    unviewAllCount: action.payload.unviewAllCount
  })
}, {});

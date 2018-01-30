import { createActions, handleActions } from 'redux-actions';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readUnviewNoticeSuccess,
  updateAllCommentNoticeToViewSuccess,
  updateAllLikeNoticeToViewSuccess
} = createActions(
  'READ_UNVIEW_NOTICE_SUCCESS',
  'UPDATE_ALL_COMMENT_NOTICE_TO_VIEW_SUCCESS',
  'UPDATE_ALL_LIKE_NOTICE_TO_VIEW_SUCCESS'
);

/**
 * 更新所有评论通知消息状态为已读
 */
export const updateAllCommentNoticeToView = () => (dispatch) => {
  return fetch('/api/v1/notice/view', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nid: 0, type: 'comment' })
  })
    .then(res => res.json())
    .then(() => {
      dispatch(updateAllCommentNoticeToViewSuccess());
      message.success('清空评论通知成功');
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 更新评论通知消息状态为已读, 然后跳转到文章评论
 */
export const updateCommentNoticeToView = (nid, link) => () => {
  return fetch('/api/v1/notice/view', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nid, type: 'comment' })
  })
    .then(() => top.location = link)
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 更新所有点赞通知消息状态为已读
 */
export const updateAllLikeNoticeToView = () => (dispatch) => {
  return fetch('/api/v1/notice/view', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nid: 0, type: 'like' })
  })
    .then(res => res.json())
    .then(() => {
      dispatch(updateAllLikeNoticeToViewSuccess());
      message.success('清空点赞通知成功');
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 更新点赞通知消息状态为已读, 然后跳转到文章
 */
export const updateLikeNoticeToView = (nid, link) => () => {
  return fetch('/api/v1/notice/view', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nid, type: 'like' })
  })
    .then(() => top.location = link)
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
    unviewComments: action.payload.unviewComments,
    unviewLikes: action.payload.unviewLikes,
    unviewCommentsCount: action.payload.unviewCommentsCount,
    unviewLikesCount: action.payload.unviewLikesCount,
    unviewAllCount: action.payload.unviewAllCount
  }),

  UPDATE_ALL_COMMENT_NOTICE_TO_VIEW_SUCCESS: state => ({
    ...state,
    unviewComments: [],
    unviewCommentsCount: 0,
    unviewAllCount: state.unviewLikesCount
  }),

  UPDATE_ALL_LIKE_NOTICE_TO_VIEW_SUCCESS: state => ({
    ...state,
    unviewLikes: [],
    unviewLikesCount: 0,
    unviewAllCount: state.unviewCommentsCount
  })
}, {});

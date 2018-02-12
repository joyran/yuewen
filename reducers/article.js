import fetch from 'isomorphic-fetch';
import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { message } from 'antd';
import { session } from './session';
import { notice } from './notice';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readArticleSuccess,
  readArticleLikesSuccess,
  updateArticleLikesSuccess,
  readArticleCommentsSuccess,
  updateArticleCollectionSuccess
} = createActions(
  'READ_ARTICLE_SUCCESS',
  'READ_ARTICLE_LIKES_SUCCESS',
  'UPDATE_ARTICLE_LIKES_SUCCESS',
  'READ_ARTICLE_COMMENTS_SUCCESS',
  'UPDATE_ARTICLE_COLLECTION_SUCCESS'
);

/**
 * 更新文章点赞用户及用户总数
 * @param aid 文章索引 id
 */
export const updateArticleLikes = aid => (dispatch, getState) => {
  const { isLiked } = getState().article;
  if (isLiked) {
    message.warn('你已经点过赞');
    return false;
  }

  return fetch('/api/v1/article/like', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aid })
  })
    .then(res => res.json())
    .then((res) => {
      if (res.status === 200) {
        dispatch(updateArticleLikesSuccess(res.likers));
        message.success('点赞成功');
      }
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 收藏和取消收藏文章
 */
export const updateArticleCollection = aid => (dispatch) => {
  return fetch('/api/v1/article/collection', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aid })
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(updateArticleCollectionSuccess());
      if (res.hasCollected) {
        message.success('收藏文章成功');
      } else {
        message.success('取消收藏文章成功');
      }
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 添加文章评论
 * @param aid 文章索引 id
 * @param comment 评论内容
 */
export const createArticleComment = (aid, comment) => (dispatch) => {
  return fetch('/api/v1/article/comment', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aid, comment })
  })
    .then(res => res.json())
    .then((res) => {
      if (res.status === 200) {
        dispatch(readArticleCommentsSuccess(res.comments));
        message.success('评论成功');
      }
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 添加文章评论回复
 * @param aid 文章索引 id
 * @param reply 评论内容
 * @param atuser 被@的用户
 * @param rid 被回复的评论 id
 */
export const createArticleReply = (aid, reply, atuser, rid) => (dispatch) => {
  return fetch('/api/v1/article/reply', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aid, reply, atuser, rid })
  })
    .then(res => res.json())
    .then((res) => {
      if (res.status === 200) {
        dispatch(readArticleCommentsSuccess(res.comments));
        message.success('评论回复成功');
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
export const article = handleActions({
  READ_ARTICLE_SUCCESS: (state, action) => ({
    ...state,
    _id: action.payload._id,
    title: action.payload.title,
    markup: action.payload.markup,
    author: action.payload.author,
    createAt: action.payload.createAt,
    hasCollected: action.payload.hasCollected
  }),

  READ_ARTICLE_LIKES_SUCCESS: (state, action) => ({
    ...state,
    isLiked: action.payload.isLiked,
    likers: action.payload.likers,
    likerCount: action.payload.likers.length
  }),

  UPDATE_ARTICLE_LIKES_SUCCESS: (state, action) => ({
    ...state,
    isLiked: !state.isLiked,
    likers: action.payload,
    likerCount: action.payload.length
  }),

  READ_ARTICLE_COMMENTS_SUCCESS: (state, action) => ({
    ...state,
    comments: action.payload
  }),

  UPDATE_ARTICLE_COLLECTION_SUCCESS: state => ({
    ...state,
    hasCollected: !state.hasCollected
  })
}, {});

export const reducers = combineReducers({ article, session, notice });

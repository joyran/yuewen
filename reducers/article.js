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
  createArticleLikesSuccess,
  readArticleCommentsSuccess,
  updateArticleCollectionSuccess,
  readConversationSuccess,
  toggleCommentReplyEditor,
  toggleConversationModal,
  createCommentLikesSuccess,
  deleteCommentLikesSuccess,
  createConversationLikesSuccess,
  deleteConversationLikesSuccess
} = createActions(
  'READ_ARTICLE_SUCCESS',
  'READ_ARTICLE_LIKES_SUCCESS',
  'CREATE_ARTICLE_LIKES_SUCCESS',
  'READ_ARTICLE_COMMENTS_SUCCESS',
  'UPDATE_ARTICLE_COLLECTION_SUCCESS',
  'READ_CONVERSATION_SUCCESS',
  'TOGGLE_COMMENT_REPLY_EDITOR',
  'TOGGLE_CONVERSATION_MODAL',
  'CREATE_COMMENT_LIKES_SUCCESS',
  'DELETE_COMMENT_LIKES_SUCCESS',
  'CREATE_CONVERSATION_LIKES_SUCCESS',
  'DELETE_CONVERSATION_LIKES_SUCCESS'
);

/**
 * 更新文章点赞用户及用户总数
 * @param aid 文章索引 id
 */
export const createArticleLikes = aid => (dispatch, getState) => {
  if (getState().article.has_liked) {
    message.warn('你已经点过赞');
    return false;
  }

  return fetch(`/api/v1/articles/${aid}/likes`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(createArticleLikesSuccess(res));
      message.success('点赞成功');
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 收藏和取消收藏文章
 */
export const updateArticleCollection = aid => (dispatch, getState) => {
  const method = getState().article.has_collected ? 'delete' : 'post';

  return fetch(`/api/v1/articles/${aid}/collect`, {
    credentials: 'include',
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aid })
  })
    .then((res) => {
      if (res.status === 201) {
        message.success('收藏文章成功');
      } else if (res.status === 204) {
        message.success('取消收藏文章成功');
      }
      dispatch(updateArticleCollectionSuccess());
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 读取文章评论
 */
export const readArticleComments = (aid, page) => (dispatch) => {
  return fetch(`/api/v1/articles/${aid}/comments?page=${page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readArticleCommentsSuccess(res));
      // 点击分页按钮跳转到评论顶部
      const offsetTop = document.getElementById('comment-list').offsetTop;
      window.scrollTo(0, offsetTop);
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 读取评论对话
 */
export const readConversation = cid => (dispatch) => {
  dispatch(toggleConversationModal());

  return fetch(`/api/v1/comments/${cid}/conversation`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readConversationSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 添加文章评论
 * @param aid 文章索引 id
 * @param content 评论内容
 */
export const createArticleComment = (aid, content) => (dispatch) => {
  return fetch(`/api/v1/articles/${aid}/comments`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  })
    .then(res => res.json())
    .then(() => {
      dispatch(readArticleComments(aid, 1));
      message.success('评论成功');
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 添加文章评论回复
 * @param aid 文章索引 id
 * @param content 评论内容
 * @param atuser 被@的用户
 * @param cid 被回复的评论 id
 */
export const createArticleCommentReply = (aid, content, atuser, cid) => (dispatch) => {
  return fetch(`/api/v1/articles/${aid}/comments/${cid}/replys`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content, atuser })
  })
    .then(res => res.json())
    .then(() => {
      dispatch(readArticleComments(aid, 1));
      message.success('评论回复成功');
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 更新文章评论点赞
 */
export const updateCommentLikes = (cid, has_liked, type) => (dispatch) => {
  const method = has_liked ? 'delete' : 'post';

  return fetch(`/api/v1/comments/${cid}/likes`, {
    credentials: 'include',
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(() => {
      if (type === 'comment') {
        if (has_liked) {
          dispatch(deleteCommentLikesSuccess(cid));
        } else {
          dispatch(createCommentLikesSuccess(cid));
        }
      } else {
        if (has_liked) {
          dispatch(deleteConversationLikesSuccess(cid));
        } else {
          dispatch(createConversationLikesSuccess(cid));
        }
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
    ...action.payload
  }),

  READ_ARTICLE_LIKES_SUCCESS: (state, action) => ({
    ...state,
    likes: action.payload
  }),

  CREATE_ARTICLE_LIKES_SUCCESS: (state, action) => ({
    ...state,
    has_liked: true,
    likes: action.payload,
    likes_count: action.payload.length
  }),

  READ_ARTICLE_COMMENTS_SUCCESS: (state, action) => ({
    ...state,
    comments: action.payload.map((comment) => {
      // 初始化所有评论的回复编辑框都处于隐藏状态
      comment.show_reply_editor = false;
      return comment;
    })
  }),

  UPDATE_ARTICLE_COLLECTION_SUCCESS: state => ({
    ...state,
    has_collected: !state.has_collected
  }),

  READ_CONVERSATION_SUCCESS: (state, action) => ({
    ...state,
    conversation: action.payload
  }),

  TOGGLE_COMMENT_REPLY_EDITOR: (state, action) => ({
    ...state,
    comments: state.comments.map((comment) => {
      // 切换显示评论的回复编辑框
      if (comment._id === action.payload) {
        comment.show_reply_editor = !comment.show_reply_editor;
      }
      return comment;
    })
  }),

  TOGGLE_CONVERSATION_MODAL: state => ({
    ...state,
    conversation_modal_visible: !state.conversation_modal_visible
  }),

  CREATE_COMMENT_LIKES_SUCCESS: (state, action) => ({
    ...state,
    comments: state.comments.map((comment) => {
      if (comment._id === action.payload) {
        comment.likes_count += 1;
        comment.has_liked = true;
      }
      return comment;
    })
  }),

  DELETE_COMMENT_LIKES_SUCCESS: (state, action) => ({
    ...state,
    comments: state.comments.map((comment) => {
      if (comment._id === action.payload) {
        comment.likes_count -= 1;
        comment.has_liked = false;
      }
      return comment;
    })
  }),

  CREATE_CONVERSATION_LIKES_SUCCESS: (state, action) => ({
    ...state,
    conversation: state.conversation.map((comment) => {
      if (comment._id === action.payload) {
        comment.likes_count += 1;
        comment.has_liked = true;
      }
      return comment;
    }),
    comments: state.comments.map((comment) => {
      if (comment._id === action.payload) {
        comment.likes_count += 1;
        comment.has_liked = true;
      }
      return comment;
    })
  }),

  DELETE_CONVERSATION_LIKES_SUCCESS: (state, action) => ({
    ...state,
    conversation: state.conversation.map((comment) => {
      if (comment._id === action.payload) {
        comment.likes_count -= 1;
        comment.has_liked = false;
      }
      return comment;
    }),
    comments: state.comments.map((comment) => {
      if (comment._id === action.payload) {
        comment.likes_count -= 1;
        comment.has_liked = false;
      }
      return comment;
    })
  }),
}, {});

export const reducers = combineReducers({ article, session, notice });

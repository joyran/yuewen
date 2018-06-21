import { createActions, handleActions } from 'redux-actions';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  createArticleSuccess,
  updateArticleId,
  updateMarkdown,
  updateCursorRange,
  updateModeToView,
  updateModeToEdit,
  updateModeToNormal,
  update
} = createActions(
  'CREATE_ARTICLE_SUCCESS',
  'UPDATE_ARTICLE_ID',
  'UPDATE_MARKDOWN',
  'UPDATE_CURSOR_RANGE',
  'UPDATE_MODE_TO_VIEW',
  'UPDATE_MODE_TO_EDIT',
  'UPDATE_MODE_TO_NORMAL'
);

/**
 * 新增文章
 */
export const createArticle = (title, excerpt, topics, html) => (dispatch, getState) => {
  const { markdown } = getState().meditor;
  return fetch('/api/v1/articles', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, excerpt, topics, markdown, html })
  })
    .then(res => res.json())
    .then((res) => {
      message.success('文章发布成功, 即将跳转到文章页面');
      localStorage.markdown = '';
      location.href = `/article/${res._id}`;
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 更新文章
 */
export const updateArticle = (aid, title, excerpt, topics, html) => (dispatch, getState) => {
  const { markdown } = getState().meditor;
  return fetch(`/api/v1/articles/${aid}`, {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, excerpt, topics, markdown, html })
  })
    .then(res => res.json())
    .then(() => {
      message.success('文章更新成功, 即将跳转到文章页面');
      localStorage.markdown = '';
      location.href = `/article/${aid}`;
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const meditor = handleActions({
  CREATE_ARTICLE_SUCCESS: state => ({
    ...state
  }),

  UPDATE_ARTICLE_ID: (state, action) => ({
    ...state,
    aid: action.payload
  }),

  // 更新文本编辑框中内容 markdown
  UPDATE_MARKDOWN: (state, action) => ({
    ...state,
    markdown: action.payload
  }),

  // 更新 CodeMirror 光标范围
  UPDATE_CURSOR_RANGE: (state, action) => ({
    ...state,
    cursor: action.payload
  }),

  // 修改模式为 阅读模式
  UPDATE_MODE_TO_VIEW: state => ({
    ...state,
    editorClassName: 'markdown-editor-hidden',
    previewClassName: 'markdown-preview-show'
  }),

  // 修改模式为 编辑模式
  UPDATE_MODE_TO_EDIT: state => ({
    ...state,
    editorClassName: 'markdown-editor-show',
    previewClassName: 'markdown-preview-hidden'
  }),

  // 修改模式为 阅读和编辑共存模式
  UPDATE_MODE_TO_NORMAL: state => ({
    ...state,
    editorClassName: 'markdown-editor',
    previewClassName: 'markdown-preview'
  })
}, {});

import { createActions, handleActions } from 'redux-actions';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  createArticleSuccess,
  updateMarkdown,
  updateCursorRange,
  updateModeToView,
  updateModeToEdit,
  updateModeToNormal
} = createActions(
  'CREATE_ARTICLE_SUCCESS',
  'UPDATE_MARKDOWN',
  'UPDATE_CURSOR_RANGE',
  'UPDATE_MODE_TO_VIEW',
  'UPDATE_MODE_TO_EDIT',
  'UPDATE_MODE_TO_NORMAL'
);

export const createArticle = (title, digest, tags, markup) => (dispatch, getState) => {
  const { markdown } = getState().meditor;
  return fetch('/api/v1/article', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, digest, tags, markdown, markup })
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

// ------------------------
// REDUCERS
// ------------------------
export const meditor = handleActions({
  CREATE_ARTICLE_SUCCESS: state => ({
    ...state
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

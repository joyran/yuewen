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
  updateTextareaCursorIndex
} = createActions(
  'CREATE_ARTICLE_SUCCESS',
  'UPDATE_MARKDOWN',
  'UPDATE_TEXTAREA_CURSOR_INDEX'
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

  // 更新文本编辑框中光标位置
  UPDATE_TEXTAREA_CURSOR_INDEX: (state, action) => ({
    ...state,
    cursorIndex: action.payload
  })
}, {});

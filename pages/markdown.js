/**
 * 写文章页面
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout } from 'antd';
import Head from 'next/head';
import MarkdownToolbar from '../components/markdown/markdown-toolbar';
import MarkdownEditor from '../components/markdown/markdown-editor';
import reducers from '../reducers/markdown';
import { readTagsSuccessByServer } from '../reducers/markdown-toolbar';
import stylesheet from '../styles/index.scss';

// 初始默认 state
const initialState = {
  meditor: {
    title: '',
    digest: '',
    markup: '',
    markdown: '',
    tags: [],
    cursorIndex: 0
  },
  mtoolbar: {
    addImgModalVisible: false,
    addLinkModalVisible: false,
    addTableModalVisible: false,
    releaseArticleModalVisible: false
  }
};

const initStore = (state = initialState) => {
  return createStore(reducers, state, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};

const Markdown = () => {
  return (
    <Layout>
      <Head>
        <title>悦文 · 写新文章</title>
        <link rel="stylesheet" href="/css/antd.min.css" />
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      </Head>
      <MarkdownToolbar />
      <MarkdownEditor />
    </Layout>
  );
};

Markdown.getInitialProps = async ({ store, req }) => {
  // 读取所有 tags
  // 服务端请求 url 必须为完整路径，不能为绝对路径 /api/v1/tags
  // isomorphic-fetch 在 node 端不会自动带上 cookie，需要手动添加 headers: { Cookie: req.headers.cookie }
  const tagsRes = await fetch(`http://${req.headers.host}/api/v1/tags`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const tags = await tagsRes.json();
  store.dispatch(readTagsSuccessByServer(tags));
};


export default withRedux(initStore, null)(Markdown);

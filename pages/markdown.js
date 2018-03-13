/**
 * 写文章页面
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, LocaleProvider } from 'antd';
import Head from 'next/head';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import Markdown from '../components/markdown/index';
import Error from '../components/error/index';
import reducers from '../reducers/markdown';
import { readSessionSuccess } from '../reducers/session';
import { updateMarkdown, updateArticleId } from '../reducers/markdown-editor';
import { readTagsSuccessByServer } from '../reducers/markdown-toolbar';
import stylesheet from '../styles/index.scss';

// 初始默认 state
const initialState = {
  meditor: {
    editorClassName: 'markdown-editor',
    previewClassName: 'markdown-preview'
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

const Index = (props) => {
  if (props.statusCode !== 200) {
    return <Error statusCode={props.statusCode} />;
  }

  return (
    <LocaleProvider locale={zhCN}>
      <Layout>
        <Head>
          <title>写新文章 - 悦文</title>
          <link rel="stylesheet" href="/css/antd.css" />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        </Head>
        <Markdown />
      </Layout>
    </LocaleProvider>
  );
};

Index.getInitialProps = async ({ store, req, query }) => {
  var res;
  // 文章索引 aid
  const aid = query.aid;

  // ----- 读取当前登录用户所有信息
  res = await fetch(`http://${req.headers.host}/api/v1/user`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readSessionSuccess(res));
  const { login } = store.getState().session;

  if (aid) {
    // ----- 读取文章内容，作者等
    res = await fetch(`http://${req.headers.host}/api/v1/users/${login}/articles/${aid}`, {
      method: 'get',
      headers: { Cookie: req.headers.cookie }
    });
    if (res.status !== 200) return { statusCode: res.status };
    const article = await res.json();
    store.dispatch(updateMarkdown(article.markdown));
    store.dispatch(updateArticleId(aid));
  }


  // ----- 读取所有 tags
  res = await fetch(`http://${req.headers.host}/api/v1/tags`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const tags = await res.json();
  store.dispatch(readTagsSuccessByServer(tags));

  return { statusCode: 200 };
};


export default withRedux(initStore, null)(Index);

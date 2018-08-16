/**
 * 写文章页面
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, LocaleProvider, Spin } from 'antd';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import Error from '../components/error/index';
import reducers from '../reducers/markdown';
import { readSessionSuccess } from '../reducers/session';
import { updateMarkdown, updateArticleId } from '../reducers/markdown-editor';
import { readTopicsSuccess } from '../reducers/topics';
import stylesheet from '../styles/index.scss';

const Markdown = dynamic(import('../components/markdown/index'), {
  ssr: false,
  loading: () => <Spin style={{ marginTop: 200 }} />
});

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
  },
  session: {},
  topics: {
    data: [],
    page: 1,
    per_page: 1000
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
          <link rel="stylesheet" href="/css/antd.min.css" />
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
  // 服务端请求时不会带上主机地址，必须手动添加
  const { host } = req.headers;

  // ----- 读取当前登录用户所有信息
  res = await fetch(`http://${host}/api/v1/user`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const user = await res.json();
  store.dispatch(readSessionSuccess(user));
  const { login } = user;

  if (aid) {
    // ----- 读取文章内容，作者等
    res = await fetch(`http://${host}/api/v1/users/${login}/articles/${aid}`, {
      method: 'get',
      headers: { Cookie: req.headers.cookie }
    });
    if (res.status !== 200) return { statusCode: res.status };
    const article = await res.json();
    store.dispatch(updateMarkdown(article.markdown));
    store.dispatch(updateArticleId(aid));
  }


  // ----- 读取所有话题 topics
  res = await fetch(`http://${host}/api/v1/topics`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const topics = await res.json();
  store.dispatch(readTopicsSuccess(topics));

  return { statusCode: 200 };
};


export default withRedux(initStore, null)(Index);

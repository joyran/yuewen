/**
 * 文章管理页面，功能包括：修改标签和标题，删除文章
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, LocaleProvider } from 'antd';
import Head from 'next/head';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { reducers, readArticlesByUserSuccess } from '../reducers/manage';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import ArticleManage from '../components/article-manage/index';
import Nav from '../components/nav/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  manage: {},
  session: {},
  notice: {}
};

const initStore = (state = initialState) => {
  return createStore(reducers, state, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};

const Index = () => {
  return (
    <LocaleProvider locale={zhCN}>
      <Layout>
        <Head>
          <title>悦文 · 与世界分享你的知识、经验和见解</title>
          <link rel="stylesheet" href="/css/antd.min.css" />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        </Head>
        <Header>
          <Nav />
        </Header>
        <Content>
          <ArticleManage />
        </Content>
        <Footer />
      </Layout>
    </LocaleProvider>
  );
};

Index.getInitialProps = async ({ store, req }) => {
  var res;

  // ----- 读取用户发表的所有文章
  res = await fetch(`http://${req.headers.host}/api/v1/article/manage`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const articles = await res.json();
  store.dispatch(readArticlesByUserSuccess(articles));

  // ----- 读取当前登录用户id, 用户名, 头像
  res = await fetch(`http://${req.headers.host}/api/v1/session`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const session = await res.json();
  store.dispatch(readSessionSuccess(session.user));

  // ----- 读取当前登录用户未读消息
  res = await fetch(`http://${req.headers.host}/api/v1/notice/unview`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const notice = await res.json();
  store.dispatch(readUnviewNoticeSuccess(notice));
};


export default withRedux(initStore, null)(Index);

/**
 * 通知消息页面
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, BackTop } from 'antd';
import Head from 'next/head';
import { reducers, readAllNoticeSuccess, readUnviewNoticeSuccess } from '../reducers/notice';
import { readSessionSuccess } from '../reducers/session';
import Nav from '../components/nav/index';
import Notice from '../components/notice/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  session: {
    uid: null,
    username: null,
    avatar: null,
    followedTags: []
  },
  notice: {
    notices: [],
    unviewComments: [],
    unviewLikes: [],
    unviewCommentsCount: 5,
    unviewLikesCount: 5,
    unviewAllCount: 10
  }
};

const initStore = (state = initialState) => {
  return createStore(reducers, state, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};

const Index = () => {
  return (
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
        <Notice />
      </Content>
      <Footer />
      <BackTop />
    </Layout>
  );
};

Index.getInitialProps = async ({ store, req }) => {
  var res;
  var notice;

  // ----- 读取当前登录用户id, 用户名, 头像
  res = await fetch(`http://${req.headers.host}/api/v1/session`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  res = await res.json();
  store.dispatch(readSessionSuccess(res.user));

  // ----- 读取当前登录用户未读消息
  res = await fetch(`http://${req.headers.host}/api/v1/notice/unview`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  notice = await res.json();
  store.dispatch(readUnviewNoticeSuccess(notice));

  // ----- 读取当前登录用户所有通知消息
  res = await fetch(`http://${req.headers.host}/api/v1/notice`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  notice = await res.json();
  store.dispatch(readAllNoticeSuccess(notice));
};


export default withRedux(initStore, null)(Index);

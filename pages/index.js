/**
 * 首页
 */

import { connect } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, BackTop } from 'antd';
import Head from 'next/head';
import reducers from '../reducers/index';
import { readExcerptsSuccessByServer } from '../reducers/excerpt';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import Nav from '../components/nav/index';
import TagNav from '../components/tag-nav/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  excerpt: {
    tag: 'new',
    loading: false,
    skip: 0,
    limit: 10
  },
  session: {},
  notice: {}
};

const initStore = (state = initialState) => {
  return createStore(reducers, state, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};

const Index = () => {
  return (
    <Layout style={{ background: '#f6f6f6' }}>
      <Head>
        <title>悦文 · 与世界分享你的知识、经验和见解</title>
        <link rel="stylesheet" href="/css/antd.css" />
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      </Head>
      <Header>
        <Nav />
      </Header>
      <Content>
        <TagNav />
      </Content>
      <Footer />
      <BackTop />
    </Layout>
  );
};

Index.getInitialProps = async ({ store, req }) => {
  var res;
  // ----- 根据标签读取文章摘要列表
  const { limit, tag } = store.getState().excerpt;

  // 请求 url 必须为完整路径，不能为绝对路径 /api/v1/excerpts
  // isomorphic-fetch 在 node 端不会自动带上 cookie，需要手动添加 headers: { Cookie: req.headers.cookie }
  res = await fetch(`http://${req.headers.host}/api/v1/excerpts/tag/${tag}?&skip=0&limit=${limit}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const excerpt = await res.json();
  store.dispatch(readExcerptsSuccessByServer(excerpt));

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


export default withRedux(initStore, null)(connect(state => state)(Index));

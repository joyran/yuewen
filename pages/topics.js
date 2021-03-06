/**
 * 话题广场
 */

import { connect } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, BackTop, LocaleProvider } from 'antd';
import Head from 'next/head';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { reducers, readTopicsSuccess } from '../reducers/topics';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import Nav from '../components/nav/index';
import Topics from '../components/topics/index';
import Error from '../components/error/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  topics: {},
  session: {},
  notice: {}
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
      <Layout style={{ background: '#f6f6f6' }}>
        <Head>
          <title>话题广场 - 悦文</title>
          <link rel="stylesheet" href="/css/antd.min.css" />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        </Head>
        <Header>
          <Nav active="topics" />
        </Header>
        <Content>
          <Topics />
        </Content>
        <Footer />
        <BackTop />
      </Layout>
    </LocaleProvider>
  );
};

Index.getInitialProps = async ({ store, req }) => {
  var res;
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


  // ----- 读取所有话题
  res = await fetch(`http://${host}/api/v1/topics`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  res = await res.json();
  store.dispatch(readTopicsSuccess(res));


  // ----- 读取用户未读通知消息
  res = await fetch(`http://${host}/api/v1/users/${login}/received_notices?has_view=false`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const unviewNotices = await res.json();
  store.dispatch(readUnviewNoticeSuccess(unviewNotices));

  // 默认返回 200 OK
  return { statusCode: 200 };
};


export default withRedux(initStore, null)(connect(state => state)(Index));

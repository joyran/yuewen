/**
 * 通知消息页面
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, BackTop, LocaleProvider } from 'antd';
import Head from 'next/head';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { reducers, readAllNoticeSuccess, readUnviewNoticeSuccess } from '../reducers/notice';
import { readSessionSuccess } from '../reducers/session';
import Nav from '../components/nav/index';
import Notice from '../components/notice/index';
import Error from '../components/error/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
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
      <Layout>
        <Head>
          <title>通知消息 - 悦文</title>
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

  // ----- 读取用户未读通知消息
  res = await fetch(`http://${host}/api/v1/users/${login}/received_notices?has_view=false`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const unviewNotices = await res.json();
  store.dispatch(readUnviewNoticeSuccess(unviewNotices));

  // ----- 读取用户所有通知消息
  res = await fetch(`http://${host}/api/v1/users/${login}/received_notices`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const notices = await res.json();
  store.dispatch(readAllNoticeSuccess(notices));

  // 默认返回 200 OK
  return { statusCode: 200 };
};


export default withRedux(initStore, null)(Index);

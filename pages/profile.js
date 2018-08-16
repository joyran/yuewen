/**
 * 用户个人主页
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
import { reducers, readProfileSuccess, readArticlesSuccess } from '../reducers/profile';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import Profile from '../components/profile/index';
import Nav from '../components/nav/index';
import Error from '../components/error/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  profile: {
    followers: {
      data: [],
      page: 1,
      per_page: 20,
      has_more: true
    },
    following: {
      data: [],
      page: 1,
      per_page: 20,
      has_more: true
    },
    articles: {
      data: [],
      page: 1,
      per_page: 20,
      has_more: true,
      loading: false
    },
    collects: {
      data: [],
      page: 1,
      per_page: 20,
      has_more: true,
      loading: false
    }
  },
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
          <title>{`${props.profile.name} - 悦文`}</title>
          <link rel="stylesheet" href="/css/antd.min.css" />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        </Head>
        <Header>
          <Nav />
        </Header>
        <Content>
          <Profile />
        </Content>
        <Footer />
        <BackTop />
      </Layout>
    </LocaleProvider>
  );
};

Index.getInitialProps = async ({ store, req, query }) => {
  var res;
  // 服务端请求时不会带上主机地址，必须手动添加
  const { host } = req.headers;
  const { user } = query;
  const { page, per_page } = store.getState().profile.articles;

  // ----- 读取当前登录用户所有信息
  res = await fetch(`http://${host}/api/v1/user`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  res = await res.json();
  store.dispatch(readSessionSuccess(res));
  const { login } = res;


  // ----- 读取用户个人基本信息
  res = await fetch(`http://${host}/api/v1/users/${user}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const profile = await res.json();
  store.dispatch(readProfileSuccess(profile));


  // ----- 读取当前用户所有发表的文章摘录
  res = await fetch(`http://${host}/api/v1/users/${user}/excerpts/create?page=${page}&per_page=${per_page}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const articles = await res.json();
  store.dispatch(readArticlesSuccess(articles));


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

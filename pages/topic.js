/**
 * 话题
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
import { reducers, readTopicSuccess, readTopicArticlesSuccess, readTopicFollowersSuccess } from '../reducers/topic';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import Nav from '../components/nav/index';
import Topic from '../components/topic/index';
import Error from '../components/error/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  topic: {
    followers: {
      data: [],
      page: 1,
      per_page: 20
    },
    articles: {
      data: [],
      page: 1,
      per_page: 10,
      sort_by: 'time'
    },
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
          <title>{`${props.topic.topic} - 悦文`}</title>
          <link rel="stylesheet" href="/css/antd.css" />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        </Head>
        <Header>
          <Nav active="topics" />
        </Header>
        <Content>
          <Topic />
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
  const { topic } = query;

  // ----- 读取当前登录用户所有信息
  res = await fetch(`http://${host}/api/v1/user`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readSessionSuccess(res));
  const { login } = store.getState().session;


  // ----- 读取话题基本信息
  res = await fetch(`http://${host}/api/v1/topic/${topic}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readTopicSuccess(res));


  // ----- 读取话题下的文章
  const articles = store.getState().topic.articles;
  res = await fetch(`http://${host}/api/v1/topic/${topic}/articles?&page=${articles.page}&per_page=${articles.per_page}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readTopicArticlesSuccess(res));


  // ----- 读取话题下的关注者
  const followers = store.getState().topic.followers;
  res = await fetch(`http://${host}/api/v1/topic/${topic}/followers?&page=${followers.page}&per_page=${followers.per_page}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readTopicFollowersSuccess(res));


  // ----- 读取用户未读通知消息数组
  res = await fetch(`http://${host}/api/v1/users/${login}/received_notices?has_view=false`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const unviewNotices = await res.json();

  // 过滤 comments
  const comments = unviewNotices.filter((notice) => {
    if (notice.type === 'comment') {
      return notice;
    }
    return false;
  });

  // 过滤 likes
  const likes = unviewNotices.filter((notice) => {
    if (notice.type === 'like') {
      return notice;
    }
    return false;
  });

  store.dispatch(readUnviewNoticeSuccess({ comments, likes }));

  return { statusCode: 200 };
};


export default withRedux(initStore, null)(connect(state => state)(Index));

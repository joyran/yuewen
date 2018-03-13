/**
 * 首页
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
import reducers from '../reducers/index';
import { readExcerptsSuccessByServer } from '../reducers/excerpt';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import Nav from '../components/nav/index';
import TagNav from '../components/tag-nav/index';
import Error from '../components/error/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  excerpt: {
    tag: 'new',
    loading: false,
    page: 1,
    per_page: 10
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
    </LocaleProvider>
  );
};

Index.getInitialProps = async ({ store, req }) => {
  var res;
  // ----- 根据标签读取文章摘要列表
  const excerpt = store.getState().excerpt;

  // 请求 url 必须为完整路径，不能为绝对路径 /api/v1/excerpts
  // isomorphic-fetch 在 node 端不会自动带上 cookie，需要手动添加 headers: { Cookie: req.headers.cookie }
  res = await fetch(`http://${req.headers.host}/api/v1/excerpts/tag/${excerpt.tag}?&page=${excerpt.page}&per_page=${excerpt.per_page}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const excerpts = await res.json();
  store.dispatch(readExcerptsSuccessByServer(excerpts));


  // ----- 读取当前登录用户所有信息
  res = await fetch(`http://${req.headers.host}/api/v1/user`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readSessionSuccess(res));
  const { login } = store.getState().session;


  // ----- 读取用户未读通知消息数组
  res = await fetch(`http://${req.headers.host}/api/v1/users/${login}/received_notices?has_view=false`, {
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

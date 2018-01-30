/**
 * 首页
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, BackTop } from 'antd';
import Head from 'next/head';
import reducers from '../reducers/index';
import { readDigestsSuccessByServer, disableLoadButton, activeTag } from '../reducers/digest';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import Digest from '../components/digest/index';
import Nav from '../components/nav/index';
import TagNav from '../components/tag-nav/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  digest: {
    digests: [],
    loadBtnDisableState: false,
    loadBtnLoadingState: false,
    loadBtnLabel: '加载更多',
    emptyLabel: '还没有一篇文章',
    skip: 0,
    limit: 10,
    activeTag: null
  },
  session: {
    uid: null,
    username: null,
    avatar: null,
    followedTags: []
  },
  notice: {
    comments: [],
    likes: [],
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
        <TagNav />
        <Digest />
      </Content>
      <Footer />
      <BackTop />
    </Layout>
  );
};

Index.getInitialProps = async ({ store, req, query }) => {
  var res;
  // ----- 根据标签读取文章摘要列表
  // limit
  const limit = store.getState().digest.limit;
  const tag = typeof query.tag !== 'undefined' ? query.tag : '';
  // 请求 url 必须为完整路径，不能为绝对路径 /api/v1/digests
  // isomorphic-fetch 在 node 端不会自动带上 cookie，需要手动添加 headers: { Cookie: req.headers.cookie }
  res = await fetch(`http://${req.headers.host}/api/v1/digests?tag=${tag}&skip=0&limit=${limit}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const digest = await res.json();
  store.dispatch(readDigestsSuccessByServer(digest.digests));

  // isEnd = true 表示全部加载完成
  if (digest.isEnd) {
    store.dispatch(disableLoadButton());
  }

  // 更新 activeTag
  store.dispatch(activeTag(tag));

  // ----- 读取当前登录用户id, 用户名, 头像
  res = await fetch(`http://${req.headers.host}/api/v1/session`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const session = await res.json();
  store.dispatch(readSessionSuccess(session.user));

  // ----- 读取当前登录用户未读消息
  res = await fetch(`http://${req.headers.host}/api/v1/notice?state=unview`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const notice = await res.json();
  store.dispatch(readUnviewNoticeSuccess(notice));
};


export default withRedux(initStore, null)(Index);

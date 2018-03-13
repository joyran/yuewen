/**
 * 文章展示页面
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, BackTop } from 'antd';
import Head from 'next/head';
import { reducers, readArticleSuccess, readArticleCommentsSuccess, readArticleLikesSuccess } from '../reducers/article';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import ArticleContent from '../components/article-content/index';
import ArticleComment from '../components/article-comment/index';
import Error from '../components/error/index';
import Nav from '../components/nav/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  article: {},
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
    <Layout>
      <Head>
        <title>悦文 · 与世界分享你的知识、经验和见解</title>
        <link rel="stylesheet" href="/css/antd.css" />
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      </Head>
      <Header>
        <Nav />
      </Header>
      <Content>
        <ArticleContent />
        <ArticleComment />
      </Content>
      <Footer />
      <BackTop />
    </Layout>
  );
};

Index.getInitialProps = async ({ store, req, query }) => {
  var res;

  // 文章索引 aid, 为空显示 404 页面
  const { aid } = query;
  if (!aid) return { statusCode: 404 };


  // ----- 读取当前登录用户基本信息
  res = await fetch(`http://${req.headers.host}/api/v1/user`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const user = await res.json();
  store.dispatch(readSessionSuccess(user));
  const { login } = store.getState().session;


  // ----- 读取文章内容
  res = await fetch(`http://${req.headers.host}/api/v1/articles/${aid}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const article = await res.json();
  store.dispatch(readArticleSuccess(article));


  // ----- 读取文章点赞用户数组
  res = await fetch(`http://${req.headers.host}/api/v1/articles/${aid}/likes`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readArticleLikesSuccess(res));


  // ----- 读取文章评论数组
  res = await fetch(`http://${req.headers.host}/api/v1/articles/${aid}/comments`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readArticleCommentsSuccess(res));


  // ----- 读取用户未读通知消息数组
  res = await fetch(`http://${req.headers.host}/api/v1/users/${login}/received_notices?has_view=false`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
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


export default withRedux(initStore, null)(Index);

/**
 * 文章展示页面
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout } from 'antd';
import Head from 'next/head';
import { reducers, readArticleSuccess, readArticleCommentsSuccess, readArticleLikesSuccess } from '../reducers/article';
import { readSessionSuccess } from '../reducers/session';
import ArticleContent from '../components/article-content/index';
import ArticleComment from '../components/article-comment/index';
import Nav from '../components/nav/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  article: {
    aid: null,
    title: null,
    markup: null,
    author: null,
    authorId: null,
    authorAvatar: null,
    createAt: null,
    comments: null
  },
  session: {
    uid: null,
    username: null,
    avatar: null,
    notifications: 5
  }
};

const initStore = (state = initialState) => {
  return createStore(reducers, state, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};

const Article = () => {
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
        <ArticleContent />
        <ArticleComment />
      </Content>
      <Footer />
    </Layout>
  );
};

Article.getInitialProps = async ({ store, req, query }) => {
  var res;
  // 文章索引 aid
  const aid = typeof query.aid !== 'undefined' ? query.aid : '';

  // ----- 读取文章内容，作者等
  // 请求 url 必须为完整路径，不能为绝对路径 /api/v1/digests
  // isomorphic-fetch 在 node 端不会自动带上 cookie，需要手动添加 headers: { Cookie: req.headers.cookie }
  res = await fetch(`http://${req.headers.host}/api/v1/article?aid=${aid}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  res = await res.json();
  store.dispatch(readArticleSuccess(res.article));

  // ----- 读取文章点赞人列表和点赞人数
  res = await fetch(`http://${req.headers.host}/api/v1/article/like?aid=${aid}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  res = await res.json();
  store.dispatch(readArticleLikesSuccess(res.like));

  // ----- 读取文章评论列表
  res = await fetch(`http://${req.headers.host}/api/v1/article/comment?aid=${aid}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  res = await res.json();
  store.dispatch(readArticleCommentsSuccess(res.comments));


  // ----- 读取当前登录用户id, 用户名, 头像
  res = await fetch(`http://${req.headers.host}/api/v1/session`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  res = await res.json();
  store.dispatch(readSessionSuccess(res.user));
};


export default withRedux(initStore, null)(Article);

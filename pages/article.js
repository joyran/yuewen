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
  article: {
    comment: {
      skip: 0,
      limit: 10  // comment 评论每次读取的数量
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
  const { limit } = store.getState().article.comment;

  // 文章索引 aid, 为空显示 404 页面
  const aid = query.aid;
  if (!aid) return { statusCode: 404 };

  // ----- 读取文章内容，作者等
  res = await fetch(`http://${req.headers.host}/api/v1/article?aid=${aid}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const article = await res.json();
  store.dispatch(readArticleSuccess(article));

  // ----- 读取文章点赞人列表和点赞人数
  res = await fetch(`http://${req.headers.host}/api/v1/article/like?aid=${aid}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readArticleLikesSuccess(res.like));

  // ----- 读取文章评论列表
  res = await fetch(`http://${req.headers.host}/api/v1/article/comment?aid=${aid}&skip=0&limit=${limit}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readArticleCommentsSuccess(res));


  // ----- 读取当前登录用户id, 用户名, 头像
  res = await fetch(`http://${req.headers.host}/api/v1/session`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readSessionSuccess(res.user));

  // ----- 读取当前登录用户未读消息
  res = await fetch(`http://${req.headers.host}/api/v1/notice/unview`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const notice = await res.json();
  store.dispatch(readUnviewNoticeSuccess(notice));

  return { statusCode: 200 };
};


export default withRedux(initStore, null)(Index);

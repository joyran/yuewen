/**
 * 文章管理页面，功能包括：修改标签和标题，删除文章
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, LocaleProvider } from 'antd';
import Head from 'next/head';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { reducers, readArticlesSuccess } from '../reducers/manage';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import ArticleManage from '../components/article-manage/index';
import Nav from '../components/nav/index';
import Error from '../components/error/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  manage: {},
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
          <title>悦文 · 与世界分享你的知识、经验和见解</title>
          <link rel="stylesheet" href="/css/antd.css" />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        </Head>
        <Header>
          <Nav />
        </Header>
        <Content>
          <ArticleManage />
        </Content>
        <Footer />
      </Layout>
    </LocaleProvider>
  );
};

Index.getInitialProps = async ({ store, req }) => {
  var res;

  // ----- 读取当前登录用户所有信息
  res = await fetch(`http://${req.headers.host}/api/v1/user`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  res = await res.json();
  store.dispatch(readSessionSuccess(res));
  const { login } = store.getState().session;


  // ----- 读取用户发表的所有文章
  res = await fetch(`http://${req.headers.host}/api/v1/users/${login}/articles`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  if (res.status !== 200) return { statusCode: res.status };
  const articles = await res.json();
  store.dispatch(readArticlesSuccess(articles));

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


export default withRedux(initStore, null)(Index);

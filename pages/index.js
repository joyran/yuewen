/**
 * 首页
 */

import { connect } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import { Layout, BackTop, LocaleProvider, Card, Alert } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import Head from 'next/head';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import reducers from '../reducers/index';
import { readExcerptsSuccess, readExcerptsByUser } from '../reducers/excerpt';
import { readSessionSuccess } from '../reducers/session';
import { readUnviewNoticeSuccess } from '../reducers/notice';
import Nav from '../components/nav/index';
import ExcerptList from '../components/excerpt-list/index';
import Error from '../components/error/index';
import stylesheet from '../styles/index.scss';

const { Header, Content, Footer } = Layout;

// 初始默认 state
const initialState = {
  excerpt: {
    sortby: 'follow',
    data: [],
    page: 1,
    per_page: 20
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
          <Nav active="index" />
        </Header>
        <Content>
          { props.session.followed_topics.length + props.session.following_count === 0 ?
            <Alert
              message="你还没有关注话题和用户，以下为你展示的是热门文章，快进入话题广场挑选喜欢的话题关注吧"
              type="info"
              closable
              className="alert-info"
            /> : ''
          }
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.excerpt.loading && props.excerpt.has_more && props.dispatch(readExcerptsByUser(props.session.login)); }}
            hasMore={!props.excerpt.loading && props.excerpt.has_more}
            useWindow
          >
            <ExcerptList
              data={props.excerpt.data}
              loading={props.excerpt.loading}
            />
            { props.excerpt.loading && props.excerpt.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
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


  // ----- 读取用户关注的话题文章集合
  const excerpt = store.getState().excerpt;
  res = await fetch(`http://${host}/api/v1/users/${login}/excerpts/follow?&page=${excerpt.page}&per_page=${excerpt.per_page}`, {
    method: 'get',
    headers: { Cookie: req.headers.cookie }
  });
  const excerpts = await res.json();
  store.dispatch(readExcerptsSuccess(excerpts));


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

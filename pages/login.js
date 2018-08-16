/**
 * 登录页
 */

import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import Head from 'next/head';
import { reducers } from '../reducers/login';
import LoginForm from '../components/login-form/index';


// 初始默认 state
const initialState = {
  login: {
    loading: false,
    label: '登录'
  }
};

const initStore = () => {
  return createStore(reducers, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};

const Index = () => {
  return (
    <div>
      <Head>
        <title>悦文 · 登录</title>
        <link rel="stylesheet" href="/css/antd.min.css" />
      </Head>
      <LoginForm />
    </div>
  );
};

export default withRedux(initStore, null)(Index);

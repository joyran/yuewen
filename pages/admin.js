/**
 * 后台管理
 */

import { connect } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import dynamic from 'next/dynamic';
import { reducers } from '../reducers/admin';
import { readSessionSuccess } from '../reducers/session';
import Error from '../components/error/index';

const Admin = dynamic(import('../components/admin/index'), {
  ssr: false
});

// 初始默认 state
const initialState = {
  session: {},
  admin: {
    loading: false
  }
};

const initStore = (state = initialState) => {
  return createStore(reducers, state, composeWithDevTools(applyMiddleware(thunkMiddleware)));
};

const Index = (props) => {
  if (props.statusCode !== 200) {
    return <Error statusCode={props.statusCode} />;
  }

  return (
    <Admin />
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

  // 如果用户 admin 为 false 则没有权限，显示403页面
  if (!res.admin) return { statusCode: 403 };
  store.dispatch(readSessionSuccess(res));

  // 默认返回 200 OK
  return { statusCode: 200 };
};


export default withRedux(initStore, null)(connect(state => state)(Index));

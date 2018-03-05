/**
 * 自定义异常显示页面
 */

import React from 'react';
import Head from 'next/head';
import { Button } from 'antd';
import stylesheet from '../components/error/index.scss';

export default class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err.statusCode;
    return { statusCode };
  }

  render() {
    var errorMsg;
    switch (this.props.statusCode) {
      case 403:
        errorMsg = '抱歉，你无权访问该页面';
        break;
      case 404:
        errorMsg = '抱歉，你访问的页面不存在';
        break;
      case 500:
        errorMsg = '抱歉，服务器出错了';
        break;
      default:
        break;
    }

    return (
      <div className="error-wrapper">
        <Head>
          <title>{`悦文 · ${errorMsg}`}</title>
          <link rel="stylesheet" href="/css/antd.css" />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        </Head>
        <img className="error-img" src={`/imgs/${this.props.statusCode}.svg`} alt={this.props.statusCode} />
        <div className="error-content">
          <h1>{this.props.statusCode}</h1>
          <p>{errorMsg}</p>
          <Button type="primary" size="large" href="/">返回首页</Button>
        </div>
      </div>
    );
  }
}

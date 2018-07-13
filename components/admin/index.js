import React from 'react';
import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Menu, Icon, Layout, LocaleProvider } from 'antd';
import Head from 'next/head';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { connect } from 'react-redux';
import Dashboard from './dashboard';
import User from './user';
import Article from './article';
import stylesheet from './index.scss';

const { Header, Content, Sider } = Layout;

const Admin = () => {
  return (
    <Router>
      <div>
        <LocaleProvider locale={zhCN}>
          <Layout style={{ background: '#f6f6f6', minHeight: '100vh' }} >
            <Head>
              <title>悦文 · 后台管理</title>
              <link rel="stylesheet" href="/css/antd.css" />
              <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
            </Head>
            <Sider>
              <div className="logo">
                <a href="/">悦文</a>
              </div>
              <Menu
                defaultSelectedKeys={['dashboard']}
                mode="inline"
                theme="dark"
              >
                <Menu.Item key="dashboard">
                  <Icon type="dashboard" />
                  <Link to="/dashboard" style={{ display: 'inline-block' }}>仪表盘</Link>
                </Menu.Item>
                <Menu.Item key="user">
                  <Icon type="user" />
                  <Link to="/user" style={{ display: 'inline-block' }}>用户管理</Link>
                </Menu.Item>
                <Menu.Item key="article">
                  <Icon type="profile" />
                  <Link to="/article" style={{ display: 'inline-block' }}>文章管理</Link>
                </Menu.Item>
              </Menu>
            </Sider>
            <Layout>
              <Header>
                <div />
              </Header>
              <Content>
                <Switch>
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/user" component={User} />
                  <Route path="/article" component={Article} />
                  <Route exact path="/" component={Dashboard} />
                </Switch>
              </Content>
            </Layout>
          </Layout>
        </LocaleProvider>
      </div>
    </Router>
  );
};

export default connect(state => state)(Admin);

/**
 * 顶部导航
 */

import React, { Component } from 'react';
import { Icon, Badge, Popover, Tabs, Row, Col, Avatar, Dropdown } from 'antd';
import { connect } from 'react-redux';
import fetch from 'isomorphic-fetch';
import { deleteSession } from '../../reducers/session';
import NoticeTabPane from './notice-tab-pane';
import WrappedChangePasswordModal from './change-password-modal';
import stylesheet from './index.scss';

const TabPane = Tabs.TabPane;

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResult: {
        data: {
          articles: [],
          users: []
        },
        total: 0
      },
      visible: false,
      query: null
    };
  }

  onSearch = (e) => {
    const query = e.target.value;
    if (!query) {
      this.setState({
        searchResult: {
          data: {
            articles: [],
            users: []
          },
          total: 0
        }
      });
      return false;
    }

    fetch(`/api/v1/search/all?q=${query}`, {
      credentials: 'include',
      method: 'get'
    })
      .then(res => res.json())
      .then((res) => {
        this.setState({ searchResult: res, query });
      });
  }

  showModal = () => {
    this.setState({ visible: true });
  }

  hiddenModal = () => {
    this.setState({ visible: false });
  }

  handleChangePassword = () => {
    this.setState({ visible: false });
  }

  render() {
    const { unview_notices } = this.props.notice;
    const { dispatch } = this.props;

    // 过滤出 type 为 comment 的评论通知
    const unviewCommentNotices = unview_notices.filter((n) => {
      if (n.type === 'comment') { return n; }
      return false;
    });

    // 过滤出 type 为 like 的点赞通知
    const unviewLikeNotices = unview_notices.filter((n) => {
      if (n.type === 'like') { return n; }
      return false;
    });

    // 消息通知卡片组件，包括评论和点赞通知消息
    const notice = (
      <Tabs defaultActiveKey="1">
        <TabPane tab={unviewCommentNotices.length === 0 ? '评论' : `评论 ${unviewCommentNotices.length}`} key="1">
          <NoticeTabPane type="评论" dataSource={unviewCommentNotices} dispatch={dispatch} />
        </TabPane>
        <TabPane tab={unviewLikeNotices.length === 0 ? '点赞' : `点赞 ${unviewLikeNotices.length}`} key="2">
          <NoticeTabPane type="点赞" dataSource={unviewLikeNotices} dispatch={dispatch} />
        </TabPane>
      </Tabs>
    );

    // 点击个人头像弹出的 Popover
    const profile = (
      <div>
        <a href={`/user/${this.props.session.login}`} ><Icon type="user" />个人主页</a>
        <a href="/markdown" target="_blank"><Icon type="edit" />写新文章</a>
        <a href="/manage"><Icon type="profile" />文章管理</a>
        <a onClick={this.showModal}><Icon type="lock" />修改密码</a>
        {this.props.session.admin ? <a href="/admin"><Icon type="setting" />后台管理</a> : ''}
        <a onClick={() => dispatch(deleteSession())}><Icon type="logout" />退出登录</a>
      </div>
    );

    // 搜索结果下拉展示组件
    const search = (
      <div>
        { this.state.searchResult.data.articles.length > 0 ? <p className="search-header">文章</p> : '' }
        <ul>
          { this.state.searchResult.data.articles.map((item, index) => {
            // 文章标题默认从 highlight 中读取，如果 highlight 中没有则从 _source 中读取
            const title = item.highlight.title ? item.highlight.title[0] : item._source.title;
            return (
              <li key={index} className="link">
                <a href={`/article/${item._id}`} target="_blank">
                  <span dangerouslySetInnerHTML={{ __html: title }} />
                </a>
              </li>
            );
          }) }
        </ul>
        { this.state.searchResult.data.users.length > 0 ? <p className="search-header">用户</p> : '' }
        <ul>
          { this.state.searchResult.data.users.map((item, index) => {
            const name = item.highlight.name[0];
            return (
              <li key={index} className="link">
                <a href={`/user/${item._source.login}`} target="_blank">
                  <span dangerouslySetInnerHTML={{ __html: name }} />
                </a>
              </li>
            );
          }) }
        </ul>
        { this.state.searchResult.total > 0 ?
          <a href={`/search?q=${this.state.query}`} className="search-hint">{`查看${this.state.searchResult.total}条搜索结果`}</a> : '' }
      </div>
    );

    return (
      <Row className="header">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Col className="header-left" span={6}>
          <a href="/" className={this.props.active === 'index' ? 'active' : ''}>首页</a>
          <a href="/topics" className={this.props.active === 'topics' ? 'active' : ''}>话题</a>
        </Col>
        <Col className="search-box" span={6}>
          <Icon type="search" />
          <Dropdown overlay={search} overlayClassName="dropdown-search" trigger={['click']}>
            <input placeholder="在悦文中搜索" onChange={this.onSearch} />
          </Dropdown>
        </Col>
        <Col className="header-right" span={12}>
          <Popover
            content={profile}
            trigger="click"
            placement="bottom"
            overlayClassName="popover-avatar"
          >
            <Avatar src={this.props.session.small_avatar_url} size="large" shape="square" />
          </Popover>
          <Popover
            content={notice}
            trigger="click"
            placement="bottom"
            overlayClassName="popover-notification"
          >
            <Badge count={this.props.notice.unview_notices_total}>
              <Icon type="bell" />
            </Badge>
          </Popover>
        </Col>
        <WrappedChangePasswordModal
          visible={this.state.visible}
          handleCancel={this.hiddenModal}
          handleOk={this.hiddenModal}
        />
      </Row>
    );
  }
}

export default connect(state => state)(Nav);

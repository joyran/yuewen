/**
 * 顶部导航
 */

import React, { Component } from 'react';
import { Icon, Badge, Popover, Tabs, Row, Col, Avatar, Dropdown, Menu } from 'antd';
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
      searchResult: [],
      visible: false
    };
  }

  onSearch = (e) => {
    const keyword = e.target.value;
    if (!keyword) return false;

    fetch(`/api/v1/search/${keyword}`, {
      credentials: 'include',
      method: 'get'
    })
      .then(res => res.json())
      .then((res) => {
        this.setState({ searchResult: res.data });
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
    const { comments, likes } = this.props.notice;
    const { dispatch } = this.props;

    const notice = (
      <Tabs defaultActiveKey="1">
        <TabPane tab={comments.length === 0 ? '评论' : `评论 (${comments.length})`} key="1">
          <NoticeTabPane type="评论" dataSource={comments} dispatch={dispatch} />
        </TabPane>
        <TabPane tab={likes.length === 0 ? '点赞' : `点赞 (${likes.length})`} key="2">
          <NoticeTabPane type="点赞" dataSource={likes} dispatch={dispatch} />
        </TabPane>
      </Tabs>
    );

    const profile = (
      <div>
        <a href={`/user/${this.props.session.login}`} ><Icon type="user" />个人主页</a>
        <a href="/markdown" target="_blank"><Icon type="edit" />写新文章</a>
        <a href="/manage"><Icon type="profile" />文章管理</a>
        <a onClick={this.showModal}><Icon type="lock" />修改密码</a>
        <a onClick={() => dispatch(deleteSession())}><Icon type="logout" />退出登录</a>
      </div>
    );

    const search = (
      <Menu>
        { this.state.searchResult.map((item, index) => {
          // 文章标题默认从 highlight 中读取，如果 highlight 中没有则从 _source 中读取
          const title = item.highlight.title ? item.highlight.title[0] : item._source.title;

          // markdown默认从 highlight 中读取，如果 highlight 中没有则从 _source 中读取摘要
          const markdown = item.highlight.markdown ? item.highlight.markdown[0] : item._source.excerpt;
          // replace 删除摘要中 # 和空格
          const excerpt = markdown.replace(/[#\s]/g, '');
          return (
            <Menu.Item key={index}>
              <a href={`/article/${item._id}`} target="_blank">
                <p className="title" dangerouslySetInnerHTML={{ __html: title }} />
                <p className="excerpt" dangerouslySetInnerHTML={{ __html: excerpt }} />
              </a>
            </Menu.Item>
          );
        }) }
      </Menu>
    );

    return (
      <Row className="header">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Col className="header-left" span={6}>
          <a href="/">首页</a>
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
            <Badge count={comments.length + likes.length}>
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

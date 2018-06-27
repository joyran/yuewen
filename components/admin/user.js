/**
 * 用户管理
 */

import React, { Component } from 'react';
import { Table } from 'antd';
import { connect } from 'react-redux';
import { readUsers } from '../../reducers/admin';

const columns = [{
  title: '头像',
  dataIndex: 'small_avatar_url',
  render: text => <img className="avatar" src={text} alt={text} />
}, {
  title: '昵称',
  dataIndex: 'name',
  render: (text, record) => <a target="_blank" href={`/user/${record.login}`}>{text}</a>
}, {
  title: '用户名',
  dataIndex: 'login'
}, {
  title: '声望',
  dataIndex: 'prestige'
}, {
  title: '状态',
  dataIndex: 'state',
  render: text => (text ? <span>可用</span> : <span>禁用</span>)
}];

class User extends Component {
  componentDidMount() {
    this.props.dispatch(readUsers(1, 10));
  }

  render() {
    // 点击分页按钮
    const onChange = (pagination) => {
      const { current, pageSize } = pagination;
      this.props.dispatch(readUsers(current, pageSize));
    };

    // 分页组件
    const pagination = {
      total: this.props.admin.count,
      showSizeChanger: true,
      showTotal: total => `总数 ${total}`
    };

    return (
      <Table
        columns={columns}
        dataSource={this.props.admin.data}
        rowKey="_id"
        loading={this.props.admin.loading}
        pagination={pagination}
        onChange={onChange}
      />
    );
  }
}

export default connect(state => state)(User);

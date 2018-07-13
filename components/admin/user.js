/**
 * 用户管理
 */

import React, { Component } from 'react';
import { Table, Modal } from 'antd';
import { connect } from 'react-redux';
import { readUsers } from '../../reducers/admin';

class User extends Component {
  constructor() {
    super();
    this.closeModal = this.closeModal.bind(this);

    this.state = {
      avatar: '',
      visible: false,
      width: 520
    };
  }

  showAvatar(e) {
    this.setState({
      avatar: e.target.getAttribute('src'),
      visible: true,
      width: e.target.naturalWidth
    });
  }

  closeModal() {
    this.setState({ visible: false });
  }

  componentDidMount() {
    this.props.dispatch(readUsers(1, 10));
  }

  render() {
    const columns = [{
      title: '头像',
      dataIndex: 'small_avatar_url',
      render: text => <img onClick={(e) => { this.showAvatar(e); }} className="avatar" src={text} alt={text} />
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

    // 点击分页按钮
    const onChange = (pagination) => {
      const { current, pageSize } = pagination;
      this.props.dispatch(readUsers(current, pageSize));
    };

    // 分页组件
    const pagination = {
      total: this.props.admin.total,
      showSizeChanger: true,
      showTotal: total => `总数 ${total}`
    };

    return (
      <div>
        <Table
          columns={columns}
          dataSource={this.props.admin.data}
          rowKey="_id"
          loading={this.props.admin.loading}
          pagination={pagination}
          onChange={onChange}
        />
        <Modal
          visible={this.state.visible}
          footer={null}
          width={this.state.width}
          onCancel={this.closeModal}
          closable={false}
          wrapClassName="vertical-center-modal"
        >
          <img src={this.state.avatar} onClick={this.closeModal} alt="头像" className="avatar-big" />
        </Modal>
      </div>
    );
  }
}

export default connect(state => state)(User);

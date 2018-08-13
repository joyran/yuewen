/**
 * 用户管理
 */

import React, { Component } from 'react';
import { Table, Modal, Divider } from 'antd';
import { connect } from 'react-redux';
import { readUsers, resetUserPassword, createUser } from '../../reducers/admin';
import CreateUserModal from './create-user-modal';

const confirm = Modal.confirm;

class User extends Component {
  constructor(props) {
    super(props);
    this.onOk = this.onOk.bind(this);

    this.state = {
      avatar: '',
      visible: false,
      width: 520,
      userVisible: false
    };
  }

  showAvatar(e) {
    this.setState({
      avatar: e.target.getAttribute('src'),
      visible: true,
      width: e.target.naturalWidth
    });
  }

  onOk(e) {
    e.preventDefault();
    const _this = this;
    this.form.validateFields((err, values) => {
      if (!err) {
        _this.props.dispatch(createUser(values));
        _this.setState({ userVisible: false });
      }
    });
  }

  componentDidMount() {
    this.props.dispatch(readUsers(1, 10));
  }

  render() {
    // 恢复用户登录密码为默认值
    const onClickReset = (login, name) => {
      const _this = this;
      confirm({
        title: `确定要恢复用户 ${name} 的密码为默认值 123456 吗?`,
        onOk() {
          _this.props.dispatch(resetUserPassword(login));
        },
        onCancel() {},
      });
    };

    const columns = [{
      title: '头像',
      dataIndex: 'small_avatar_url',
      render: text => <img onClick={(e) => { this.showAvatar(e); }} className="user-avatar" src={text} alt={text} />
    }, {
      title: '昵称',
      dataIndex: 'name',
      render: (text, record) => <a target="_blank" href={`/user/${record.login}`}>{text}</a>
    }, {
      title: '用户名',
      dataIndex: 'login'
    }, {
      title: '邮箱',
      dataIndex: 'mail'
    }, {
      title: '声望',
      dataIndex: 'prestige'
    }, {
      title: '状态',
      dataIndex: 'state',
      render: text => (text ? <span>可用</span> : <span>禁用</span>)
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={() => this.setState({ userVisible: true })}>新增用户</a>
          <Divider type="vertical" />
          <a onClick={() => onClickReset(record.login, record.name)}>重设密码</a>
        </span>
      ),
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
          onCancel={() => this.setState({ visible: false })}
          closable={false}
          wrapClassName="vertical-center-modal"
        >
          <img src={this.state.avatar} onClick={() => this.setState({ visible: false })} alt="头像" className="avatar-big" />
        </Modal>
        <CreateUserModal
          ref={ref => this.form = ref}
          visible={this.state.userVisible}
          onOk={e => this.onOk(e)}
          onCancel={() => this.setState({ userVisible: false })}
        />
      </div>
    );
  }
}

export default connect(state => state)(User);

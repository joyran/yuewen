/**
 * 话题管理
 */

import React, { Component } from 'react';
import { Table, Divider } from 'antd';
import { connect } from 'react-redux';
import { readTopics, createTopic } from '../../reducers/admin';
import CreateTopicModal from './create-topic-modal';

class Topic extends Component {
  constructor(props) {
    super(props);
    this.onOk = this.onOk.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      avatar: '',
      visible: false,
      width: 520,
      loading: false,
    };
  }

  onOk(e) {
    e.preventDefault();
    const _this = this;
    this.form.validateFields((err, values) => {
      if (!err) {
        _this.props.dispatch(createTopic({ ...values, avatar_url: _this.state.avatar }));
        _this.setState({ visible: false });
      }
    });
  }

  handleChange({ file }) {
    if (file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }

    if (file.status === 'done') {
      this.setState({ avatar: file.response.filepath, loading: false });
    }
  }

  componentDidMount() {
    this.props.dispatch(readTopics(1, 10));
  }

  render() {
    const columns = [{
      title: '头像',
      dataIndex: 'avatar_url',
      render: text => <img className="topic-avatar" src={text} alt={text} />,
      width: '10%'
    }, {
      title: '话题',
      dataIndex: 'topic',
      render: (text, record) => <a target="_blank" href={`/topic/${record.topic}`}>{text}</a>,
      width: '10%'
    }, {
      title: '描述',
      dataIndex: 'description',
      width: '50%'
    }, {
      title: '关注用户',
      dataIndex: 'followers_count',
      width: '10%'
    }, {
      title: '文章数量',
      dataIndex: 'articles_count',
      width: '10%'
    }, {
      title: '操作',
      key: 'action',
      render: () => (
        <span>
          <a onClick={() => this.setState({ visible: true })}>新增</a>
          <Divider type="vertical" />
          <a>删除</a>
        </span>
      ),
      width: '10%'
    }];

    // 点击分页按钮
    const onChange = (pagination) => {
      const { current, pageSize } = pagination;
      this.props.dispatch(readTopics(current, pageSize));
    };

    // 分页组件
    const pagination = {
      total: this.props.admin.total,
      showSizeChanger: true,
      showTotal: total => `总数 ${total}`
    };

    console.log(this.state);

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
        <CreateTopicModal
          ref={ref => this.form = ref}
          visible={this.state.visible}
          onOk={e => this.onOk(e)}
          onCancel={() => this.setState({ visible: false })}
          onChange={this.handleChange}
          avatar={this.state.avatar}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

export default connect(state => state)(Topic);

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

    this.state = {
      avatar: '',
      visible: false,
      width: 520,
      previewVisible: false,
      previewImage: '',
      fileList: [{}],
    };
  }

  onOk(e) {
    e.preventDefault();
    const _this = this;
    this.form.validateFields((err, values) => {
      if (!err) {
        _this.props.dispatch(createTopic(values));
        _this.setState({ visible: false });
      }
    });
  }

  componentDidMount() {
    this.props.dispatch(readTopics(1, 10));
  }

  render() {
    // 编辑话题
    const editTopic = (record) => {
      this.setState({ visible: true });
      console.log(record);
    };

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
      render: (text, record) => (
        <span>
          <a onClick={() => this.setState({ visible: true })}>新增</a>
          <Divider type="vertical" />
          <a onClick={() => editTopic(record)}>编辑</a>
        </span>
      ),
      width: '10%'
    }];

    // 上传图片成功后回调
    // const onChangeDragger = (info) => {
    //   const status = info.file.status;
    //   if (status === 'done') {
    //     // 上传完成后修改 avatar_url 表单
    //     this.form.setFieldsValue({ avatar_url: info.file.response.filepath });
    //     message.success('图片上传成功');
    //   } else if (status === 'error') {
    //     message.error('图片上传失败');
    //   }
    // };

    const handleChange = ({ file }) => {
      if (file.status === 'done') {
        this.setState({ avatar: file.response.filepath });
      }
    };

    const handlePreview = (file) => {
      this.setState({
        previewImage: file.url || file.thumbUrl,
        previewVisible: true,
      });
    };

    const handleCancel = () => this.setState({ previewVisible: false });

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
          onChange={handleChange}
          onPreview={handlePreview}
          handleCancel={handleCancel}
          avatar={this.state.avatar}
          previewVisible={this.state.previewVisible}
          previewImage={this.state.previewImage}
        />
      </div>
    );
  }
}

export default connect(state => state)(Topic);

/**
 * 文章管理
 */

import React, { Component } from 'react';
import { Table, Divider, Modal } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { readArticles, deleteArticle } from '../../reducers/admin';

// 时间汉化
moment.locale('zh-cn');
const confirm = Modal.confirm;

class Article extends Component {
  componentDidMount() {
    this.props.dispatch(readArticles(1, 10));
  }

  render() {
    // 删除文章
    const onClickDelete = (aid, title) => {
      confirm({
        title: '确定要删除文章吗',
        content: `文章 《${title}》 被删除不可恢复`,
        onOk() {
          this.props.dispatch(deleteArticle(aid));
        },
        onCancel() {},
      });
    };

    const columns = [{
      title: '标题',
      dataIndex: 'title',
      render: (text, record) => <a target="_blank" href={`/article/${record._id}`}>{text}</a>
    }, {
      title: '作者',
      dataIndex: 'author',
      render: (text, record) => <a target="_blank" href={`/user/${record.author_login}`}>{text}</a>
    }, {
      title: '阅读',
      dataIndex: 'views_count'
    }, {
      title: '点赞',
      dataIndex: 'likes_count'
    }, {
      title: '评论',
      dataIndex: 'comments_count'
    }, {
      title: '时间',
      dataIndex: 'created_at',
      render: text => <span>{ moment(text, 'X').format('YYYY-MM-DD HH:mm:ss') }</span>
    }, {
      title: '热度',
      dataIndex: 'heat'
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={() => onClickDelete(record._id, record.title)}>删除</a>
          <Divider type="vertical" />
          <a href={`/markdown/${record._id}`}>编辑</a>
        </span>
      ),
    }];

    // 点击分页按钮
    const onChange = (pagination) => {
      const { current, pageSize } = pagination;
      this.props.dispatch(readArticles(current, pageSize));
    };

    // 分页组件
    const pagination = {
      total: this.props.admin.total,
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

export default connect(state => state)(Article);

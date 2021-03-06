/**
 * 文章管理组件
 */

import { Table, Divider, Modal } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { deleteArticle, readArticles } from '../../reducers/manage';
import stylesheet from './index.scss';

const confirm = Modal.confirm;

// 时间汉化
moment.locale('zh-cn');

const ArticleManage = (props) => {
  // 点击分页按钮
  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    props.dispatch(readArticles(current, pageSize));
  };

  // 删除文章
  const onClickDelete = (aid, title) => {
    confirm({
      title: '确定要删除文章吗',
      content: `文章 《${title}》 被删除不可恢复`,
      onOk() {
        props.dispatch(deleteArticle(aid));
      },
      onCancel() {},
    });
  };

  const columns = [{
    title: '标题',
    dataIndex: 'title',
    width: '60%',
    render: (text, record) => (
      <a href={`/article/${record._id}`}>{text}</a>
    )
  }, {
    title: '时间',
    dataIndex: 'created_at',
    width: '25%',
    render: text => <span>{ moment(text, 'X').format('YYYY-MM-DD HH:mm:ss') }</span>
  }, {
    title: '操作',
    dataIndex: 'action',
    width: '15%',
    render: (text, record) => (
      <span>
        <a onClick={() => onClickDelete(record._id, record.title)}>删除</a>
        <Divider type="vertical" />
        <a href={`/markdown/${record._id}`}>编辑</a>
      </span>
    ),
  }];

  // 分页组件
  const pagination = {
    total: props.session.articles_count,
    showSizeChanger: true,
    showTotal: total => `总数 ${total}`
  };

  return (
    <div className="article-manage">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <Table
        columns={columns}
        dataSource={props.manage.articles}
        pagination={pagination}
        rowKey="_id"
        style={{ marginTop: 24 }}
        onChange={onChange}
      />
    </div>
  );
};

export default connect(state => state)(ArticleManage);

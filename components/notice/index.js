/**
 * 消息通知
 */

import { List, Avatar, Badge } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  updateCommentNoticeToView,
  updateLikeNoticeToView
} from '../../reducers/notice';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const Notice = (props) => {
  const updateNoticeToView = (type, id, link) => {
    if (type === 'comment') {
      props.dispatch(updateCommentNoticeToView(id, link));
    } else {
      props.dispatch(updateLikeNoticeToView(id, link));
    }
  };

  return (
    <div className="notices">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      { props.notice.notices.length ?
        <List
          itemLayout="horizontal"
          dataSource={props.notice.notices}
          renderItem={item => (
            <List.Item
              key={item._id}
              actions={[moment(item.createAt, 'X').fromNow()]}
              className={item.hasView ? 'viewed' : 'unview'}
            >
              <Badge status={item.hasView ? 'default' : 'processing'} />
              <List.Item.Meta
                onClick={() => { updateNoticeToView(item.type, item._id, item.link); }}
                avatar={<Avatar src={item.initiator.smAvatar} shape="square" />}
                title={item.title}
                description={item.content}
              />
            </List.Item>
          )}
          footer={null}
        /> :
        <div className="not-found">
          <img src="/imgs/notice.svg" alt="空空而已" />
          <p>还没有收到新通知哦</p>
        </div>
      }
    </div>
  );
};

export default connect(state => state)(Notice);

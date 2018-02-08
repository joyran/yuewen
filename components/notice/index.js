/**
 * 消息通知
 */

import { List, Avatar, Badge } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  updateCommentNoticeToView
} from '../../reducers/notice';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const Notice = (props) => {
  return (
    <div className="notices">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
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
              onClick={() => { props.dispatch(updateCommentNoticeToView(item._id, item.link)); }}
              avatar={<Avatar src={item.initiatorAvatar} />}
              title={item.title}
              description={item.content}
            />
          </List.Item>
        )}
        footer={null}
      />
    </div>
  );
};

export default connect(state => state)(Notice);

/**
 * 消息通知
 */

import { List, Avatar, Badge } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { updateNoticeToView } from '../../reducers/notice';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const Notice = (props) => {
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
              actions={[moment(item.created_at, 'X').fromNow()]}
              className={item.has_view ? 'viewed' : 'unview'}
            >
              <Badge status={item.has_view ? 'default' : 'processing'} />
              <List.Item.Meta
                onClick={() => { props.dispatch(updateNoticeToView(item._id, item.link_url)); }}
                avatar={<Avatar src={item.initiator.small_avatar_url} shape="square" />}
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

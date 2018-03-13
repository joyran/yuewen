import { List, Avatar, Icon } from 'antd';
import moment from 'moment';
import {
  updateNoticeToView,
  updateAllNoticeToView
} from '../../reducers/notice';

// 时间汉化
moment.locale('zh-cn');

// 未读消息为空时显示的内容
const NotFound = (
  <div className="not-found">
    <div className="body">
      <img src="/imgs/notice.svg" alt="空空而已" />
      <p>你已读完所有通知</p>
    </div>
    <div className="footer">
      <span>
        <Icon type="delete" style={{ marginRight: 8 }} />清空通知
      </span>
      <a style={{ float: 'right' }} href="/notice" >
        查看全部通知
      </a>
    </div>
  </div>
);

// 通知卡片内容
const NoticeTabPane = (props) => {
  const { dataSource } = props;

  return (
    <div>
      { dataSource.length !== 0 ?
        <List
          itemLayout="horizontal"
          dataSource={dataSource}
          renderItem={item => (
            <List.Item
              key={item._id}
              actions={[moment(item.created_at, 'X').fromNow()]}
            >
              <List.Item.Meta
                onClick={() => props.dispatch(updateNoticeToView(item._id, item.link_url))}
                avatar={<Avatar src={item.initiator.small_avatar_url} size="large" shape="square" />}
                title={item.title}
                description={item.content}
              />
            </List.Item>
          )}
          footer={
            <div>
              <span style={{ cursor: 'pointer' }} onClick={() => props.dispatch(updateAllNoticeToView())}>
                <Icon type="delete" style={{ marginRight: 8 }} />清空通知
              </span>
              <a style={{ float: 'right' }} href="/notice" >查看全部通知</a>
            </div>
          }
        /> :
        NotFound
      }
    </div>
  );
};

export default NoticeTabPane;

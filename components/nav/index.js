/**
 * 顶部导航
 */

import { Menu, Icon, Badge, Popover, Tabs, List, Avatar } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { deleteSession } from '../../reducers/session';
import {
  updateCommentNoticeToView,
  updateAllCommentNoticeToView,
  updateLikeNoticeToView,
  updateAllLikeNoticeToView
} from '../../reducers/notice';
import stylesheet from './index.scss';

const SubMenu = Menu.SubMenu;
const TabPane = Tabs.TabPane;
// const Search = Input.Search;

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
const UnviewNoticeTabPane = (props) => {
  const { type, dataSource, dispatch } = props;
  const count = dataSource.length;

  const updateNoticeToView = (id, link) => {
    if (type === '评论') {
      dispatch(updateCommentNoticeToView(id, link));
    } else {
      dispatch(updateLikeNoticeToView(id, link));
    }
  };

  const updateAllNoticeToView = () => {
    if (type === '评论') {
      dispatch(updateAllCommentNoticeToView());
    } else if (type === '点赞') {
      dispatch(updateAllLikeNoticeToView());
    }
  };

  return (
    <div>
      {
        count !== 0 ?
          <List
            itemLayout="horizontal"
            dataSource={dataSource}
            renderItem={item => (
              <List.Item
                key={item._id}
                actions={[moment(item.createAt, 'X').fromNow()]}
              >
                <List.Item.Meta
                  onClick={() => { updateNoticeToView(item._id, item.link); }}
                  avatar={<Avatar src={item.initiator.smAvatar} size="large" shape="square" />}
                  title={item.title}
                  description={item.content}
                />
              </List.Item>
            )}
            footer={
              <div>
                <span style={{ cursor: 'pointer' }} onClick={() => { updateAllNoticeToView(); }}>
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

const Nav = (props) => {
  // 通知消息弹出卡片主体内容
  const { unviewComments, unviewLikes } = props.notice;
  const { dispatch } = props;
  const notice = (
    <Tabs defaultActiveKey="1">
      <TabPane tab={unviewComments.length === 0 ? '评论' : `评论 (${unviewComments.length})`} key="1">
        <UnviewNoticeTabPane type="评论" dataSource={unviewComments} dispatch={dispatch} />
      </TabPane>
      <TabPane tab={unviewLikes.length === 0 ? '点赞' : `点赞 (${unviewLikes.length})`} key="2">
        <UnviewNoticeTabPane type="点赞" dataSource={unviewLikes} dispatch={dispatch} />
      </TabPane>
    </Tabs>
  );

  return (
    <div className="nav">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <Menu
        selectedKeys={['main']}
        mode="horizontal"
        className="nav-menu"
      >
        <Menu.Item key="main">
          <a href="/">首页</a>
        </Menu.Item>
        <SubMenu
          title={
            <a href={`/profile/${props.session.uid}`}>
              <Avatar src={props.session.smAvatar} size="large" shape="square" />
            </a>
          }
          className="nav-avatar"
        >
          <Menu.Item key="manage">
            <a href="/manage">文章管理</a>
          </Menu.Item>
          <Menu.Item key="markdown">
            <a href="/markdown" target="_blank">写新文章</a>
          </Menu.Item>
          <Menu.Item key="profile">
            <a href={`/profile/${props.session.uid}`}>个人主页</a>
          </Menu.Item>
          <Menu.Item key="logout">
            <a onClick={() => props.dispatch(deleteSession())}>退出登录</a>
          </Menu.Item>
        </SubMenu>
        <Menu.Item key="notification" className="nav-notification">
          <Popover
            content={notice}
            trigger="click"
            placement="bottom"
            overlayClassName="notification"
          >
            <Badge count={props.notice.unviewAllCount}>
              <Icon type="notification" />
            </Badge>
          </Popover>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default connect(state => state)(Nav);

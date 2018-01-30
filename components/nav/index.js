/**
 * 顶部导航
 */

import { Menu, Icon, Badge, Popover, Tabs, List, Avatar } from 'antd';
import { connect } from 'react-redux';
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

const Nav = (props) => {
  // 点赞未读消息为空时显示的内容
  const NotFoundLikeNotice = (
    <div className="not-found">
      <div className="body">
        <img src="/imgs/notice.svg" alt="空空而已" />
        <p>你已读完所有点赞通知</p>
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

  // 评论未读消息为空时显示的内容
  const NotFoundCommentNotice = (
    <div className="not-found">
      <div className="body">
        <img src="/imgs/notice.svg" alt="空空而已" />
        <p>你已读完所有评论通知</p>
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

  // 通知消息弹出卡片内容
  const notice = (
    <Tabs defaultActiveKey="1">
      <TabPane tab={props.notice.unviewCommentsCount === 0 ? '评论' : `评论 (${props.notice.unviewCommentsCount})`} key="1" >
        {
          props.notice.unviewCommentsCount !== 0 ?
            <List
              itemLayout="horizontal"
              dataSource={props.notice.unviewComments}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    onClick={() => { props.dispatch(updateCommentNoticeToView(item._id, item.link)); }}
                    avatar={<Avatar src={item.initiatorAvatar} />}
                    title={item.title}
                    description={item.content}
                  />
                </List.Item>
              )}
              footer={
                <div>
                  <span style={{ cursor: 'pointer' }} onClick={() => { props.dispatch(updateAllCommentNoticeToView()); }}>
                    <Icon type="delete" style={{ marginRight: 8 }} />清空通知
                  </span>
                  <a style={{ float: 'right' }} href="/notice" >
                    查看全部通知
                  </a>
                </div>
              }
            /> : NotFoundCommentNotice
        }
      </TabPane>
      <TabPane tab={props.notice.unviewLikesCount === 0 ? '点赞' : `点赞 (${props.notice.unviewLikesCount})`} key="2" >
        {
          props.notice.unviewLikesCount !== 0 ?
            <List
              itemLayout="horizontal"
              dataSource={props.notice.unviewLikes}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    onClick={() => { props.dispatch(updateLikeNoticeToView(item._id, item.link)); }}
                    avatar={<Avatar src={item.initiatorAvatar} />}
                    title={item.title}
                  />
                </List.Item>
              )}
              footer={
                <div>
                  <span style={{ cursor: 'pointer' }} onClick={() => { props.dispatch(updateAllLikeNoticeToView()); }}>
                    <Icon type="delete" style={{ marginRight: 8 }} />清空通知
                  </span>
                  <a style={{ float: 'right' }} href="/notice" >
                    查看全部通知
                  </a>
                </div>
              }
            /> : NotFoundLikeNotice
        }
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
            <a href={`/user/${props.session.uid}`}>
              <Avatar src={props.session.avatar} />
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
            <a href="/profile">个人设置</a>
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

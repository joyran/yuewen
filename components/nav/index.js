/**
 * 顶部导航
 */

import { Menu, Icon, Input, Badge } from 'antd';
import { connect } from 'react-redux';
import stylesheet from './index.scss';

const SubMenu = Menu.SubMenu;
const Search = Input.Search;

const Nav = (props) => {
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
              <img
                alt={props.session.username}
                src={props.session.avatar}
                className="nav-avatar-img"
              />
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
            <a href="/logout">退出登录</a>
          </Menu.Item>
        </SubMenu>
        <Menu.Item key="notification" className="nav-notification">
          <Badge count={props.session.notifications}>
            <a href="/notice"><Icon type="notification" /></a>
          </Badge>
        </Menu.Item>
        <Search
          placeholder="搜索你感兴趣的内容..."
          size="large"
          style={{ width: 200, float: 'right', marginRight: 30 }}
          onSearch={(value) => { top.location = `/search/${value}`; }}
        />
      </Menu>
    </div>
  );
};

export default connect(state => state)(Nav);

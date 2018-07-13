/**
 * 用户列表展示组件
 */

import { Button } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { followUser, unfollowUser } from '../../reducers/session';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const UserList = (props) => {
  const { data, info, loading } = props;

  return (
    <ul className="user-list">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      {
        data.map((item) => {
          const has_followed = props.session.following.indexOf(item._id) !== -1;

          return (
            <li className="user-item" key={item.login}>
              <a
                href={`/user/${item.login}`}
                className="user-item-avatar-link"
              >
                <img
                  alt={item.name}
                  src={item.avatar_url}
                  className="user-item-avatar"
                />
              </a>
              <div className="user-item-content">
                <a
                  className="user-item-content-username"
                  href={`/user/${item.login}`}
                >{item.name}</a>
                <p className="user-item-content-bio">{item.bio}</p>
              </div>
              { has_followed ?
                <Button className="user-item-button" onClick={() => props.dispatch(unfollowUser(item.login))}>已关注</Button> :
                <Button type="primary" icon="plus" className="user-item-button" onClick={() => props.dispatch(followUser(item.login))}>关注</Button>
              }
            </li>
          );
        })
      }
      { data.length === 0 && !loading ?
        <div className="empty">
          <img src="/imgs/article.svg" alt={info} />
          <p>{info}</p>
        </div> : ''
      }
    </ul>
  );
};

export default connect(state => state)(UserList);

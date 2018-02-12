/**
 * 个人主页头
 */

import { Button } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';

// 时间汉化
moment.locale('zh-cn');

const ProfileHeader = (props) => {
  return (
    <div className="profile-header">
      { props.profile.banner ?
        <img src={props.profile.banner} alt="banner" className="profile-header-banner" /> :
        <div className="profile-header-banner-tip">
          <Button ghost>上传封面图片</Button>
        </div>
      }
      <div className="profile-header-wrapper">
        <img src={props.profile.avatar} alt={props.profile.username} className="profile-header-avatar" />
        <div className="profile-header-content">
          <div className="profile-header-title">
            <span className="profile-header-username">{props.profile.username}</span>
            <span className="profile-header-bio">{props.profile.bio}</span>
          </div>
          <Button type="primary" className="profile-header-edit">编辑个人资料</Button>
        </div>
      </div>
    </div>
  );
};

export default connect(state => state)(ProfileHeader);

/**
 * 个人主页
 */

import { connect } from 'react-redux';
import ProfileHeader from './profile-header';
import ProfileContent from './profile-content';
import stylesheet from './index.scss';

const Profile = () => {
  return (
    <div className="profile">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <ProfileHeader />
      <ProfileContent />
    </div>
  );
};

export default connect(state => state)(Profile);

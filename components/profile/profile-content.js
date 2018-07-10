/**
 * 个人主页内容
 */

import { Tabs, Card } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import ExcerptList from '../excerpt-list/index';
import UserList from '../user-list/index';
import { readCollects, readArticles, readFollowers, readFollowing } from '../../reducers/profile';

const TabPane = Tabs.TabPane;
// 时间汉化
moment.locale('zh-cn');

const ProfileContent = (props) => {
  const onChangeTag = (key) => {
    switch (key) {
      case 'create':
        if (props.profile.articles.data.length === 0 && props.profile.articles_count !== 0) props.dispatch(readArticles(props.profile.login));
        break;

      case 'collect':
        if (props.profile.collects.data.length === 0 && props.profile.collects_count !== 0) props.dispatch(readCollects(props.profile.login));
        break;

      case 'follower':
        if (props.profile.followers.data.length === 0 && props.profile.followers_count !== 0) props.dispatch(readFollowers(props.profile.login));
        break;

      case 'following':
        if (props.profile.following.data.length === 0 && props.profile.following_count !== 0) props.dispatch(readFollowing(props.profile.login));
        break;

      default:
        break;
    }
  };

  return (
    <div className="profile-content">
      <Tabs defaultActiveKey="create" onChange={onChangeTag} animated={false}>
        <TabPane tab={`文章 ${props.profile.articles_count}`} key="create">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.profile.articles.loading && props.profile.articles.has_more && props.dispatch(readArticles(props.profile.login)); }}
            hasMore={!props.profile.articles.loading && props.profile.articles.has_more}
            useWindow
          >
            <ExcerptList data={props.profile.articles.data} loading={props.profile.articles.loading} info="还没有文章" />
            { props.profile.articles.loading && props.profile.articles.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
        <TabPane tab={`收藏 ${props.profile.collects_count}`} key="collect">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.profile.collects.loading && props.profile.collects.has_more && props.dispatch(readCollects(props.profile.login)); }}
            hasMore={!props.profile.collects.loading && props.profile.collects.has_more}
            useWindow
          >
            <ExcerptList data={props.profile.collects.data} loading={props.profile.collects.loading} info="还没有收藏" />
            { props.profile.collects.loading && props.profile.collects.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
        <TabPane tab={`关注我的人 ${props.profile.followers_count}`} key="follower">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.profile.followers.loading && props.profile.followers.has_more && props.dispatch(readFollowers(props.profile.login)); }}
            hasMore={!props.profile.followers.loading && props.profile.followers.has_more}
            useWindow
          >
            <UserList data={props.profile.followers.data} loading={props.profile.followers.loading} info="还没有关注的用户" />
            { props.profile.followers.loading && props.profile.followers.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
        <TabPane tab={`我关注的人 ${props.profile.following_count}`} key="following">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.profile.following.loading && props.profile.following.has_more && props.dispatch(readFollowers(props.profile.login)); }}
            hasMore={!props.profile.following.loading && props.profile.following.has_more}
            useWindow
          >
            <UserList data={props.profile.following.data} loading={props.profile.following.loading} info="还没有关注的用户" />
            { props.profile.following.loading && props.profile.following.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default connect(state => state)(ProfileContent);

import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import { Tabs, Button, Card } from 'antd';
import { readTopicArticles, readTopicFollowers, followTopic } from '../../reducers/topic';
import ExcerptList from '../excerpt-list/index';
import stylesheet from './index.scss';

const TabPane = Tabs.TabPane;

const Topic = (props) => {
  const { articles, followers } = props.topic;

  return (
    <div className="topic">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <div className="topic-header">
        <p className="title">{props.topic.topic}</p>
        <p className="description">{props.topic.description}</p>
        <Button
          className={props.topic.has_followed ? 'followed' : 'unfollowed'}
          onClick={() => { props.dispatch(followTopic()); }}
        >{ props.topic.has_followed ? '已关注' : '关注'}</Button>
      </div>
      <Tabs defaultActiveKey="articles" animated={false} className="topic-body">
        <TabPane tab={`文章 ${props.topic.articles_count}`} key="articles" className="topic-articles">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !articles.loading && articles.has_more && props.dispatch(readTopicArticles()); }}
            hasMore={!articles.loading && articles.has_more}
            useWindow
          >
            <ExcerptList data={articles.data} loading={articles.loading} />
            { articles.loading && articles.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
        <TabPane tab={`关注者 ${props.topic.followers_count}`} key="followers" className="topic-followers">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !followers.loading && followers.has_more && props.dispatch(readTopicFollowers()); }}
            hasMore={!followers.loading && followers.has_more}
            useWindow
          >
            {
              followers.data.map((follower) => {
                return (
                  <div className="topic-follower" key={follower.login}>
                    <a
                      href={`/user/${follower.login}`}
                      className="topic-follower-avatar-link"
                    >
                      <img
                        alt={follower.name}
                        src={follower.avatar_url}
                        className="topic-follower-avatar"
                      />
                    </a>
                    <div className="topic-follower-content">
                      <a
                        className="topic-follower-content-username"
                        href={`/user/${follower.login}`}
                      >{follower.name}</a>
                      <p className="topic-follower-content-bio">{follower.bio}</p>
                    </div>
                    <Button type="primary" className="topic-follower-button">关注</Button>
                  </div>
                );
              })
            }
            { followers.loading && followers.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default connect(state => state)(Topic);

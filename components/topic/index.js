import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import { Tabs, Button, Card, Icon } from 'antd';
import { readTopicArticles, readTopicFollowers, followTopic, swapSortby, resetTopicArticles } from '../../reducers/topic';
import ExcerptList from '../excerpt-list/index';
import UserList from '../user-list/index';
import stylesheet from './index.scss';

const TabPane = Tabs.TabPane;

const Topic = (props) => {
  const { articles, followers } = props.topic;
  const sortBy = props.topic.articles.sort_by === 'time' ? '热度' : '时间';

  const handleClick = () => {
    const method = props.topic.has_followed ? 'delete' : 'put';
    props.dispatch(followTopic(props.topic.topic, method));
  };

  const handleSwapSortby = () => {
    props.dispatch(resetTopicArticles());
    props.dispatch(swapSortby());
    props.dispatch(readTopicArticles());
  };

  const operations = <span onClick={handleSwapSortby}><Icon type="swap" />{`切换为${sortBy}排序`}</span>;

  return (
    <div className="topic">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <div className="topic-header">
        <div className="info">
          <div className="avatar">
            <img src={props.topic.avatar_url} alt={props.topic.topic} />
          </div>
          <div className="content">
            <p className="title">{props.topic.topic}</p>
            <p className="description">{props.topic.description}</p>
          </div>
        </div>
        <Button
          className={props.topic.has_followed ? 'followed' : 'unfollowed'}
          onClick={handleClick}
        >{ props.topic.has_followed ? '已关注' : '关注话题'}</Button>
      </div>
      <Tabs defaultActiveKey="articles" animated={false} className="topic-body" tabBarExtraContent={operations}>
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
            <UserList data={followers.data} loading={followers.loading} info="还没有关注的用户" />
            { followers.loading && followers.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default connect(state => state)(Topic);

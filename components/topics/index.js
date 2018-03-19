/**
 * 话题广场
 */

import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import { Button, Card, Tag, Row, Col } from 'antd';
import { followTopic } from '../../reducers/topic';
import { readTopics } from '../../reducers/topics';
import stylesheet from './index.scss';

const Topics = (props) => {
  const { data, has_more, loading } = props.topics;
  const { followed_topics } = props.session;

  const handleClick = (topic, has_followed) => {
    const method = has_followed ? 'delete' : 'put';
    props.dispatch(followTopic(topic, method));
  };

  return (
    <div className="topics">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <Card title="已关注的话题">
        {
          followed_topics.map((topic) => {
            return (
              <Tag key={topic} className="topic-tag" color="blue">
                <a href={`/topic/${topic}`} target="_blank">{topic}</a>
              </Tag>
            );
          })
        }
      </Card>
      <Card title="所有话题" className="all-topics">
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={() => { !loading && has_more && props.dispatch(readTopics()); }}
          hasMore={!loading && has_more}
          useWindow
        >
          <Row className="topic-row" gutter={0}>
            {
              data.map((topic) => {
                // 如果话题在用户已关注话题列表中则 has_followed 为 true
                const has_followed = followed_topics.indexOf(topic.topic) !== -1;
                return (
                  <Col span={12} key={topic.topic} className="topic-col">
                    <a className="topic-row-title" href={`/topic/${topic.topic}`}>{topic.topic}</a>
                    <p className="topic-row-description">{topic.description}</p>
                    <Button
                      type="primary"
                      className={has_followed ? 'followed' : 'unfollowed'}
                      onClick={() => { handleClick(topic.topic, has_followed); }}
                    >{ has_followed ? '已关注' : '关注话题'}</Button>
                    <span style={{ marginLeft: 24 }}>{`${topic.articles_count}篇文章，${topic.followers_count}人关注`}</span>
                  </Col>
                );
              })
            }
          </Row>
          { loading && has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
        </InfiniteScroll>
      </Card>
    </div>
  );
};

export default connect(state => state)(Topics);

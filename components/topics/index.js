/**
 * 话题广场
 */

import { connect } from 'react-redux';
import { Button, Card, Tag, Row, Col, Pagination } from 'antd';
import { followTopic } from '../../reducers/topic';
import { readTopics } from '../../reducers/topics';
import stylesheet from './index.scss';

const Topics = (props) => {
  const { data, count } = props.topics;
  const { followed_topics } = props.session;

  const handleClick = (topic, has_followed) => {
    const method = has_followed ? 'delete' : 'put';
    props.dispatch(followTopic(topic, method));
  };

  // 点击分页按钮
  const onChange = (page, pageSize) => {
    props.dispatch(readTopics(page, pageSize));
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
        {
          data.map((item) => {
            // 如果话题在用户已关注话题列表中则 has_followed 为 true
            const has_followed = followed_topics.indexOf(item.topic) !== -1;

            return (
              <Row key={item._id} className="topic-row" gutter={24}>
                <Col span={2}>
                  <img src={item.avatar_url} className="topic_avatar" alt={item.topic} />
                </Col>
                <Col span={19}>
                  <a className="topic-title" href={`/topic/${item.topic}`}>{item.topic}</a>
                  <span className="topic-description">{item.description}</span>
                </Col>
                <Col span={3}>
                  <Button
                    type="primary"
                    className={has_followed ? 'followed' : 'unfollowed'}
                    onClick={() => { handleClick(item.topic, has_followed); }}
                  >{has_followed ? '已经关注' : '关注话题'}
                  </Button>
                </Col>
              </Row>
            );
          })
        }
        <Pagination style={{ textAlign: 'center', marginTop: 24 }} showSizeChanger onShowSizeChange={onChange} onChange={onChange} total={count} />
      </Card>
    </div>
  );
};

export default connect(state => state)(Topics);

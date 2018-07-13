/**
 * 话题广场
 */

import { connect } from 'react-redux';
import { Button, Card, Tag, Pagination } from 'antd';
import { followTopic } from '../../reducers/topic';
import { readTopics } from '../../reducers/topics';
import stylesheet from './index.scss';

const Topics = (props) => {
  const { data, count } = props.topics;
  const { followed_topics } = props.session;

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
        <ul className="topic-list">
          {
            data.map((item) => {
              // 如果话题在用户已关注话题列表中则 has_followed 为 true
              const has_followed = followed_topics.indexOf(item.topic) !== -1;

              return (
                <li className="topic-item" key={item._id}>
                  <a
                    href={`/topic/${item.topic}`}
                    className="topic-item-avatar-link"
                  >
                    <img alt={item.topic} src={item.avatar_url} className="topic-item-avatar" />
                  </a>
                  <div className="topic-item-content">
                    <a
                      className="topic-item-content-topic"
                      href={`/topic/${item.topic}`}
                    >{item.topic}</a>
                    <p className="topic-item-content-bio">145人关注，44篇文章</p>
                  </div>
                  { has_followed ?
                    <Button className="topic-item-button" onClick={() => props.dispatch(followTopic(item.topic, 'delete'))}>已关注</Button> :
                    <Button type="primary" icon="plus" className="topic-item-button" onClick={() => props.dispatch(followTopic(item.topic, 'put'))}>关注</Button>
                  }
                </li>
              );
            })
          }
        </ul>
        <Pagination style={{ textAlign: 'center', marginTop: 24 }} showSizeChanger onShowSizeChange={onChange} onChange={onChange} total={count} />
      </Card>
    </div>
  );
};

export default connect(state => state)(Topics);

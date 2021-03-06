/**
 * 文章摘要列表显示组件
 */

import { Tag } from 'antd';
import moment from 'moment';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const ExcerptList = (props) => {
  const { data, loading, info } = props;

  return (
    <ul className="excerpt-list">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      {
        data.map((item) => {
          return (
            <li className="excerpt-item" key={item._id}>
              <div className="excerpt-title-line">
                <a
                  href={`/article/${item._id}`}
                  className="excerpt-title"
                >
                  {item.title}
                </a>
                <span className="excerpt-date">
                  {moment(item.created_at, 'X').fromNow()}
                </span>
              </div>
              <div className="excerpt-author-info">
                <a
                  href={`/user/${item.author.login}`}
                  className="excerpt-author-info-avatar-link"
                >
                  <img
                    alt={item.author.name}
                    src={item.author.small_avatar_url}
                    className="excerpt-author-info-avatar"
                  />
                </a>
                <div className="excerpt-author-info-content">
                  <a
                    className="excerpt-author-info-content-username"
                    href={`/user/${item.author.login}`}
                  >{item.author.name}</a>
                  <p className="excerpt-author-info-content-bio">{item.author.bio}</p>
                </div>
              </div>
              <p className="excerpt-content">{item.excerpt}</p>
              <span className="excerpt-footer">
                阅读 {item.views_count} ·
                评论 {item.comments_count} ·
                点赞 {item.likes_count}
              </span>
              {
                item.topics.map((topic) => {
                  return (
                    <Tag key={topic} className="excerpt-topic" color="blue">
                      <a href={`/topic/${topic}`} target="_blank">{topic}</a>
                    </Tag>
                  );
                })
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

export default ExcerptList;

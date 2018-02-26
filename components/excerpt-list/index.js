/**
 * 文章摘要列表显示组件
 */

import { Tag } from 'antd';
import moment from 'moment';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const ExcerptList = (props) => {
  const { dataSource, loading } = props;

  return (
    <ul className="excerpt-list">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      {
        dataSource.map((item) => {
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
                  {moment(item.createAt, 'X').fromNow()}
                </span>
              </div>
              <div className="excerpt-author-info">
                <a
                  href={`/profile/${item.author._id}`}
                  className="excerpt-author-info-avatar-link"
                >
                  <img
                    alt={item.author.username}
                    src={item.author.smAvatar}
                    className="excerpt-author-info-avatar"
                  />
                </a>
                <div className="excerpt-author-info-content">
                  <a
                    className="excerpt-author-info-content-username"
                    href={`/profile/${item.author._id}`}
                  >{item.author.username}</a>
                  <p className="excerpt-author-info-content-bio">{item.author.bio}</p>
                </div>
              </div>
              <p className="excerpt-content">{item.excerpt}</p>
              <span className="excerpt-footer">
                阅读 {item.views} ·
                评论 {item.comments} ·
                点赞 {item.likes}
              </span>
              {
                item.tags.map((tag) => {
                  return (
                    <Tag key={tag} className="excerpt-tag" color="blue">{tag}</Tag>
                  );
                })
              }
            </li>
          );
        })
      }
      { dataSource.length === 0 && !loading ?
        <div className="excerpt-not-found">
          <img src="/imgs/article.svg" alt="空空而已" />
          <p>还没有文章，敬请期待</p>
        </div> : ''
      }
    </ul>
  );
};

export default ExcerptList;

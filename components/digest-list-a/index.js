/**
 * 文章摘要
 */

import { Tag } from 'antd';
import moment from 'moment';
// import { readDigests } from '../../reducers/digest';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const DigestList = (props) => {
  const { dataSource } = props;

  return (
    <ul className="digest-list">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      {
        dataSource.map((item) => {
          return (
            <li className="digest" key={item.aid}>
              <div>
                <a
                  href={`/profile/${item.author._id}`}
                  className="avatar"
                >
                  <img
                    alt={item.author.username}
                    src={item.author.avatar}
                    className="avatar-img"
                  />
                  {item.author.username}
                </a>
                <span className="digest-date">
                  {moment(item.createAt, 'X').fromNow()}
                </span>
              </div>
              <a
                href={`/article/${item.aid}`}
                className="digest-title"
              >
                {item.title}
              </a>
              <p className="digest-content">{item.digest}</p>
              <span className="digest-footer">
                阅读 {item.views} ·
                评论 {item.comments} ·
                点赞 {item.likes}
              </span>
              {
                item.tags.map((tag) => {
                  return (
                    <Tag key={tag} className="digest-tag" color="blue"><a href={`/tag/${tag}`}>{tag}</a></Tag>
                  );
                })
              }
            </li>
          );
        })
      }
      { dataSource.length === 0 ?
        <div className="digest-not-found">
          <img src="/imgs/article.svg" alt="空空而已" />
          <p>还没有文章，敬请期待</p>
        </div> : ''
      }
    </ul>
  );
};

export default DigestList;

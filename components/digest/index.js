/**
 * 文章摘要
 */

import { Button, Tag } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { readDigests } from '../../reducers/digest';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const Digest = (props) => {
  return (
    <ul className="digest-list">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      {
        props.digest.digests.map((digest) => {
          return (
            <li className="digest" key={digest.aid}>
              <div>
                <a
                  href={`/user/${digest.authorId}`}
                  className="avatar"
                >
                  <img
                    alt={digest.authorName}
                    src={digest.authorAvatar}
                    className="avatar-img"
                  />
                  {digest.authorName}
                </a>
                <span className="digest-date">
                  {moment(digest.createAt, 'X').fromNow()}
                </span>
              </div>
              <a
                href={`/article/${digest.aid}`}
                className="digest-title"
              >
                {digest.title}
              </a>
              <p className="digest-content">{digest.digest}</p>
              <span className="digest-footer">
                阅读 {digest.views} ·
                评论 {digest.comments} ·
                点赞 {digest.likes}
              </span>
              {
                digest.tags.map((tag) => {
                  return (
                    <Tag key={tag} className="digest-tag" color="blue"><a href={`/tag/${tag}`}>{tag}</a></Tag>
                  );
                })
              }
            </li>
          );
        })
      }
      {props.digest.digests.length > 0 ?
        <div className="loading-more">
          <Button
            type="primary"
            className="loading-more-button"
            disabled={props.digest.loadBtnDisableState}
            onClick={() => props.dispatch(readDigests())}
            loading={props.digest.loadBtnLoadingState}
          >
            {props.digest.loadBtnLabel}
          </Button>
        </div> : <p className="empty-label">{props.digest.emptyLabel}</p>
      }
    </ul>
  );
};

export default connect(state => state)(Digest);

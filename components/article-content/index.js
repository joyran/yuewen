/**
 * 文章内容展示
 */

import { Tooltip, Icon } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { updateArticleLikes } from '../../reducers/article';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const ArticleContent = (props) => {
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      {/* 文章头部，包括标题和作者以及创作时间 */}
      <div className="article-header clearfix">
        <h1 className="title">{props.article.title}</h1>
        <div className="author-info">
          <a
            href={`/user/${props.article.authorId}`}
            className="avatar"
          >
            <img alt={props.article.author} src={props.article.authorAvatar} />
            {props.article.author}
          </a>
          <span className="split"> · </span>
          <Tooltip title={moment(props.article.createAt, 'X').format('LLL')}>
            <span>{moment(props.article.createAt, 'X').fromNow()}</span>
          </Tooltip>
        </div>
      </div>
      {/* 文章主体内容 */}
      <div className="article-preview">
        <div dangerouslySetInnerHTML={{ __html: props.article.markup }} />
      </div>
      {/* 点赞 div */}
      <div className="article-like">
        {/* 点赞按钮，已点赞实心，未点赞空心 */}
        <div
          className={props.article.isLiked ? 'like-button active' : 'like-button'}
          onClick={() => { props.dispatch(updateArticleLikes(props.article.aid)); }}
        >
          <Icon type="like" />{props.article.likerCount}
        </div>
        {/* 点赞人列表 */}
        <ol className="likers">
          {props.article.likers.map((liker) => {
            return (
              <Tooltip placement="top" title={liker.liker} key={liker.likerId}>
                <li>
                  <a href={`/user/${liker.likerId}`}>
                    <img alt={liker.liker} src={liker.likerAvatar} />
                  </a>
                </li>
              </Tooltip>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default connect(state => state)(ArticleContent);

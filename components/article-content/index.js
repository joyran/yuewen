/**
 * 文章内容展示
 */

import { Tooltip, Icon, Button, Avatar } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { updateArticleLikes, updateArticleStar } from '../../reducers/article';
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
            <Avatar src={props.article.authorAvatar} />
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
        <Button
          className="like-button"
          type={props.article.isLiked ? 'primary' : 'default'}
          size="large"
          icon="like"
          onClick={() => { props.dispatch(updateArticleLikes(props.article.aid)); }}
        >
          {props.article.likerCount}
        </Button>
        {/* 收藏按钮 */}
        <Tooltip title={props.article.isStar ? '取消收藏' : '收藏文章'}>
          <Icon
            onClick={() => { props.dispatch(updateArticleStar(props.article.aid)); }}
            className="article-star"
            type={props.article.isStar ? 'star' : 'star-o'}
          />
        </Tooltip>
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

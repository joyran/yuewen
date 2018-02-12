/**
 * 文章内容展示
 */

import { Tooltip, Icon, Button } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { updateArticleLikes, updateArticleCollection } from '../../reducers/article';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');

const ArticleContent = (props) => {
  const { article } = props;
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      {/* 文章头部，包括标题和作者以及创作时间 */}
      <div className="article-header clearfix">
        <h1 className="article-title">{article.title}</h1>
        <div className="article-author-info">
          <a
            href={`/profile/${article.author._id}`}
            className="article-author-info-avatar-link"
          >
            <img
              alt={article.author.username}
              src={article.author.avatar}
              className="article-author-info-avatar"
            />
          </a>
          <div className="article-author-info-content">
            <a
              className="article-author-info-content-username"
              href={`/profile/${article.author._id}`}
            >{article.author.username}</a>
            <p className="article-author-info-content-bio">{article.author.bio}</p>
          </div>
        </div>
      </div>
      {/* 文章主体内容 */}
      <div className="article-preview">
        <div dangerouslySetInnerHTML={{ __html: article.markup }} />
      </div>
      {/* 点赞 div */}
      <div className="article-like">
        {/* 点赞按钮，已点赞实心，未点赞空心 */}
        <Button
          className="like-button"
          type={article.isLiked ? 'primary' : 'default'}
          size="large"
          icon="like"
          onClick={() => { props.dispatch(updateArticleLikes(article._id)); }}
        >
          {article.likerCount}
        </Button>
        {/* 收藏按钮 */}
        <Tooltip title={article.hasCollected ? '取消收藏' : '收藏文章'}>
          <Icon
            onClick={() => { props.dispatch(updateArticleCollection(article._id)); }}
            className="article-star"
            type={props.article.hasCollected ? 'star' : 'star-o'}
          />
        </Tooltip>
        {/* 点赞人列表 */}
        <ol className="likers">
          {article.likers.map((liker) => {
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

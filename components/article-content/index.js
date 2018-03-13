/**
 * 文章内容展示
 */

import { Tooltip, Icon, Button } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { createArticleLikes, updateArticleCollection } from '../../reducers/article';
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
              alt={article.author.name}
              src={article.author.small_avatar_url}
              className="article-author-info-avatar"
            />
          </a>
          <div className="article-author-info-content">
            <a
              className="article-author-info-content-username"
              href={`/profile/${article.author._id}`}
            >{article.author.name}</a>
            <p className="article-author-info-content-bio">{article.author.bio}</p>
          </div>
        </div>
      </div>
      {/* 文章主体内容 */}
      <div className="article-preview">
        <div dangerouslySetInnerHTML={{ __html: article.html }} />
      </div>
      {/* 点赞 div */}
      <div className="article-like">
        {/* 点赞按钮，已点赞实心，未点赞空心 */}
        <Button
          className="like-button"
          type={article.has_liked ? 'primary' : 'default'}
          size="large"
          icon="like"
          onClick={() => { props.dispatch(createArticleLikes(article._id)); }}
        >
          {article.likes_count}
        </Button>
        {/* 收藏按钮 */}
        <Tooltip title={article.has_collected ? '取消收藏' : '收藏文章'}>
          <Icon
            onClick={() => { props.dispatch(updateArticleCollection(article._id)); }}
            className="article-star"
            type={article.has_collected ? 'star' : 'star-o'}
          />
        </Tooltip>
        {/* 点赞人列表 */}
        <ol className="likes">
          {article.likes.map((like) => {
            return (
              <Tooltip placement="top" title={like.user.name} key={like.user._id}>
                <li>
                  <a href={`/user/${like.user._id}`}>
                    <img alt={like.user.name} src={like.user.small_avatar_url} />
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

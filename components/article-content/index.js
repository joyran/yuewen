/**
 * 文章内容展示
 */

import { Tooltip, Icon, Button, Tag } from 'antd';
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
            href={`/user/${article.author.login}`}
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
              href={`/user/${article.author.login}`}
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
      <div className="article-footer">
        <div className="article-topics">
          {
            article.topics.map((topic) => {
              return (
                <Tag key={topic} className="article-topic" color="blue">
                  <a href={`/topic/${topic}`} target="_blank">{topic}</a>
                </Tag>
              );
            })
          }
        </div>
        {/* 点赞按钮，已点赞实心，未点赞空心 */}
        <div className="buttons">
          <Button
            className={article.has_liked ? 'button-like' : 'button-no-like'}
            type={article.has_liked ? 'primary' : 'default'}
            size="large"
            icon="like"
            onClick={() => { props.dispatch(createArticleLikes(article._id)); }}
          >
            {article.likes_count}
          </Button>
          {/* 收藏按钮 */}
          <div onClick={() => { props.dispatch(updateArticleCollection(article._id)); }} className="button">
            <Icon type={article.has_collected ? 'star' : 'star-o'} style={{ fontSize: 15 }} />
            <span>{ article.has_collected ? '已收藏' : '收藏' }</span>
          </div>
          <div className="button">
            <Icon type="message" />
            <a href="#comment-list">{ `${article.comments_count} 条评论` }</a>
          </div>
          <div className="button">
            <Icon type="download" />
            <span onClick={() => { window.open(`/api/v1/articles/${article._id}/download`, 'Iframe'); }}>下载</span>
          </div>
          <div className="button">
            <Icon type="clock-circle-o" />
            <span>发布于 { moment(article.created_at, 'X').format('YYYY-MM-DD') }</span>
          </div>
        </div>
        {/* 点赞人列表 */}
        <ol className="article-likes clearfix">
          {article.likes.map((like) => {
            return (
              <Tooltip placement="top" title={like.user.name} key={like.user._id}>
                <li>
                  <a href={`/user/${like.user.login}`}>
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

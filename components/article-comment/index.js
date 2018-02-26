/**
 * 文章评论展示
 */

import React, { Component } from 'react';
import { Tooltip, Pagination } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CommentEditor from './comment-editor';
import ReplyEditor from './reply-editor';
import { readArticleComments } from '../../reducers/article';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');


class ArticleComment extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
    this.toggleCommentReply = this.toggleCommentReply.bind(this);
    this.onChangePagination = this.onChangePagination.bind(this);
  }

  // 点击分页按钮切换评论分页
  onChangePagination = (page) => {
    const { limit } = this.props.article.comment;
    const { _id } = this.props.article;
    const skip = (page - 1) * limit;
    this.props.dispatch(readArticleComments(_id, skip, limit));
  }

  // 切换评论回复框显示状态
  toggleCommentReply = (e) => {
    const childrens = e.target.parentNode.children;
    for (let i = 0; i < childrens.length; i += 1) {
      const className = childrens[i].className;
      if (className.indexOf('comment-reply-input-textarea') !== -1) {
        if (className.indexOf('hidden') !== -1) {
          childrens[i].className = 'comment-reply-input-textarea clearfix';
        } else {
          childrens[i].className = 'comment-reply-input-textarea clearfix hidden';
        }
      }
    }
  }

  render() {
    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div className="comment-wrapper">
          {/* 评论输入框 */}
          <CommentEditor />
          {/* 评论列表 */}
          <ul className="comment-list" id="comment-list">
            {
              this.props.article.comment.dataSource.map((comment) => {
                return (
                  <li className="comment-item" id={`comment-${comment._id}`} key={comment._id}>
                    {/* 评论人头像 */}
                    <a className="comment-item-avatar" href={`/profile/${comment.author._id}`}>
                      <img src={comment.author.smAvatar} alt={comment.author.username} />
                    </a>
                    <div className="comment-item-main">
                      <div className="comment-item-header">
                        <a className="comment-item-header-username" href={`/profile/${comment.author._id}`}>{comment.author.username}</a>
                        <Tooltip title={moment(comment.createAt, 'X').format('LLL')}>
                          <span className="comment-item-header-datetime">
                            { moment(comment.createAt, 'X').fromNow() }
                          </span>
                        </Tooltip>
                      </div>
                      {/* 评论内容 */}
                      <div className="comment-item-content">
                        <p>{comment.comment}</p>
                      </div>
                      <span className="comment-item-reply-label" onClick={this.toggleCommentReply}>回复</span>
                      <ReplyEditor atUserId={comment.atuser._id} rid={comment._id} />
                      <ul className="comment-item-reply-list clearfix">
                        { comment.replys.map((reply) => {
                          return (
                            <li className="comment-item-reply clearfix" id={`comment-${reply._id}`} key={reply._id}>
                              <div className="comment-item-reply-main">
                                <div className="tip">
                                  <a href={`/profile/${reply.author._id}`}>{reply.author.username}</a>
                                  <span>回复</span>
                                  <a href={`/profile/${reply.atuser._id}`}>{reply.atuser.username}</a>
                                  <Tooltip title={moment(reply.createAt, 'X').format('LLL')}>
                                    <span className="comment-item-reply-main-datetime">
                                      { moment(reply.createAt, 'X').fromNow() }
                                    </span>
                                  </Tooltip>
                                </div>
                                <div className="comment-item-reply-content">
                                  <p>{reply.comment}</p>
                                </div>
                                <span className="comment-item-reply-reply-label" onClick={this.toggleCommentReply}>回复</span>
                                <ReplyEditor atUserId={reply.author._id} rid={comment._id} />
                              </div>
                            </li>
                          );
                        }) }
                      </ul>
                    </div>
                  </li>
                );
              })
            }
          </ul>
          {/* 评论分页组件，当且仅当页数 pages > 1时才显示分页组件 */}
          { this.props.article.comment.pages > 1 ?
            <Pagination
              defaultCurrent={1}
              total={this.props.article.comment.total}
              className="comment-pagination"
              style={{ marginTop: 24 }}
              onChange={this.onChangePagination}
            /> : ''
          }
        </div>
      </div>
    );
  }
}

export default connect(state => state)(ArticleComment);

/**
 * 文章评论展示
 */

import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CommentEditor from './comment-editor';
import ReplyEditor from './reply-editor';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');


class ArticleComment extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
    this.toggleCommentReply = this.toggleCommentReply.bind(this);
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
        <div className="comment">
          {/* 评论输入框 */}
          <CommentEditor />
          {/* 评论列表 */}
          <ul className="comments">
            {
              this.props.article.comments.map((comment) => {
                return (
                  <li className="comment-item" id={`comment-${comment.cid}`} key={comment.cid}>
                    {/* 评论人头像 */}
                    <a className="avatar" href={`/user/${comment.authorId}`}>
                      <img src={comment.authorAvatar} alt={comment.authorName} />
                    </a>
                    <div className="comment-body">
                      <div className="username">
                        <a href={`/user/${comment.authorId}`}>{comment.authorName}</a>
                        <Tooltip title={moment(comment.createAt, 'X').format('LLL')}>
                          <span className="datetime">
                            { moment(comment.createAt, 'X').fromNow() }
                          </span>
                        </Tooltip>
                      </div>
                      {/* 评论内容 */}
                      <div className="comment-content">
                        <p>{comment.comment}</p>
                      </div>
                      <span className="comment-reply-label" onClick={this.toggleCommentReply}>回复</span>
                      <ReplyEditor atUserId={comment.atUserId} rid={comment.cid} />
                      <ul className="comment-replys clearfix">
                        { comment.replys.map((reply) => {
                          return (
                            <li className="comment-reply clearfix" id={`comment-${reply.cid}`}>
                              <div className="comment-reply-body">
                                <div className="tip">
                                  <a href={`/user/${reply.authorId}`}>{reply.authorName}</a>
                                  <span>回复</span>
                                  <a href={`/user/${reply.atUserId}`}>{reply.atUsername}</a>
                                  <Tooltip title={moment(reply.createAt, 'X').format('LLL')}>
                                    <span className="datetime">
                                      { moment(reply.createAt, 'X').fromNow() }
                                    </span>
                                  </Tooltip>
                                </div>
                                <div className="comment-reply-content">
                                  <p>{reply.comment}</p>
                                </div>
                                <span className="reply-label" onClick={this.toggleCommentReply}>回复</span>
                                <ReplyEditor atUserId={reply.authorId} rid={comment.cid} />
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
        </div>
      </div>
    );
  }
}

export default connect(state => state)(ArticleComment);

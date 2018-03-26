/**
 * 文章评论展示
 */

import React, { Component } from 'react';
import { Tooltip, Pagination, Icon } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CommentEditor from './comment-editor';
import ReplyEditor from './reply-editor';
import Conversation from './conversation';
import { readArticleComments, toggleCommentReplyEditor, readConversation } from '../../reducers/article';
import stylesheet from './index.scss';

// 时间汉化
moment.locale('zh-cn');


class ArticleComment extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  // 点击分页按钮切换评论分页
  onChangePagination = (page) => {
    const { _id } = this.props.article;
    this.props.dispatch(readArticleComments(_id, page));
  }

  render() {
    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Conversation />
        <div className="comment-wrapper">
          {/* 评论输入框 */}
          <CommentEditor />
          {/* 评论列表 */}
          <ul className="comment-list" id="comment-list">
            {
              this.props.article.comments.map((comment) => {
                return (
                  <li className="comment-item" id={`comment-${comment._id}`} key={comment._id}>
                    {/* 评论人头像 */}
                    <div className="comment-item-header">
                      <a href={`/user/${comment.author.login}`} className="avatar-link">
                        <img
                          alt={comment.author.name}
                          src={comment.author.small_avatar_url}
                          className="avatar"
                        />
                      </a>
                      <div className="headline">
                        <a href={`/user/${comment.author.login}`}>{comment.author.name}</a>
                        { comment.reply_to_author ? <span>回复</span> : '' }
                        { comment.reply_to_author ? <a href={`/user/${comment.reply_to_author.login}`}>{comment.reply_to_author.name}</a> : '' }
                        <Tooltip title={moment(comment.created_at, 'X').format('LLL')}>
                          <span className="datetime">{ moment(comment.created_at, 'X').fromNow() }</span>
                        </Tooltip>
                      </div>
                    </div>
                    {/* 评论内容 */}
                    <div className="comment-item-body">
                      {comment.content}
                    </div>
                    <div className="comment-item-footer">
                      { !comment.show_reply_editor ? <span className="like"><Icon type="like" /> 赞</span> : '' }
                      { !comment.show_reply_editor ?
                        <div className="extra-buttons">
                          <div onClick={() => { this.props.dispatch(toggleCommentReplyEditor(comment._id)); }}>
                            <svg viewBox="0 0 22 16" width="13" height="16" aria-hidden="true">
                              <title />
                              <g>
                                <path d="M21.96 13.22c-1.687-3.552-5.13-8.062-11.637-8.65-.54-.053-1.376-.436-1.376-1.56V.677c0-.52-.635-.915-1.116-.52L.47 6.67C.18 6.947 0 7.334 0 7.763c0 .376.14.722.37.987 0 0 6.99 6.818 7.442 7.114.453.295 1.136.124 1.135-.5V13c.027-.814.703-1.466 1.532-1.466 1.185-.14 7.596-.077 10.33 2.396 0 0 .395.257.535.257.892 0 .614-.967.614-.967z" />
                              </g>
                            </svg>
                            <span className="reply">回复</span>
                          </div>
                          { comment.reply_to_author ?
                            <div onClick={() => { this.props.dispatch(readConversation(this.props.article._id, comment._id)); }}>
                              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" width="13" height="16" aria-hidden="true">
                                <title />
                                <g>
                                  <g>
                                    <path d="M9 0C3.394 0 0 4.13 0 8c0 1.654.522 3.763 2.014 5.566.314.292.518.82.454 1.17-.165 1.488-.842 1.905-.842 1.905-.328.332.105.67.588.582 1.112-.2 2.07-.58 3.526-1.122.4-.202.464-.147.78-.078C11.524 17.764 18 14 18 8c0-3.665-3.43-8-9-8z" />
                                    <path d="M19.14 9.628c.758.988.86 2.01.86 3.15 0 1.195-.62 3.11-1.368 3.938-.21.23-.354.467-.308.722.12 1.073.614 1.5.614 1.5.237.24-.188.563-.537.5-.802-.145-1.494-.42-2.545-.81-.29-.146-.336-.106-.563-.057-2.043.712-4.398.476-6.083-.926 5.964-.524 8.726-3.03 9.93-8.016z" />
                                  </g>
                                </g>
                              </svg>
                              <span className="show-comment">查看对话</span>
                            </div>
                            : ''
                          }
                        </div> : ''
                      }
                      { comment.show_reply_editor ? <ReplyEditor atUserId={comment.author._id} rid={comment._id} /> : '' }
                    </div>
                  </li>
                );
              })
            }
          </ul>
          {/* 评论分页组件，当且仅当评论数量大于 10 时才显示分页组件 */}
          { this.props.article.comments_count > 10 ?
            <Pagination
              defaultCurrent={1}
              total={this.props.article.comments_count}
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

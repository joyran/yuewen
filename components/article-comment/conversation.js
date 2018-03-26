/**
 * 评论会话展示
 */

import React from 'react';
import { Modal, Tooltip, Icon } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { toggleConversationModal } from '../../reducers/article';

// 时间汉化
moment.locale('zh-cn');

const Conversation = (props) => {
  return (
    <Modal
      className="comment-conversation"
      width="700"
      title="查看对话"
      visible={props.article.conversation_modal_visible}
      footer={null}
      onCancel={() => props.dispatch(toggleConversationModal())}
    >
      {
        props.article.conversation.map((comment) => {
          return (
            <li className="comment-item" key={comment._id}>
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
                <span className="like"><Icon type="like" /> 赞</span>
              </div>
            </li>
          );
        })
      }
    </Modal>
  );
};

export default connect(state => state)(Conversation);

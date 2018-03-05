/**
 * 评论输入编辑框
 */

import React, { Component } from 'react';
import { Input, Button, Icon, Tooltip, Popover } from 'antd';
import { connect } from 'react-redux';
import { createArticleComment } from '../../reducers/article';

const { TextArea } = Input;

class CommentEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { disabled: true, comment: '' };
  }

  // 评论输入框最少输入5个字符，否则评论按钮灰显，不可提交评论
  onChangeValue = (e) => {
    if (e.target.value.length > 5) {
      this.setState({ disabled: false, comment: e.target.value });
    } else {
      this.setState({ disabled: true, comment: e.target.value });
    }
  }

  // 点击评论按钮提交评论
  onClickButton = () => {
    if (this.state.disabled) return false;
    // 提交评论
    this.props.dispatch(createArticleComment(this.props.article._id, this.state.comment));
    // 清空评论框
    this.setState({ comment: '', disabled: true });
  }

  // 点击emoji表情 添加 emoji native 原生表情到评论框中
  addEmoji = (emoji) => {
    this.setState({ comment: this.state.comment + emoji });
  }

  render() {
    const emojis = [
      '😂', '😘', '😍', '👏', '😁', '💯', '👍', '👎', '🎉',
      '🤣', '😲', '😄', '😊', '😃', '😅', '🤠', '😎', '😆',
      '🤝', '🤑', '🤤', '😤', '🙃', '🤡', '😪', '😴', '😜',
      '😓', '😷', '🤓', '👻', '😥', '🙄', '☹️', '☠️', '😰',
      '😩', '😒', '💀', '😨', '😱', '😭', '😠', '🙌', '😋',
      '😇', '💔', '💖', '👊', '💋', '🖕', '✌️', '👌', '👄',
      '💩', '👿', '😡', '🚀', '🏀', '⚽', '🐶', '🐷', '🎤'
    ];

    const content = (
      <ul className="emojis">
        {
          emojis.map((emoji, index) => {
            return <li data-emoji={emoji} onClick={() => this.addEmoji(emoji)} key={index}>{emoji}</li>;
          })
        }
      </ul>
    );

    return (
      <div className="comment-input-textarea clearfix">
        <TextArea
          autosize={{ minRows: 2 }}
          placeholder="写下你的评论..."
          onChange={this.onChangeValue}
          value={this.state.comment}
          onPressEnter={this.onClickButton}
        />
        <Button
          type="primary"
          className={this.state.disabled ? 'ant-btn-disabled' : ''}
          onClick={this.onClickButton}
        >
          评论
        </Button>
        <Popover overlayClassName="popover-emojis" content={content} trigger="click" placement="bottom">
          <Tooltip placement="bottom" title="添加 emoji 表情">
            <Icon type="smile-o" className="show-emoji-icon" />
          </Tooltip>
        </Popover>
      </div>
    );
  }
}

export default connect(state => state)(CommentEditor);

/**
 * 评论输入编辑框
 */

import React, { Component } from 'react';
import { Input, Button, Tooltip, Popover, Icon } from 'antd';
import { connect } from 'react-redux';
import { createArticleComment } from '../../reducers/article';

const { TextArea } = Input;

class CommentEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { disabled: true, comment: '', cursor: 0 };
  }

  // 评论输入框最少输入5个字符，否则评论按钮灰显，不可提交评论
  onChangeValue = (e) => {
    const disabled = e.target.value.length < 6;
    this.setState({ disabled, comment: e.target.value });
  }

  // 点击emoji表情 添加 emoji native 原生表情到评论框中
  addEmoji = (emoji) => {
    const left = this.state.comment.substr(0, this.state.cursor);
    const right = this.state.comment.substr(this.state.cursor);
    const comment = `${left}${emoji}${right}`;

    // 每个 emoji 表情占两个字符，所以 cursor + 2
    this.setState({ comment, cursor: this.state.cursor + 2 });
  }

  // 点击评论按钮提交评论
  onClickButton = () => {
    // 提交评论
    this.props.dispatch(createArticleComment(this.props.article._id, this.state.comment));
    // 清空评论框
    this.setState({ comment: '', disabled: true });
  }

  render() {
    // emoji 表情列表
    const emojis = [
      '😂', '😘', '😍', '👏', '😁', '💯', '👍', '👎', '🎉',
      '🤣', '😲', '😄', '😊', '😃', '😅', '🤠', '😎', '😆',
      '🤝', '🤑', '🤤', '😤', '🙃', '🤡', '😪', '😴', '😜',
      '😓', '😷', '🤓', '👻', '😥', '🙄', '☹️', '☠️', '😰',
      '😩', '😒', '💀', '😨', '😱', '😭', '😠', '🙌', '😋',
      '😇', '💔', '💖', '👊', '💋', '🖕', '✌️', '👌', '👄',
      '💩', '👿', '😡', '🚀', '🏀', '⚽', '🐶', '🐷', '🎤'
    ];

    const emojisContent = (
      <ul className="emojis">
        {
          emojis.map((emoji, index) => {
            return <li data-emoji={emoji} onClick={() => this.addEmoji(emoji)} key={index}>{emoji}</li>;
          })
        }
      </ul>
    );

    return (
      <div className="comment-editor-wrapper clearfix">
        <TextArea
          autosize={{ minRows: 2 }}
          placeholder="写下你的评论..."
          onChange={this.onChangeValue}
          value={this.state.comment}
          onMouseUp={(e) => { this.setState({ cursor: e.target.selectionEnd }); }}
          onKeyUp={(e) => { this.setState({ cursor: e.target.selectionEnd }); }}
        />
        <div className="footer">
          <Popover overlayClassName="popover-emojis" content={emojisContent} trigger="click" placement="bottom">
            <Tooltip placement="bottom" title="emoji 表情">
              <Icon type="smile-o" className="show-emoji-icon" />
            </Tooltip>
          </Popover>
          <Button
            type="primary"
            disabled={this.state.disabled}
            onClick={this.onClickButton}
          >评论</Button>
        </div>
      </div>
    );
  }
}

export default connect(state => state)(CommentEditor);

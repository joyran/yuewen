/**
 * 评论回复输入编辑框
 */

import React, { Component } from 'react';
import { Input, Button, Tooltip, Popover, Icon } from 'antd';
import { connect } from 'react-redux';
import { createArticleCommentReply, toggleCommentReplyEditor } from '../../reducers/article';

const { TextArea } = Input;

class ReplyEditor extends Component {
  constructor(props) {
    super(props);
    const { atUserId, rid } = this.props;
    this.state = { disabled: true, reply: '', atUserId, rid, cursor: 0 };
  }

  // 评论输入框最少输入5个字符，否则评论按钮灰显，不可提交评论
  onChangeValue = (e) => {
    const disabled = e.target.value.length < 6;
    this.setState({ disabled, reply: e.target.value });
  }

  // 点击emoji表情 添加 emoji native 原生表情到评论框中
  addEmoji = (emoji) => {
    const left = this.state.reply.substr(0, this.state.cursor);
    const right = this.state.reply.substr(this.state.cursor);
    const reply = `${left}${emoji}${right}`;

    // 每个 emoji 表情占两个字符，所以 cursor + 2
    this.setState({ reply, cursor: this.state.cursor + 2 });
  }

  // 点击回复按钮提交评论
  onClickButton = () => {
    const aid = this.props.article._id;
    const reply = this.state.reply;

    // 提交评论回复
    this.props.dispatch(createArticleCommentReply(aid, reply, this.state.atUserId, this.state.rid));
    // 清空回复框
    this.setState({ reply: '' });

    this.props.dispatch(toggleCommentReplyEditor(this.state.rid));
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
      <div className="reply-editor-wrapper clearfix">
        <TextArea
          autosize
          placeholder="写下你的回复..."
          onChange={this.onChangeValue}
          value={this.state.reply}
          onMouseUp={(e) => { this.setState({ cursor: e.target.selectionEnd }); }}
          onKeyUp={(e) => { this.setState({ cursor: e.target.selectionEnd }); }}
        />
        <div className="footer">
          <Popover overlayClassName="popover-emojis" content={emojisContent} trigger="click" placement="bottom">
            <Tooltip placement="bottom" title="emoji 表情">
              <Icon type="smile-o" className="show-emoji-icon" />
            </Tooltip>
          </Popover>
          <a className="btn-cancel" onClick={() => { this.props.dispatch(toggleCommentReplyEditor(this.state.rid)); }}>取 消</a>
          <Button
            type="primary"
            disabled={this.state.disabled}
            onClick={this.onClickButton}
          >回复</Button>
        </div>
      </div>
    );
  }
}

export default connect(state => state)(ReplyEditor);

/**
 * 评论回复输入编辑框
 */

import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { connect } from 'react-redux';
import { createArticleReply } from '../../reducers/article';

const { TextArea } = Input;

class ReplyEditor extends Component {
  constructor(props) {
    super(props);

    // atuser: 被@的用户  rid: 被回复的 comment id
    const { atUserId, rid } = this.props;
    this.state = {
      disabled: true,
      reply: '',
      atUserId,
      rid
    };
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onClickButton = this.onClickButton.bind(this);
  }

  // 评论输入框最少输入5个字符，否则评论按钮灰显，不可提交评论
  onChangeValue = (e) => {
    if (e.target.value.length > 5) {
      this.setState({ disabled: false, reply: e.target.value });
    } else {
      this.setState({ disabled: true, reply: e.target.value });
    }
  }

  onClickButton = (e) => {
    const { atUserId, rid } = this.props;
    const aid = this.props.article.aid;
    const reply = this.state.reply;
    // 提交评论回复
    this.props.dispatch(createArticleReply(aid, reply, atUserId, rid));
    // 清空回复框
    this.setState({ reply: '' });
    // 隐藏评论框
    const className = e.target.parentNode.className;
    e.target.parentNode.className = `${className} hidden`;
  }

  render() {
    return (
      <div className="comment-reply-input-textarea clearfix hidden">
        <TextArea
          autosize={{ minRows: 2 }}
          placeholder="写下你的回复..."
          onChange={this.onChangeValue}
          value={this.state.reply}
          onPressEnter={this.onClickButton}
        />
        <Button
          type="primary"
          disabled={this.state.disabled}
          onClick={this.onClickButton}
        >
          回复
        </Button>
      </div>
    );
  }
}

export default connect(state => state)(ReplyEditor);

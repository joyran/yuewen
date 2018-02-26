/**
 * 评论输入编辑框
 */

import React, { Component } from 'react';
import { Input, Button, Icon, Tooltip, Popover } from 'antd';
import { connect } from 'react-redux';
import { Picker } from 'emoji-mart';
import { createArticleComment } from '../../reducers/article';

const { TextArea } = Input;

// emoji-mart 中文汉化
const i18n = {
  search: '搜索',
  notfound: '未找到 emoji',
  categories: {
    search: '搜索结果',
    recent: '常用',
    people: '笑脸 & 人类',
    nature: '动物 & 自然',
    foods: '食物 & 饮料',
    activity: '运动',
    places: '交通',
    objects: '对象',
    symbols: '符号',
    flags: '旗帜'
  }
};

// emoji 不显示的分类
const exclude = ['flags', 'custom'];

class CommentEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { disabled: true, comment: '' };
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onClickButton = this.onClickButton.bind(this);
    this.addEmoji = this.addEmoji.bind(this);
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
    this.setState({ comment: this.state.comment + emoji.native });
  }

  render() {
    const content = (
      <Picker
        onClick={this.addEmoji}
        native
        showPreview={false}
        i18n={i18n}
        emojiSize={18}
        exclude={exclude}
        style={{ width: '310px' }}
      />
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
        <Popover content={content} trigger="click" placement="bottom">
          <Tooltip placement="bottom" title="添加 emoji 表情">
            <Icon type="smile-o" className="emoji-show" />
          </Tooltip>
        </Popover>
      </div>
    );
  }
}

export default connect(state => state)(CommentEditor);

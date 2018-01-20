/**
 * 评论输入编辑框
 */

import React, { Component } from 'react';
import { Input, Button, Icon } from 'antd';
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
    this.toogleEmojiPicker = this.toogleEmojiPicker.bind(this);
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
    // 提交评论
    this.props.dispatch(createArticleComment(this.props.article.aid, this.state.comment));
    // 清空评论框
    this.setState({ comment: '' });
  }

  // 点击emoji表情 添加 emoji native 原生表情到评论框中
  addEmoji = (emoji) => {
    this.setState({ comment: this.state.comment + emoji.native });
  }

  // 切换显示隐藏 emoji 表情选择框
  toogleEmojiPicker = () => {
    const picker = document.getElementsByClassName('emoji-mart')[0];
    picker.style.display = picker.style.display === 'block' ? 'none' : 'block';
  }

  render() {
    return (
      <div className="comment-input-textarea clearfix">
        <TextArea
          autosize={{ minRows: 2 }}
          placeholder="写下你的评论..."
          onChange={this.onChangeValue}
          value={this.state.comment}
          onPressEnter={this.onClickButton}
        />
        <Picker
          onClick={this.addEmoji}
          native
          showPreview={false}
          i18n={i18n}
          emojiSize={18}
          exclude={exclude}
          style={{ width: '310px', display: 'none', position: 'absolute', zIndex: 10000, right: '124px', top: '76px' }}
        />
        <Button
          type="primary"
          disabled={this.state.disabled}
          onClick={this.onClickButton}
        >
          评论
        </Button>
        <Icon type="smile-o" className="emoji-show" onClick={this.toogleEmojiPicker} />
      </div>
    );
  }
}

export default connect(state => state)(CommentEditor);

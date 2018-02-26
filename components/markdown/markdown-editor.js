/**
 * markdown编辑器编辑框 textarea
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './code-block';
import { updateMarkdown, updateTextareaCursorIndex } from '../../reducers/markdown-editor';
import stylesheet from './index.scss';

// const { TextArea } = Input;

class MarkdownEditor extends Component {
  constructor() {
    super();

    this.state = {
      loading: true
    };

    this.onChangeMarkdown = this.onChangeMarkdown.bind(this);
  }

  componentDidMount() {
    // 设置markdown div高度和工具栏高度填满整个可视窗口
    const height = document.documentElement.clientHeight - 48;
    document.getElementById('markdown').style.height = `${height}px`;

    // 写新文章时才从 localStorage 中读取 markdown，编辑文章不读取
    if (!this.props.meditor.markdown) {
      this.props.dispatch(updateMarkdown(localStorage.markdown));
    }

    this.setState({ loading: false });
  }

  onChangeMarkdown(e) {
    this.props.dispatch(updateMarkdown(e.target.value));
    localStorage.markdown = e.target.value;
  }

  render() {
    return (
      <Spin spinning={this.state.loading} >
        <div id="markdown">
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <textarea
            className="markdown-editor"
            value={this.props.meditor.markdown}
            onChange={this.onChangeMarkdown}
            onMouseUp={(e) => { this.props.dispatch(updateTextareaCursorIndex(e.target.selectionEnd)); }}
            onKeyUp={(e) => { this.props.dispatch(updateTextareaCursorIndex(e.target.selectionEnd)); }}
          />
          <ReactMarkdown
            source={this.props.meditor.markdown}
            className="article-preview"
            renderers={{ code: CodeBlock }}
          />
        </div>
      </Spin>
    );
  }
}

export default connect(state => state)(MarkdownEditor);

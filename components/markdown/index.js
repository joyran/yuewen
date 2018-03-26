/**
 * markdown
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import ReactMarkdown from 'react-markdown';
import CodeMirror from 'react-codemirror';
import CodeBlock from './code-block';
import Toolbar from './toolbar';
import { updateMarkdown, updateCursorRange } from '../../reducers/markdown-editor';
import stylesheet from './index.scss';

// let CodeMirror = null;
// if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
//   CodeMirror = require('react-codemirror');
//   require('codemirror/mode/markdown/markdown');
// }

class Markdown extends Component {
  constructor() {
    super();
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    // 设置markdown div高度和工具栏高度填满整个可视窗口
    const height = document.documentElement.clientHeight - 48;
    document.getElementById('markdown').style.height = `${height}px`;

    // 写新文章时才从 localStorage 中读取 markdown，编辑文章不读取
    if (!this.props.meditor.markdown) {
      this.props.dispatch(updateMarkdown(localStorage.markdown));
      this.codemirror.setValue(localStorage.markdown);
    } else {
      // 初始化设置 codemirror value
      this.codemirror.setValue(this.props.meditor.markdown);
    }

    this.setState({ loading: false });
  }

  // CodeMirror 发生变化时更新 store 中 markdown并同步更新 localStorage
  onChangeMarkdown = (value) => {
    this.props.dispatch(updateMarkdown(value));
    localStorage.markdown = value;
  }

  // 光标改变时更新光标位置
  onCursorActivity = () => {
    var cursorFrom;
    var cursorTo;

    // 获取选中文本的光标位置
    const range = this.codemirror.doc.listSelections();
    const { anchor, head } = range[0];

    // 如果 anchor.ch 小于 head.ch，则 anchor 为 from
    if (anchor.ch <= head.ch) {
      cursorFrom = { line: anchor.line, ch: anchor.ch };
      cursorTo = { line: head.line, ch: head.ch };
    } else {
      cursorFrom = { line: head.line, ch: head.ch };
      cursorTo = { line: anchor.line, ch: anchor.ch };
    }

    const cursor = { from: cursorFrom, to: cursorTo };
    this.props.dispatch(updateCursorRange(cursor));
  }

  codemirrorRef = (codemirror) => {
    this.codemirror = codemirror.getCodeMirror();
    return this.codemirror;
  }

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Toolbar codemirror={this.codemirror} />
        <div id="markdown" style={{ display: 'flex' }}>
          <CodeMirror
            ref={this.codemirrorRef}
            className={this.props.meditor.editorClassName}
            onChange={this.onChangeMarkdown}
            onCursorActivity={this.onCursorActivity}
            options={{
              lineWrapping: true,
              showCursorWhenSelecting: true,
              mode: 'markdown'
            }}
            autoFocus
          />
          <ReactMarkdown
            source={this.props.meditor.markdown}
            className={this.props.meditor.previewClassName}
            renderers={{ code: CodeBlock }}
            escapeHtml={false}
          />
        </div>
      </Spin>
    );
  }
}

export default connect(state => state)(Markdown);

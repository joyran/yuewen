/**
 * markdown
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import CodeMirror from 'react-codemirror';
import marked from 'marked';
import highlight from 'highlight.js';
import Toolbar from './toolbar';
import { updateMarkdown, updateCursorRange } from '../../reducers/markdown-editor';
import stylesheet from './index.scss';

marked.setOptions({
  highlight: code => highlight.highlightAuto(code).value
});

// 加载 markdown 格式
require('codemirror/mode/markdown/markdown');

class Markdown extends Component {
  constructor() {
    super();

    this.state = {
      html: ''
    };
  }

  componentDidMount() {
    // 写新文章时才从 localStorage 中读取 markdown，编辑文章不读取
    if (!this.props.meditor.markdown) {
      this.props.dispatch(updateMarkdown(localStorage.markdown));
      this.setState({ html: marked(localStorage.markdown) });
      this.codemirror.setValue(localStorage.markdown);
    } else {
      // 初始化设置 codemirror value
      this.codemirror.setValue(this.props.meditor.markdown);
      this.setState({ html: marked(this.props.meditor.markdown) });
    }
  }

  // CodeMirror 发生变化时更新 store 中 markdown并同步更新 localStorage
  onChangeMarkdown = (value) => {
    this.props.dispatch(updateMarkdown(value));
    this.setState({ html: marked(value) });
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
      <div>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Toolbar codemirror={this.codemirror} />
        <div className="markdown">
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
          <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: this.state.html }} />
        </div>
      </div>
    );
  }
}

export default connect(state => state)(Markdown);

/**
 * Code代码采用 highlight.js 渲染
 */

import React, { Component } from 'react';
import highlight from 'highlight.js';

class CodeBlock extends Component {
  constructor(props) {
    super(props);
    this.setRef = this.setRef.bind(this);
  }

  setRef(el) {
    this.codeEl = el;
  }

  componentDidMount() {
    this.highlightCode();
  }

  componentDidUpdate() {
    this.highlightCode();
  }

  highlightCode() {
    highlight.highlightBlock(this.codeEl);
  }

  render() {
    return (
      <pre>
        <code ref={this.setRef}>
          {this.props.value}
        </code>
      </pre>
    );
  }
}

export default CodeBlock;

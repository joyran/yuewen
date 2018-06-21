/**
 * markdown编辑器 工具栏
 */

import React from 'react';
import { Tooltip, Icon, Button, message, Select, Popover } from 'antd';
import { connect } from 'react-redux';
import AddImgModal from './add-img-modal';
import AddLinkModal from './add-link-modal';
import AddTableModal from './add-table-modal';
import ReleaseArticleModal from './release-article-modal';
import {
  toggleAddImgModal,
  toggleAddLinkModal,
  toggleAddTableModal,
  toggleReleaseArticleModal
} from '../../reducers/markdown-toolbar';
import {
  createArticle,
  updateArticle,
  updateModeToView,
  updateModeToEdit,
  updateModeToNormal
} from '../../reducers/markdown-editor';

const Option = Select.Option;

const Toolbar = (props) => {
  var addImgForm = null;
  var addLinkForm = null;
  var addTableForm = null;
  var releaseArticleForm = null;
  var { codemirror } = props;

  const saveAddImgFormRef = (form) => {
    addImgForm = form;
  };

  const saveAddLinkFormRef = (form) => {
    addLinkForm = form;
  };

  const saveAddTableFormRef = (form) => {
    addTableForm = form;
  };

  const saveReleaseArticleFormRef = (form) => {
    releaseArticleForm = form;
  };

  // 点击插入图片模态框确定按钮后在编辑框中插入图片地址，关闭模态框
  const onOkImgModal = (e) => {
    e.preventDefault();
    addImgForm.validateFields((err, values) => {
      if (!err) {
        const { imgUrl, imgLink } = values;
        const imgDesc = values.imgDesc ? values.imgDesc : '';
        const img = imgLink ? `[![](${imgUrl} "${imgDesc}")](${imgLink})` : `![](${imgUrl} "${imgDesc}")`;

        // 在光标位置插入内容
        const { from, to } = props.meditor.cursor;
        codemirror.doc.replaceRange(img, from, to);

        // 关闭模态框
        props.dispatch(toggleAddImgModal());
      }
    });
  };

  // 点击插入链接模态框按钮确定按钮
  const onOkLinkModal = (e) => {
    e.preventDefault();
    addLinkForm.validateFields((err, values) => {
      if (!err) {
        const { linkUrl, linkDesc } = values;
        const link = linkDesc ? `[${linkDesc}](${linkUrl})` : `<${linkUrl}>`;

        // 在光标位置插入内容
        const { from, to } = props.meditor.cursor;
        codemirror.doc.replaceRange(link, from, to);

        // 关闭模态框
        props.dispatch(toggleAddLinkModal());
      }
    });
  };

  const onOkTableModal = (e) => {
    var table = '|';
    e.preventDefault();
    addTableForm.validateFields((err, values) => {
      if (!err) {
        const { row, col, align } = values;

        // 表头
        for (let i = 0; i < col; i += 1) {
          table += '    |';
        }
        table += '\n|';

        // 对齐方式
        for (let i = 0; i < col; i += 1) {
          if (align === 'left') {
            table += ' :---- |';
          } else if (align === 'center') {
            table += ' :----: |';
          } else if (align === 'right') {
            table += ' ----: |';
          }
        }

        // 表格内容
        for (let i = 0; i < row; i += 1) {
          table += '\n|';
          for (let j = 0; j < col; j += 1) {
            table += '    |';
          }
        }

        // 在光标位置插入内容
        const { from, to } = props.meditor.cursor;
        codemirror.doc.replaceRange(table, from, to);

        // 关闭模态框
        props.dispatch(toggleAddTableModal());
      }
    });
  };

  // 在光标位置处插入 粗体文本
  const addBoldText = () => {
    const { from, to } = props.meditor.cursor;
    codemirror.doc.replaceRange('**粗体文本**', from, to);

    // 选中 粗体文本 并 focus
    codemirror.doc.setSelection({ line: from.line, ch: from.ch + 2 }, { line: from.line, ch: from.ch + 6 });
    codemirror.focus();
  };

  // 在光标位置处插入 斜体文本
  const addItalicText = () => {
    const { from, to } = props.meditor.cursor;
    codemirror.doc.replaceRange('*斜体文本*', from, to);

    // 选中 斜体文本 并 focus
    codemirror.doc.setSelection({ line: from.line, ch: from.ch + 1 }, { line: from.line, ch: from.ch + 5 });
    codemirror.focus();
  };

  // 在光标位置处插入 段落引用
  const addQuoteText = () => {
    const { from, to } = props.meditor.cursor;
    codemirror.doc.replaceRange('\n> 段落引用\n', from, to);

    // 选中 段落引用 并 focus
    codemirror.doc.setSelection({ line: from.line + 1, ch: 2 }, { line: from.line + 1, ch: 6 });
    codemirror.focus();
  };

  // 在光标位置处插入 行内代码
  const addInlineCode = () => {
    const { from, to } = props.meditor.cursor;
    codemirror.doc.replaceRange('`此处输入代码`', from, to);

    // 选中 段落引用 并 focus
    codemirror.doc.setSelection({ line: from.line, ch: from.ch + 1 }, { line: from.line, ch: from.ch + 7 });
    codemirror.focus();
  };

  // 在光标位置处插入 块级代码
  const addBlockCode = () => {
    const { from, to } = props.meditor.cursor;
    const text = '\n```\n此处输入代码\n```\n';
    codemirror.doc.replaceRange(text, from, to);

    // 选中 段落引用 并 focus
    codemirror.doc.setSelection({ line: from.line + 2, ch: 0 }, { line: from.line + 2, ch: 6 });
    codemirror.focus();
  };

  // 在光标位置处插入 有序列表
  const addUlItem = () => {
    const { from, to } = props.meditor.cursor;
    const text = '\n1. 有序列表\n';
    codemirror.doc.replaceRange(text, from, to);

    // 选中 段落引用 并 focus
    codemirror.doc.setSelection({ line: from.line + 1, ch: 3 }, { line: from.line + 1, ch: 7 });
    codemirror.focus();
  };

  // 在光标位置处插入 无序列表
  const addOlItem = () => {
    const { from, to } = props.meditor.cursor;
    const text = '\n- 无序列表\n';
    codemirror.doc.replaceRange(text, from, to);

    // 选中 段落引用 并 focus
    codemirror.doc.setSelection({ line: from.line + 1, ch: 2 }, { line: from.line + 1, ch: 6 });
    codemirror.focus();
  };

  // 切换到编辑模式
  const changeModeToEdit = () => {
    props.dispatch(updateModeToEdit());
  };

  // 切换到阅读模式
  const changeModeToView = () => {
    props.dispatch(updateModeToView());
  };

  // 切换到正常模式
  const changeModeToNormal = () => {
    props.dispatch(updateModeToNormal());
  };

  // 点击 发布文章 模态框确定按钮后发布文章
  const onOkReleaseArticleModal = (e) => {
    e.preventDefault();
    releaseArticleForm.validateFields((err, values) => {
      if (!err) {
        const { title, topics } = values;

        // markdown 解析后的 html
        const html = document.getElementsByClassName('markdown-preview')[0].innerHTML;

        // 摘要，取 html前 150个字符
        const excerpt = document.getElementsByClassName('markdown-preview')[0].textContent.substring(0, 150);

        if (props.meditor.aid) {
          // 更新文章
          props.dispatch(updateArticle(props.meditor.aid, title, excerpt, topics, html));
        } else {
          // 新增文章
          props.dispatch(createArticle(title, excerpt, topics, html));
        }
      }
    });
  };

  // 上传图片成功后回调
  const onChangeDragger = (info) => {
    const status = info.file.status;
    if (status === 'done') {
      // 上传完成后修改 imgUrl 表单
      addImgForm.setFieldsValue({ imgUrl: info.file.response.filepath });
      message.success('图片上传成功');
    }
  };

  // 点击 【发布文章】 按钮发布文章
  const onClickReleaseArticleButton = () => {
    if (!props.meditor.markdown) {
      message.error('文章内容不能为空！');
      return false;
    }
    props.dispatch(toggleReleaseArticleModal());
  };

  // 光标位置处插入 emoji 表情
  const addEmoji = (emoji) => {
    const { from, to } = props.meditor.cursor;
    codemirror.doc.replaceRange(emoji, from, to);
    codemirror.focus();
  };

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
          return <li data-emoji={emoji} onClick={() => addEmoji(emoji)} key={index}>{emoji}</li>;
        })
      }
    </ul>
  );

  return (
    <div className="toolbar">
      <ol>
        <Tooltip placement="bottom" title="图片">
          <li onClick={() => { props.dispatch(toggleAddImgModal()); }} style={{ marginLeft: 16 }} >
            <Icon type="picture" />
          </li>
        </Tooltip>
        <Tooltip placement="bottom" title="链接">
          <li onClick={() => { props.dispatch(toggleAddLinkModal()); }}><Icon type="link" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="表格">
          <li onClick={() => { props.dispatch(toggleAddTableModal()); }}><Icon type="table" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="粗体">
          <li onClick={addBoldText}><Icon className="anticon-user-define" type="bold" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="斜体">
          <li onClick={addItalicText}><Icon className="anticon-user-define" type="italic" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="引用">
          <li onClick={addQuoteText}><Icon className="anticon-user-define" type="quote" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="行内代码">
          <li onClick={addInlineCode}><Icon className="anticon-user-define" type="code-inline" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="代码块">
          <li onClick={addBlockCode}><Icon className="anticon-user-define" type="code-block" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="有序列表">
          <li onClick={addUlItem}><Icon className="anticon-user-define" type="ul" /></li>
        </Tooltip>
        <Tooltip placement="bottom" title="无序列表">
          <li onClick={addOlItem}><Icon className="anticon-user-define" type="ol" /></li>
        </Tooltip>
        <Popover overlayClassName="popover-emojis" content={content} trigger="click" placement="bottom">
          <Tooltip placement="bottom" title="添加 emoji 表情">
            <li><Icon type="smile-o" /></li>
          </Tooltip>
        </Popover>
        <div className="right-div">
          <Tooltip placement="bottom" title="编辑模式">
            <li onClick={changeModeToEdit}><Icon type="edit" /></li>
          </Tooltip>
          <Tooltip placement="bottom" title="阅读模式">
            <li onClick={changeModeToView}><Icon type="desktop" /></li>
          </Tooltip>
          <Tooltip placement="bottom" title="正常模式">
            <li onClick={changeModeToNormal}><Icon type="laptop" /></li>
          </Tooltip>
          <Button
            style={{ marginLeft: 46 }}
            type="primary"
            ghost
            onClick={onClickReleaseArticleButton}
          >
            发布文章
          </Button>
        </div>
      </ol>
      {/* 插入图片模态框 */}
      <AddImgModal
        ref={saveAddImgFormRef}
        visible={props.mtoolbar.addImgModalVisible}
        onOk={e => onOkImgModal(e)}
        onCancel={() => { props.dispatch(toggleAddImgModal()); }}
        onChange={info => onChangeDragger(info)}
      />
      {/* 插入链接模态框 */}
      <AddLinkModal
        ref={saveAddLinkFormRef}
        visible={props.mtoolbar.addLinkModalVisible}
        onOk={e => onOkLinkModal(e)}
        onCancel={() => { props.dispatch(toggleAddLinkModal()); }}
      />
      {/* 插入表格模态框 */}
      <AddTableModal
        ref={saveAddTableFormRef}
        visible={props.mtoolbar.addTableModalVisible}
        onOk={e => onOkTableModal(e)}
        onCancel={() => { props.dispatch(toggleAddTableModal()); }}
      />
      {/* 发布文章模态框 */}
      <ReleaseArticleModal
        ref={saveReleaseArticleFormRef}
        visible={props.mtoolbar.releaseArticleModalVisible}
        onOk={e => onOkReleaseArticleModal(e)}
        onCancel={() => { props.dispatch(toggleReleaseArticleModal()); }}
        topics={props.topics.data.map(topic => <Option key={topic.topic}>{topic.topic}</Option>)}
      />
    </div>
  );
};

export default connect(state => state)(Toolbar);

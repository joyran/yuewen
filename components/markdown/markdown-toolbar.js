/**
 * markdown编辑器 工具栏
 */

import React from 'react';
import { Tooltip, Icon, Button, message, Select } from 'antd';
import { connect } from 'react-redux';
import AddImgModal from './add-img-modal';
import AddLinkModal from './add-link-modal';
import AddTableModal from './add-table-modal';
import ReleaseArticleModal from './release-article-modal';
import { toggleAddImgModal, toggleAddLinkModal, toggleAddTableModal, toggleReleaseArticleModal } from '../../reducers/markdown-toolbar';
import { updateMarkdown, createArticle } from '../../reducers/markdown-editor';
import stylesheet from './toolbar.scss';

const Option = Select.Option;

const MarkdownToolbar = (props) => {
  var addImgForm = null;
  var addLinkForm = null;
  var addTableForm = null;
  var releaseArticleForm = null;

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
        const markdownLeft = props.meditor.markdown.substr(0, props.meditor.cursorIndex);
        const markdownRight = props.meditor.markdown.substr(props.meditor.cursorIndex);
        const markdown = `${markdownLeft}${img}${markdownRight}`;

        // 更新 markdown 并写入 localStorage
        props.dispatch(updateMarkdown(markdown));
        localStorage.markdown = markdown;
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
        const markdownLeft = props.meditor.markdown.substr(0, props.meditor.cursorIndex);
        const markdownRight = props.meditor.markdown.substr(props.meditor.cursorIndex);
        const markdown = `${markdownLeft}${link}${markdownRight}`;

        // 更新 markdown 并写入 localStorage
        props.dispatch(updateMarkdown(markdown));
        localStorage.markdown = markdown;
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
        const markdownLeft = props.meditor.markdown.substr(0, props.meditor.cursorIndex);
        const markdownRight = props.meditor.markdown.substr(props.meditor.cursorIndex);
        const markdown = `${markdownLeft}${table}${markdownRight}`;

        // 更新 markdown 并写入 localStorage
        props.dispatch(updateMarkdown(markdown));
        localStorage.markdown = markdown;
        // 关闭模态框
        props.dispatch(toggleAddTableModal());
      }
    });
  };

  // 点击 发布文章 模态框确定按钮后发布文章
  const onOkReleaseArticleModal = (e) => {
    e.preventDefault();
    releaseArticleForm.validateFields((err, values) => {
      if (!err) {
        const { title, tags } = values;
        // markdown 解析后的 html
        const markup = document.getElementsByClassName('article-preview')[0].innerHTML;
        // 摘要，取 html前 150个字符
        const digest = document.getElementsByClassName('article-preview')[0].textContent.substring(0, 150);
        // 发布文章
        props.dispatch(createArticle(title, digest, tags, markup));
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

  const onClickReleaseArticleButton = () => {
    if (!props.meditor.markdown) {
      message.error('文章内容不能为空！');
      return false;
    }
    props.dispatch(toggleReleaseArticleModal());
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <div className="toolbar">
        <ol>
          <Tooltip placement="bottom" title="图片">
            <li onClick={() => { props.dispatch(toggleAddImgModal()); }} ><Icon type="picture" /></li>
          </Tooltip>
          <Tooltip placement="bottom" title="链接">
            <li onClick={() => { props.dispatch(toggleAddLinkModal()); }}><Icon type="link" /></li>
          </Tooltip>
          <Tooltip placement="bottom" title="表格">
            <li onClick={() => { props.dispatch(toggleAddTableModal()); }}><Icon type="calendar" /></li>
          </Tooltip>
          <li className="release">
            <Button
              type="primary"
              ghost
              onClick={onClickReleaseArticleButton}
            >
              发布文章
            </Button>
          </li>
        </ol>
      </div>
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
        tags={props.mtoolbar.tags.map(tag => <Option key={tag.tag}>{tag.tag}</Option>)}
      />
    </div>
  );
};

export default connect(state => state)(MarkdownToolbar);

/**
 * 个人主页头
 */

import React, { Component } from 'react';
import { Button, Upload, message, Icon, Modal, Slider } from 'antd';
import AvatarEditor from 'react-avatar-editor';
import { connect } from 'react-redux';
import moment from 'moment';
import { cropAvatar, cropBanner, deleteBanner } from '../../reducers/profile';

// 时间汉化
moment.locale('zh-cn');

class ProfileHeader extends Component {
  constructor() {
    super();

    this.state = {
      avatarEditorModalVisible: false,
      avatarEditorUrl: '',
      avatarScale: 1,
      bannerEditorModalVisible: false,
      bannerEditorUrl: '',
      bannerScale: 1
    };
  }

  beforeUpload = (file) => {
    // 允许上传的 mimetype
    const allowTypes = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png'];
    if (allowTypes.indexOf(file.type) === -1) {
      message.error('文件类型非法，只能上传图片！');
      return false;
    }
  }

  onChangeBanner = (info) => {
    const status = info.file.status;
    if (status === 'done') {
      // 上传完成后弹出对话框裁剪 banner
      this.setState({
        bannerEditorModalVisible: !this.state.bannerEditorModalVisible,
        bannerEditorUrl: info.file.response.filepath
      });
      // this.props.dispatch(updateProfileBanner(info.file.response.filepath));
    }
  }

  onChangeAvatar = (info) => {
    const status = info.file.status;
    if (status === 'done') {
      // 上传完成后弹出对话框裁剪头像
      this.setState({
        avatarEditorModalVisible: !this.state.avatarEditorModalVisible,
        avatarEditorUrl: info.file.response.filepath
      });
    }
  }

  onCancelAvatar = () => {
    this.setState({ avatarEditorModalVisible: !this.state.avatarEditorModalVisible });
  }

  onCancelBanner = () => {
    this.setState({ bannerEditorModalVisible: !this.state.bannerEditorModalVisible });
    this.props.dispatch(deleteBanner(this.state.bannerEditorUrl));
  }

  onOkAvatar = () => {
    var originalWidth;
    var originalHeight;

    if (this.avatarEditor) {
      // 计算图片原始宽度和高度
      // 图片缩小后在 canvas 中宽度 width
      const imageWidth = this.avatarEditor.state.image.width;
      // 图片缩小后在 canvas 中高度 height
      const imageHeight = this.avatarEditor.state.image.height;
      // 由于 canvas 大小为 160*160 正方形，如果高度大于宽度，则高度溢出，以宽度为基准计算图片高度
      if (imageHeight >= imageWidth) {
        originalWidth = this.avatarEditor.getImage().width * this.state.avatarScale;
        originalHeight = (originalWidth * imageHeight) / imageWidth;
      } else {
        originalHeight = this.avatarEditor.getImage().height * this.state.avatarScale;
        originalWidth = (originalHeight * imageWidth) / imageHeight;
      }

      // 图片裁剪后的 x 和 y 偏移，width 和 height 缩放比例
      const crop = this.avatarEditor.getCroppingRect();
      const x = originalWidth * crop.x;
      const y = originalHeight * crop.y;
      const width = originalWidth * crop.width;
      const height = originalHeight * crop.height;

      // 从文件路径中读取文件名
      const arr = this.state.avatarEditorUrl.split('/');
      const filename = arr[arr.length - 1];

      // 上传参数在服务端裁剪头像并压缩
      this.props.dispatch(cropAvatar(width, height, x, y, filename));

      // 关闭模态框
      this.setState({ avatarEditorModalVisible: !this.state.avatarEditorModalVisible });
    }
  }

  onOkBanner = () => {
    var originalWidth;
    var originalHeight;

    if (this.bannerEditor) {
      // 计算图片原始宽度和高度
      // 图片缩小后在 canvas 中宽度 width
      const imageWidth = this.bannerEditor.state.image.width;
      // 图片缩小后在 canvas 中高度 height
      const imageHeight = this.bannerEditor.state.image.height;
      // 由于 canvas 大小为 900*220 长方形，如果高度大于 220，则高度溢出，以宽度为基准计算图片高度
      if (imageHeight >= 220) {
        originalWidth = this.bannerEditor.getImage().width * this.state.bannerScale;
        originalHeight = (originalWidth * imageHeight) / imageWidth;
      } else {
        originalHeight = this.bannerEditor.getImage().height * this.state.bannerScale;
        originalWidth = (originalHeight * imageWidth) / imageHeight;
      }

      // 图片裁剪后的 x 和 y 偏移，width 和 height 缩放比例
      const crop = this.bannerEditor.getCroppingRect();
      const x = originalWidth * crop.x;
      const y = originalHeight * crop.y;
      const width = originalWidth * crop.width;
      const height = originalHeight * crop.height;

      // 从文件路径中读取文件名
      const arr = this.state.bannerEditorUrl.split('/');
      const filename = arr[arr.length - 1];

      // 上传参数在服务端裁剪 banner 并压缩
      this.props.dispatch(cropBanner(width, height, x, y, filename));

      // 关闭模态框
      this.setState({ bannerEditorModalVisible: !this.state.bannerEditorModalVisible });
    }
  }

  onChangeAvatarScale = (value) => {
    this.setState({ avatarScale: value });
  }

  onChangeBannerScale = (value) => {
    this.setState({ bannerScale: value });
  }

  avatarEditorRef = (editor) => {
    this.avatarEditor = editor;
    return this.avatarEditor;
  }

  bannerEditorRef = (editor) => {
    this.bannerEditor = editor;
    return this.bannerEditor;
  }

  render() {
    return (
      <div className="profile-header">
        <div className="profile-header-banner-tip" style={{ backgroundImage: `url(${this.props.profile.banner_url})` }}>
          { this.props.session._id === this.props.profile._id ?
            <Upload
              name="file"
              beforeUpload={this.beforeUpload}
              onChange={this.onChangeBanner}
              action="/api/v1/upload/banner"
              showUploadList={false}
            >
              {
                this.props.profile.banner_url ? <Button ghost>编辑封面图片</Button> : <Button ghost>上传封面图片</Button>
              }
            </Upload> : ''
          }
        </div>
        <div className="profile-header-wrapper">
          <div className="profile-header-avatar-wrapper">
            <img src={this.props.profile.avatar_url} alt={this.props.profile.name} className="profile-header-avatar" />
            { this.props.session._id === this.props.profile._id ?
              <Upload
                name="file"
                beforeUpload={this.beforeUpload}
                onChange={this.onChangeAvatar}
                action="/api/v1/upload/avatar"
                showUploadList={false}
              >
                <div className="profile-header-avatar-mask">
                  <Icon type="camera" />
                  <p className="profile-header-avatar-mask-title">修改我的头像</p>
                </div>
              </Upload> : ''
            }
          </div>

          <Modal
            title="调整头像尺寸和位置"
            visible={this.state.avatarEditorModalVisible}
            onOk={this.onOkAvatar}
            onCancel={this.onCancelAvatar}
            maskClosable={false}
            className="avatar-editor-modal"
          >
            <AvatarEditor
              ref={this.avatarEditorRef}
              image={this.state.avatarEditorUrl}
              width={160}
              height={160}
              border={50}
              scale={this.state.avatarScale}
              color={[247, 248, 250, 0.8]}
              rotate={0}
              disableDrop
            />
            <div className="icon-wrapper">
              <Icon type="picture" />
              <Slider step={0.01} tipFormatter={null} min={1} max={3} onChange={this.onChangeAvatarScale} value={this.state.avatarScale} />
              <Icon type="picture" />
            </div>
          </Modal>

          <Modal
            title="调整封面图片尺寸和位置"
            visible={this.state.bannerEditorModalVisible}
            onOk={this.onOkBanner}
            onCancel={this.onCancelBanner}
            maskClosable={false}
            className="avatar-editor-modal"
            width={1100}
          >
            <AvatarEditor
              ref={this.bannerEditorRef}
              image={this.state.bannerEditorUrl}
              width={900}
              height={220}
              border={50}
              scale={this.state.bannerScale}
              color={[247, 248, 250, 0.8]}
              rotate={0}
              disableDrop
            />
            <div className="icon-wrapper">
              <Icon type="picture" />
              <Slider step={0.01} tipFormatter={null} min={1} max={3} onChange={this.onChangeBannerScale} value={this.state.bannerScale} />
              <Icon type="picture" />
            </div>
          </Modal>

          <div className="profile-header-content">
            <div className="profile-header-title">
              <span className="profile-header-username">{this.props.profile.name}</span>
              <span className="profile-header-bio">{this.props.profile.bio}</span>
            </div>
            { this.props.session._id === this.props.profile._id ?
              <Button type="primary" className="profile-header-edit">编辑个人资料</Button> : ''
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state)(ProfileHeader);

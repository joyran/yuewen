/**
 * 修改密码模态框
 */

import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import crypto from 'crypto';

const FormItem = Form.Item;
const networkErrorMsg = '网络连接失败，请刷新重试！';

class ChangePasswordModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { confirmDirty: false };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        fetch('/api/v1/user/password', {
          credentials: 'include',
          method: 'put',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            oldpassword: crypto.createHash('md5').update(values.oldpassword).digest('hex'),
            newpassword: crypto.createHash('md5').update(values.newpassword).digest('hex')
          })
        })
          .then(res => res.json())
          .then((res) => {
            if (res.message) {
              message.error(res.message);
            } else {
              message.success('密码修改成功');
              top.location = '/login';
            }
          })
          .catch((error) => {
            console.error(error.message);
            message.error(networkErrorMsg);
          });
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newpassword')) {
      callback('两次密码输入不一致！');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirmPassword'], { force: true });
    }
    callback();
  }

  render() {
    const { visible, handleCancel } = this.props;
    const { getFieldDecorator, resetFields } = this.props.form;

    const formItemLayout = {
      labelCol: {
        sm: { span: 6 }
      },
      wrapperCol: {
        sm: { span: 18 }
      }
    };

    return (
      <Modal
        title="修改密码"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={handleCancel}
        afterClose={resetFields}
      >
        <Form onSubmit={this.handleSubmit}>
          <FormItem label="旧密码" {...formItemLayout}>
            {getFieldDecorator('oldpassword', {
              rules: [{ required: true, message: '旧密码必填' }]
            })(
              <Input type="password" />
            )}
          </FormItem>
          <FormItem label="新密码" {...formItemLayout}>
            {getFieldDecorator('newpassword', {
              rules: [
                { required: true, message: '密码长度不能小于8位', min: 8 },
                { validator: this.validateToNextPassword }
              ]
            })(
              <Input type="password" />
            )}
          </FormItem>
          <FormItem label="确认新密码" {...formItemLayout}>
            {getFieldDecorator('confirmPassword', {
              rules: [
                { required: true, message: '密码长度不能小于8位', min: 8 },
                { validator: this.compareToFirstPassword }
              ]
            })(
              <Input type="password" onBlur={this.handleConfirmBlur} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const WrappedChangePasswordModal = Form.create()(ChangePasswordModal);

export default WrappedChangePasswordModal;

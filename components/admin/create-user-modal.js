/**
 * 新增用户模态框
 */

import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

const CreateUserModal = Form.create()(
  (props) => {
    const { visible, onCancel, onOk, form } = props;
    const { getFieldDecorator, resetFields } = form;

    const formItemLayout = {
      labelCol: {
        sm: { span: 4 }
      },
      wrapperCol: {
        sm: { span: 20 }
      }
    };

    return (
      <Modal
        title="新增用户"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        afterClose={resetFields}
      >
        <Form>
          <FormItem {...formItemLayout} label="昵称" >
            { getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入昵称' }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="用户名" >
            { getFieldDecorator('login', {
              rules: [{ required: true, message: '请输入用户名' }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="邮箱" >
            { getFieldDecorator('mail', {
              rules: [{ required: true, message: '请输入邮箱' }],
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

export default CreateUserModal;

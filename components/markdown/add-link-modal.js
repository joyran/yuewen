/**
 * 添加链接模态框
 */

import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

const AddLinkModal = Form.create()(
  (props) => {
    const { visible, onCancel, onOk, form } = props;
    const { getFieldDecorator, resetFields } = form;

    const formItemLayout = {
      labelCol: {
        sm: { span: 3 }
      },
      wrapperCol: {
        sm: { span: 21 }
      }
    };

    return (
      <Modal
        title="插入链接"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        afterClose={resetFields}
      >
        <Form>
          <FormItem {...formItemLayout} label="地址" >
            { getFieldDecorator('linkUrl', {
              rules: [{ required: true, message: '请输入地址' }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="描述" >
            { getFieldDecorator('linkDesc')(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

export default AddLinkModal;

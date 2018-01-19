/**
 * 添加表格模态框
 */

import { Modal, Form, InputNumber, Radio } from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const AddTableModal = Form.create()(
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
        title="插入表格"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        afterClose={resetFields}
      >
        <Form>
          <FormItem {...formItemLayout} label="行数" >
            { getFieldDecorator('row', {
              rules: [{ required: true, message: '请输入行数' }],
            })(
              <InputNumber />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="列数" >
            { getFieldDecorator('col', {
              rules: [{ required: true, message: '请输入列数' }],
            })(
              <InputNumber />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="对齐" >
            { getFieldDecorator('align', {
              rules: [{ required: true, message: '请选择对齐方式' }],
              initialValue: 'left'
            })(
              <RadioGroup>
                <Radio value="left">居左</Radio>
                <Radio value="center">居中</Radio>
                <Radio value="right">居右</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

export default AddTableModal;

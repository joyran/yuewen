/**
 * 发布文章模态框
 */

import { Modal, Form, Input, Select } from 'antd';

const FormItem = Form.Item;

const ReleaseArticleModal = Form.create()(
  (props) => {
    const { visible, onCancel, onOk, form, tags } = props;
    const { getFieldDecorator } = form;

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
        title="发布文章"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
      >
        <Form>
          <FormItem {...formItemLayout} label="标题" >
            { getFieldDecorator('title', {
              rules: [{ required: true, message: '请输入标题' }],
            })(
              <Input placeholder="标题" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="标签" >
            { getFieldDecorator('tags', {
              rules: [{ required: true, message: '请选择标签' }],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
                placeholder="标签"
              >
                {tags}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

export default ReleaseArticleModal;

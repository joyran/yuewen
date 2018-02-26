/**
 * 上传图片模态框
 */

import { Modal, Form, Input, Upload, Icon, message } from 'antd';

const FormItem = Form.Item;
const Dragger = Upload.Dragger;

const AddImgModal = Form.create()(
  (props) => {
    const { visible, onCancel, onOk, onChange, form } = props;
    const { getFieldDecorator, resetFields } = form;

    const formItemLayout = {
      labelCol: {
        sm: { span: 3 }
      },
      wrapperCol: {
        sm: { span: 21 }
      }
    };

    const beforeUpload = (file) => {
      // 允许上传的 mimetype
      const allowTypes = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png'];
      if (allowTypes.indexOf(file.type) === -1) {
        message.error('文件类型非法，只能上传图片！');
        return false;
      }
    };

    return (
      <Modal
        title="插入图片"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        afterClose={resetFields}
      >
        <Dragger
          name="file"
          showUploadList={false}
          action="/api/v1/upload/article"
          onChange={onChange}
          beforeUpload={beforeUpload}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">单击或者拖到图片到此</p>
          <p className="ant-upload-hint">仅支持 jpg,jpeg,png,bmp,gif 格式</p>
        </Dragger>
        <Form>
          <FormItem {...formItemLayout} label="地址" >
            { getFieldDecorator('imgUrl', {
              rules: [{ required: true, message: '请输入图片地址' }],
            })(
              <Input placeholder="地址" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="描述" >
            { getFieldDecorator('imgDesc')(
              <Input placeholder="描述" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="链接" >
            { getFieldDecorator('imgLink')(
              <Input placeholder="链接" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);

export default AddImgModal;

/**
 * 新增用户模态框
 */

import { Modal, Form, Input, Upload, message, Icon } from 'antd';

const FormItem = Form.Item;
const { TextArea } = Input;

const CreateTopicModal = Form.create()(
  (props) => {
    const { visible, onCancel, onOk, form, onChange, avatar, loading } = props;
    const { getFieldDecorator, resetFields } = form;

    const beforeUpload = (file) => {
      // 允许上传的 mimetype
      const allowTypes = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png'];
      if (allowTypes.indexOf(file.type) === -1) {
        message.error('文件类型非法，只能上传图片！');
        return false;
      }
    };

    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传封面</div>
      </div>
    );

    return (
      <div>
        <Modal
          title="新增话题"
          visible={visible}
          onOk={onOk}
          onCancel={onCancel}
          afterClose={resetFields}
        >
          <Upload
            name="file"
            action="/api/v1/upload/topic"
            listType="picture-card"
            onChange={onChange}
            showUploadList={false}
            beforeUpload={beforeUpload}
            withCredentials
          >
            {avatar ? <img src={avatar} alt="avatar" /> : uploadButton}
          </Upload>
          <Form layout="vertical" style={{ marginTop: 24 }}>
            <FormItem label="话题" >
              { getFieldDecorator('topic', {
                rules: [{ required: true, message: '请输入话题' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="描述" >
              { getFieldDecorator('description', {
                rules: [{ required: true, message: '请输入描述' }],
              })(
                <TextArea autosize={{ minRows: 2 }} />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
);

export default CreateTopicModal;

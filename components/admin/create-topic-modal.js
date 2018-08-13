/**
 * 新增用户模态框
 */

import { Modal, Form, Input, Upload, message, Icon } from 'antd';

const FormItem = Form.Item;
// const Dragger = Upload.Dragger;
const { TextArea } = Input;

const CreateTopicModal = Form.create()(
  (props) => {
    const {
      visible, onCancel, onOk, form, onChange, avatar } = props;
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
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
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
            name="avatar"
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
            <FormItem label="封面" >
              { getFieldDecorator('avatar_url', {
                rules: [{ required: true, message: '请上传封面' }],
              })(
                <Input />
              )}
            </FormItem>
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

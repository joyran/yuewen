/**
 * 登录表单
 */

import { Form, Input, Button, Checkbox } from 'antd';
import crypto from 'crypto';
import { connect } from 'react-redux';
import { signin } from '../../reducers/login';
import stylesheet from './index.scss';

const FormItem = Form.Item;

const LoginFormUI = (props) => {
  const { getFieldDecorator } = props.form;

  // 登录
  const handleSubmit = (e) => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        const username = values.username;
        const password = crypto.createHash('md5').update(values.password).digest('hex');   // 密码 MD5 加密
        const remember = values.remember;
        props.dispatch(signin(username, password, remember));
      }
    });
  };

  return (
    <Form onSubmit={e => handleSubmit(e)} style={{ margin: '100px auto' }}>
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <h1>悦文 · 登录</h1>
      <FormItem>
        { getFieldDecorator('username', {
          rules: [{ required: true, message: '请输入用户名/邮箱' }],
        })(
          <Input placeholder="用户名/邮箱" />
        )}
      </FormItem>
      <FormItem>
        { getFieldDecorator('password', {
          rules: [{ required: true, message: '请输入密码' }],
        })(
          <Input type="password" placeholder="密码" />
        )}
      </FormItem>
      <FormItem>
        { getFieldDecorator('remember', {
          valuePropName: 'checked',
          initialValue: true,
        })(
          <Checkbox>下次自动登录</Checkbox>
        )}
        <a>忘记密码</a>
        <Button
          type="primary"
          htmlType="submit"
          loading={props.login.loading}
        >
          {props.login.label}
        </Button>
      </FormItem>
    </Form>
  );
};

const LoginFrom = Form.create()(LoginFormUI);
export default connect(state => state)(LoginFrom);

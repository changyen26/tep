/**
 * 登入頁面
 */
import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登入成功');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || '登入失敗，請檢查帳號密碼');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="login"
      onFinish={onFinish}
      autoComplete="off"
      size="large"
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: '請輸入帳號',
          },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="帳號"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: '請輸入密碼',
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密碼"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          style={{
            background: '#667eea',
            borderColor: '#667eea',
          }}
        >
          登入
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginPage;

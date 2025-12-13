/**
 * 登入頁面
 * 參考：平安符打卡系統 PDF 第6頁第1張
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 處理登入
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // TODO: 整合後端 API
      console.log('登入資料:', values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬 API 請求
      message.success('登入成功！');
      navigate('/');
    } catch (error) {
      message.error('登入失敗，請檢查信箱或密碼');
    } finally {
      setLoading(false);
    }
  };

  // 處理註冊
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // TODO: 整合後端 API
      console.log('註冊資料:', values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬 API 請求
      message.success('註冊成功！請登入');
      setIsRegisterMode(false);
    } catch (error) {
      message.error('註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 背景裝飾圖形 */}
      <div className="bg-decoration"></div>

      <div className="login-container">
        {/* Logo 區域 */}
        <div className="logo-section">
          <div className="logo-circle">
            <span className="logo-text">平安符</span>
          </div>
        </div>

        {/* 標語 */}
        <h1 className="login-title">
          加入松柏嶺受天宮，一同開啟<br />祈福之旅。
        </h1>

        {/* 登入/註冊表單 */}
        <div className="form-section">
          <h2 className="form-label">信箱</h2>
          <Form
            name={isRegisterMode ? 'register' : 'login'}
            onFinish={isRegisterMode ? handleRegister : handleLogin}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '請輸入信箱' },
                { type: 'email', message: '請輸入有效的信箱格式' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#999' }} />}
                placeholder="請輸入信箱..."
                size="large"
                className="login-input"
              />
            </Form.Item>

            <h2 className="form-label">密碼</h2>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '請輸入密碼' },
                { min: 6, message: '密碼至少需要6個字元' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="請輸入密碼..."
                size="large"
                className="login-input"
              />
            </Form.Item>

            {isRegisterMode && (
              <>
                <h2 className="form-label">確認密碼</h2>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '請確認密碼' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('兩次輸入的密碼不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#999' }} />}
                    placeholder="請再次輸入密碼..."
                    size="large"
                    className="login-input"
                  />
                </Form.Item>
              </>
            )}

            {!isRegisterMode && (
              <div className="forgot-password">
                <a href="#" onClick={(e) => { e.preventDefault(); message.info('忘記密碼功能開發中'); }}>
                  忘記密碼？
                </a>
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="login-button"
              >
                {isRegisterMode ? '註冊' : '登入'}
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                size="large"
                block
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="register-button"
              >
                {isRegisterMode ? '返回登入' : '註冊'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* 底部提示 */}
        <div className="bottom-hint">
          請登入會員或註冊新會員
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

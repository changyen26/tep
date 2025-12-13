/**
 * 使用者詳情頁面
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  message,
  Spin,
  Alert,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DollarOutlined,
  UserSwitchOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { getUserDetail, adjustUserPoints, updateUserRole, toggleUserStatus } from '../../api';
import { USER_ROLE_LABELS } from '../../utils/constants';
import { formatDateTime, formatPoints } from '../../utils/format';

const { Option } = Select;
const { TextArea } = Input;

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [pointsForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  // 查詢使用者詳情
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserDetail(id),
  });

  // 調整點數
  const adjustPointsMutation = useMutation({
    mutationFn: ({ amount, reason }) => adjustUserPoints(id, amount, reason),
    onSuccess: () => {
      message.success('功德點數調整成功');
      queryClient.invalidateQueries(['user', id]);
      setPointsModalVisible(false);
      pointsForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '功德點數調整失敗');
    },
  });

  // 變更角色
  const updateRoleMutation = useMutation({
    mutationFn: ({ role }) => updateUserRole(id, role),
    onSuccess: () => {
      message.success('角色變更成功');
      queryClient.invalidateQueries(['user', id]);
      setRoleModalVisible(false);
      roleForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '角色變更失敗');
    },
  });

  // 啟用/停用使用者
  const toggleStatusMutation = useMutation({
    mutationFn: () => toggleUserStatus(id),
    onSuccess: () => {
      message.success('使用者狀態變更成功');
      queryClient.invalidateQueries(['user', id]);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '狀態變更失敗');
    },
  });

  // 處理調整點數
  const handleAdjustPoints = () => {
    pointsForm.validateFields().then((values) => {
      adjustPointsMutation.mutate(values);
    });
  };

  // 處理變更角色
  const handleUpdateRole = () => {
    roleForm.validateFields().then((values) => {
      updateRoleMutation.mutate(values);
    });
  };

  // 處理啟用/停用
  const handleToggleStatus = () => {
    toggleStatusMutation.mutate();
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        title="載入失敗"
        description="無法載入使用者資料"
        type="error"
        showIcon
      />
    );
  }

  const user = data?.data || {};

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>
          返回列表
        </Button>
        <h1 style={{ margin: 0 }}>使用者詳情</h1>
      </Space>

      {/* 基本資訊 */}
      <Card
        title="基本資訊"
        extra={
          <Space>
            <Button
              icon={<DollarOutlined />}
              onClick={() => setPointsModalVisible(true)}
            >
              調整點數
            </Button>
            <Button
              icon={<UserSwitchOutlined />}
              onClick={() => setRoleModalVisible(true)}
            >
              變更角色
            </Button>
            <Popconfirm
              title={user.is_active ? '確定要停用此使用者嗎？' : '確定要啟用此使用者嗎？'}
              onConfirm={handleToggleStatus}
              okText="確定"
              cancelText="取消"
            >
              <Button
                danger={user.is_active}
                icon={user.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
                loading={toggleStatusMutation.isPending}
              >
                {user.is_active ? '停用' : '啟用'}
              </Button>
            </Popconfirm>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="使用者 ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="狀態">
            <Tag color={user.is_active ? 'green' : 'red'}>
              {user.is_active ? '啟用' : '停用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="姓名">{user.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="信箱">{user.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={user.role === 'temple_admin' ? 'blue' : 'default'}>
              {USER_ROLE_LABELS[user.role] || user.role}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="功德點數">
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
              {formatPoints(user.points || 0)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="註冊時間">
            {formatDateTime(user.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="最後更新">
            {formatDateTime(user.updated_at)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 統計資訊 */}
      <Card title="統計資訊" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總打卡次數"
              value={user.total_checkins || 0}
              suffix="次"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="連續打卡天數"
              value={user.streak_days || 0}
              suffix="天"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="兌換次數"
              value={user.total_redemptions || 0}
              suffix="次"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="累積獲得點數"
              value={user.total_points_earned || 0}
              suffix="點"
            />
          </Col>
        </Row>
      </Card>

      {/* 調整點數模態框 */}
      <Modal
        title="調整功德點數"
        open={pointsModalVisible}
        onOk={handleAdjustPoints}
        onCancel={() => {
          setPointsModalVisible(false);
          pointsForm.resetFields();
        }}
        confirmLoading={adjustPointsMutation.isPending}
      >
        <Form form={pointsForm} layout="vertical">
          <Form.Item
            label="調整數量"
            name="amount"
            rules={[
              { required: true, message: '請輸入調整數量' },
              { type: 'number', message: '請輸入有效數字' },
            ]}
            tooltip="正數為增加，負數為減少"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="例如：100 或 -50"
              min={-999999}
              max={999999}
            />
          </Form.Item>
          <Form.Item
            label="調整原因"
            name="reason"
            rules={[{ required: true, message: '請輸入調整原因' }]}
          >
            <TextArea
              rows={4}
              placeholder="請說明調整原因，例如：活動獎勵、違規扣點等"
            />
          </Form.Item>
          <Alert
            title="提示"
            description={`目前點數：${user.points || 0} 點`}
            type="info"
            showIcon
          />
        </Form>
      </Modal>

      {/* 變更角色模態框 */}
      <Modal
        title="變更使用者角色"
        open={roleModalVisible}
        onOk={handleUpdateRole}
        onCancel={() => {
          setRoleModalVisible(false);
          roleForm.resetFields();
        }}
        confirmLoading={updateRoleMutation.isPending}
      >
        <Form form={roleForm} layout="vertical" initialValues={{ role: user.role }}>
          <Form.Item
            label="新角色"
            name="role"
            rules={[{ required: true, message: '請選擇角色' }]}
          >
            <Select placeholder="請選擇角色">
              <Option value="user">一般使用者</Option>
              <Option value="temple_admin">廟宇管理員</Option>
            </Select>
          </Form.Item>
          <Alert
            title="注意"
            description="變更角色後，使用者的權限會立即改變"
            type="warning"
            showIcon
          />
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetailPage;

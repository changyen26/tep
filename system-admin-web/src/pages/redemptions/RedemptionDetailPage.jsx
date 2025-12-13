/**
 * 兌換詳情頁面
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
  message,
  Spin,
  Alert,
  Modal,
  Form,
  Select,
  Input,
} from 'antd';
import {
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { getRedemptionDetail, updateRedemptionStatus } from '../../api';
import { formatDateTime, formatPoints } from '../../utils/format';

const { TextArea } = Input;
const { Option } = Select;

// 兌換狀態配置
const REDEMPTION_STATUS = {
  pending: { label: '待處理', color: 'orange' },
  processing: { label: '處理中', color: 'blue' },
  shipped: { label: '已出貨', color: 'cyan' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'red' },
};

const RedemptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();

  // 查詢兌換詳情
  const { data, isLoading, error } = useQuery({
    queryKey: ['redemption', id],
    queryFn: () => getRedemptionDetail(id),
  });

  // 更新兌換狀態
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, remarks }) =>
      updateRedemptionStatus(id, status, remarks),
    onSuccess: () => {
      message.success('狀態更新成功');
      queryClient.invalidateQueries(['redemption', id]);
      setStatusModalVisible(false);
      statusForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '狀態更新失敗');
    },
  });

  // 開啟狀態更新對話框
  const handleUpdateStatus = () => {
    setStatusModalVisible(true);
  };

  // 提交狀態更新
  const handleStatusSubmit = () => {
    statusForm.validateFields().then((values) => {
      updateStatusMutation.mutate({
        status: values.status,
        remarks: values.remarks,
      });
    });
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
        message="載入失敗"
        description="無法載入兌換資料"
        type="error"
        showIcon
      />
    );
  }

  const redemption = data?.data || {};
  const statusConfig = REDEMPTION_STATUS[redemption.status] || { label: redemption.status, color: 'default' };

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/redemptions')}>
          返回列表
        </Button>
        <h1 style={{ margin: 0 }}>兌換詳情</h1>
      </Space>

      {/* 訂單資訊 */}
      <Card
        title="訂單資訊"
        extra={
          redemption.status !== 'completed' && redemption.status !== 'cancelled' && (
            <Button type="primary" onClick={handleUpdateStatus}>
              更新狀態
            </Button>
          )
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="訂單 ID">{redemption.id}</Descriptions.Item>
          <Descriptions.Item label="狀態">
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="兌換時間">
            {formatDateTime(redemption.redeemed_at)}
          </Descriptions.Item>
          <Descriptions.Item label="最後更新">
            {formatDateTime(redemption.updated_at)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 商品資訊 */}
      <Card title="商品資訊" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="商品名稱">{redemption.product_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="所屬廟宇">{redemption.temple_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="數量">{redemption.quantity || 0} 件</Descriptions.Item>
          <Descriptions.Item label="使用點數">
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
              {formatPoints(redemption.merit_points_used || 0)}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 用戶資訊 */}
      <Card title="用戶資訊" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="用戶姓名">{redemption.user_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="用戶信箱">{redemption.user_email || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 收件資訊 */}
      <Card title="收件資訊" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="收件人">{redemption.recipient_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="聯絡電話">{redemption.recipient_phone || redemption.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="郵遞區號">{redemption.postal_code || '-'}</Descriptions.Item>
          <Descriptions.Item label="城市">{redemption.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="收件地址" span={2}>
            {redemption.address || '-'}
          </Descriptions.Item>
          {redemption.notes && (
            <Descriptions.Item label="備註" span={2}>
              {redemption.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 狀態更新對話框 */}
      <Modal
        title="更新訂單狀態"
        open={statusModalVisible}
        onOk={handleStatusSubmit}
        onCancel={() => {
          setStatusModalVisible(false);
          statusForm.resetFields();
        }}
        confirmLoading={updateStatusMutation.isPending}
      >
        <Form
          form={statusForm}
          layout="vertical"
          initialValues={{ status: redemption.status }}
        >
          <Form.Item
            label="新狀態"
            name="status"
            rules={[{ required: true, message: '請選擇狀態' }]}
          >
            <Select placeholder="請選擇狀態">
              {Object.entries(REDEMPTION_STATUS).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="備註"
            name="remarks"
          >
            <TextArea
              rows={4}
              placeholder="請輸入狀態更新說明（選填）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RedemptionDetailPage;

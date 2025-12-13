/**
 * 廟宇詳情頁面
 */
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
  message,
  Spin,
  Alert,
  Popconfirm,
  Image,
} from 'antd';
import {
  ArrowLeftOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { getTempleDetail, toggleTempleStatus } from '../../api';
import { formatDateTime } from '../../utils/format';

const TempleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 查詢廟宇詳情
  const { data, isLoading, error } = useQuery({
    queryKey: ['temple', id],
    queryFn: () => getTempleDetail(id),
  });

  // 啟用/停用廟宇
  const toggleStatusMutation = useMutation({
    mutationFn: () => toggleTempleStatus(id),
    onSuccess: () => {
      message.success('廟宇狀態變更成功');
      queryClient.invalidateQueries(['temple', id]);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '狀態變更失敗');
    },
  });

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
        description="無法載入廟宇資料"
        type="error"
        showIcon
      />
    );
  }

  const temple = data?.data?.temple || {};
  const stats = data?.data?.statistics || {};

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/temples')}>
          返回列表
        </Button>
        <h1 style={{ margin: 0 }}>廟宇詳情</h1>
      </Space>

      {/* 基本資訊 */}
      <Card
        title="基本資訊"
        extra={
          <Popconfirm
            title={temple.is_active ? '確定要停用此廟宇嗎？' : '確定要啟用此廟宇嗎？'}
            onConfirm={() => toggleStatusMutation.mutate()}
            okText="確定"
            cancelText="取消"
          >
            <Button
              danger={temple.is_active}
              icon={temple.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
              loading={toggleStatusMutation.isPending}
            >
              {temple.is_active ? '停用' : '啟用'}
            </Button>
          </Popconfirm>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="廟宇 ID">{temple.id}</Descriptions.Item>
          <Descriptions.Item label="狀態">
            <Tag color={temple.is_active ? 'green' : 'red'}>
              {temple.is_active ? '啟用' : '停用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="廟宇名稱">{temple.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="聯絡電話">{temple.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>{temple.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {temple.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="網站">
            {temple.website ? (
              <a href={temple.website} target="_blank" rel="noopener noreferrer">
                {temple.website}
              </a>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="信箱">{temple.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="建立時間">
            {formatDateTime(temple.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="最後更新">
            {formatDateTime(temple.updated_at)}
          </Descriptions.Item>
        </Descriptions>

        {/* 圖片 */}
        {temple.image_url && (
          <div style={{ marginTop: 16 }}>
            <h4>廟宇圖片</h4>
            <Image
              src={temple.image_url}
              alt={temple.name}
              style={{ maxWidth: '400px' }}
            />
          </div>
        )}
      </Card>

      {/* 統計資訊 */}
      <Card title="統計資訊" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總打卡次數"
              value={stats.total_checkins || 0}
              suffix="次"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總商品數"
              value={stats.total_products || 0}
              suffix="個"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="待審核商品"
              value={stats.pending_products || 0}
              suffix="個"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總兌換次數"
              value={stats.total_redemptions || 0}
              suffix="次"
            />
          </Col>
        </Row>
      </Card>

      {/* 位置資訊 */}
      {(temple.latitude && temple.longitude) && (
        <Card title="位置資訊">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="緯度">{temple.latitude}</Descriptions.Item>
            <Descriptions.Item label="經度">{temple.longitude}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default TempleDetailPage;

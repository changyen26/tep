/**
 * 儀表板頁面
 */
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Spin, Alert } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getOverviewAnalytics } from '../../api';

const DashboardPage = () => {
  // 查詢總覽數據
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: getOverviewAnalytics,
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
        message="載入失敗"
        description="無法載入儀表板數據"
        type="error"
        showIcon
      />
    );
  }

  const stats = data?.data || {};

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>系統總覽</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總使用者數"
              value={stats.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總廟宇數"
              value={stats.total_temples || 0}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總商品數"
              value={stats.total_products || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總兌換訂單"
              value={stats.total_redemptions || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待審核廟宇申請"
              value={stats.pending_temple_applications || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待審核商品"
              value={stats.pending_products || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待處理兌換"
              value={stats.pending_redemptions || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總打卡次數"
              value={stats.total_checkins || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

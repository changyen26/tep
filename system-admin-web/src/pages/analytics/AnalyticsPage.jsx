/**
 * 數據分析頁面
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Select, DatePicker, Space, Alert, Spin, Table, Tag } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  getUserAnalytics,
  getTempleAnalytics,
  getCheckinAnalytics,
  getRedemptionAnalytics,
} from '../../api';
import { formatPoints } from '../../utils/format';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('7days');
  const [dateRange, setDateRange] = useState([]);

  // 查詢各項數據
  const { data: userStats, isLoading: userLoading } = useQuery({
    queryKey: ['analytics', 'users', period, dateRange],
    queryFn: () => getUserAnalytics({ period }),
  });

  const { data: templeStats, isLoading: templeLoading } = useQuery({
    queryKey: ['analytics', 'temples', period, dateRange],
    queryFn: () => getTempleAnalytics({ period }),
  });

  const { data: checkinStats, isLoading: checkinLoading } = useQuery({
    queryKey: ['analytics', 'checkins', period, dateRange],
    queryFn: () => getCheckinAnalytics({ period }),
  });

  const { data: redemptionStats, isLoading: redemptionLoading } = useQuery({
    queryKey: ['analytics', 'redemptions', period, dateRange],
    queryFn: () => getRedemptionAnalytics({ period }),
  });

  const isLoading = userLoading || templeLoading || checkinLoading || redemptionLoading;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const users = userStats?.data || {};
  const temples = templeStats?.data || {};
  const checkins = checkinStats?.data || {};
  const redemptions = redemptionStats?.data || {};

  // 廟宇活躍度排行表格配置
  const templeColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: '廟宇名稱',
      dataIndex: 'temple_name',
      key: 'temple_name',
    },
    {
      title: '打卡次數',
      dataIndex: 'checkin_count',
      key: 'checkin_count',
      width: 120,
      sorter: (a, b) => a.checkin_count - b.checkin_count,
    },
    {
      title: '活躍度',
      dataIndex: 'activity_score',
      key: 'activity_score',
      width: 120,
      render: (score) => (
        <Tag color={score > 80 ? 'green' : score > 50 ? 'blue' : 'orange'}>
          {score || 0}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>數據分析</h1>
        <Space>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 150 }}
          >
            <Option value="7days">最近 7 天</Option>
            <Option value="30days">最近 30 天</Option>
            <Option value="90days">最近 90 天</Option>
            <Option value="365days">最近一年</Option>
          </Select>
        </Space>
      </div>

      {/* 核心指標 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="新增使用者"
              value={users.new_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                users.growth_rate > 0 ? (
                  <span style={{ fontSize: 14, color: '#3f8600' }}>
                    <RiseOutlined /> {users.growth_rate}%
                  </span>
                ) : (
                  <span style={{ fontSize: 14, color: '#cf1322' }}>
                    <FallOutlined /> {Math.abs(users.growth_rate || 0)}%
                  </span>
                )
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活躍廟宇數"
              value={temples.active_temples || 0}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總打卡次數"
              value={checkins.total_checkins || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                checkins.growth_rate > 0 ? (
                  <span style={{ fontSize: 14, color: '#3f8600' }}>
                    <RiseOutlined /> {checkins.growth_rate}%
                  </span>
                ) : null
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="兌換訂單數"
              value={redemptions.total_redemptions || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 使用者分析 */}
      <Card title="使用者分析" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總使用者數"
              value={users.total_users || 0}
              suffix="人"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="活躍使用者"
              value={users.active_users || 0}
              suffix="人"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="平均功德點數"
              value={users.avg_points || 0}
              suffix="點"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總功德點數"
              value={formatPoints(users.total_points || 0)}
            />
          </Col>
        </Row>
      </Card>

      {/* 打卡分析 */}
      <Card title="打卡分析" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總打卡次數"
              value={checkins.total_checkins || 0}
              suffix="次"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="日均打卡"
              value={checkins.avg_daily_checkins || 0}
              suffix="次"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="打卡用戶數"
              value={checkins.unique_users || 0}
              suffix="人"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="人均打卡次數"
              value={checkins.avg_checkins_per_user || 0}
              suffix="次"
            />
          </Col>
        </Row>
      </Card>

      {/* 兌換分析 */}
      <Card title="兌換分析" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總兌換訂單"
              value={redemptions.total_redemptions || 0}
              suffix="筆"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="使用功德點數"
              value={formatPoints(redemptions.total_points_used || 0)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="兌換用戶數"
              value={redemptions.unique_users || 0}
              suffix="人"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="平均訂單點數"
              value={redemptions.avg_points_per_order || 0}
              suffix="點"
            />
          </Col>
        </Row>
      </Card>

      {/* 廟宇活躍度排行 */}
      {temples.top_temples && temples.top_temples.length > 0 && (
        <Card title="廟宇活躍度排行 TOP 10">
          <Table
            columns={templeColumns}
            dataSource={temples.top_temples}
            rowKey="temple_id"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;

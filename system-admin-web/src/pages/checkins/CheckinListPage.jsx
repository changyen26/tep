/**
 * 打卡記錄管理頁面
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Space, DatePicker, Tag, Statistic, Row, Col } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { getCheckinList } from '../../api';
import { formatDateTime } from '../../utils/format';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const CheckinListPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dateRange, setDateRange] = useState([]);

  // 查詢打卡記錄列表
  const { data, isLoading } = useQuery({
    queryKey: ['checkins', page, pageSize, dateRange],
    queryFn: () => {
      const params = {
        page,
        per_page: pageSize,
      };

      if (dateRange && dateRange.length === 2) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      return getCheckinList(params);
    },
  });

  const handleDateChange = (dates) => {
    setDateRange(dates || []);
    setPage(1); // 重置頁碼
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '使用者ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
    },
    {
      title: '使用者名稱',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
    },
    {
      title: '廟宇ID',
      dataIndex: 'temple_id',
      key: 'temple_id',
      width: 100,
    },
    {
      title: '廟宇名稱',
      dataIndex: 'temple_name',
      key: 'temple_name',
      width: 200,
    },
    {
      title: '打卡方式',
      dataIndex: 'checkin_type',
      key: 'checkin_type',
      width: 120,
      render: (type) => {
        const typeMap = {
          location: { color: 'blue', text: '位置打卡' },
          nfc: { color: 'green', text: 'NFC打卡' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '獲得功德點數',
      dataIndex: 'merit_points',
      key: 'merit_points',
      width: 130,
      render: (points) => (
        <Tag color="gold">+{points}</Tag>
      ),
    },
    {
      title: '打卡時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDateTime(date),
    },
  ];

  const checkins = data?.data?.checkins || [];
  const total = data?.data?.total || 0;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>打卡記錄管理</h1>

      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="總打卡次數"
              value={total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            placeholder={['開始日期', '結束日期']}
            onChange={handleDateChange}
            format="YYYY-MM-DD"
          />
        </Space>

        <Table
          columns={columns}
          dataSource={checkins}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 筆`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default CheckinListPage;

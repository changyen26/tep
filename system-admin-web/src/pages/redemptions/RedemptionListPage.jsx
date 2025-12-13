/**
 * 兌換列表頁面
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Input, Select, Space, Tag, Button, DatePicker } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getRedemptionList } from '../../api';
import { formatDateTime, formatPoints } from '../../utils/format';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 兌換狀態配置
const REDEMPTION_STATUS = {
  pending: { label: '待處理', color: 'orange' },
  processing: { label: '處理中', color: 'blue' },
  shipped: { label: '已出貨', color: 'cyan' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'red' },
};

const RedemptionListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState([]);

  // 查詢兌換列表
  const { data, isLoading } = useQuery({
    queryKey: ['redemptions', page, pageSize, keyword, status, dateRange],
    queryFn: () => {
      const params = {
        page,
        per_page: pageSize,
        keyword,
        status,
      };

      if (dateRange && dateRange.length === 2) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }

      return getRedemptionList(params);
    },
  });

  const columns = [
    {
      title: '訂單 ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '用戶資訊',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (userName, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{userName || '-'}</div>
          {record.user_email && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.user_email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '商品資訊',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (productName, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{productName || '-'}</div>
          {record.temple_name && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.temple_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '數量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: '使用點數',
      dataIndex: 'merit_points_used',
      key: 'merit_points_used',
      width: 120,
      render: (points) => formatPoints(points),
    },
    {
      title: '收件人',
      dataIndex: 'recipient_name',
      key: 'recipient_name',
      width: 120,
      render: (name, record) => (
        <div>
          <div>{name || '-'}</div>
          {record.recipient_phone && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.recipient_phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = REDEMPTION_STATUS[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '兌換時間',
      dataIndex: 'redeemed_at',
      key: 'redeemed_at',
      width: 180,
      render: (date) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/redemptions/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>兌換管理</h1>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜尋用戶或收件人名稱"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={setKeyword}
          />
          <Select
            placeholder="狀態篩選"
            allowClear
            style={{ width: 150 }}
            onChange={setStatus}
          >
            {Object.entries(REDEMPTION_STATUS).map(([key, config]) => (
              <Option key={key} value={key}>
                {config.label}
              </Option>
            ))}
          </Select>
          <RangePicker
            placeholder={['開始日期', '結束日期']}
            onChange={setDateRange}
            style={{ width: 280 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data?.redemptions || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.data?.total || 0,
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

export default RedemptionListPage;

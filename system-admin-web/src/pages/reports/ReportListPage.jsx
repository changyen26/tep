/**
 * 檢舉列表頁面
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Input, Select, Space, Tag, Button } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getReportList } from '../../api';
import { formatDateTime } from '../../utils/format';

const { Search } = Input;
const { Option } = Select;

// 檢舉狀態配置
const REPORT_STATUS = {
  pending: { label: '待處理', color: 'orange' },
  processing: { label: '處理中', color: 'blue' },
  resolved: { label: '已處理', color: 'green' },
  rejected: { label: '已駁回', color: 'red' },
};

// 檢舉類型
const REPORT_TYPES = {
  inappropriate_content: { label: '不當內容', color: 'red' },
  spam: { label: '垃圾訊息', color: 'orange' },
  fraud: { label: '詐騙行為', color: 'purple' },
  abuse: { label: '濫用系統', color: 'magenta' },
  other: { label: '其他', color: 'default' },
};

const ReportListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [reportType, setReportType] = useState('');

  // 查詢檢舉列表
  const { data, isLoading } = useQuery({
    queryKey: ['reports', page, pageSize, keyword, status, reportType],
    queryFn: () => getReportList({
      page,
      per_page: pageSize,
      keyword,
      status,
      report_type: reportType,
    }),
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '檢舉類型',
      dataIndex: 'report_type',
      key: 'report_type',
      width: 120,
      render: (type) => {
        const config = REPORT_TYPES[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '檢舉內容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '檢舉人',
      dataIndex: 'reporter_name',
      key: 'reporter_name',
      width: 120,
    },
    {
      title: '被檢舉對象',
      dataIndex: 'reported_name',
      key: 'reported_name',
      width: 120,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = REPORT_STATUS[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '檢舉時間',
      dataIndex: 'created_at',
      key: 'created_at',
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
          onClick={() => navigate(`/reports/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>檢舉管理</h1>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜尋檢舉內容"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={setKeyword}
          />
          <Select
            placeholder="狀態篩選"
            allowClear
            style={{ width: 120 }}
            onChange={setStatus}
          >
            {Object.entries(REPORT_STATUS).map(([key, config]) => (
              <Option key={key} value={key}>
                {config.label}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="類型篩選"
            allowClear
            style={{ width: 150 }}
            onChange={setReportType}
          >
            {Object.entries(REPORT_TYPES).map(([key, config]) => (
              <Option key={key} value={key}>
                {config.label}
              </Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data?.reports || []}
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

export default ReportListPage;

/**
 * 廟宇列表頁面
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Input, Select, Space, Tag, Button, message, Popconfirm } from 'antd';
import { SearchOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getTempleList, toggleTempleStatus } from '../../api';
import { formatDateTime } from '../../utils/format';

const { Search } = Input;
const { Option } = Select;

const TempleListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [isActive, setIsActive] = useState('');

  // 查詢廟宇列表
  const { data, isLoading } = useQuery({
    queryKey: ['temples', page, pageSize, keyword, isActive],
    queryFn: () => getTempleList({ page, per_page: pageSize, keyword, is_active: isActive }),
  });

  // 啟用/停用廟宇
  const toggleStatusMutation = useMutation({
    mutationFn: (templeId) => toggleTempleStatus(templeId),
    onSuccess: () => {
      message.success('廟宇狀態變更成功');
      queryClient.invalidateQueries(['temples']);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '狀態變更失敗');
    },
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '廟宇名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.description.substring(0, 50)}
              {record.description.length > 50 ? '...' : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '聯絡電話',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/temples/${record.id}`)}
          >
            查看
          </Button>
          <Popconfirm
            title={record.is_active ? '確定要停用此廟宇嗎？' : '確定要啟用此廟宇嗎？'}
            onConfirm={() => toggleStatusMutation.mutate(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger={record.is_active}
              icon={record.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
              loading={toggleStatusMutation.isPending}
            >
              {record.is_active ? '停用' : '啟用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>廟宇管理</h1>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜尋廟宇名稱或地址"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={setKeyword}
          />
          <Select
            placeholder="狀態篩選"
            allowClear
            style={{ width: 150 }}
            onChange={setIsActive}
          >
            <Option value="true">啟用</Option>
            <Option value="false">停用</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data?.temples || []}
          loading={isLoading}
          rowKey="id"
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

export default TempleListPage;

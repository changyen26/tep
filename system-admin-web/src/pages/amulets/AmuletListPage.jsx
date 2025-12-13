/**
 * 平安符管理頁面
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Input, Space, Tag, Button, message, Popconfirm } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getAmuletList, deleteAmulet } from '../../api';
import { formatDateTime } from '../../utils/format';

const { Search } = Input;

const AmuletListPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');

  // 查詢平安符列表
  const { data, isLoading } = useQuery({
    queryKey: ['amulets', page, pageSize, keyword],
    queryFn: () => getAmuletList({
      page,
      per_page: pageSize,
      search: keyword
    }),
  });

  // 刪除平安符
  const deleteMutation = useMutation({
    mutationFn: deleteAmulet,
    onSuccess: () => {
      message.success('平安符刪除成功');
      queryClient.invalidateQueries(['amulets']);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '刪除失敗');
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
      title: '目前能量',
      dataIndex: 'energy',
      key: 'energy',
      width: 120,
      render: (energy) => (
        <Tag color={energy > 50 ? 'green' : energy > 20 ? 'orange' : 'red'}>
          {energy} / 100
        </Tag>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusMap = {
          active: { color: 'green', text: '使用中' },
          inactive: { color: 'default', text: '未啟用' },
          expired: { color: 'red', text: '已過期' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDateTime(date),
    },
    {
      title: '最後更新',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (date) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="確定要刪除此平安符嗎？"
            description="此操作無法復原"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button
              danger
              type="link"
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            >
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>平安符管理</h1>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜尋使用者名稱或 ID"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={setKeyword}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data?.amulets || []}
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

export default AmuletListPage;

/**
 * 使用者列表頁面
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Input, Select, Space, Tag, Button } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserList } from '../../api';
import { USER_ROLE_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

const { Search } = Input;
const { Option } = Select;

const UserListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('');

  // 查詢使用者列表
  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize, keyword, role],
    queryFn: () => getUserList({ page, per_page: pageSize, keyword, role }),
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '信箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'temple_admin' ? 'blue' : 'default'}>
          {USER_ROLE_LABELS[role] || role}
        </Tag>
      ),
    },
    {
      title: '功德點數',
      dataIndex: 'points',
      key: 'points',
      render: (points) => points?.toLocaleString() || 0,
    },
    {
      title: '註冊時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/users/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>使用者管理</h1>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜尋姓名或信箱"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={setKeyword}
          />
          <Select
            placeholder="角色篩選"
            allowClear
            style={{ width: 150 }}
            onChange={setRole}
          >
            <Option value="user">一般使用者</Option>
            <Option value="temple_admin">廟宇管理員</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data?.users || []}
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

export default UserListPage;

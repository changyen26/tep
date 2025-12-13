/**
 * 系統設定頁面
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Button, Space, message, Modal, Form, Input, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSettings, createSetting, updateSetting } from '../../api';
import { formatDateTime } from '../../utils/format';

const { TextArea } = Input;

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 查詢設定列表
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  // 新增/更新設定
  const saveMutation = useMutation({
    mutationFn: (values) => {
      if (editingId) {
        return updateSetting(editingId, values);
      }
      return createSetting(values);
    },
    onSuccess: () => {
      message.success(editingId ? '更新成功' : '新增成功');
      queryClient.invalidateQueries(['settings']);
      setModalVisible(false);
      setEditingId(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '操作失敗');
    },
  });

  const handleAdd = () => {
    setEditingId(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setModalVisible(true);
    form.setFieldsValue({
      key: record.key,
      value: record.value,
      description: record.description,
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      saveMutation.mutate(values);
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '設定鍵',
      dataIndex: 'key',
      key: 'key',
      width: 200,
      render: (key) => <Tag color="blue">{key}</Tag>,
    },
    {
      title: '設定值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>系統設定</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增設定
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.data?.settings || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 筆` }}
        />
      </Card>

      <Modal
        title={editingId ? '編輯設定' : '新增設定'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="設定鍵"
            name="key"
            rules={[
              { required: true, message: '請輸入設定鍵' },
              { pattern: /^[a-z0-9_]+$/, message: '只能包含小寫字母、數字和底線' },
            ]}
          >
            <Input placeholder="例如：max_upload_size" disabled={!!editingId} />
          </Form.Item>
          <Form.Item
            label="設定值"
            name="value"
            rules={[{ required: true, message: '請輸入設定值' }]}
          >
            <Input placeholder="設定值" />
          </Form.Item>
          <Form.Item
            label="說明"
            name="description"
          >
            <TextArea rows={3} placeholder="設定說明（選填）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;

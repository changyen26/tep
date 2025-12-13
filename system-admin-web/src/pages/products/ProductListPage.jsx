/**
 * 商品列表頁面
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Input, Select, Space, Tag, Button, message, Popconfirm, Image, Modal, Form, InputNumber } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProductList, reviewProduct, createProduct } from '../../api';
import { formatDateTime, formatPoints } from '../../utils/format';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const ProductListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [isActive, setIsActive] = useState('');
  const [category, setCategory] = useState('');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [currentProductId, setCurrentProductId] = useState(null);
  const [reviewForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // 查詢商品列表
  const { data, isLoading } = useQuery({
    queryKey: ['products', page, pageSize, keyword, isActive, category],
    queryFn: () => getProductList({
      page,
      per_page: pageSize,
      keyword,
      is_active: isActive,
      category
    }),
  });

  // 審核商品
  const reviewMutation = useMutation({
    mutationFn: ({ productId, action, remarks }) =>
      reviewProduct(productId, action, remarks),
    onSuccess: () => {
      message.success('審核完成');
      queryClient.invalidateQueries(['products']);
      setReviewModalVisible(false);
      reviewForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '審核失敗');
    },
  });

  // 開啟審核對話框
  const handleReview = (productId, action) => {
    setCurrentProductId(productId);
    setReviewAction(action);
    setReviewModalVisible(true);
  };

  // 提交審核
  const handleReviewSubmit = () => {
    reviewForm.validateFields().then((values) => {
      reviewMutation.mutate({
        productId: currentProductId,
        action: reviewAction,
        remarks: values.remarks,
      });
    });
  };

  // 新增商品
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      message.success('商品新增成功');
      queryClient.invalidateQueries(['products']);
      setCreateModalVisible(false);
      createForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '新增失敗');
    },
  });

  // 開啟新增對話框
  const handleCreate = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  // 提交新增
  const handleCreateSubmit = () => {
    createForm.validateFields().then((values) => {
      // 處理圖片欄位
      const submitData = {
        ...values,
        images: values.images ? values.images.split(',').map(url => url.trim()) : [],
        is_active: true, // 管理員創建的商品直接上架
      };
      createMutation.mutate(submitData);
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
      title: '商品圖片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => {
        if (images && images.length > 0) {
          return <Image src={images[0]} alt="商品圖片" style={{ width: 60, height: 60, objectFit: 'cover' }} />;
        }
        return <div style={{ width: 60, height: 60, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>無圖</div>;
      },
    },
    {
      title: '商品名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          {record.temple_name && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              廟宇：{record.temple_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '功德點數',
      dataIndex: 'merit_points',
      key: 'merit_points',
      width: 120,
      render: (points) => formatPoints(points),
    },
    {
      title: '庫存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'orange'}>
          {isActive ? '已上架' : '待審核'}
        </Tag>
      ),
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${record.id}`)}
          >
            查看
          </Button>
          {!record.is_active && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleReview(record.id, 'approve')}
              >
                通過
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReview(record.id, 'reject')}
              >
                拒絕
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>商品管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增商品
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜尋商品名稱"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={setKeyword}
          />
          <Select
            placeholder="分類篩選"
            allowClear
            style={{ width: 150 }}
            onChange={setCategory}
          >
            <Option value="平安符">平安符</Option>
            <Option value="祈福商品">祈福商品</Option>
            <Option value="文創商品">文創商品</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select
            placeholder="狀態篩選"
            allowClear
            style={{ width: 150 }}
            onChange={setIsActive}
          >
            <Option value="true">已上架</Option>
            <Option value="false">待審核</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data?.products || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.data?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 筆`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      {/* 審核對話框 */}
      <Modal
        title={reviewAction === 'approve' ? '通過商品' : '拒絕商品'}
        open={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        confirmLoading={reviewMutation.isPending}
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            label="審核備註"
            name="remarks"
            rules={[
              {
                required: reviewAction === 'reject',
                message: '拒絕商品必須輸入原因'
              }
            ]}
          >
            <TextArea
              rows={4}
              placeholder={
                reviewAction === 'approve'
                  ? '請說明通過原因或給予建議（選填）'
                  : '請說明拒絕原因'
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增商品對話框 */}
      <Modal
        title="新增商品"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="商品名稱"
            name="name"
            rules={[{ required: true, message: '請輸入商品名稱' }]}
          >
            <Input placeholder="例如：平安符" />
          </Form.Item>
          <Form.Item
            label="商品描述"
            name="description"
            rules={[{ required: true, message: '請輸入商品描述' }]}
          >
            <TextArea rows={4} placeholder="請詳細描述商品內容" />
          </Form.Item>
          <Form.Item
            label="分類"
            name="category"
            rules={[{ required: true, message: '請選擇分類' }]}
          >
            <Select placeholder="請選擇分類">
              <Option value="平安符">平安符</Option>
              <Option value="祈福商品">祈福商品</Option>
              <Option value="文創商品">文創商品</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="功德點數"
            name="merit_points"
            rules={[{ required: true, message: '請輸入功德點數' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如：100" />
          </Form.Item>
          <Form.Item
            label="庫存數量"
            name="stock_quantity"
            rules={[{ required: true, message: '請輸入庫存數量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如：50" />
          </Form.Item>
          <Form.Item
            label="商品圖片 URL（多張請用逗號分隔）"
            name="images"
          >
            <Input placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
          </Form.Item>
          <Form.Item
            label="是否為推薦商品"
            name="is_featured"
            initialValue={false}
          >
            <Select>
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductListPage;

/**
 * 商品詳情頁面
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Alert,
  Modal,
  Form,
  Input,
  Image,
  InputNumber,
  Select,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getProductDetail, reviewProduct, toggleProductStatus, updateProduct, deleteProduct } from '../../api';
import { formatDateTime, formatPoints } from '../../utils/format';

const { TextArea } = Input;
const { Option } = Select;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // 查詢商品詳情
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductDetail(id),
  });

  // 審核商品
  const reviewMutation = useMutation({
    mutationFn: ({ action, remarks }) =>
      reviewProduct(id, action, remarks),
    onSuccess: () => {
      message.success('審核完成');
      queryClient.invalidateQueries(['product', id]);
      setReviewModalVisible(false);
      reviewForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '審核失敗');
    },
  });

  // 切換商品狀態
  const toggleStatusMutation = useMutation({
    mutationFn: (isActive) => toggleProductStatus(id, isActive),
    onSuccess: () => {
      message.success('商品狀態變更成功');
      queryClient.invalidateQueries(['product', id]);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '狀態變更失敗');
    },
  });

  // 開啟審核對話框
  const handleReview = (action) => {
    setReviewAction(action);
    setReviewModalVisible(true);
  };

  // 提交審核
  const handleReviewSubmit = () => {
    reviewForm.validateFields().then((values) => {
      reviewMutation.mutate({
        action: reviewAction,
        remarks: values.remarks,
      });
    });
  };

  // 編輯商品
  const updateMutation = useMutation({
    mutationFn: (data) => updateProduct(id, data),
    onSuccess: () => {
      message.success('商品更新成功');
      queryClient.invalidateQueries(['product', id]);
      setEditModalVisible(false);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '更新失敗');
    },
  });

  // 刪除商品
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      message.success('商品刪除成功');
      navigate('/products');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '刪除失敗');
    },
  });

  // 開啟編輯對話框
  const handleEdit = () => {
    editForm.setFieldsValue({
      name: product.name,
      description: product.description,
      category: product.category,
      merit_points: product.merit_points,
      stock_quantity: product.stock,
      images: product.images ? product.images.join(', ') : '',
      is_featured: product.is_featured || false,
    });
    setEditModalVisible(true);
  };

  // 提交編輯
  const handleEditSubmit = () => {
    editForm.validateFields().then((values) => {
      const submitData = {
        ...values,
        images: values.images ? values.images.split(',').map(url => url.trim()) : [],
      };
      updateMutation.mutate(submitData);
    });
  };

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
        description="無法載入商品資料"
        type="error"
        showIcon
      />
    );
  }

  const product = data?.data || {};

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
          返回列表
        </Button>
        <h1 style={{ margin: 0 }}>商品詳情</h1>
      </Space>

      {/* 基本資訊 */}
      <Card
        title="基本資訊"
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              編輯商品
            </Button>
            {!product.is_active && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleReview('approve')}
                >
                  通過審核
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleReview('reject')}
                >
                  拒絕審核
                </Button>
              </>
            )}
            {product.is_active && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={() => toggleStatusMutation.mutate(false)}
                loading={toggleStatusMutation.isPending}
              >
                下架商品
              </Button>
            )}
            <Popconfirm
              title="確定要刪除此商品嗎？"
              description="此操作無法復原"
              onConfirm={() => deleteMutation.mutate()}
              okText="確定"
              cancelText="取消"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              >
                刪除商品
              </Button>
            </Popconfirm>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="商品 ID">{product.id}</Descriptions.Item>
          <Descriptions.Item label="狀態">
            <Tag color={product.is_active ? 'green' : 'orange'}>
              {product.is_active ? '已上架' : '待審核'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="商品名稱">{product.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="分類">{product.category || '-'}</Descriptions.Item>
          <Descriptions.Item label="功德點數">
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
              {formatPoints(product.merit_points || 0)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="庫存數量">
            <Tag color={product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red'}>
              {product.stock || 0} 件
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="所屬廟宇" span={2}>
            {product.temple_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="商品描述" span={2}>
            {product.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="建立時間">
            {formatDateTime(product.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="最後更新">
            {formatDateTime(product.updated_at)}
          </Descriptions.Item>
        </Descriptions>

        {/* 商品圖片 */}
        {product.images && product.images.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4>商品圖片</h4>
            <Image.PreviewGroup>
              <Space wrap size={16}>
                {product.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`商品圖片 ${index + 1}`}
                    style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </div>
        )}
      </Card>

      {/* 統計資訊 */}
      <Card title="統計資訊" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="總兌換次數"
              value={product.redemption_count || 0}
              suffix="次"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="當前庫存"
              value={product.stock || 0}
              suffix="件"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="所需點數"
              value={product.merit_points || 0}
              suffix="點"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="商品狀態"
              value={product.is_active ? '已上架' : '待審核'}
              valueStyle={{ color: product.is_active ? '#3f8600' : '#faad14' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 審核對話框 */}
      <Modal
        title={reviewAction === 'approve' ? '通過商品審核' : '拒絕商品審核'}
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

      {/* 編輯商品對話框 */}
      <Modal
        title="編輯商品"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        confirmLoading={updateMutation.isPending}
        width={600}
      >
        <Form form={editForm} layout="vertical">
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

export default ProductDetailPage;

/**
 * 廟宇申請列表頁面
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Select, Space, Tag, Button, message, Modal, Form, Input } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getTempleApplicationList, reviewTempleApplication } from '../../api';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

const { Option } = Select;
const { TextArea } = Input;

const TempleApplicationListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState('');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [currentApplicationId, setCurrentApplicationId] = useState(null);
  const [reviewForm] = Form.useForm();

  // 查詢申請列表
  const { data, isLoading } = useQuery({
    queryKey: ['temple-applications', page, pageSize, status],
    queryFn: () => getTempleApplicationList({ page, per_page: pageSize, status }),
  });

  // 審核申請
  const reviewMutation = useMutation({
    mutationFn: ({ applicationId, action, remarks }) =>
      reviewTempleApplication(applicationId, action, remarks),
    onSuccess: () => {
      message.success('審核完成');
      queryClient.invalidateQueries(['temple-applications']);
      setReviewModalVisible(false);
      reviewForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '審核失敗');
    },
  });

  // 開啟審核對話框
  const handleReview = (applicationId, action) => {
    setCurrentApplicationId(applicationId);
    setReviewAction(action);
    setReviewModalVisible(true);
  };

  // 提交審核
  const handleReviewSubmit = () => {
    reviewForm.validateFields().then((values) => {
      reviewMutation.mutate({
        applicationId: currentApplicationId,
        action: reviewAction,
        remarks: values.remarks,
      });
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
      title: '廟宇名稱',
      dataIndex: 'temple_name',
      key: 'temple_name',
    },
    {
      title: '申請人',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
    },
    {
      title: '聯絡電話',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={APPLICATION_STATUS_COLORS[status]}>
          {APPLICATION_STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: '申請時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/temples/applications/${record.id}`)}
          >
            查看
          </Button>
          {record.status === APPLICATION_STATUS.PENDING && (
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
      <h1 style={{ marginBottom: 24 }}>廟宇申請審核</h1>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="狀態篩選"
            allowClear
            style={{ width: 150 }}
            onChange={setStatus}
          >
            <Option value={APPLICATION_STATUS.PENDING}>待審核</Option>
            <Option value={APPLICATION_STATUS.IN_REVIEW}>審核中</Option>
            <Option value={APPLICATION_STATUS.APPROVED}>已通過</Option>
            <Option value={APPLICATION_STATUS.REJECTED}>已拒絕</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data?.applications || []}
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

      {/* 審核對話框 */}
      <Modal
        title={reviewAction === 'approve' ? '通過申請' : '拒絕申請'}
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
            rules={[{ required: true, message: '請輸入審核備註' }]}
          >
            <TextArea
              rows={4}
              placeholder={
                reviewAction === 'approve'
                  ? '請說明通過原因或給予申請者的建議'
                  : '請說明拒絕原因'
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TempleApplicationListPage;

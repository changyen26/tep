/**
 * 廟宇申請詳情頁面
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
  message,
  Spin,
  Alert,
  Modal,
  Form,
  Input,
  Image,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { getTempleApplicationDetail, reviewTempleApplication } from '../../api';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

const { TextArea } = Input;

const TempleApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewForm] = Form.useForm();

  // 查詢申請詳情
  const { data, isLoading, error } = useQuery({
    queryKey: ['temple-application', id],
    queryFn: () => getTempleApplicationDetail(id),
  });

  // 審核申請
  const reviewMutation = useMutation({
    mutationFn: ({ action, remarks }) =>
      reviewTempleApplication(id, action, remarks),
    onSuccess: () => {
      message.success('審核完成');
      queryClient.invalidateQueries(['temple-application', id]);
      setReviewModalVisible(false);
      reviewForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '審核失敗');
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
        title="載入失敗"
        description="無法載入申請資料"
        type="error"
        showIcon
      />
    );
  }

  const application = data?.data || {};

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/temples/applications')}>
          返回列表
        </Button>
        <h1 style={{ margin: 0 }}>廟宇申請詳情</h1>
      </Space>

      {/* 申請資訊 */}
      <Card
        title="申請資訊"
        extra={
          application.status === APPLICATION_STATUS.PENDING && (
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleReview('approve')}
              >
                通過
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReview('reject')}
              >
                拒絕
              </Button>
            </Space>
          )
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="申請 ID">{application.id}</Descriptions.Item>
          <Descriptions.Item label="狀態">
            <Tag color={APPLICATION_STATUS_COLORS[application.status]}>
              {APPLICATION_STATUS_LABELS[application.status] || application.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="廟宇名稱">{application.temple_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="申請人姓名">{application.applicant_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="聯絡電話">{application.contact_phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="聯絡信箱">{application.contact_email || '-'}</Descriptions.Item>
          <Descriptions.Item label="廟宇地址" span={2}>
            {application.temple_address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="廟宇簡介" span={2}>
            {application.temple_description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="申請理由" span={2}>
            {application.reason || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="申請時間">
            {formatDateTime(application.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="最後更新">
            {formatDateTime(application.updated_at)}
          </Descriptions.Item>
        </Descriptions>

        {/* 證明文件 */}
        {application.documents && application.documents.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>證明文件</h4>
            <Space wrap>
              {application.documents.map((doc, index) => (
                <Image
                  key={index}
                  src={doc.url}
                  alt={`證明文件 ${index + 1}`}
                  style={{ maxWidth: '200px' }}
                />
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* 審核記錄 */}
      {(application.reviewed_at || application.admin_remarks) && (
        <Card title="審核記錄">
          <Descriptions column={2} bordered>
            {application.reviewed_by && (
              <Descriptions.Item label="審核人員">
                {application.reviewed_by}
              </Descriptions.Item>
            )}
            {application.reviewed_at && (
              <Descriptions.Item label="審核時間">
                {formatDateTime(application.reviewed_at)}
              </Descriptions.Item>
            )}
            {application.admin_remarks && (
              <Descriptions.Item label="審核備註" span={2}>
                {application.admin_remarks}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

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

export default TempleApplicationDetailPage;

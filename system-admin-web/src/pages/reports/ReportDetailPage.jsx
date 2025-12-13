/**
 * 檢舉詳情頁面
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
  Select,
  Input,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getReportDetail, updateReportStatus } from '../../api';
import { formatDateTime } from '../../utils/format';

const { TextArea } = Input;
const { Option } = Select;

// 檢舉狀態配置
const REPORT_STATUS = {
  pending: { label: '待處理', color: 'orange' },
  processing: { label: '處理中', color: 'blue' },
  resolved: { label: '已處理', color: 'green' },
  rejected: { label: '已駁回', color: 'red' },
};

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 查詢檢舉詳情
  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => getReportDetail(id),
  });

  // 更新檢舉狀態
  const updateMutation = useMutation({
    mutationFn: ({ status, remarks }) =>
      updateReportStatus(id, status, remarks),
    onSuccess: () => {
      message.success('處理成功');
      queryClient.invalidateQueries(['report', id]);
      setModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '處理失敗');
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      updateMutation.mutate(values);
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
      <Alert message="載入失敗" description="無法載入檢舉資料" type="error" showIcon />
    );
  }

  const report = data?.data || {};
  const statusConfig = REPORT_STATUS[report.status] || { label: report.status, color: 'default' };

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reports')}>
          返回列表
        </Button>
        <h1 style={{ margin: 0 }}>檢舉詳情</h1>
      </Space>

      <Card
        title="檢舉資訊"
        extra={
          report.status !== 'resolved' && report.status !== 'rejected' && (
            <Button type="primary" onClick={() => setModalVisible(true)}>
              處理檢舉
            </Button>
          )
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="檢舉 ID">{report.id}</Descriptions.Item>
          <Descriptions.Item label="狀態">
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="檢舉類型">{report.report_type || '-'}</Descriptions.Item>
          <Descriptions.Item label="檢舉人">{report.reporter_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="被檢舉對象">{report.reported_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="檢舉時間">
            {formatDateTime(report.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="檢舉內容" span={2}>
            {report.content || '-'}
          </Descriptions.Item>
          {report.admin_remarks && (
            <Descriptions.Item label="處理備註" span={2}>
              {report.admin_remarks}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Modal
        title="處理檢舉"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ status: report.status }}>
          <Form.Item
            label="處理結果"
            name="status"
            rules={[{ required: true, message: '請選擇處理結果' }]}
          >
            <Select>
              {Object.entries(REPORT_STATUS).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="處理說明"
            name="remarks"
            rules={[{ required: true, message: '請輸入處理說明' }]}
          >
            <TextArea rows={4} placeholder="請說明處理結果和採取的措施" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportDetailPage;

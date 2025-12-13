import { useEffect, useMemo, useState } from 'react';
import rewardAPI from '../../api/rewardAPI';
import PageContainer from '../../components/PageContainer';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

// 簡易 Modal 元件
const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg p-5 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const rewardTypes = [
  { value: 'consecutive_days', label: '連續打卡' },
  { value: 'total_count', label: '累積次數' },
  { value: 'first_time', label: '首次' },
  { value: 'daily_bonus', label: '每日獎勵' },
];

const emptyForm = {
  temple_id: '',
  name: '',
  description: '',
  reward_type: 'consecutive_days',
  condition_value: 0,
  reward_points: 0,
  is_repeatable: true,
  start_date: '',
  end_date: '',
};

const RewardManagement = () => {
  const { user } = useAuth();
  const templeId = user?.temple_id;

  const [onlyActive, setOnlyActive] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const params = useMemo(
    () => ({
      templeId,
      isActive: onlyActive,
    }),
    [templeId, onlyActive],
  );

  const loadRewards = async () => {
    if (!templeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await rewardAPI.getTempleRewards(templeId, { isActive: onlyActive });
      setRewards(res.data?.rewards || res.data || []);
    } catch (err) {
      setError(err.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.templeId, params.isActive]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, temple_id: templeId });
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    setEditing(row);
    setDetailLoading(true);
    try {
      const res = await rewardAPI.getRewardDetail(row.id);
      const data = res.data || {};
      setForm({
        temple_id: data.temple_id ?? templeId ?? '',
        name: data.name || '',
        description: data.description || '',
        reward_type: data.reward_type || 'consecutive_days',
        condition_value: data.condition_value ?? 0,
        reward_points: data.reward_points ?? 0,
        is_repeatable: !!data.is_repeatable,
        start_date: data.start_date ? data.start_date.split('T')[0] : '',
        end_date: data.end_date ? data.end_date.split('T')[0] : '',
      });
      setModalOpen(true);
    } catch (err) {
      alert(err.message || '載入獎勵詳情失敗');
    } finally {
      setDetailLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        ...form,
        temple_id: form.temple_id || templeId || null,
        condition_value: Number(form.condition_value),
        reward_points: Number(form.reward_points),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (editing) {
        await rewardAPI.updateReward(editing.id, payload);
      } else {
        await rewardAPI.createReward(payload);
      }
      setModalOpen(false);
      await loadRewards();
    } catch (err) {
      alert(err.message || '送出失敗');
    } finally {
      setSubmitLoading(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`確認刪除「${row.name}」？`)) return;
    try {
      await rewardAPI.deleteReward(row.id);
      await loadRewards();
    } catch (err) {
      alert(err.message || '刪除失敗');
    }
  };

  if (!templeId) {
    return <ErrorMessage message="無法取得 temple_id，請重新登入或檢查帳號資訊。" />;
  }

  return (
    <PageContainer title="獎勵規則管理">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          只看啟用中的獎勵
        </label>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={openCreate}
        >
          + 新增獎勵規則
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">名稱</th>
                <th className="px-4 py-2">類型</th>
                <th className="px-4 py-2">條件值</th>
                <th className="px-4 py-2">點數</th>
                <th className="px-4 py-2">可重複</th>
                <th className="px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-center" colSpan={6}>
                    尚無資料
                  </td>
                </tr>
              )}
              {rewards.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">
                    {rewardTypes.find((t) => t.value === r.reward_type)?.label || r.reward_type}
                  </td>
                  <td className="px-4 py-2">{r.condition_value}</td>
                  <td className="px-4 py-2">{r.reward_points}</td>
                  <td className="px-4 py-2">{r.is_repeatable ? '是' : '否'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="text-blue-600 underline" onClick={() => openEdit(r)}>
                      編輯
                    </button>
                    <button className="text-red-600 underline" onClick={() => onDelete(r)}>
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `編輯：${editing.name}` : '新增獎勵規則'}
      >
        {detailLoading ? (
          <LoadingSpinner />
        ) : (
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input
              label="名稱"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="描述"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              類型
              <select
                className="border rounded px-3 py-2"
                value={form.reward_type}
                onChange={(e) => setForm({ ...form, reward_type: e.target.value })}
              >
                {rewardTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                label="條件值"
                type="number"
                value={form.condition_value}
                onChange={(e) => setForm({ ...form, condition_value: e.target.value })}
              />
              <Input
                label="獎勵點數"
                type="number"
                value={form.reward_points}
                onChange={(e) => setForm({ ...form, reward_points: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.is_repeatable}
                onChange={(e) => setForm({ ...form, is_repeatable: e.target.checked })}
              />
              允許重複領取
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                label="開始日期"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
              <Input
                label="結束日期"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 border rounded"
                onClick={() => setModalOpen(false)}
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                disabled={submitLoading}
              >
                {submitLoading ? '送出中...' : '送出'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
};

const Input = ({ label, type = 'text', ...rest }) => (
  <label className="flex flex-col gap-1 text-sm text-gray-700">
    {label}
    <input
      type={type}
      className="border rounded px-3 py-2"
      {...rest}
    />
  </label>
);

export default RewardManagement;

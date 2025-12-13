import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardAPI, templeAPI } from '../api';
import './Rewards.css';

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

const rewardTypes = [
  { value: 'consecutive_days', label: '連續簽到' },
  { value: 'total_count', label: '累積簽到次數' },
  { value: 'first_time', label: '首次' },
  { value: 'daily_bonus', label: '每日獎勵' },
];

const Rewards = () => {
  const [search, setSearch] = useState('');
  const [rewardTypeFilter, setRewardTypeFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();

  const rewardsQuery = useQuery({
    queryKey: ['rewards', search, rewardTypeFilter],
    queryFn: async () => {
      const res = await rewardAPI.list({
        reward_type: rewardTypeFilter || undefined,
        search: search || undefined,
        per_page: 50,
      });
      return res.data?.rewards || [];
    },
  });

  const templesQuery = useQuery({
    queryKey: ['temples-options'],
    queryFn: async () => {
      const res = await templeAPI.list({ limit: 100 });
      return res.data?.temples || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => rewardAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      resetForm();
    },
    onError: (err) => setFormError(err.message || '建立失敗'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => rewardAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      resetForm();
    },
    onError: (err) => setFormError(err.message || '更新失敗'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rewardAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      resetForm();
    },
    onError: (err) => setFormError(err.message || '刪除失敗'),
  });

  const startEdit = (item) => {
    setEditing(item);
    setForm({
      temple_id: item.temple_id ?? '',
      name: item.name || '',
      description: item.description || '',
      reward_type: item.reward_type || 'consecutive_days',
      condition_value: item.condition_value ?? 0,
      reward_points: item.reward_points ?? 0,
      is_repeatable: !!item.is_repeatable,
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name) {
      setFormError('名稱必填');
      return;
    }

    const payload = {
      temple_id: form.temple_id || null,
      name: form.name,
      description: form.description || undefined,
      reward_type: form.reward_type,
      condition_value: Number(form.condition_value) || 0,
      reward_points: Number(form.reward_points) || 0,
      is_repeatable: form.is_repeatable,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (reward) => {
    if (!window.confirm(`確定刪除「${reward.name}」？`)) return;
    deleteMutation.mutate(reward.id);
  };

  const rewards = rewardsQuery.data || [];
  const temples = templesQuery.data || [];

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <div>
          <h1>獎勵規則</h1>
          <p className="subtitle">新增、編輯、刪除獎勵規則</p>
        </div>
        <button type="button" className="btn-primary" onClick={resetForm}>
          + 新增獎勵
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="搜尋名稱"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={rewardTypeFilter} onChange={(e) => setRewardTypeFilter(e.target.value)}>
          <option value="">全部類型</option>
          {rewardTypes.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="content-grid">
        <div className="table-section">
          {rewardsQuery.isLoading && <div className="info">載入中...</div>}
          {rewardsQuery.isError && <div className="error">載入失敗</div>}
          {!rewardsQuery.isLoading && rewards.length === 0 && <div className="empty">尚無資料</div>}

          {rewards.length > 0 && (
            <div className="table-wrapper">
              <table className="rewards-table">
                <thead>
                  <tr>
                    <th>名稱</th>
                    <th>類型</th>
                    <th>條件值</th>
                    <th>點數</th>
                    <th>重複</th>
                    <th>廟宇</th>
                    <th>期間</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{rewardTypes.find((rt) => rt.value === r.reward_type)?.label || r.reward_type}</td>
                      <td>{r.condition_value}</td>
                      <td>{r.reward_points}</td>
                      <td>{r.is_repeatable ? '是' : '否'}</td>
                      <td>{r.temple_name || '-'}</td>
                      <td>
                        {r.start_date ? r.start_date.split('T')[0] : '-'} ~{' '}
                        {r.end_date ? r.end_date.split('T')[0] : '-'}
                      </td>
                      <td className="actions">
                        <button type="button" className="link" onClick={() => startEdit(r)}>
                          編輯
                        </button>
                        <button type="button" className="link danger" onClick={() => handleDelete(r)}>
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h3>{editing ? `編輯：${editing.name}` : '新增獎勵'}</h3>
              {editing && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  取消編輯
                </button>
              )}
            </div>

            {formError && <div className="error">{formError}</div>}

            <form onSubmit={handleSubmit} className="rewards-form">
              <label>
                所屬廟宇（可留空代表全域）
                <select
                  value={form.temple_id}
                  onChange={(e) => setForm({ ...form, temple_id: e.target.value })}
                >
                  <option value="">全域</option>
                  {temples.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                名稱*
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>

              <label>
                描述
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </label>

              <label>
                獎勵類型
                <select
                  value={form.reward_type}
                  onChange={(e) => setForm({ ...form, reward_type: e.target.value })}
                >
                  {rewardTypes.map((rt) => (
                    <option key={rt.value} value={rt.value}>
                      {rt.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="row">
                <label>
                  條件值
                  <input
                    type="number"
                    value={form.condition_value}
                    onChange={(e) => setForm({ ...form, condition_value: e.target.value })}
                  />
                </label>
                <label>
                  獎勵點數
                  <input
                    type="number"
                    value={form.reward_points}
                    onChange={(e) => setForm({ ...form, reward_points: e.target.value })}
                  />
                </label>
              </div>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.is_repeatable}
                  onChange={(e) => setForm({ ...form, is_repeatable: e.target.checked })}
                />
                允許重複領取
              </label>

              <div className="row">
                <label>
                  開始日期
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </label>
                <label>
                  結束日期
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editing ? '儲存變更' : '建立獎勵'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;

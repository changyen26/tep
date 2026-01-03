import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './Temples.css';

const emptyForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  main_deity: '',
  description: '',
  nfc_uid: '',
  is_active: true,
};

const Temples = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const isTempleAdmin = role === 'temple_admin';
  const userTempleId = user?.temple_id;

  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const queryClient = useQueryClient();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      is_active: isActive === '' ? undefined : isActive,
      limit,
      offset,
      ...(isTempleAdmin && userTempleId ? { temple_id: userTempleId } : {}),
    }),
    [search, isActive, limit, offset, isTempleAdmin, userTempleId],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['temples', queryParams],
    queryFn: async () => {
      const res = await templeAPI.list(queryParams);
      return res.data.data;
    },
    keepPreviousData: true,
    enabled: !isTempleAdmin || !!userTempleId,
  });

  const temples = data?.temples || [];
  const total = data?.total || 0;

  const createMutation = useMutation({
    mutationFn: (payload) => templeAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temples'] });
      resetForm();
    },
    onError: (err) => setFormError(err.message || '建立失敗'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => templeAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temples'] });
      resetForm();
    },
    onError: (err) => setFormError(err.message || '更新失敗'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => templeAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temples'] });
      resetForm();
    },
    onError: (err) => setFormError(err.message || '刪除失敗'),
  });

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      latitude: form.latitude !== '' ? Number(form.latitude) : undefined,
      longitude: form.longitude !== '' ? Number(form.longitude) : undefined,
      main_deity: form.main_deity.trim() || undefined,
      description: form.description.trim() || undefined,
      nfc_uid: form.nfc_uid.trim() || undefined,
      is_active: form.is_active,
    };

    if (!payload.name || !payload.address) {
      setFormError('名稱與地址為必填');
      return;
    }
    if (payload.latitude !== undefined && Number.isNaN(payload.latitude)) {
      setFormError('緯度需為數字');
      return;
    }
    if (payload.longitude !== undefined && Number.isNaN(payload.longitude)) {
      setFormError('經度需為數字');
      return;
    }

    if (isTempleAdmin && editing && editing.id !== userTempleId) {
      setFormError('僅能編輯自己所屬的廟宇');
      return;
    }
    if (isTempleAdmin && !editing) {
      setFormError('僅系統管理員可新增廟宇');
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (temple) => {
    setEditing(temple);
    setForm({
      name: temple.name || '',
      address: temple.address || '',
      latitude: temple.latitude ?? '',
      longitude: temple.longitude ?? '',
      main_deity: temple.main_deity || '',
      description: temple.description || '',
      nfc_uid: temple.nfc_uid || '',
      is_active: !!temple.is_active,
    });
  };

  const handleDelete = (temple) => {
    if (isTempleAdmin) {
      setFormError('僅系統管理員可刪除廟宇');
      return;
    }
    if (!window.confirm(`確認刪除「${temple.name}」？`)) return;
    deleteMutation.mutate(temple.id);
  };

  const toggleActive = (temple) => {
    if (isTempleAdmin) {
      setFormError('僅系統管理員可啟用/停用廟宇');
      return;
    }
    updateMutation.mutate({
      id: temple.id,
      payload: { is_active: !temple.is_active },
    });
  };

  const handlePageChange = (direction) => {
    const nextOffset = offset + direction * limit;
    if (nextOffset < 0) return;
    if (nextOffset >= total) return;
    setOffset(nextOffset);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    refetch();
  };

  if (isTempleAdmin && !userTempleId) {
    return (
      <div className="temples-page">
        <h1>廟宇管理</h1>
        <div className="error">帳號未設定所屬廟宇，請聯繫系統管理員。</div>
      </div>
    );
  }

  return (
    <div className="temples-page">
      <div className="temples-header">
        <div>
          <h1>廟宇管理</h1>
          <p className="subtitle">查看、搜尋、建立與編輯廟宇</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={resetForm}
          disabled={isTempleAdmin}
          title={isTempleAdmin ? '僅系統管理員可新增廟宇' : ''}
        >
          + 新增廟宇
        </button>
      </div>

      <form className="filters" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="搜尋名稱 / 地址 / 主祀神明"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isTempleAdmin}
          title={isTempleAdmin ? '已限定所屬廟宇' : ''}
        />
        <select value={isActive} onChange={(e) => setIsActive(e.target.value)}>
          <option value="">全部狀態</option>
          <option value="true">啟用</option>
          <option value="false">停用</option>
        </select>
        <button type="button" className="btn-secondary" onClick={() => setOffset(0)}>
          搜尋
        </button>
      </form>

      <div className="content-grid">
        <div className="table-section">
          {isLoading && <div className="info">載入中...</div>}
          {isError && <div className="error">載入失敗，請稍後再試</div>}

          {!isLoading && temples.length === 0 && <div className="empty">尚無資料</div>}

          {temples.length > 0 && (
            <div className="table-wrapper">
              <table className="temples-table">
                <thead>
                  <tr>
                    <th>名稱</th>
                    <th>地址</th>
                    <th>主祀神明</th>
                    <th>狀態</th>
                    <th>建立時間</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {temples.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.address}</td>
                      <td>{t.main_deity || '-'}</td>
                      <td>
                        <span className={t.is_active ? 'badge success' : 'badge muted'}>
                          {t.is_active ? '啟用' : '停用'}
                        </span>
                      </td>
                      <td>{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
                      <td className="actions">
                        <button type="button" className="link" onClick={() => startEdit(t)}>
                          編輯
                        </button>
                        <button type="button" className="link" onClick={() => navigate(`/temples/${t.id}`)}>
                          查看
                        </button>
                        {!isTempleAdmin && (
                          <button type="button" className="link" onClick={() => toggleActive(t)}>
                            {t.is_active ? '停用' : '啟用'}
                          </button>
                        )}
                        {!isTempleAdmin && (
                          <button type="button" className="link danger" onClick={() => handleDelete(t)}>
                            刪除
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {temples.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                onClick={() => handlePageChange(-1)}
                disabled={offset === 0}
              >
                上一頁
              </button>
              <span>
                {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={offset + limit >= total}
              >
                下一頁
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h3>{editing ? `編輯：${editing.name}` : '新增廟宇'}</h3>
              {editing && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  取消編輯
                </button>
              )}
            </div>

            {formError && <div className="error">{formError}</div>}

            <form onSubmit={handleSubmit} className="temple-form">
              <label>
                名稱*
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={isTempleAdmin && editing?.id !== userTempleId}
                />
              </label>
              <label>
                地址*
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  disabled={isTempleAdmin && editing?.id !== userTempleId}
                />
              </label>
              <div className="row">
                <label>
                  緯度
                  <input
                    type="number"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    step="0.000001"
                    disabled={isTempleAdmin && editing?.id !== userTempleId}
                  />
                </label>
                <label>
                  經度
                  <input
                    type="number"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    step="0.000001"
                    disabled={isTempleAdmin && editing?.id !== userTempleId}
                  />
                </label>
              </div>
              <label>
                主祀神明
                <input
                  type="text"
                  value={form.main_deity}
                  onChange={(e) => setForm({ ...form, main_deity: e.target.value })}
                  disabled={isTempleAdmin && editing?.id !== userTempleId}
                />
              </label>
              <label>
                NFC UID
                <input
                  type="text"
                  value={form.nfc_uid}
                  onChange={(e) => setForm({ ...form, nfc_uid: e.target.value })}
                  disabled={isTempleAdmin && editing?.id !== userTempleId}
                />
              </label>
              <label>
                描述
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  disabled={isTempleAdmin && editing?.id !== userTempleId}
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  disabled={isTempleAdmin}
                />
                啟用
              </label>

              <button
                type="submit"
                className="btn-primary full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editing ? '儲存變更' : '建立廟宇'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Temples;

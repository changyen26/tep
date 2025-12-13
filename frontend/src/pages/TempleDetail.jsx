import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { templeAPI, checkinAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './TempleDetail.css';

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value ?? '-'}</span>
  </div>
);

const TempleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const templeId = Number(id);
  const { role, user } = useAuth();
  const isTempleAdmin = role === 'temple_admin';
  const userTempleId = user?.temple_id;

  const disallow =
    isTempleAdmin && Number.isFinite(templeId) && userTempleId && templeId !== Number(userTempleId);

  const detailQuery = useQuery({
    queryKey: ['temple', templeId],
    queryFn: async () => {
      const res = await templeAPI.detail(templeId);
      return res.data;
    },
    enabled: Number.isFinite(templeId) && !disallow,
  });

  const recentCheckinsQuery = useQuery({
    queryKey: ['temple-checkins', templeId],
    queryFn: async () => {
      const res = await checkinAPI.history({ temple_id: templeId, per_page: 10, page: 1 });
      return res.data?.checkins || [];
    },
    enabled: Number.isFinite(templeId) && !disallow,
  });

  const temple = detailQuery.data;
  const checkins = useMemo(() => recentCheckinsQuery.data || [], [recentCheckinsQuery.data]);

  if (disallow) {
    return (
      <div className="temple-detail">
        <div className="header">
          <div>
            <h1>廟宇詳情</h1>
            <p className="subtitle">無權限查看此廟宇</p>
          </div>
          <Link to="/temples" className="btn-secondary">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return <div className="loading">載入中...</div>;
  }

  if (!temple) {
    return (
      <div className="temple-detail">
        <div className="header">
          <div>
            <h1>廟宇詳情</h1>
            <p className="subtitle">找不到資料</p>
          </div>
          <Link to="/temples" className="btn-secondary">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="temple-detail">
      <div className="header">
        <div>
          <h1>{temple.name}</h1>
          <p className="subtitle">座標 / NFC / 描述 / 近期簽到</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            返回
          </button>
          <Link to="/temples" className="btn-primary">
            廟宇列表
          </Link>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>基本資訊</h3>
          <div className="info-list">
            <InfoRow label="地址" value={temple.address} />
            <InfoRow label="主祀神明" value={temple.main_deity} />
            <InfoRow label="描述" value={temple.description} />
            <InfoRow label="NFC UID" value={temple.nfc_uid} />
            <InfoRow label="啟用狀態" value={temple.is_active ? '啟用' : '停用'} />
            <InfoRow label="建立時間" value={temple.created_at ? new Date(temple.created_at).toLocaleString() : '-'} />
          </div>
        </div>

        <div className="card">
          <h3>座標</h3>
          <div className="info-list">
            <InfoRow label="緯度" value={temple.latitude ?? '-'} />
            <InfoRow label="經度" value={temple.longitude ?? '-'} />
          </div>
          <div className="map-placeholder">地圖預覽尚未實作</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>公告</h3>
          <p className="muted">公告管理尚未實作</p>
        </div>

        <div className="card">
          <h3>近期簽到</h3>
          {recentCheckinsQuery.isLoading && <div className="muted">載入中...</div>}
          {!recentCheckinsQuery.isLoading && checkins.length === 0 && (
            <div className="muted">尚無簽到記錄</div>
          )}
          {checkins.length > 0 && (
            <div className="table">
              <div className="table-head">
                <div className="th">日期</div>
                <div className="th">使用者</div>
                <div className="th">護身符</div>
              </div>
              <div className="table-body">
                {checkins.map((c) => (
                  <div className="tr" key={c.id}>
                    <div className="td">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</div>
                    <div className="td">{c.user_name || c.user_id || '-'}</div>
                    <div className="td">{c.amulet_id ? `#${c.amulet_id}` : '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TempleDetail;

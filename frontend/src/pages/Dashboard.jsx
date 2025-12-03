import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { amuletAPI, checkinAPI, energyAPI } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [amulets, setAmulets] = useState([]);
  const [selectedAmulet, setSelectedAmulet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [energyLogs, setEnergyLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // 載入護身符列表
  const loadAmulets = async () => {
    try {
      const response = await amuletAPI.getAll();
      setAmulets(response.data.amulets);

      if (response.data.amulets.length > 0 && !selectedAmulet) {
        setSelectedAmulet(response.data.amulets[0]);
      }
    } catch (error) {
      console.error('載入護身符失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 創建新護身符
  const createAmulet = async () => {
    try {
      await amuletAPI.create({ energy: 0 });
      loadAmulets();
      alert('護身符創建成功！');
    } catch (error) {
      alert('創建失敗：' + (error.message || '未知錯誤'));
    }
  };

  // 檢查今天是否已簽到
  const checkTodayCheckin = async (amuletId) => {
    try {
      const response = await checkinAPI.checkToday(amuletId);
      setCheckedInToday(response.data.checked_in);
    } catch (error) {
      console.error('檢查簽到狀態失敗:', error);
    }
  };

  // 簽到
  const handleCheckin = async () => {
    if (!selectedAmulet) return;

    try {
      const response = await checkinAPI.checkin({ amulet_id: selectedAmulet.id });
      alert(`簽到成功！獲得 ${response.data.energy_added} 點能量`);
      setCheckedInToday(true);
      loadAmulets();
      loadEnergyData();
    } catch (error) {
      alert('簽到失敗：' + (error.message || '未知錯誤'));
    }
  };

  // 載入能量記錄和統計
  const loadEnergyData = async () => {
    if (!selectedAmulet) return;

    try {
      const response = await energyAPI.getByAmulet(selectedAmulet.id);
      setEnergyLogs(response.data.logs);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('載入能量記錄失敗:', error);
    }
  };

  // 手動充能
  const handleAddEnergy = async () => {
    if (!selectedAmulet) return;

    const amount = prompt('請輸入要充能的數量：');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    try {
      await energyAPI.add({ amulet_id: selectedAmulet.id, amount: Number(amount) });
      alert(`充能成功！增加 ${amount} 點能量`);
      loadAmulets();
      loadEnergyData();
    } catch (error) {
      alert('充能失敗：' + (error.message || '未知錯誤'));
    }
  };

  // 消耗能量
  const handleConsumeEnergy = async () => {
    if (!selectedAmulet) return;

    const amount = prompt('請輸入要消耗的能量：');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    try {
      await energyAPI.consume({ amulet_id: selectedAmulet.id, amount: Number(amount) });
      alert(`消耗成功！減少 ${amount} 點能量`);
      loadAmulets();
      loadEnergyData();
    } catch (error) {
      alert('消耗失敗：' + (error.message || '未知錯誤'));
    }
  };

  useEffect(() => {
    loadAmulets();
  }, []);

  useEffect(() => {
    if (selectedAmulet) {
      checkTodayCheckin(selectedAmulet.id);
      loadEnergyData();
    }
  }, [selectedAmulet]);

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>護身符管理系統</h1>
        <div className="user-info">
          <span>歡迎，{user?.name}</span>
          <button onClick={logout} className="btn-logout">登出</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>我的護身符</h2>
            <button onClick={createAmulet} className="btn-create">+ 新增</button>
          </div>

          <div className="amulet-list">
            {amulets.length === 0 ? (
              <p className="empty-message">還沒有護身符，點擊新增創建一個吧！</p>
            ) : (
              amulets.map((amulet) => (
                <div
                  key={amulet.id}
                  className={`amulet-item ${selectedAmulet?.id === amulet.id ? 'active' : ''}`}
                  onClick={() => setSelectedAmulet(amulet)}
                >
                  <div className="amulet-icon">🎴</div>
                  <div className="amulet-info">
                    <span className="amulet-id">護身符 #{amulet.id}</span>
                    <span className="amulet-energy">⚡ {amulet.energy} 能量</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="main-content">
          {selectedAmulet ? (
            <>
              <section className="amulet-detail">
                <h2>護身符 #{selectedAmulet.id}</h2>
                <div className="energy-display">
                  <div className="energy-value">
                    <span className="energy-icon">⚡</span>
                    <span className="energy-number">{selectedAmulet.energy}</span>
                  </div>
                  <p className="energy-label">當前能量</p>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={handleCheckin}
                    className="btn-checkin"
                    disabled={checkedInToday}
                  >
                    {checkedInToday ? '✓ 今天已簽到' : '📅 每日簽到 (+10)'}
                  </button>
                  <button onClick={handleAddEnergy} className="btn-action">⬆ 手動充能</button>
                  <button onClick={handleConsumeEnergy} className="btn-action">⬇ 消耗能量</button>
                </div>
              </section>

              {statistics && (
                <section className="statistics">
                  <h3>能量統計</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-label">總充能</span>
                      <span className="stat-value">+{statistics.total_added}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">總消耗</span>
                      <span className="stat-value">-{statistics.total_consumed}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">當前能量</span>
                      <span className="stat-value">{statistics.current_energy}</span>
                    </div>
                  </div>
                </section>
              )}

              <section className="energy-logs">
                <h3>能量記錄</h3>
                <div className="logs-list">
                  {energyLogs.length === 0 ? (
                    <p className="empty-message">暫無能量記錄</p>
                  ) : (
                    energyLogs.map((log) => (
                      <div key={log.id} className={`log-item ${log.energy_added > 0 ? 'positive' : 'negative'}`}>
                        <span className="log-type">
                          {log.energy_added > 0 ? '📈 充能' : '📉 消耗'}
                        </span>
                        <span className="log-amount">
                          {log.energy_added > 0 ? '+' : ''}{log.energy_added}
                        </span>
                        <span className="log-time">
                          {new Date(log.timestamp).toLocaleString('zh-TW')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className="empty-state">
              <h2>請選擇或創建一個護身符</h2>
              <p>點擊左側的「+ 新增」按鈕創建你的第一個護身符</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

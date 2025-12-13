import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await statsAPI.mySummary();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('載入統計資料失敗:', err);
        setError('載入資料失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="loading-message">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* 頁面標題 */}
      <div className="dashboard-header">
        <div>
          <h1>歡迎回來，{user?.name || '使用者'}</h1>
          <p className="subtitle">查看您的功德點數與活動記錄</p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">目前功德點數</div>
          <div className="stat-value">{stats?.blessing_points || 0}</div>
          <div className="stat-hint">可用於兌換商品</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">累計兌換次數</div>
          <div className="stat-value">{stats?.total_redemptions || 0}</div>
          <div className="stat-hint">次</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">累計消耗點數</div>
          <div className="stat-value">{stats?.total_points_used || 0}</div>
          <div className="stat-hint">點</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">累計打卡天數</div>
          <div className="stat-value">{stats?.total_checkins || 0}</div>
          <div className="stat-hint">天</div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-label">連續打卡天數</div>
          <div className="stat-value">{stats?.consecutive_checkin_days || 0}</div>
          <div className="stat-hint">保持連續打卡可獲得更多獎勵</div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="quick-actions-section">
        <h2 className="section-title">快速操作</h2>
        <div className="action-grid">
          <Link to="/temples" className="action-card">
            <div className="action-title">廟宇打卡</div>
            <div className="action-desc">前往廟宇打卡獲得功德點數</div>
          </Link>

          <Link to="/shop" className="action-card">
            <div className="action-title">商品兌換</div>
            <div className="action-desc">使用功德點數兌換精美商品</div>
          </Link>

          <Link to="/rewards" className="action-card">
            <div className="action-title">我的獎勵</div>
            <div className="action-desc">查看已兌換的商品與訂單狀態</div>
          </Link>
        </div>
      </div>

      {/* 功德點數說明 */}
      <div className="info-section">
        <h2 className="section-title">如何獲得功德點數？</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-number">1</div>
            <div className="info-content">
              <div className="info-title">廟宇打卡</div>
              <div className="info-text">前往合作廟宇進行打卡，每次可獲得功德點數</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-number">2</div>
            <div className="info-content">
              <div className="info-title">連續打卡獎勵</div>
              <div className="info-text">連續多天打卡可獲得額外獎勵點數</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-number">3</div>
            <div className="info-content">
              <div className="info-title">特殊活動</div>
              <div className="info-text">參加廟宇舉辦的特殊活動可獲得豐厚獎勵</div>
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="tips-section">
        <h2 className="section-title">使用小提示</h2>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-bullet">•</span>
            <span className="tip-text">建議定期前往廟宇打卡，保持連續打卡記錄可獲得更多獎勵</span>
          </div>
          <div className="tip-item">
            <span className="tip-bullet">•</span>
            <span className="tip-text">功德點數可用於兌換各式精美商品，請至商城頁面選購</span>
          </div>
          <div className="tip-item">
            <span className="tip-bullet">•</span>
            <span className="tip-text">已兌換的商品可在「我的獎勵」頁面查看訂單狀態與物流資訊</span>
          </div>
          <div className="tip-item">
            <span className="tip-bullet">•</span>
            <span className="tip-text">如有任何問題，請聯繫廟方管理人員或系統客服</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

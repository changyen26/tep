import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../api';
import './Dashboard.css';

const SummaryCard = ({ title, value, hint }) => (
  <div className="summary-card">
    <div className="summary-title">{title}</div>
    <div className="summary-value">{value ?? '-'}</div>
    {hint && <div className="summary-hint">{hint}</div>}
  </div>
);

const Table = ({ columns, data, emptyText = '無資料' }) => (
  <div className="table">
    <div className="table-head">
      {columns.map((c) => (
        <div key={c.key} className="th">
          {c.title}
        </div>
      ))}
    </div>
    <div className="table-body">
      {data.length === 0 && <div className="table-empty">{emptyText}</div>}
      {data.map((row, idx) => (
        <div className="tr" key={idx}>
          {columns.map((c) => (
            <div key={c.key} className="td">
              {c.render ? c.render(row) : row[c.dataIndex]}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await statsAPI.dashboard();
      return res.data;
    },
  });

  const topSellingQuery = useQuery({
    queryKey: ['top-selling'],
    queryFn: async () => {
      const res = await statsAPI.topSellingProducts({ limit: 5 });
      return res.data?.products || [];
    },
  });

  const lowStockQuery = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const res = await statsAPI.lowStockProducts({ threshold: 10 });
      return res.data || {};
    },
  });

  const redemptionTrendQuery = useQuery({
    queryKey: ['redemptions-trend'],
    queryFn: async () => {
      const res = await statsAPI.redemptionsTrend({ days: 14 });
      return res.data?.trend || [];
    },
  });

  const pointsFlowQuery = useQuery({
    queryKey: ['points-flow'],
    queryFn: async () => {
      const res = await statsAPI.pointsFlow({ days: 14 });
      return res.data;
    },
  });

  const loading =
    dashboardQuery.isLoading ||
    topSellingQuery.isLoading ||
    lowStockQuery.isLoading ||
    redemptionTrendQuery.isLoading ||
    pointsFlowQuery.isLoading;

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  const dashboard = dashboardQuery.data || {};
  const topSelling = topSellingQuery.data || [];
  const lowStock = lowStockQuery.data?.products || [];
  const lowStockThreshold = lowStockQuery.data?.threshold ?? 10;
  const trend = redemptionTrendQuery.data || [];
  const pointsFlow = pointsFlowQuery.data || {};

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>後台總覽</h1>
          <p className="subtitle">營運指標、庫存警示與近期動態</p>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/temples" className="btn-primary">
          廟宇管理
        </Link>
        <Link to="/rewards" className="btn-secondary">
          獎勵規則
        </Link>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="用戶總數"
          value={dashboard.users?.total}
          hint={`今日新增 ${dashboard.users?.new_today ?? 0}`}
        />
        <SummaryCard
          title="商品數"
          value={dashboard.products?.total}
          hint={`上架 ${dashboard.products?.active ?? 0}`}
        />
        <SummaryCard
          title="兌換待處理"
          value={dashboard.redemptions?.pending}
          hint={`今日兌換 ${dashboard.redemptions?.today ?? 0}`}
        />
        <SummaryCard
          title="累計消耗點數"
          value={dashboard.points?.total_used}
          hint={`今日 ${dashboard.points?.today_used ?? 0}`}
        />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>近 14 天兌換趨勢</h3>
              <p className="hint">每日兌換量與點數消耗</p>
            </div>
          </div>
          <Table
            columns={[
              { key: 'date', title: '日期', dataIndex: 'date' },
              { key: 'count', title: '兌換數', dataIndex: 'count' },
              { key: 'points', title: '點數', dataIndex: 'points' },
            ]}
            data={trend}
            emptyText="尚無兌換紀錄"
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>點數流向 (近 14 天)</h3>
              <p className="hint">累計與每日淨流向</p>
            </div>
          </div>
          <div className="points-summary">
            <div>
              <div className="label">累計獲得</div>
              <div className="value">{pointsFlow.summary?.total_earned ?? '-'}</div>
            </div>
            <div>
              <div className="label">累計消耗</div>
              <div className="value">{pointsFlow.summary?.total_spent ?? '-'}</div>
            </div>
            <div>
              <div className="label">淨流向</div>
              <div className="value">{pointsFlow.summary?.net_flow ?? '-'}</div>
            </div>
          </div>
          <Table
            columns={[
              { key: 'date', title: '日期', dataIndex: 'date' },
              { key: 'earned', title: '獲得', dataIndex: 'earned' },
              { key: 'spent', title: '消耗', dataIndex: 'spent' },
              { key: 'net', title: '淨流', dataIndex: 'net' },
            ]}
            data={pointsFlow.daily_flow || []}
            emptyText="尚無點數流向資料"
          />
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>熱銷商品 TOP 5</h3>
              <p className="hint">以近 30 天銷售為基準</p>
            </div>
          </div>
          <Table
            columns={[
              { key: 'name', title: '商品', dataIndex: 'name' },
              { key: 'sold', title: '銷售量', dataIndex: 'total_sold' },
              { key: 'points', title: '點數', dataIndex: 'merit_points' },
            ]}
            data={topSelling}
            emptyText="尚無銷售資料"
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>低庫存警示</h3>
              <p className="hint">庫存低於門檻的商品</p>
            </div>
          </div>
          <Table
            columns={[
              { key: 'name', title: '商品', dataIndex: 'name' },
              { key: 'stock', title: '庫存', dataIndex: 'stock_quantity' },
              { key: 'threshold', title: '警戒值', dataIndex: 'threshold' },
            ]}
            data={lowStock.map((p) => ({ ...p, threshold: lowStockThreshold }))}
            emptyText="目前沒有低庫存商品"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

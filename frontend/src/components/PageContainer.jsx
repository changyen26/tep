// 頁面容器：統一頁面標題與內距
const PageContainer = ({ title, children }) => (
  <div className="page-container" style={{ padding: '16px' }}>
    {title && <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{title}</h1>}
    {children}
  </div>
);

export default PageContainer;

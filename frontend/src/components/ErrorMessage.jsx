// 簡易錯誤訊息呈現
const ErrorMessage = ({ message }) => (
  <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
    {message || '發生錯誤'}
  </div>
);

export default ErrorMessage;

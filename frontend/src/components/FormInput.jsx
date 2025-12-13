// 簡易表單輸入元件
const FormInput = ({ label, type = 'text', value, onChange, required }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <span style={{ fontSize: '14px', color: '#374151' }}>
      {label} {required ? '*' : ''}
    </span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      style={{
        padding: '8px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
      }}
    />
  </label>
);

export default FormInput;

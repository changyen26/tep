// 簡易資料表格，接受 columns 與 data
// columns: [{ Header, accessor }]
// accessor 可為 string 或 function(row)
const DataTable = ({ columns, data }) => {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.Header}
                style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}
              >
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
              {columns.map((col) => (
                <td key={col.Header} style={{ padding: '10px' }}>
                  {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

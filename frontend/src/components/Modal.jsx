import { useEffect } from 'react';

// 簡易 Modal 元件
const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;
  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialog: {
    background: '#fff',
    borderRadius: '10px',
    padding: '16px',
    minWidth: '320px',
    maxWidth: '90vw',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default Modal;

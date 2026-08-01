import React from 'react';

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="page-loader" role="status" aria-label={message}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid var(--color-border2)',
          borderTopColor: 'var(--mana-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{message}</p>
      </div>
    </div>
  );
}

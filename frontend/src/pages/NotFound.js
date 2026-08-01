import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--color-bg)',
      paddingTop: 'var(--navbar-h)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🍽️</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px,6vw,56px)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          marginBottom: 12,
        }}>
          Page not found
        </h1>
        <p style={{
          fontSize: 16,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
          marginBottom: 32,
        }}>
          Looks like this page took a day off — just like your favourite home cook on a Sunday.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/"       className="btn-primary">Go home</Link>
          <Link to="/browse" className="btn-secondary">Browse cooks</Link>
        </div>
      </div>
    </div>
  );
}

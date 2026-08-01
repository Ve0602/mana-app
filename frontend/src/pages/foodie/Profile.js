// Profile.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dash-greeting">My Profile</h1>
        <div className="dash-card" style={{ maxWidth: 480 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'var(--space-5)', marginBottom:'var(--space-6)' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--mana-primary),var(--mana-primary-light))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#fff', fontWeight:800, flexShrink:0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800 }}>{user?.name}</div>
              <div style={{ fontSize:13, color:'var(--color-text-muted)', marginTop:2 }}>{user?.email}</div>
              <span style={{ display:'inline-block', marginTop:4, fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:'var(--radius-full)', background:'var(--mana-primary-dim)', color:'var(--mana-primary)' }}>
                {user?.role}
              </span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
            {user?.role === 'COOK' && <Link to="/cook/dashboard" className="btn-secondary">Cook Dashboard</Link>}
            {user?.role === 'FOODIE' && <Link to="/orders" className="btn-secondary">Order History</Link>}
            <button className="btn-ghost" style={{ color:'var(--color-danger)', justifyContent:'flex-start' }} onClick={logout}>
              🚪 Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

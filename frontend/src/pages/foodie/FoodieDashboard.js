import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services';
import '../../styles/dashboard.css';

export default function FoodieDashboard() {
  const { user }                = useAuth();
  const [active, setActive]     = useState([]);
  const [recent, setRecent]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [activeData, allData] = await Promise.all([
          orderService.getActiveOrders(),
          orderService.getMyOrders(),
        ]);
        setActive(activeData);
        setRecent(allData.filter(o => o.status === 'DELIVERED').slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">
              Hey, <span style={{ color: 'var(--mana-primary)' }}>{user.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="dash-subtitle">What are you craving today?</p>
          </div>
        </div>

        {/* Active orders */}
        {active.length > 0 && (
          <div className="dash-card" style={{ border: '2px solid var(--mana-primary)', background: 'var(--mana-primary-dim)' }}>
            <div className="dash-card-header">
              <h2 className="dash-card-title" style={{ color: 'var(--mana-primary)' }}>
                🔴 Live order in progress
              </h2>
              <Link to={`/order/${active[0].orderId}`} className="dash-card-link">Track →</Link>
            </div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{active[0].kitchenName}</div>
            <div style={{ fontSize:13, color:'var(--color-text-secondary)', marginBottom:8 }}>
              {active[0].items?.map(i=>`${i.dishName} ×${i.quantity}`).join(' · ')}
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--mana-primary)', color:'#fff', padding:'6px 14px', borderRadius:'var(--radius-full)', fontSize:12, fontWeight:700 }}>
              <span className="pulse-dot" style={{ background:'#fff' }} />
              {active[0].status?.replace('_', ' ')}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="quick-links-grid">
          <Link to="/browse"   className="quick-link-card"><span className="quick-link-icon">🔍</span><span>Browse Cooks</span></Link>
          <Link to="/orders"   className="quick-link-card"><span className="quick-link-icon">📦</span><span>My Orders</span></Link>
          <Link to="/cart"     className="quick-link-card"><span className="quick-link-icon">🛒</span><span>My Cart</span></Link>
          <Link to="/profile"  className="quick-link-card"><span className="quick-link-icon">👤</span><span>Profile</span></Link>
        </div>

        {/* Recent orders */}
        {recent.length > 0 && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title">🕐 Recent orders</h2>
              <Link to="/orders" className="dash-card-link">View all →</Link>
            </div>
            <div className="orders-list">
              {recent.map(order => (
                <div key={order.orderId} className="order-item">
                  <div className="order-item-left">
                    <div className="order-id">#{order.orderId?.slice(-6).toUpperCase()}</div>
                    <div className="order-customer">{order.kitchenName}</div>
                    <div className="order-items-summary">
                      {order.items?.map(i => `${i.dishName} ×${i.quantity}`).join(', ')}
                    </div>
                  </div>
                  <div className="order-item-right">
                    <div className="order-amount">₹{order.finalAmount}</div>
                    {order.rating && <div style={{ fontSize:12, color:'#f59e0b' }}>{'⭐'.repeat(order.rating)}</div>}
                    <Link to={`/cook/${order.cookId}`} className="btn-ghost" style={{ fontSize:12, padding:'4px 10px' }}>
                      Order again
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recent.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No orders yet</h3>
            <p>Discover amazing home cooks near you</p>
            <Link to="/browse" className="btn-primary">Find a home cook</Link>
          </div>
        )}
      </div>
    </div>
  );
}

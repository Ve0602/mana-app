import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services';
import '../../styles/dashboard.css';

const STATUS_COLORS = {
  PENDING:          { bg: '#fef3c7', color: '#b45309' },
  ACCEPTED:         { bg: '#dbeafe', color: '#1d4ed8' },
  PREPARING:        { bg: '#ede9fe', color: '#6d28d9' },
  READY:            { bg: '#d1fae5', color: '#065f46' },
  OUT_FOR_DELIVERY: { bg: '#e0f2fe', color: '#0369a1' },
  DELIVERED:        { bg: '#dcfce7', color: '#15803d' },
  CANCELLED:        { bg: '#fee2e2', color: '#b91c1c' },
};

export default function OrderHistory() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all'
    ? orders
    : filter === 'active'
      ? orders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status))
      : orders.filter(o => o.status === filter.toUpperCase());

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">My Orders 📦</h1>
            <p className="dash-subtitle">{orders.length} total orders</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-pills" style={{ marginBottom: 'var(--space-2)' }}>
          {['all','active','delivered','cancelled'].map(f => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:120 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>Your order history will appear here</p>
            <Link to="/browse" className="btn-primary">Browse home cooks</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map(order => {
              const sc = STATUS_COLORS[order.status] || {};
              return (
                <div key={order.orderId} className="dash-card" style={{ padding: 'var(--space-5)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'var(--space-4)', flexWrap:'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', marginBottom:'var(--space-2)', flexWrap:'wrap' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--color-text-muted)' }}>
                          #{order.orderId?.slice(-8).toUpperCase()}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px',
                          borderRadius: 'var(--radius-full)', letterSpacing: '.06em',
                          background: sc.bg, color: sc.color,
                        }}>
                          {order.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>
                        🏠 {order.kitchenName}
                      </div>

                      <div style={{ fontSize:13, color:'var(--color-text-secondary)', marginBottom:6 }}>
                        {order.items?.map(i => `${i.dishName} ×${i.quantity}`).join(' · ')}
                      </div>

                      <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day:'numeric', month:'short', year:'numeric',
                          hour:'2-digit', minute:'2-digit'
                        })}
                        {order.rating && ` · ⭐ ${order.rating}/5`}
                      </div>
                    </div>

                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:20, fontWeight:800, color:'var(--mana-primary)', marginBottom:'var(--space-3)' }}>
                        ₹{order.finalAmount}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
                        {!['DELIVERED','CANCELLED'].includes(order.status) && (
                          <Link to={`/order/${order.orderId}`} className="btn-primary" style={{ fontSize:13, padding:'7px 16px', textAlign:'center' }}>
                            Track order →
                          </Link>
                        )}
                        {order.status === 'DELIVERED' && (
                          <Link to={`/order/${order.orderId}`} className="btn-secondary" style={{ fontSize:13, padding:'7px 16px', textAlign:'center' }}>
                            View details
                          </Link>
                        )}
                        <Link to={`/cook/${order.cookId}`} className="btn-ghost" style={{ fontSize:12, padding:'5px 12px', textAlign:'center' }}>
                          Order again
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

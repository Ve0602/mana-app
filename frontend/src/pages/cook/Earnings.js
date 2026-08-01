import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services';
import '../../styles/dashboard.css';

export default function Earnings() {
  const { user }              = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('week');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await orderService.getCookOrders();
      setOrders(data.filter(o => o.status === 'DELIVERED'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const now   = new Date();
  const since = (days) => new Date(now - days * 864e5);

  const filterByPeriod = (list) => {
    const cutoff = period === 'today' ? since(1)
      : period === 'week'  ? since(7)
      : period === 'month' ? since(30)
      : new Date(0);
    return list.filter(o => new Date(o.createdAt) >= cutoff);
  };

  const periodOrders = filterByPeriod(orders);
  const totalRevenue = periodOrders.reduce((s, o) => s + (o.finalAmount || 0), 0);
  const totalCount   = periodOrders.length;
  const avgOrder     = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  // Group by date
  const byDate = periodOrders.reduce((acc, o) => {
    const date = new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    if (!acc[date]) acc[date] = { count: 0, revenue: 0 };
    acc[date].count++;
    acc[date].revenue += o.finalAmount || 0;
    return acc;
  }, {});

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">Earnings 💰</h1>
            <p className="dash-subtitle">Track your income from Mana</p>
          </div>
        </div>

        {/* Period selector */}
        <div className="filter-pills">
          {['today','week','month','all'].map(p => (
            <button key={p} className={`filter-pill ${period===p?'active':''}`} onClick={()=>setPeriod(p)}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-val">₹{totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-val">{totalCount}</div>
            <div className="stat-label">Orders delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-val">₹{avgOrder}</div>
            <div className="stat-label">Avg order value</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-val">{orders.length}</div>
            <div className="stat-label">Lifetime deliveries</div>
          </div>
        </div>

        {/* Day-by-day breakdown */}
        {Object.keys(byDate).length > 0 && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Daily breakdown</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
              {Object.entries(byDate).reverse().map(([date, d]) => (
                <div key={date} style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-3) 0', borderBottom:'1px solid var(--color-border)' }}>
                  <div style={{ width:80, fontSize:13, fontWeight:600, color:'var(--color-text-secondary)', flexShrink:0 }}>{date}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:6, borderRadius:3, background:'var(--color-surface2)', overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:3,
                        background:'linear-gradient(90deg,var(--mana-primary),var(--mana-primary-light))',
                        width:`${Math.min(100,(d.revenue/Math.max(...Object.values(byDate).map(x=>x.revenue)))*100)}%`,
                        transition:'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:'var(--color-text-muted)', flexShrink:0 }}>{d.count} order{d.count!==1?'s':''}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--mana-primary)', minWidth:72, textAlign:'right', flexShrink:0 }}>
                    ₹{d.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Recent transactions</h2>
          </div>
          {periodOrders.length === 0 ? (
            <div className="empty-state" style={{ padding:'var(--space-8) 0' }}>
              <div className="empty-icon">💸</div>
              <h3>No earnings yet for this period</h3>
              <p>Start accepting orders to see your earnings here</p>
            </div>
          ) : (
            <div className="orders-list">
              {periodOrders.slice(0, 15).map(order => (
                <div key={order.orderId} className="order-item">
                  <div className="order-item-left">
                    <div className="order-id">#{order.orderId?.slice(-6).toUpperCase()}</div>
                    <div className="order-customer">{order.foodieName}</div>
                    <div className="order-items-summary">
                      {order.items?.map(i => `${i.dishName} ×${i.quantity}`).join(', ')}
                    </div>
                    <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:2 }}>
                      {new Date(order.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                      {' · '}{order.paymentMethod}
                    </div>
                  </div>
                  <div className="order-item-right">
                    <div style={{ fontSize:18, fontWeight:700, color:'var(--color-success)' }}>+₹{order.finalAmount}</div>
                    {order.rating && <div style={{ fontSize:12, color:'#f59e0b' }}>{'⭐'.repeat(order.rating)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService, cookService, dishService } from '../../services';
import '../../styles/dashboard.css';

export default function CookDashboard() {
  const { user } = useAuth();
  const [cook, setCook]         = useState(null);
  const [activeOrders, setActive] = useState([]);
  const [dishes, setDishes]     = useState([]);
  const [stats, setStats]       = useState({ today: 0, week: 0, month: 0, orders: 0 });
  const [loading, setLoading]   = useState(true);
  const [moodInput, setMood]    = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [cookData, ordersData, dishesData] = await Promise.all([
        cookService.getById(user.userId),
        orderService.getCookOrders(),
        dishService.getByCook(user.userId),
      ]);
      setCook(cookData);
      setMood(cookData.cookMood || '');
      setActive(ordersData.filter(o =>
        ['PENDING','ACCEPTED','PREPARING','READY'].includes(o.status)
      ));
      setDishes(dishesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const updated = await cookService.toggleAvailability(user.userId);
      setCook(updated);
    } catch (e) { console.error(e); }
  };

  const saveMood = async () => {
    try {
      await cookService.updateMood(user.userId, moodInput);
      setCook(c => ({ ...c, cookMood: moodInput }));
    } catch (e) { console.error(e); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      load();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width:36,height:36 }} /></div>;

  const nextStatus = {
    PENDING:  { label: '✅ Accept Order',  next: 'ACCEPTED'  },
    ACCEPTED: { label: '👨‍🍳 Start Cooking', next: 'PREPARING' },
    PREPARING:{ label: '🍱 Mark Ready',    next: 'READY'     },
    READY:    { label: '🚚 Out for Delivery', next: 'OUT_FOR_DELIVERY' },
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* ── Welcome header ─────────────────────────────── */}
        <div className="dash-header">
          <div className="dash-header-left">
            <h1 className="dash-greeting">
              Welcome back, <span style={{ color: 'var(--mana-primary)' }}>{user.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="dash-subtitle">
              {cook?.kitchenName} · {cook?.city}
            </p>
          </div>

          {/* Availability toggle */}
          <div className="avail-toggle-wrap">
            <span className="avail-toggle-label">
              {cook?.isAvailable ? '🟢 Accepting orders' : '🔴 Not available'}
            </span>
            <button
              className={`avail-toggle-btn ${cook?.isAvailable ? 'active' : ''}`}
              onClick={toggleAvailability}
            >
              {cook?.isAvailable ? 'Go offline' : 'Go online'}
            </button>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-val">{activeOrders.length}</div>
            <div className="stat-label">Active orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-val">₹{stats.today.toLocaleString()}</div>
            <div className="stat-label">Today's earnings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-val">{cook?.avgRating?.toFixed(1) || '—'}</div>
            <div className="stat-label">Your rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍱</div>
            <div className="stat-val">{cook?.totalDeliveries || 0}</div>
            <div className="stat-label">Total deliveries</div>
          </div>
        </div>

        {/* ── Cook mood ──────────────────────────────────── */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">💬 Today's mood</h2>
            <p className="dash-card-sub">Tell your customers what you're cooking today</p>
          </div>
          <div style={{ display:'flex', gap: 10 }}>
            <input
              className="form-input"
              placeholder="e.g. Making fresh biryani today! 🍛"
              value={moodInput}
              onChange={e => setMood(e.target.value)}
              maxLength={200}
              onKeyDown={e => e.key === 'Enter' && saveMood()}
            />
            <button className="btn-primary" onClick={saveMood} style={{ whiteSpace:'nowrap' }}>
              Save
            </button>
          </div>
        </div>

        {/* ── Active orders ──────────────────────────────── */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">🔔 Active orders ({activeOrders.length})</h2>
            <Link to="/cook/orders" className="dash-card-link">See all →</Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
              <div className="empty-icon">🍽️</div>
              <h3>No active orders</h3>
              <p>New orders will appear here in real time</p>
            </div>
          ) : (
            <div className="orders-list">
              {activeOrders.map(order => (
                <div key={order.orderId} className="order-item">
                  <div className="order-item-left">
                    <div className="order-id">#{order.orderId.slice(-6).toUpperCase()}</div>
                    <div className="order-customer">{order.foodieName}</div>
                    <div className="order-items-summary">
                      {order.items?.map(i => `${i.dishName} ×${i.quantity}`).join(', ')}
                    </div>
                    <div className="order-address" style={{ fontSize:12, color:'var(--color-text-muted)', marginTop:2 }}>
                      📍 {order.deliveryAddress}
                    </div>
                    {order.specialInstructions && (
                      <div style={{ fontSize:12, color:'var(--color-text-secondary)', marginTop:4, fontStyle:'italic' }}>
                        Note: {order.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div className="order-item-right">
                    <div className="order-amount">₹{order.finalAmount}</div>
                    <div className={`order-status-badge status-${order.status.toLowerCase()}`}>
                      {order.status.replace('_', ' ')}
                    </div>
                    {nextStatus[order.status] && (
                      <button
                        className="btn-primary"
                        style={{ fontSize:12, padding:'6px 14px', marginTop: 8 }}
                        onClick={() => updateOrderStatus(order.orderId, nextStatus[order.status].next)}
                      >
                        {nextStatus[order.status].label}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Menu overview ──────────────────────────────── */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">🍽️ My menu ({dishes.length} dishes)</h2>
            <Link to="/cook/menu" className="dash-card-link">Manage menu →</Link>
          </div>
          <div className="menu-preview-grid">
            {dishes.slice(0, 6).map(dish => (
              <div key={dish.dishId} className={`menu-preview-card ${!dish.isAvailable ? 'unavail' : ''}`}>
                <div className="menu-preview-name">{dish.dishName}</div>
                <div className="menu-preview-price">₹{dish.price}</div>
                <div className={`menu-preview-status ${dish.isAvailable ? 'avail' : 'unavail'}`}>
                  {dish.isAvailable ? '● Available' : '○ Off'}
                </div>
              </div>
            ))}
            {dishes.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'var(--space-6)', color:'var(--color-text-muted)' }}>
                No dishes yet. <Link to="/cook/menu" className="auth-link">Add your first dish →</Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick links ─────────────────────────────────── */}
        <div className="quick-links-grid">
          <Link to="/cook/menu"     className="quick-link-card">
            <span className="quick-link-icon">🍽️</span>
            <span>Manage Menu</span>
          </Link>
          <Link to="/cook/orders"   className="quick-link-card">
            <span className="quick-link-icon">📦</span>
            <span>All Orders</span>
          </Link>
          <Link to="/cook/earnings" className="quick-link-card">
            <span className="quick-link-icon">💰</span>
            <span>Earnings</span>
          </Link>
          <Link to="/profile"       className="quick-link-card">
            <span className="quick-link-icon">👤</span>
            <span>Profile</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

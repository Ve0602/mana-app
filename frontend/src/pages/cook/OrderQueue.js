import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services';
import '../../styles/dashboard.css';

const NEXT = {
  PENDING:   { label: '✅ Accept',           next: 'ACCEPTED'   },
  ACCEPTED:  { label: '👨‍🍳 Start cooking',    next: 'PREPARING'  },
  PREPARING: { label: '🍱 Mark ready',        next: 'READY'      },
  READY:     { label: '🚚 Out for delivery',  next: 'OUT_FOR_DELIVERY' },
};

export default function OrderQueue() {
  const { user }              = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('active');

  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);

  const load = async () => {
    setLoading(true);
    try { const d = await orderService.getCookOrders(); setOrders(d); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try { await orderService.updateStatus(orderId, status); load(); }
    catch (e) { alert('Failed to update status'); }
  };

  const filtered = filter === 'active'
    ? orders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status))
    : orders.filter(o => o.status === 'DELIVERED');

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">Order Queue 📦</h1>
            <p className="dash-subtitle">
              {orders.filter(o=>!['DELIVERED','CANCELLED'].includes(o.status)).length} active orders
            </p>
          </div>
          <button className="btn-secondary" onClick={load}>↺ Refresh</button>
        </div>

        <div className="filter-pills">
          <button className={`filter-pill ${filter==='active'?'active':''}`} onClick={()=>setFilter('active')}>Active orders</button>
          <button className={`filter-pill ${filter==='delivered'?'active':''}`} onClick={()=>setFilter('delivered')}>Delivered</button>
        </div>

        {loading && orders.length === 0 ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[1,2].map(i=><div key={i} className="skeleton" style={{height:150}}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{filter==='active' ? '🎉' : '📦'}</div>
            <h3>{filter==='active' ? 'No active orders right now' : 'No deliveries yet'}</h3>
            <p>{filter==='active' ? 'New orders will appear here automatically' : 'Completed deliveries will show here'}</p>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map(order => (
              <div key={order.orderId} className="dash-card" style={{padding:'var(--space-5)'}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:'var(--space-4)',flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'var(--space-3)',marginBottom:'var(--space-2)',flexWrap:'wrap'}}>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--color-text-muted)'}}>
                        #{order.orderId?.slice(-6).toUpperCase()}
                      </span>
                      <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                        {order.status.replace('_',' ')}
                      </span>
                      <span style={{fontSize:12,color:'var(--color-text-muted)'}}>
                        {new Date(order.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                      </span>
                    </div>
                    <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{order.foodieName}</div>
                    <div style={{fontSize:13,color:'var(--color-text-secondary)',marginBottom:4}}>
                      {order.items?.map(i=>`${i.dishName} ×${i.quantity}`).join(' · ')}
                    </div>
                    <div style={{fontSize:12,color:'var(--color-text-muted)',marginBottom:4}}>
                      📍 {order.deliveryAddress}
                    </div>
                    {order.specialInstructions && (
                      <div style={{fontSize:12,color:'var(--color-text-secondary)',fontStyle:'italic',background:'var(--color-surface2)',padding:'6px 10px',borderRadius:'var(--radius-sm)'}}>
                        Note: {order.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'var(--space-3)',flexShrink:0}}>
                    <div style={{fontSize:22,fontWeight:800,color:'var(--mana-primary)'}}>₹{order.finalAmount}</div>
                    <div style={{fontSize:12,color:'var(--color-text-muted)'}}>{order.paymentMethod}</div>
                    {NEXT[order.status] && (
                      <button
                        className="btn-primary"
                        style={{fontSize:12,padding:'8px 16px',whiteSpace:'nowrap'}}
                        onClick={()=>updateStatus(order.orderId, NEXT[order.status].next)}
                      >
                        {NEXT[order.status].label}
                      </button>
                    )}
                    {order.status==='PENDING' && (
                      <button
                        className="btn-ghost"
                        style={{fontSize:11,color:'var(--color-danger)',padding:'4px 10px'}}
                        onClick={()=>updateStatus(order.orderId,'CANCELLED')}
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services';
import '../styles/order-tracking.css';

const STATUS_STEPS = [
  { key: 'PENDING',           icon: '📋', label: 'Order placed',      desc: 'Waiting for cook to accept' },
  { key: 'ACCEPTED',          icon: '✅', label: 'Order accepted',     desc: 'Cook has accepted your order' },
  { key: 'PREPARING',         icon: '👨‍🍳', label: 'Preparing',         desc: 'Your food is being cooked' },
  { key: 'READY',             icon: '🍱', label: 'Ready',              desc: 'Food is packed and ready' },
  { key: 'OUT_FOR_DELIVERY',  icon: '🚚', label: 'Out for delivery',   desc: 'On the way to you' },
  { key: 'DELIVERED',         icon: '🎉', label: 'Delivered',          desc: 'Enjoy your meal!' },
];

const STATUS_INDEX = Object.fromEntries(STATUS_STEPS.map((s, i) => [s.key, i]));

export default function OrderTracking() {
  const { id }              = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoad]  = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [rated, setRated]   = useState(false);

  useEffect(() => {
    load();
    // Poll every 15 seconds for live updates
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const load = async () => {
    try {
      const data = await orderService.getById(id);
      setOrder(data);
      if (data.rating) { setRating(data.rating); setRated(true); }
    } catch (e) { console.error(e); }
    finally { setLoad(false); }
  };

  const handleRate = async () => {
    if (!rating) return;
    try {
      await orderService.rateOrder(id, rating, review);
      setRated(true);
    } catch (e) { console.error(e); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderService.cancel(id);
      load();
    } catch (e) { alert('Cannot cancel at this stage.'); }
  };

  if (loading) return (
    <div className="page-loader"><div className="spinner" style={{ width:40,height:40 }} /></div>
  );

  if (!order) return (
    <div className="page-loader">
      <div className="empty-state">
        <div className="empty-icon">😕</div>
        <h3>Order not found</h3>
        <Link to="/orders" className="btn-primary">View all orders</Link>
      </div>
    </div>
  );

  const currentIdx  = STATUS_INDEX[order.status] ?? 0;
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const canCancel   = ['PENDING'].includes(order.status);

  const eta = order.estimatedDeliveryTime
    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '30–45 mins';

  return (
    <div className="tracking-page">
      <div className="container">

        {/* Header */}
        <div className="tracking-header">
          <div>
            <h1 className="tracking-title">
              {isDelivered ? '🎉 Delivered!' : isCancelled ? '❌ Cancelled' : '📍 Tracking Order'}
            </h1>
            <p className="tracking-id">Order #{order.orderId?.slice(-8).toUpperCase()}</p>
          </div>
          {!isDelivered && !isCancelled && (
            <div className="tracking-eta">
              <div className="eta-label">Estimated delivery</div>
              <div className="eta-time">{eta}</div>
            </div>
          )}
        </div>

        <div className="tracking-layout">
          <div className="tracking-main">

            {/* Status timeline */}
            {!isCancelled && (
              <div className="tracking-card">
                <h2 className="tracking-section-title">Order status</h2>
                <div className="timeline">
                  {STATUS_STEPS.map((step, i) => {
                    const done    = i <= currentIdx;
                    const current = i === currentIdx;
                    return (
                      <div key={step.key} className={`timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                        <div className="timeline-icon-wrap">
                          <div className="timeline-icon">{done ? step.icon : '○'}</div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`timeline-line ${done ? 'done' : ''}`} />
                          )}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">{step.label}</div>
                          {current && <div className="timeline-desc">{step.desc}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order items */}
            <div className="tracking-card">
              <h2 className="tracking-section-title">Your items · {order.kitchenName}</h2>
              {order.items?.map(item => (
                <div key={item.itemId} className="tracking-item">
                  <span className="tracking-item-name">{item.dishName}</span>
                  <span className="tracking-item-qty">× {item.quantity}</span>
                  <span className="tracking-item-price">₹{item.subtotal}</span>
                </div>
              ))}
              <div className="tracking-divider" />
              <div className="tracking-item" style={{ fontWeight:700, color:'var(--color-text-primary)' }}>
                <span>Total paid</span>
                <span />
                <span>₹{order.finalAmount}</span>
              </div>
              <div className="tracking-item" style={{ fontSize:12, color:'var(--color-text-muted)' }}>
                <span>Payment: {order.paymentMethod} · {order.paymentStatus}</span>
              </div>
            </div>

            {/* Delivery address */}
            <div className="tracking-card">
              <h2 className="tracking-section-title">📍 Delivery address</h2>
              <p style={{ fontSize:14, color:'var(--color-text-secondary)', lineHeight:1.6 }}>
                {order.deliveryAddress}
              </p>
            </div>

            {/* Rating (after delivery) */}
            {isDelivered && !rated && (
              <div className="tracking-card">
                <h2 className="tracking-section-title">⭐ Rate your meal</h2>
                <p style={{ fontSize:13, color:'var(--color-text-muted)', marginBottom:'var(--space-4)' }}>
                  How was your meal from {order.kitchenName}?
                </p>
                <div className="star-rating">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      className={`star-btn ${s <= rating ? 'active' : ''}`}
                      onClick={() => setRating(s)}
                      aria-label={`Rate ${s} stars`}
                    >★</button>
                  ))}
                </div>
                {rating > 0 && (
                  <>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="Leave a review (optional)..."
                      value={review}
                      onChange={e => setReview(e.target.value)}
                      style={{ marginTop:'var(--space-3)', resize:'vertical' }}
                    />
                    <button className="btn-primary" style={{ marginTop:'var(--space-3)' }} onClick={handleRate}>
                      Submit rating
                    </button>
                  </>
                )}
              </div>
            )}

            {rated && isDelivered && (
              <div className="alert alert-success">
                ⭐ Thanks for rating! Your feedback helps home cooks improve.
              </div>
            )}

            {/* Cancel button */}
            {canCancel && (
              <button
                className="btn-ghost"
                style={{ color:'var(--color-danger)', marginTop:'var(--space-2)' }}
                onClick={handleCancel}
              >
                Cancel order
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop:'var(--space-6)', display:'flex', gap:'var(--space-4)' }}>
          <Link to="/orders"  className="btn-secondary">View all orders</Link>
          <Link to="/browse"  className="btn-ghost">Order again</Link>
        </div>
      </div>
    </div>
  );
}

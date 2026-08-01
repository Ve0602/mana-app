import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/cart.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [note, setNote] = useState('');

  if (totalItems === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state" style={{ minHeight: '60vh', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse home cooks and add delicious dishes to your cart</p>
            <Link to="/browse" className="btn-primary" style={{ alignSelf: 'center' }}>Browse cooks</Link>
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee  = totalPrice >= 200 ? 0 : 30;
  const platformFee  = 5;
  const grandTotal   = totalPrice + deliveryFee + platformFee;

  const handleCheckout = () => {
    navigate('/checkout', { state: { note } });
  };

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-from">From <strong>{cart.kitchenName}</strong> · {totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>

        <div className="cart-layout">
          {/* ── Items ────────────────────────────────── */}
          <div className="cart-items">
            <div className="cart-card">
              {cart.items.map(item => (
                <div key={item.dishId} className="cart-item">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.dishName} className="cart-item-img" />
                  )}
                  <div className="cart-item-body">
                    <div className="cart-item-name">{item.dishName}</div>
                    <div className="cart-item-price">₹{item.price} each</div>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <div className="cart-item-subtotal">₹{item.price * item.quantity}</div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.dishId)}
                    aria-label={`Remove ${item.dishName}`}
                  >✕</button>
                </div>
              ))}
            </div>

            {/* Special instructions */}
            <div className="cart-card">
              <h3 className="cart-section-title">🗒️ Special instructions</h3>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Any special requests? e.g. Less spicy, extra gravy, no onion..."
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={300}
                style={{ resize: 'vertical', marginTop: 8 }}
              />
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, textAlign: 'right' }}>
                {note.length}/300
              </div>
            </div>
          </div>

          {/* ── Summary ──────────────────────────────── */}
          <div className="cart-summary">
            <div className="cart-card">
              <h3 className="cart-section-title">Order summary</h3>

              <div className="summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="summary-row">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? 'free-tag' : ''}>
                  {deliveryFee === 0 ? '🎉 FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <div className="free-delivery-hint">
                  Add ₹{200 - totalPrice} more for free delivery
                </div>
              )}
              <div className="summary-row">
                <span>Platform fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>

              <button className="btn-primary checkout-btn" onClick={handleCheckout}>
                Proceed to checkout →
              </button>

              <div className="cart-meta">
                <span>🏠 Home cooked by <strong>{cart.kitchenName}</strong></span>
                <span>🕐 Est. delivery: 30–45 mins</span>
                <span>💰 Save ₹0 with Mana vs restaurant</span>
              </div>
            </div>

            <button className="btn-ghost clear-cart-btn" onClick={() => { if (window.confirm('Clear your cart?')) clearCart(); }}>
              🗑️ Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

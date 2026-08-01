import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services';
import '../styles/checkout.css';

const PAYMENT_METHODS = [
  { id: 'UPI',    icon: '📱', label: 'UPI', desc: 'PhonePe, GPay, Paytm' },
  { id: 'CARD',   icon: '💳', label: 'Card', desc: 'Debit / Credit card' },
  { id: 'COD',    icon: '💵', label: 'Cash on Delivery', desc: 'Pay when delivered' },
  { id: 'WALLET', icon: '👛', label: 'Wallet', desc: 'Mana wallet' },
];

export default function Checkout() {
  const { user }                          = useAuth();
  const { cart, totalPrice, clearCart }   = useCart();
  const navigate                          = useNavigate();
  const { state }                         = useLocation();

  const deliveryFee  = totalPrice >= 200 ? 0 : 30;
  const platformFee  = 5;
  const grandTotal   = totalPrice + deliveryFee + platformFee;

  const [address, setAddress]   = useState('');
  const [pincode, setPincode]   = useState('');
  const [payment, setPayment]   = useState('UPI');
  const [placing, setPlacing]   = useState(false);
  const [error, setError]       = useState('');

  const handlePlaceOrder = async () => {
    if (!address.trim()) { setError('Please enter your delivery address'); return; }
    if (!pincode || pincode.length !== 6) { setError('Please enter a valid 6-digit pincode'); return; }
    setError('');
    setPlacing(true);

    try {
      const orderPayload = {
        cookId:          cart.cookId,
        kitchenName:     cart.kitchenName,
        items:           cart.items.map(i => ({
          dishId:   i.dishId,
          dishName: i.dishName,
          unitPrice:i.price,
          quantity: i.quantity,
        })),
        totalAmount:       totalPrice,
        discountAmount:    0,
        finalAmount:       grandTotal,
        deliveryAddress:   address,
        deliveryPincode:   pincode,
        paymentMethod:     payment,
        specialInstructions: state?.note || '',
      };

      const order = await orderService.place(orderPayload);
      clearCart();
      navigate(`/order/${order.orderId}`, { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-left">

            {/* Delivery address */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">📍 Delivery address</h2>
              <div className="form-group">
                <label className="form-label">Full address</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="House/Flat no., Street, Area, Landmark..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="500001"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">💳 Payment method</h2>
              <div className="payment-methods">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`payment-option ${payment === m.id ? 'active' : ''}`}
                    onClick={() => setPayment(m.id)}
                  >
                    <span className="payment-icon">{m.icon}</span>
                    <div className="payment-info">
                      <div className="payment-label">{m.label}</div>
                      <div className="payment-desc">{m.desc}</div>
                    </div>
                    <div className={`payment-radio ${payment === m.id ? 'checked' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="alert alert-error">{error}</div>
            )}
          </div>

          {/* Order summary */}
          <div className="checkout-summary">
            <div className="checkout-card">
              <h3 className="checkout-section-title">Order summary</h3>

              <div className="checkout-from">
                🏠 {cart.kitchenName}
              </div>

              {cart.items.map(item => (
                <div key={item.dishId} className="checkout-item">
                  <span>{item.dishName} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}

              <div className="checkout-divider" />

              <div className="checkout-item">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="checkout-item">
                <span>Delivery fee</span>
                <span style={{ color: deliveryFee === 0 ? 'var(--color-success)' : 'inherit' }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="checkout-item">
                <span>Platform fee</span>
                <span>₹{platformFee}</span>
              </div>

              <div className="checkout-divider" />

              <div className="checkout-item checkout-total">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>

              <button
                className="btn-primary place-order-btn"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner" style={{ width: 18, height: 18 }} />
                    Placing order...
                  </span>
                ) : `Place order · ₹${grandTotal}`}
              </button>

              <p className="checkout-note">
                🔒 Secure checkout · 100% safe payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

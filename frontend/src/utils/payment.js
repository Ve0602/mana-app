import api from '../services/api';

/**
 * Razorpay Payment Integration for Mana
 *
 * Usage:
 *   import { initiatePayment } from '../utils/payment';
 *   await initiatePayment(orderId, finalAmount, user, onSuccess, onFailure);
 */

/**
 * Load Razorpay checkout script dynamically
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiate Razorpay payment for a Mana order
 *
 * @param {string}   orderId     - Mana order ID
 * @param {number}   amount      - Amount in ₹ (converted to paise internally)
 * @param {object}   user        - { name, email, phoneNumber }
 * @param {Function} onSuccess   - Called after successful payment
 * @param {Function} onFailure   - Called on payment failure
 */
export async function initiatePayment(orderId, amount, user, onSuccess, onFailure) {
  // 1. Load Razorpay script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure(new Error('Failed to load payment gateway. Please try again.'));
    return;
  }

  try {
    // 2. Create Razorpay order on backend
    const res = await api.post('/payments/create-order', { orderId });
    const { razorpayOrderId, amount: amountPaise, keyId, prefill } = res.data;

    // 3. Open Razorpay checkout modal
    const options = {
      key:         keyId,
      amount:      amountPaise,
      currency:    'INR',
      name:        'Mana — Taste of Home',
      description: 'Home cooked food delivery',
      image:       '/logo192.png',
      order_id:    razorpayOrderId,

      prefill: {
        name:    prefill?.name || user?.name || '',
        email:   user?.email  || '',
        contact: user?.phoneNumber || '',
      },

      theme: { color: '#e85d26' },

      modal: {
        ondismiss: () => {
          onFailure(new Error('Payment cancelled by user'));
        },
      },

      handler: async (response) => {
        try {
          // 4. Verify payment on backend
          await api.post('/payments/verify', {
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId,
          });
          onSuccess(response);
        } catch (err) {
          onFailure(err);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      onFailure(new Error(response.error?.description || 'Payment failed'));
    });
    rzp.open();

  } catch (err) {
    onFailure(err);
  }
}

/**
 * Mana utility functions
 */

// ── Currency ─────────────────────────────────────────────────
export const formatCurrency = (amount) =>
  amount != null
    ? '₹' + Math.round(amount).toLocaleString('en-IN')
    : '—';

// ── Date / Time ──────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return formatDate(dateStr);
};

// ── Text ─────────────────────────────────────────────────────
export const truncate = (str, maxLen = 100) =>
  str && str.length > maxLen ? str.slice(0, maxLen) + '…' : str;

export const initials = (name) =>
  name
    ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

// ── Order status label ────────────────────────────────────────
export const orderStatusLabel = (status) => {
  const labels = {
    PENDING:          '⏳ Waiting for cook',
    ACCEPTED:         '✅ Cook accepted',
    PREPARING:        '👨‍🍳 Preparing your food',
    READY:            '🍱 Food is ready',
    OUT_FOR_DELIVERY: '🚚 Out for delivery',
    DELIVERED:        '🎉 Delivered!',
    CANCELLED:        '❌ Cancelled',
    REFUNDED:         '💸 Refunded',
  };
  return labels[status] || status;
};

// ── Validation ────────────────────────────────────────────────
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

export const isValidPincode = (pin) =>
  /^[1-9][0-9]{5}$/.test(pin);

// ── Delivery fee calculator ───────────────────────────────────
export const calcDeliveryFee = (subtotal) => subtotal >= 200 ? 0 : 30;

export const calcPlatformFee = () => 5;

export const calcGrandTotal = (subtotal) =>
  subtotal + calcDeliveryFee(subtotal) + calcPlatformFee();

// ── Health tag color ──────────────────────────────────────────
export const healthTagColor = (tag) => {
  const colors = {
    'diabetic-friendly': '#3b82f6',
    'high-protein':      '#8b5cf6',
    'low-oil':           '#10b981',
    'vegan':             '#22c55e',
    'gluten-free':       '#f59e0b',
    'low-carb':          '#06b6d4',
    'keto':              '#ec4899',
    'sugar-free':        '#6366f1',
  };
  return colors[tag] || '#9ca3af';
};

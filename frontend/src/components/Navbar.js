import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isCook, isFoodie } = useAuth();
  const { totalItems } = useCart();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <div className="navbar-inner">

        {/* ── Brand ───────────────────────────────────── */}
        <Link to="/" className="navbar-brand">
          <span className="brand-emoji">🍱</span>
          <div>
            <span className="brand-name">Mana</span>
            <span className="brand-tag">Taste of Home</span>
          </div>
        </Link>

        {/* ── Desktop Nav Links ────────────────────────── */}
        <div className="navbar-links">
          <Link to="/browse"          className="nav-link">Browse</Link>
          {isCook && (
            <>
              <Link to="/cook/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/cook/orders"    className="nav-link">Orders</Link>
              <Link to="/cook/menu"      className="nav-link">My Menu</Link>
            </>
          )}
          {isFoodie && (
            <>
              <Link to="/orders"  className="nav-link">My Orders</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </>
          )}
        </div>

        {/* ── Right Actions ────────────────────────────── */}
        <div className="navbar-actions">
          {/* Cart (only for foodies) */}
          {isFoodie && (
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <span className="cart-icon">🛒</span>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems > 9 ? '9+' : totalItems}</span>
              )}
            </Link>
          )}

          {/* Auth */}
          {user ? (
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => setDropOpen(d => !d)}
                aria-expanded={dropOpen}
                aria-haspopup="true"
              >
                <div className="avatar-circle">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <span className="chevron">{dropOpen ? '▲' : '▼'}</span>
              </button>

              {dropOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span className="dropdown-role">{user.role}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile"        className="dropdown-item">👤 Profile</Link>
                  {isFoodie && <Link to="/orders"   className="dropdown-item">📦 My Orders</Link>}
                  {isCook   && <Link to="/cook/earnings" className="dropdown-item">💰 Earnings</Link>}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login"    className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary btn-sm">Get started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────── */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/browse"  className="mobile-link">Browse Cooks</Link>
          {isCook && (
            <>
              <Link to="/cook/dashboard" className="mobile-link">Dashboard</Link>
              <Link to="/cook/orders"    className="mobile-link">Orders</Link>
              <Link to="/cook/menu"      className="mobile-link">My Menu</Link>
              <Link to="/cook/earnings"  className="mobile-link">Earnings</Link>
            </>
          )}
          {isFoodie && (
            <>
              <Link to="/dashboard" className="mobile-link">Dashboard</Link>
              <Link to="/orders"    className="mobile-link">My Orders</Link>
              <Link to="/cart"      className="mobile-link">Cart {totalItems > 0 && `(${totalItems})`}</Link>
            </>
          )}
          <div className="mobile-divider" />
          {user ? (
            <button className="mobile-link mobile-logout" onClick={handleLogout}>
              🚪 Sign out
            </button>
          ) : (
            <>
              <Link to="/login"    className="mobile-link">Sign in</Link>
              <Link to="/register" className="btn-primary mobile-cta">Get started</Link>
            </>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {dropOpen && (
        <div className="navbar-backdrop" onClick={() => setDropOpen(false)} />
      )}
    </nav>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const redirect    = params.get('redirect') || null;

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoad]  = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoad(true);
    try {
      const data = await login(form.email, form.password);
      if (redirect) navigate(redirect, { replace: true });
      else navigate(data.role === 'COOK' ? '/cook/dashboard' : '/browse', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-brand-emoji">🍱</span>
          <div>
            <div className="auth-brand-name">Mana</div>
            <div className="auth-brand-tag">Taste of Home</div>
          </div>
        </div>
        <div className="auth-left-content">
          <h1 className="auth-left-title">
            Welcome<br />back to<br />
            <span className="auth-left-accent">Mana</span>
          </h1>
          <p className="auth-left-sub">
            Real food, made with love.<br />
            Your home cook is waiting.
          </p>
          <div className="auth-testimonial">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              "Finally found a platform where I can eat home-cooked food that actually feels like my mom made it."
            </p>
            <div className="testimonial-author">— Priya R., Hyderabad</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Sign in</h2>
            <p className="auth-subtitle">Don't have an account? <Link to="/register" className="auth-link">Create one →</Link></p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 6 }}>
                <label className="form-label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="auth-link" style={{ fontSize: 12 }}>Forgot password?</Link>
              </div>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="spinner" style={{ width:16, height:16 }} />
                  Signing in...
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <div className="social-btns">
            <button className="social-btn" disabled>
              <span>🔵</span> Google (coming soon)
            </button>
          </div>

          <p className="auth-footer-note">
            Are you a home cook?{' '}
            <Link to="/register?role=cook" className="auth-link">Join as a cook →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

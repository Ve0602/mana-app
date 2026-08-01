import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const COOK_SPECIALITIES = [
  'Andhra Cuisine', 'Hyderabadi', 'North Indian', 'South Indian',
  'Chinese', 'Continental', 'Vegan', 'Desserts', 'Snacks & Tiffin',
  'Biryani', 'Seafood', 'Healthy & Fitness',
];

export default function Register() {
  const { registerCook, registerFoodie } = useAuth();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();

  const [role, setRole]     = useState(params.get('role') === 'cook' ? 'COOK' : 'FOODIE');
  const [step, setStep]     = useState(1); // multi-step for cook
  const [error, setError]   = useState('');
  const [loading, setLoad]  = useState(false);

  // Shared fields
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', phoneCode: '+91',
    // Cook fields
    kitchenName: '', address: '', city: '', state: '', pincode: '',
    speciality: [], bio: '',
    // Foodie fields
    healthGoal: '', dietType: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleSpeciality = (s) => {
    setForm(f => ({
      ...f,
      speciality: f.speciality.includes(s)
        ? f.speciality.filter(x => x !== s)
        : [...f.speciality, s],
    }));
  };

  const validate = () => {
    if (!form.name.trim())        return 'Name is required';
    if (!form.email.trim())       return 'Email is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (role === 'COOK') {
      if (!form.kitchenName) return 'Kitchen name is required';
      if (!form.city)        return 'City is required';
      if (!form.pincode)     return 'Pincode is required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoad(true);
    try {
      if (role === 'COOK') {
        await registerCook(form);
        navigate('/cook/dashboard', { replace: true });
      } else {
        await registerFoodie(form);
        navigate('/browse', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
            {role === 'COOK' ? (
              <>Join as a<br /><span className="auth-left-accent">Home Chef</span></>
            ) : (
              <>Discover<br /><span className="auth-left-accent">Real Food</span></>
            )}
          </h1>
          <p className="auth-left-sub">
            {role === 'COOK'
              ? 'Turn your passion for cooking into income. Earn ₹15,000–₹40,000/month from home.'
              : 'No restaurant can cook like a mother. Find your perfect home cook today.'
            }
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Create account</h2>
            <p className="auth-subtitle">
              Already have one? <Link to="/login" className="auth-link">Sign in →</Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === 'FOODIE' ? 'active' : ''}`}
              onClick={() => setRole('FOODIE')}
            >
              🍽️ I want to order
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'COOK' ? 'active' : ''}`}
              onClick={() => setRole('COOK')}
            >
              👩‍🍳 I want to cook
            </button>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Common fields ── */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone number</label>
                <div style={{ display:'flex', gap:6 }}>
                  <select className="form-select" style={{ width:80 }} value={form.phoneCode} onChange={set('phoneCode')}>
                    <option>+91</option><option>+1</option><option>+44</option>
                  </select>
                  <input className="form-input" type="tel" placeholder="9876543210" value={form.phoneNumber} onChange={set('phoneNumber')} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>

            {/* ── Cook-specific fields ── */}
            {role === 'COOK' && (
              <>
                <div className="form-group">
                  <label className="form-label">Kitchen name</label>
                  <input className="form-input" type="text" placeholder="e.g. Lakshmi's Kitchen" value={form.kitchenName} onChange={set('kitchenName')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Short bio <span style={{color:'var(--color-text-muted)',fontWeight:400}}>(optional)</span></label>
                  <textarea className="form-input" rows={2} placeholder="Tell customers about your cooking..." value={form.bio} onChange={set('bio')} style={{ resize:'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" type="text" placeholder="Street address" value={form.address} onChange={set('address')} />
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" type="text" placeholder="Hyderabad" value={form.city} onChange={set('city')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" type="text" placeholder="Telangana" value={form.state} onChange={set('state')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input className="form-input" type="text" placeholder="500001" value={form.pincode} onChange={set('pincode')} maxLength={6} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Specialities <span style={{color:'var(--color-text-muted)',fontWeight:400}}>(select all that apply)</span></label>
                  <div className="speciality-grid">
                    {COOK_SPECIALITIES.map(s => (
                      <button
                        key={s} type="button"
                        className={`speciality-chip ${form.speciality.includes(s) ? 'active' : ''}`}
                        onClick={() => toggleSpeciality(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Foodie-specific fields ── */}
            {role === 'FOODIE' && (
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Health goal <span style={{color:'var(--color-text-muted)',fontWeight:400}}>(optional)</span></label>
                  <select className="form-select" value={form.healthGoal} onChange={set('healthGoal')}>
                    <option value="">Select goal...</option>
                    <option value="lose-weight">⚖️ Lose weight</option>
                    <option value="build-muscle">💪 Build muscle</option>
                    <option value="diabetic">🩺 Diabetic diet</option>
                    <option value="vegan">🌱 Vegan</option>
                    <option value="light">🌤️ Light meals</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Diet type <span style={{color:'var(--color-text-muted)',fontWeight:400}}>(optional)</span></label>
                  <select className="form-select" value={form.dietType} onChange={set('dietType')}>
                    <option value="">Select diet...</option>
                    <option value="veg">🌿 Vegetarian</option>
                    <option value="non-veg">🍗 Non-vegetarian</option>
                    <option value="vegan">🌱 Vegan</option>
                    <option value="eggetarian">🥚 Eggetarian</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="spinner" style={{ width:16, height:16 }} />
                  Creating account...
                </span>
              ) : `Create ${role === 'COOK' ? 'cook' : ''} account →`}
            </button>
          </form>

          <p style={{ fontSize:12, color:'var(--color-text-muted)', marginTop:16, textAlign:'center', lineHeight:1.6 }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

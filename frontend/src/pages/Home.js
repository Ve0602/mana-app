import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cookService, aiService } from '../services';
import CookCard from '../components/CookCard';
import AISearchBar from '../components/AISearchBar';
import HealthGoalSelector from '../components/HealthGoalSelector';
import '../styles/home.css';

const HEALTH_GOALS = [
  { id: 'lose-weight',   emoji: '⚖️', label: 'Lose Weight',   color: '#10b981' },
  { id: 'build-muscle',  emoji: '💪', label: 'Build Muscle',   color: '#3b82f6' },
  { id: 'diabetic',      emoji: '🩺', label: 'Diabetic Diet',  color: '#8b5cf6' },
  { id: 'vegan',         emoji: '🌱', label: 'Vegan',          color: '#22c55e' },
  { id: 'festive',       emoji: '🎉', label: 'Festive Feast',  color: '#f59e0b' },
  { id: 'light',         emoji: '🌤️', label: 'Light Tiffin',  color: '#06b6d4' },
];

export default function Home() {
  const [cooks, setCooks]             = useState([]);
  const [filteredCooks, setFiltered]  = useState([]);
  const [selectedGoal, setGoal]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const [aiMessage, setAiMessage]     = useState('');
  const navigate                      = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await cookService.getTopRated();
        setCooks(data);
        setFiltered(data);
      } catch {
        // Use empty state gracefully
      }
    })();
  }, []);

  const handleGoalSelect = async (goal) => {
    setGoal(goal.id);
    setLoading(true);
    setAiMessage('');
    try {
      const result = await aiService.matchCooks(goal.id, {});
      setFiltered(result.cooks || cooks);
      setAiMessage(result.message || `Found cooks matching your "${goal.label}" goal!`);
    } catch {
      setFiltered(cooks);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setGoal(null);
    setFiltered(cooks);
    setAiMessage('');
  };

  return (
    <div className="home">

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-gradient" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-powered meal matching · Hyderabad
          </div>
          <h1 className="hero-title">
            Real food.<br />
            Real homes.<br />
            <span className="hero-title-accent">Real love.</span>
          </h1>
          <p className="hero-subtitle">
            No restaurant can cook like a mother. Connect with home chefs
            who cook the way your family used to — fresh, personal, and made with care.
          </p>

          {/* AI Search */}
          <AISearchBar onSearch={(q) => navigate(`/browse?q=${encodeURIComponent(q)}`)} />

          {/* Quick stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">50+</span>
              <span className="hero-stat-lbl">Home Cooks</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">4.8★</span>
              <span className="hero-stat-lbl">Avg Rating</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">30 min</span>
              <span className="hero-stat-lbl">Avg Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Goal Matcher ────────────────────────────────── */}
      <section className="goal-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What's your goal today?</h2>
            <p className="section-subtitle">
              Tell us your health goal — our AI matches the perfect home cook for you
            </p>
          </div>

          <div className="goal-grid">
            {HEALTH_GOALS.map(goal => (
              <button
                key={goal.id}
                className={`goal-chip ${selectedGoal === goal.id ? 'active' : ''}`}
                style={{ '--goal-color': goal.color }}
                onClick={() => handleGoalSelect(goal)}
              >
                <span className="goal-emoji">{goal.emoji}</span>
                <span className="goal-label">{goal.label}</span>
              </button>
            ))}
          </div>

          <div className="goal-cta">
            <button
              className="btn-ai-match"
              onClick={() => selectedGoal
                ? null
                : handleGoalSelect(HEALTH_GOALS[0])
              }
            >
              ✨ Find My Perfect Cook
            </button>
          </div>
        </div>
      </section>

      {/* ── AI Message ─────────────────────────────────────── */}
      {aiMessage && (
        <div className="ai-message-bar">
          <div className="container">
            <span className="ai-icon">🤖</span>
            <span className="ai-text">{aiMessage}</span>
            <button className="ai-clear" onClick={clearFilter}>✕ Clear filter</button>
          </div>
        </div>
      )}

      {/* ── Cook Cards ─────────────────────────────────────── */}
      <section className="cooks-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {selectedGoal ? 'AI-Matched Cooks For You' : 'Home Cooks Near You'}
            </h2>
            <p className="section-subtitle">
              Hyderabad · Delivering in 25–45 mins
            </p>
          </div>

          {loading ? (
            <div className="cooks-skeleton-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="cook-skeleton" />)}
            </div>
          ) : filteredCooks.length > 0 ? (
            <div className="cooks-grid">
              {filteredCooks.map(cook => (
                <CookCard
                  key={cook.cookId}
                  cook={cook}
                  isAiMatch={!!selectedGoal}
                  onClick={() => navigate(`/cook/${cook.cookId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No cooks found</h3>
              <p>Try a different filter or check back later</p>
              <button className="btn-primary" onClick={clearFilter}>See all cooks</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Why Mana ───────────────────────────────────────── */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Why Mana is different</h2>
          <div className="why-grid">
            {[
              { icon: '🏠', title: 'Home Cooked', desc: 'Every meal prepared in a real home kitchen with love and care' },
              { icon: '🤖', title: 'AI Matched',  desc: 'Our AI understands your health goals and dietary needs' },
              { icon: '✅', title: 'Verified Cooks', desc: 'Every cook is verified, rated, and trusted by the community' },
              { icon: '📍', title: 'Hyperlocal', desc: 'Your neighborhood cook who knows your taste preferences' },
              { icon: '🌱', title: 'Fresh Daily', desc: 'Cooked fresh every day — no frozen food, no preservatives' },
              { icon: '💰', title: 'Fair Pricing', desc: 'Transparent pricing — no hidden fees, no platform inflation' },
            ].map(w => (
              <div key={w.title} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <h3 className="why-title">{w.title}</h3>
                <p className="why-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cook CTA ──────────────────────────────────────── */}
      <section className="cook-cta-section">
        <div className="container">
          <div className="cook-cta-card">
            <div className="cook-cta-left">
              <h2>Are you a home cook?</h2>
              <p>Turn your passion for cooking into income. Join 50+ home chefs already earning on Mana.</p>
              <button className="btn-white" onClick={() => navigate('/register?role=cook')}>
                Start Cooking on Mana →
              </button>
            </div>
            <div className="cook-cta-right">
              <div className="cook-cta-stats">
                <div><strong>₹15,000–₹40,000</strong><span>Monthly income potential</span></div>
                <div><strong>0% commission</strong><span>for first 3 months</span></div>
                <div><strong>Free</strong><span>onboarding & support</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

import React from 'react';
import './CookCard.css';

export default function CookCard({ cook, isAiMatch, onClick }) {
  const {
    name, kitchenName, speciality = [], bio,
    avgRating = 0, totalReviews = 0, totalDeliveries = 0,
    isAvailable, cookMood, profileImageUrl, city,
  } = cook;

  const ratingStars = '★'.repeat(Math.round(avgRating)) +
                      '☆'.repeat(5 - Math.round(avgRating));

  return (
    <div className={`cook-card ${!isAvailable ? 'unavailable' : ''}`} onClick={onClick}>

      {/* ── Image / Avatar ────────────────────────────── */}
      <div className="cook-card-img">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={name} className="cook-img" />
        ) : (
          <div className="cook-avatar-placeholder">
            <span className="cook-avatar-emoji">👩‍🍳</span>
          </div>
        )}

        {/* Availability badge */}
        <div className={`avail-badge ${isAvailable ? 'open' : 'closed'}`}>
          <span className="avail-dot" />
          {isAvailable ? 'Open now' : 'Unavailable'}
        </div>

        {/* AI match badge */}
        {isAiMatch && (
          <div className="ai-match-badge">✨ AI Match</div>
        )}
      </div>

      {/* ── Cook Mood ─────────────────────────────────── */}
      {cookMood && (
        <div className="cook-mood">
          <span className="mood-icon">💬</span>
          <span className="mood-text">"{cookMood}"</span>
        </div>
      )}

      {/* ── Card Body ─────────────────────────────────── */}
      <div className="cook-card-body">
        <div className="cook-name-row">
          <div>
            <h3 className="cook-name">{name}</h3>
            <p className="cook-kitchen">{kitchenName} · {city}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="cook-rating-row">
          <span className="stars">{ratingStars}</span>
          <span className="rating-val">{avgRating?.toFixed(1)}</span>
          <span className="rating-cnt">({totalReviews} reviews)</span>
          {totalDeliveries > 0 && (
            <span className="delivery-cnt">· {totalDeliveries.toLocaleString()} deliveries</span>
          )}
        </div>

        {/* Bio */}
        {bio && <p className="cook-bio">{bio}</p>}

        {/* Specialities */}
        {speciality.length > 0 && (
          <div className="cook-tags">
            {speciality.slice(0, 3).map((s, i) => (
              <span key={i} className="cook-tag">{s}</span>
            ))}
            {speciality.length > 3 && (
              <span className="cook-tag-more">+{speciality.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="cook-card-footer">
          <button
            className="btn-order-now"
            disabled={!isAvailable}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            {isAvailable ? 'View Menu →' : 'Currently unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}

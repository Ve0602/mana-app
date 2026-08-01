import React from 'react';

const GOALS = [
  { id: 'lose-weight',  emoji: '⚖️', label: 'Lose Weight',   color: '#10b981', desc: 'Low-oil, low-carb meals' },
  { id: 'build-muscle', emoji: '💪', label: 'Build Muscle',   color: '#3b82f6', desc: 'High-protein dishes'     },
  { id: 'diabetic',     emoji: '🩺', label: 'Diabetic Diet',  color: '#8b5cf6', desc: 'Sugar-free, controlled'  },
  { id: 'vegan',        emoji: '🌱', label: 'Vegan',          color: '#22c55e', desc: 'Plant-based only'        },
  { id: 'festive',      emoji: '🎉', label: 'Festive Feast',  color: '#f59e0b', desc: 'Special occasion meals'  },
  { id: 'light',        emoji: '🌤️', label: 'Light Tiffin',  color: '#06b6d4', desc: 'Easy on the stomach'     },
];

export default function HealthGoalSelector({ selected, onSelect, size = 'md' }) {
  const isLarge = size === 'lg';

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: isLarge ? 12 : 8,
      justifyContent: 'center',
    }}>
      {GOALS.map(goal => {
        const isActive = selected === goal.id;
        return (
          <button
            key={goal.id}
            onClick={() => onSelect(goal)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isLarge ? '12px 22px' : '8px 16px',
              background: isActive ? goal.color : 'var(--color-surface)',
              border: `2px solid ${isActive ? goal.color : 'var(--color-border2)'}`,
              borderRadius: 'var(--radius-full)',
              color: isActive ? '#fff' : 'var(--color-text-secondary)',
              fontSize: isLarge ? 14 : 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isActive ? 'translateY(-2px)' : 'none',
              boxShadow: isActive ? `0 6px 20px ${goal.color}40` : 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = goal.color;
                e.currentTarget.style.color = goal.color;
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--color-border2)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
            aria-pressed={isActive}
            aria-label={`${goal.label}: ${goal.desc}`}
          >
            <span style={{ fontSize: isLarge ? 18 : 16 }}>{goal.emoji}</span>
            <span>{goal.label}</span>
          </button>
        );
      })}
    </div>
  );
}

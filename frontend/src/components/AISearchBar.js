import React, { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  { icon: '🍱', text: 'Home cooked biryani near me' },
  { icon: '🥗', text: 'Healthy breakfast under ₹100' },
  { icon: '💪', text: 'High protein food for gym' },
  { icon: '🩺', text: 'Diabetic friendly lunch' },
  { icon: '🌱', text: 'Vegan dinner options' },
  { icon: '🌶️', text: 'Spicy Andhra food' },
  { icon: '🍛', text: 'Authentic Hyderabadi biryani' },
  { icon: '⚖️', text: 'Low calorie meals' },
];

export default function AISearchBar({ onSearch }) {
  const [query, setQuery]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (q) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setFocused(false);
    await onSearch(searchQuery.trim());
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setFocused(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!inputRef.current?.closest('.ai-search-wrap')?.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showSuggestions = focused && !loading;

  return (
    <div className="ai-search-wrap" ref={inputRef}>
      <span className="ai-search-icon">{loading ? '⏳' : '🔍'}</span>
      <input
        type="text"
        className="ai-search-input"
        placeholder="Search in natural language... e.g. 'healthy lunch under ₹150'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKey}
        aria-label="Search for food or cooks"
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
        role="combobox"
        autoComplete="off"
      />
      <button
        className="ai-search-btn"
        onClick={() => handleSubmit()}
        disabled={loading}
        aria-label="Search"
      >
        {loading ? '...' : 'Search'}
      </button>

      {showSuggestions && (
        <div className="search-suggestions" role="listbox" aria-label="Search suggestions">
          <div style={{
            padding: '8px 16px 4px',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
          }}>
            Try asking...
          </div>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              role="option"
              className="search-suggestion-item"
              onClick={() => { setQuery(s.text); handleSubmit(s.text); }}
            >
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

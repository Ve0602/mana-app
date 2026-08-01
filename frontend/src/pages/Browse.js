import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cookService, dishService } from '../services';
import CookCard from '../components/CookCard';
import '../styles/browse.css';

const FILTERS = [
  { id: 'all',        label: '🍽️ All' },
  { id: 'veg',        label: '🌿 Veg only' },
  { id: 'non-veg',    label: '🍗 Non-veg' },
  { id: 'vegan',      label: '🌱 Vegan' },
  { id: 'top-rated',  label: '⭐ Top rated' },
  { id: 'new',        label: '🆕 Newest' },
];

export default function Browse() {
  const [params]          = useSearchParams();
  const navigate          = useNavigate();
  const [cooks, setCooks]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setAF]   = useState('all');
  const [searchQ, setSearch]    = useState(params.get('q') || '');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await cookService.getAll();
        setCooks(data);
        applyFilter(data, activeFilter, searchQ);
      } catch { setCooks([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const applyFilter = (list, filter, query) => {
    let result = [...list];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.kitchenName?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.speciality?.some(s => s.toLowerCase().includes(q))
      );
    }
    switch (filter) {
      case 'top-rated': result.sort((a,b) => (b.avgRating||0) - (a.avgRating||0)); break;
      case 'new':       result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break;
    }
    setFiltered(result);
  };

  const handleFilter = (f) => { setAF(f); applyFilter(cooks, f, searchQ); };
  const handleSearch = (q) => { setSearch(q); applyFilter(cooks, activeFilter, q); };

  return (
    <div className="browse-page">
      <div className="browse-hero">
        <div className="container">
          <h1 className="browse-title">Find Your Perfect Home Cook</h1>
          <p className="browse-sub">Hyderabad · {cooks.filter(c=>c.isAvailable).length} cooks available now</p>
          <div className="browse-search-wrap">
            <span className="browse-search-icon">🔍</span>
            <input
              className="browse-search-input"
              type="text"
              placeholder="Search cooks, cuisines, locations..."
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
              aria-label="Search cooks"
            />
            {searchQ && (
              <button className="browse-clear" onClick={() => handleSearch('')} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="browse-body container">
        {/* Filter pills */}
        <div className="filter-pills">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => handleFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="browse-results-count">
          {loading ? 'Loading...' : `${filtered.length} cook${filtered.length !== 1 ? 's' : ''} found`}
          {searchQ && ` for "${searchQ}"`}
        </div>

        {/* Cook grid */}
        {loading ? (
          <div className="cooks-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton cook-skeleton" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="cooks-grid">
            {filtered.map(cook => (
              <CookCard
                key={cook.cookId}
                cook={cook}
                onClick={() => navigate(`/cook/${cook.cookId}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No cooks found</h3>
            <p>Try a different search term or filter</p>
            <button className="btn-primary" onClick={() => { handleSearch(''); handleFilter('all'); }}>
              Show all cooks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

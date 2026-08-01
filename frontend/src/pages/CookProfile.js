import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cookService, dishService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/cook-profile.css';

const CATEGORY_ORDER = ['Breakfast','Tiffin','Main Course','Snacks','Desserts','Beverages'];

export default function CookProfile() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { addToCart }       = useCart();
  const { isFoodie, user }  = useAuth();

  const [cook, setCook]     = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoad]  = useState(true);
  const [activeTab, setTab] = useState('menu');
  const [addedMap, setAdded]= useState({});
  const [filterCat, setFC]  = useState('All');

  useEffect(() => {
    (async () => {
      setLoad(true);
      try {
        const [cookData, dishData] = await Promise.all([
          cookService.getById(id),
          dishService.getByCook(id),
        ]);
        setCook(cookData);
        setDishes(dishData);
      } catch { navigate('/browse', { replace: true }); }
      finally { setLoad(false); }
    })();
  }, [id]);

  const handleAdd = (dish) => {
    if (!isFoodie) { navigate('/login?redirect=/cook/' + id); return; }
    addToCart(dish, cook.cookId, cook.kitchenName);
    setAdded(m => ({ ...m, [dish.dishId]: true }));
    setTimeout(() => setAdded(m => ({ ...m, [dish.dishId]: false })), 1500);
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width:40, height:40 }} />
    </div>
  );

  if (!cook) return null;

  const availDishes   = dishes.filter(d => d.isAvailable);
  const categories    = ['All', ...new Set(availDishes.map(d => d.category).filter(Boolean))];
  const displayDishes = filterCat === 'All'
    ? availDishes
    : availDishes.filter(d => d.category === filterCat);

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = displayDishes.filter(d => d.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  // Any remaining categories
  displayDishes.forEach(d => {
    if (!CATEGORY_ORDER.includes(d.category)) {
      if (!grouped[d.category]) grouped[d.category] = [];
      if (!grouped[d.category].includes(d)) grouped[d.category].push(d);
    }
  });

  return (
    <div className="cook-profile-page">

      {/* ── Hero banner ───────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="container profile-hero-content">
          <div className="profile-avatar">
            {cook.profileImageUrl
              ? <img src={cook.profileImageUrl} alt={cook.name} className="profile-avatar-img" />
              : <div className="profile-avatar-placeholder">👩‍🍳</div>
            }
          </div>
          <div className="profile-info">
            <div className="profile-badges">
              {cook.isVerified && <span className="badge badge-success">✅ Verified</span>}
              <span className={`badge ${cook.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                {cook.isAvailable ? '● Open now' : '○ Unavailable'}
              </span>
            </div>
            <h1 className="profile-name">{cook.name}</h1>
            <p className="profile-kitchen">{cook.kitchenName}</p>
            <p className="profile-location">📍 {cook.address}, {cook.city} — {cook.pincode}</p>
            {cook.cookMood && (
              <p className="profile-mood">💬 "{cook.cookMood}"</p>
            )}
            <div className="profile-stats">
              <div className="pstat">
                <span className="pstat-val">{cook.avgRating?.toFixed(1) || '—'}</span>
                <span className="pstat-lbl">⭐ Rating</span>
              </div>
              <div className="pstat-div" />
              <div className="pstat">
                <span className="pstat-val">{cook.totalReviews || 0}</span>
                <span className="pstat-lbl">Reviews</span>
              </div>
              <div className="pstat-div" />
              <div className="pstat">
                <span className="pstat-val">{cook.totalDeliveries?.toLocaleString() || 0}</span>
                <span className="pstat-lbl">Deliveries</span>
              </div>
              <div className="pstat-div" />
              <div className="pstat">
                <span className="pstat-val">{availDishes.length}</span>
                <span className="pstat-lbl">Dishes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Specialities ──────────────────────────────────── */}
      {cook.speciality?.length > 0 && (
        <div className="profile-specialities">
          <div className="container">
            {cook.speciality.map((s,i) => (
              <span key={i} className="tag tag-primary">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="profile-tabs">
        <div className="container">
          <button className={`ptab ${activeTab==='menu' ? 'active':''}`} onClick={()=>setTab('menu')}>Menu ({availDishes.length})</button>
          <button className={`ptab ${activeTab==='about' ? 'active':''}`} onClick={()=>setTab('about')}>About</button>
        </div>
      </div>

      {/* ── Menu tab ──────────────────────────────────────── */}
      {activeTab === 'menu' && (
        <div className="container profile-menu-section">
          {/* Category filter */}
          {categories.length > 2 && (
            <div className="filter-pills" style={{ marginBottom:'var(--space-6)' }}>
              {categories.map(c => (
                <button key={c} className={`filter-pill ${filterCat===c?'active':''}`} onClick={()=>setFC(c)}>{c}</button>
              ))}
            </div>
          )}

          {Object.keys(grouped).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No dishes available right now</h3>
              <p>Check back later — this cook may be updating their menu</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="menu-category-section">
                <h2 className="menu-category-title">{cat}</h2>
                <div className="menu-items-grid">
                  {items.map(dish => (
                    <div key={dish.dishId} className="menu-item-card">
                      {dish.imageUrl && (
                        <img src={dish.imageUrl} alt={dish.dishName} className="menu-item-img" />
                      )}
                      <div className="menu-item-body">
                        <div className="menu-item-top">
                          <div>
                            <div className="menu-item-type-dot" style={{ background: dish.type==='Veg' || dish.type==='Vegan' ? '#16a34a' : '#dc2626' }} />
                            <h3 className="menu-item-name">{dish.dishName}</h3>
                          </div>
                          <span className="menu-item-price">₹{dish.price}</span>
                        </div>
                        {dish.description && (
                          <p className="menu-item-desc">{dish.description}</p>
                        )}
                        <div className="menu-item-meta">
                          {dish.calories && <span className="menu-meta-tag">🔥 {dish.calories} kcal</span>}
                          {dish.proteinGrams && <span className="menu-meta-tag">💪 {dish.proteinGrams}g protein</span>}
                          {(dish.healthTags||[]).slice(0,2).map(t=>(
                            <span key={t} className="menu-meta-tag tag-success">{t}</span>
                          ))}
                        </div>
                        <div className="menu-item-footer">
                          {dish.avgRating > 0 && (
                            <span style={{ fontSize:12, color:'var(--color-text-muted)' }}>
                              ⭐ {dish.avgRating?.toFixed(1)} ({dish.totalOrders} orders)
                            </span>
                          )}
                          <button
                            className={`btn-add-cart ${addedMap[dish.dishId] ? 'added' : ''}`}
                            onClick={() => handleAdd(dish)}
                            disabled={!cook.isAvailable}
                          >
                            {addedMap[dish.dishId] ? '✓ Added!' : cook.isAvailable ? '+ Add' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── About tab ─────────────────────────────────────── */}
      {activeTab === 'about' && (
        <div className="container" style={{ padding:'var(--space-8) var(--space-6)', maxWidth:700 }}>
          <div className="dash-card">
            <h2 style={{ marginBottom:'var(--space-4)', fontFamily:'var(--font-display)' }}>About {cook.name}</h2>
            {cook.bio
              ? <p style={{ fontSize:15, lineHeight:1.75, color:'var(--color-text-secondary)' }}>{cook.bio}</p>
              : <p style={{ color:'var(--color-text-muted)' }}>No bio yet.</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}

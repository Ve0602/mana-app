import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dishService } from '../../services';
import '../../styles/dashboard.css';

const CATEGORIES  = ['Breakfast', 'Main Course', 'Snacks', 'Desserts', 'Beverages', 'Tiffin'];
const TYPES       = ['Veg', 'Non-Veg', 'Vegan', 'Egg'];
const HEALTH_TAGS = ['diabetic-friendly','high-protein','low-oil','vegan','gluten-free','low-carb','keto','sugar-free'];

const EMPTY_DISH = {
  dishName:'', description:'', price:'', category:'Main Course',
  type:'Veg', isAvailable:true, healthTags:[], calories:'', proteinGrams:'',
};

export default function MenuManager() {
  const { user }              = useAuth();
  const [dishes, setDishes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setForm]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFD]     = useState(EMPTY_DISH);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await dishService.getByCook(user.userId);
      setDishes(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd  = ()    => { setFD(EMPTY_DISH); setEditing(null); setForm(true); setError(''); };
  const openEdit = (d)   => { setFD({ ...d, price: String(d.price) }); setEditing(d.dishId); setForm(true); setError(''); };
  const closeForm = ()   => { setForm(false); setEditing(null); setFD(EMPTY_DISH); };

  const setF = (k) => (e) => setFD(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const toggleTag = (tag) => setFD(f => ({
    ...f,
    healthTags: f.healthTags.includes(tag)
      ? f.healthTags.filter(t => t !== tag)
      : [...f.healthTags, tag],
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.dishName.trim()) { setError('Dish name is required'); return; }
    if (!formData.price || Number(formData.price) < 1) { setError('Valid price is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        cookId:      user.userId,
        price:       Number(formData.price),
        calories:    formData.calories ? Number(formData.calories) : null,
        proteinGrams:formData.proteinGrams ? Number(formData.proteinGrams) : null,
      };
      if (editing) await dishService.update(editing, payload);
      else         await dishService.create(payload);
      closeForm();
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save. Try again.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (dishId, name) => {
    if (!window.confirm(`Delete "${name}" from your menu?`)) return;
    try {
      await dishService.delete(dishId);
      load();
    } catch (e) { alert('Failed to delete dish'); }
  };

  const handleToggleAvail = async (dishId) => {
    try {
      await dishService.toggleAvailability(dishId);
      load();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">My Menu 🍽️</h1>
            <p className="dash-subtitle">{dishes.length} dishes · Manage what you offer</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>+ Add dish</button>
        </div>

        {/* ── Dish grid ─────────────────────────────────── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
            {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:180}}/>)}
          </div>
        ) : dishes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No dishes yet</h3>
            <p>Add your first dish to start receiving orders</p>
            <button className="btn-primary" onClick={openAdd}>Add first dish</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
            {dishes.map(dish => (
              <div key={dish.dishId} className="dash-card" style={{ padding:'var(--space-4)', gap:0 }}>
                {dish.imageUrl && (
                  <img src={dish.imageUrl} alt={dish.dishName}
                    style={{ width:'100%', height:140, objectFit:'cover', borderRadius:'var(--radius-md)', marginBottom:12 }} />
                )}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                  <h3 style={{ fontSize:15, fontWeight:700 }}>{dish.dishName}</h3>
                  <span style={{ fontSize:16, fontWeight:700, color:'var(--mana-primary)' }}>₹{dish.price}</span>
                </div>
                <p style={{ fontSize:12, color:'var(--color-text-muted)', marginBottom:8 }}>{dish.category} · {dish.type}</p>
                {dish.description && (
                  <p style={{ fontSize:12, color:'var(--color-text-secondary)', marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {dish.description}
                  </p>
                )}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                  {(dish.healthTags||[]).slice(0,3).map(t=>(
                    <span key={t} className="tag tag-success" style={{fontSize:10}}>{t}</span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8, borderTop:'1px solid var(--color-border)', paddingTop:10 }}>
                  <button
                    style={{ flex:1, padding:'6px 10px', fontSize:12, fontWeight:600, border:'1px solid var(--color-border2)', borderRadius:'var(--radius-full)', background:'transparent', cursor:'pointer',
                      color: dish.isAvailable ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                    onClick={() => handleToggleAvail(dish.dishId)}
                  >
                    {dish.isAvailable ? '● On' : '○ Off'}
                  </button>
                  <button className="btn-secondary" style={{ flex:1, padding:'6px 10px', fontSize:12 }} onClick={()=>openEdit(dish)}>Edit</button>
                  <button
                    style={{ padding:'6px 10px', fontSize:12, border:'none', borderRadius:'var(--radius-full)', background:'#fee2e2', color:'var(--color-danger)', cursor:'pointer', fontWeight:600 }}
                    onClick={()=>handleDelete(dish.dishId, dish.dishName)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add / Edit Form Modal ─────────────────────── */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:300, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'80px 16px 16px', overflowY:'auto' }}>
            <div style={{ background:'var(--color-surface)', borderRadius:'var(--radius-xl)', padding:'var(--space-8)', width:'100%', maxWidth:560, position:'relative' }}>
              <button onClick={closeForm} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--color-text-muted)' }}>✕</button>
              <h2 style={{ marginBottom:'var(--space-6)' }}>{editing ? 'Edit dish' : 'Add new dish'}</h2>

              {error && <div className="alert alert-error" style={{ marginBottom:'var(--space-4)' }}>{error}</div>}

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Dish name *</label>
                  <input className="form-input" type="text" placeholder="e.g. Gongura Mutton" value={formData.dishName} onChange={setF('dishName')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} placeholder="Describe your dish..." value={formData.description} onChange={setF('description')} style={{ resize:'vertical' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input className="form-input" type="number" min="1" placeholder="150" value={formData.price} onChange={setF('price')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category} onChange={setF('category')}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={formData.type} onChange={setF('type')}>
                      {TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Calories (optional)</label>
                    <input className="form-input" type="number" placeholder="350" value={formData.calories} onChange={setF('calories')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Protein g (optional)</label>
                    <input className="form-input" type="number" step="0.1" placeholder="25" value={formData.proteinGrams} onChange={setF('proteinGrams')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Health tags</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                    {HEALTH_TAGS.map(tag => (
                      <button key={tag} type="button"
                        className={`speciality-chip ${formData.healthTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                  <input type="checkbox" id="isAvail" checked={formData.isAvailable} onChange={setF('isAvailable')} style={{ width:16, height:16 }} />
                  <label htmlFor="isAvail" className="form-label" style={{ margin:0, cursor:'pointer' }}>Available for ordering</label>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:'var(--space-4)' }}>
                  <button type="button" className="btn-secondary" style={{ flex:1 }} onClick={closeForm}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex:2 }} disabled={saving}>
                    {saving ? 'Saving...' : editing ? 'Save changes' : 'Add dish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

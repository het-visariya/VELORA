import { useState } from 'react';
import Icon from '../components/Icon';

export default function ClosetPage({ items, setItems, onAddItem }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', brand: '', category: 'Women Tops', season: 'All', image: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const categories = ['All', 'Women Tops', 'Women Bottoms', 'Women Outerwear', 'Women Accessories', 'Men Tops', 'Men Bottoms', 'Men Outerwear', 'Men Accessories'];
  const womenCategories = categories.filter((cat) => cat.startsWith('Women'));
  const menCategories = categories.filter((cat) => cat.startsWith('Men'));
  const seasons = ['All', 'Spring', 'Summer', 'Autumn', 'Winter'];

  const filteredItems = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.brand) return;
    setSaving(true);
    setMessage('');
    try {
      const savedItem = await onAddItem({ ...newItem, image: newItem.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format' });
      setNewItem({ name: '', brand: '', category: 'Women Tops', season: 'All', image: '' });
      setIsAdding(false);
      setActiveCategory(savedItem.category || 'All');
      setMessage('Clothing item saved to backend and database.');
      window.setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setMessage(err.message || 'Could not save this clothing item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-black min-h-screen pt-28 px-6 md:px-12 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 z-0"></div>

      <div className="max-w-[100rem] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div className="reveal-on-scroll">
            <span className="text-[0.65rem] font-bold tracking-[0.4em] uppercase text-neutral-500 mb-4 block">Personal Archive</span>
            <h1 className="text-5xl md:text-8xl font-semibold tracking-tighter uppercase leading-none mb-6">MY CLOSET</h1>
            <p className="text-sm font-light text-neutral-400 max-w-xl tracking-wide">
              Your digital sanctuary of curated silhouettes. Manage, categorize, and evolve your signature style with precision engineering.
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full md:w-auto items-end">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.3em] uppercase px-8 py-4 transition-all duration-500 group border ${
                isAdding
                  ? 'bg-transparent text-[#C5A880] border-[#C5A880] shadow-[0_0_15px_rgba(197,168,128,0.15)]'
                  : 'bg-white text-black border-white hover:bg-neutral-200'
              }`}
            >
              <Icon icon={isAdding ? "solar:close-circle-linear" : "solar:add-circle-linear"} />
              {isAdding ? "CANCEL" : "NEW ARCHIVE"}
            </button>

            <div className="flex flex-wrap gap-4 reveal-on-scroll justify-end">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">All</span>
                {['All'].map((cat, idx) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className={`animate-fade-in-up flex items-center gap-2 px-4 py-2.5 text-[0.5rem] font-bold tracking-[0.2em] uppercase transition-all duration-500 border border-l-2 ${
                      activeCategory === cat
                        ? 'bg-white/10 border-white/20 text-white shadow-lg scale-105'
                        : 'border-transparent text-neutral-500 hover:text-white hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon icon="solar:archive-down-square-linear" style={{ fontSize: '0.7rem' }} />
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">Women</span>
                {womenCategories.map((cat, idx) => {
                  const catActiveColor = activeCategory === cat ? 'bg-[#C5A880]/10 border-[#C5A880]/40 text-[#C5A880]' : 'border-transparent text-neutral-500 hover:text-white hover:border-white/10 hover:bg-white/[0.02]';
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className={`animate-fade-in-up flex items-center gap-2 px-4 py-2.5 text-[0.5rem] font-bold tracking-[0.2em] uppercase transition-all duration-500 border border-l-2 ${catActiveColor}`}
                    >
                      <Icon icon="solar:woman-linear" style={{ fontSize: '0.7rem' }} />
                      {cat.replace('Women ', '')}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">Men</span>
                {menCategories.map((cat, idx) => {
                  const catActiveColor = activeCategory === cat ? 'bg-blue-400/10 border-blue-400/40 text-blue-400' : 'border-transparent text-neutral-500 hover:text-white hover:border-white/10 hover:bg-white/[0.02]';
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className={`animate-fade-in-up flex items-center gap-2 px-4 py-2.5 text-[0.5rem] font-bold tracking-[0.2em] uppercase transition-all duration-500 border border-l-2 ${catActiveColor}`}
                    >
                      <Icon icon="solar:man-linear" style={{ fontSize: '0.7rem' }} />
                      {cat.replace('Men ', '')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-8 border border-[#C5A880]/30 bg-[#C5A880]/10 px-5 py-3 text-[0.6rem] font-bold tracking-[0.25em] uppercase text-[#C5A880]">
            {message}
          </div>
        )}

        {isAdding && (
          <div className="mb-24 p-8 md:p-12 border border-white/10 bg-gradient-to-br from-white/[0.01] to-white/[0.03] backdrop-blur-2xl rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C5A880]/[0.02] rounded-full blur-[80px] -z-10 pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 relative z-10">
              <div className="lg:col-span-2 flex flex-col justify-between h-full min-h-[350px] border border-white/5 bg-white/[0.01] p-6 rounded-xl relative group/preview">
                <div className="flex justify-between items-center text-[0.55rem] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                  <span>ARCHIVE DISCOVERY</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse"></span>
                    ACTIVE
                  </span>
                </div>

                {newItem.image ? (
                  <div className="flex-1 my-6 relative overflow-hidden rounded-lg aspect-[3/4] bg-neutral-950 flex items-center justify-center border border-white/10 shadow-2xl group">
                    <img src={newItem.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Aesthetic Capture Preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                      <span className="text-[0.55rem] font-bold tracking-widest text-[#C5A880] uppercase">VISUAL PREVIEW CONFIRMED</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 my-6 relative overflow-hidden rounded-lg bg-neutral-950 flex flex-col items-center justify-center border border-dashed border-white/10 group-hover/preview:border-[#C5A880]/30 transition-colors">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-neutral-400 group-hover/preview:text-[#C5A880] group-hover/preview:border-[#C5A880]/20 transition-all duration-500">
                      <Icon icon="solar:scanner-linear" className="text-xl animate-pulse" />
                    </div>
                    <span className="text-[0.6rem] font-bold tracking-widest uppercase text-neutral-500 group-hover/preview:text-neutral-300 transition-colors mb-2">AWAITING VISUAL CAPTURE</span>
                    <span className="text-[0.5rem] font-light tracking-wide text-neutral-600 px-8 text-center leading-relaxed">
                      Paste an image URL in the input field to generate a high-resolution digital twin.
                    </span>
                  </div>
                )}

                <div className="text-[0.5rem] font-medium tracking-[0.15em] text-neutral-600 uppercase flex justify-between">
                  <span>VELORA CORE OS v2.4</span>
                  <span>SILHOUETTE SCANNER</span>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="lg:col-span-3 flex flex-col justify-between space-y-8">
                <div>
                  <h2 className="text-xl font-semibold tracking-tighter uppercase mb-2">ADD TO DIGITAL ARCHIVE</h2>
                  <p className="text-[0.65rem] font-light text-neutral-500 tracking-wide mb-8">Digitize your physical catalog to render intelligent outfits and curated mood boards instantly.</p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2 group">
                        <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-[#C5A880] transition-colors">Item Name</label>
                        <input
                          type="text"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all placeholder-neutral-800"
                          placeholder="e.g. Double-Breasted Cashmere Coat"
                          required
                        />
                      </div>
                      <div className="space-y-2 group">
                        <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-[#C5A880] transition-colors">Maison / Brand</label>
                        <input
                          type="text"
                          value={newItem.brand}
                          onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all placeholder-neutral-800"
                          placeholder="e.g. Velora Maison"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2 group relative">
                        <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-[#C5A880] transition-colors">Category</label>
                        <div className="relative">
                          <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                            className="w-full bg-transparent border-b border-white/10 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all appearance-none uppercase tracking-widest"
                          >
                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-neutral-900 text-white tracking-widest py-3">{c}</option>)}
                          </select>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 group-focus-within:text-[#C5A880]">
                            <Icon icon="solar:alt-arrow-down-linear" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 group relative">
                        <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-[#666666] group-focus-within:text-[#C5A880] transition-colors">Seasonality</label>
                        <div className="relative">
                          <select
                            value={newItem.season}
                            onChange={(e) => setNewItem({...newItem, season: e.target.value})}
                            className="w-full bg-transparent border-b border-white/10 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all appearance-none uppercase tracking-widest"
                          >
                            {seasons.map(s => <option key={s} value={s} className="bg-neutral-900 text-white tracking-widest py-3">{s}</option>)}
                          </select>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 group-focus-within:text-[#C5A880]">
                            <Icon icon="solar:alt-arrow-down-linear" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-[#C5A880] transition-colors">Digital Silhouette</label>
                      <div className="flex gap-3 items-end">
                        <input
                          type="text"
                          value={newItem.image}
                          onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                          className="flex-1 bg-transparent border-b border-white/10 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all placeholder-neutral-800"
                          placeholder="Paste high-res JPG or PNG URL"
                        />
                        <span className="text-[0.55rem] text-neutral-600 px-2 uppercase font-bold">OR</span>
                        <label className="cursor-pointer flex items-center gap-2 border border-white/10 px-4 py-2 hover:border-[#C5A880]/50 hover:text-[#C5A880] transition-all text-xs tracking-widest uppercase font-bold group/upload flex-shrink-0">
                          <Icon icon="solar:gallery-linear" className="text-base" />
                          <span className="hidden sm:inline">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setNewItem({...newItem, image: event.target.result});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-transparent border border-[#C5A880] text-[#C5A880] py-4 text-[0.65rem] font-bold tracking-[0.35em] uppercase hover:bg-[#C5A880] hover:text-black hover:shadow-[0_0_30px_rgba(197,168,128,0.2)] transition-all duration-500 flex justify-center items-center gap-3"
                >
                  {saving ? 'SAVING...' : 'ARCHIVE SILHOUETTE'}
                  <Icon icon="solar:arrow-right-linear" />
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
          {filteredItems.map((item, i) => (
            <div key={i} className="group reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="aspect-[3/4] overflow-hidden bg-neutral-900 mb-8 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight uppercase mb-2">{item.name}</h3>
                  <div className="flex gap-3 text-[0.55rem] text-neutral-500 tracking-[0.2em] uppercase">
                    <span>{item.brand}</span>
                    <span>&bull;</span>
                    <span>{item.category}</span>
                    <span>&bull;</span>
                    <span>{item.season}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

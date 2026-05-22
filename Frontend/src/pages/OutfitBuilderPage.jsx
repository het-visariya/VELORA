import { useState } from 'react';
import Icon from '../components/Icon';

export default function OutfitBuilderPage({ items, savedOutfits, setSavedOutfits, onSaveOutfit, onDeleteOutfit }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const addToStage = (item) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeFromStage = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', String(item.id));
    e.dataTransfer.effectAllowed = 'copy';
    const ghost = e.currentTarget.querySelector('img');
    if (ghost) {
      e.dataTransfer.setDragImage(ghost, 60, 90);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData('text/plain');
    const item = items.find(i => String(i.id) === id);
    if (item) addToStage(item);
  };

  const handleCaptureLook = async () => {
    if (selectedItems.length === 0) return;
    const outfit = {
      name: outfitName.trim() || `Look ${savedOutfits.length + 1}`,
      items: [...selectedItems],
      createdAt: new Date().toLocaleDateString()
    };
    setSaving(true);
    setMessage('');
    try {
      await onSaveOutfit(outfit);
      setSelectedItems([]);
      setOutfitName('');
      setMessage('Outfit saved to backend and marked in the database.');
      window.setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setMessage(err.message || 'Could not save outfit.');
    } finally {
      setSaving(false);
    }
  };

  const deleteOutfit = async (outfitId) => {
    try {
      await onDeleteOutfit(outfitId);
    } catch (err) {
      setMessage(err.message || 'Could not delete outfit.');
    }
  };

  const editOutfit = (outfit) => {
    setSelectedItems(outfit.items);
    setOutfitName(outfit.name);
    setSavedOutfits(savedOutfits.filter(o => o.id !== outfit.id));
  };

  return (
    <section className="bg-black min-h-screen pt-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] z-0"></div>

      <div className="max-w-[140rem] mx-auto px-6 md:px-12 relative z-10">
        {message && (
          <div className="mb-4 border border-[#C5A880]/30 bg-[#C5A880]/10 px-5 py-3 text-[0.6rem] font-bold tracking-[0.25em] uppercase text-[#C5A880]">
            {message}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)]">

          <div className="w-full lg:w-72 flex flex-col reveal-on-scroll flex-shrink-0">
            <div className="mb-6">
              <span className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-neutral-500 mb-2 block">The Archive</span>
              <h2 className="text-2xl font-semibold tracking-tighter uppercase mb-4">Inventory</h2>
              <div className="h-[1px] w-12 bg-white/20"></div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
              {items.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => addToStage(item)}
                  className={`group relative aspect-[4/5] cursor-grab active:cursor-grabbing transition-all duration-500 border ${
                    selectedItems.find(i => i.id === item.id) ? 'border-[#C5A880]/60 ring-1 ring-[#C5A880]/20' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-[0.55rem] font-bold tracking-widest uppercase text-white">{item.name}</p>
                    <p className="text-[0.45rem] text-neutral-400 uppercase tracking-wider">{item.brand} · {item.category}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="solar:cloud-download-linear" className="text-white/60 text-base" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-[2] bg-neutral-950/50 border rounded-sm relative flex items-center justify-center overflow-hidden reveal-on-scroll transition-all duration-500 ${
              dragOver ? 'border-[#C5A880]/60 bg-[#C5A880]/[0.02]' : 'border-white/5'
            }`}
            style={{ transitionDelay: '200ms', minHeight: '60vh' }}
          >
            <div className="absolute inset-0 bg-[url('https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg')] bg-cover bg-center opacity-[0.03] grayscale"></div>

            {dragOver && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="text-center">
                  <Icon icon="solar:add-square-linear" className="text-[#C5A880] text-5xl mb-4" />
                  <p className="text-[0.65rem] tracking-[0.4em] uppercase text-[#C5A880] font-bold">Drop to compose</p>
                </div>
              </div>
            )}

            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 z-10">
              {selectedItems.length === 0 ? (
                <div className="text-center">
                  <Icon icon="solar:layers-minimalistic-linear" className="text-neutral-800 text-5xl mb-4" />
                  <p className="text-xs tracking-[0.4em] uppercase text-neutral-600 font-medium">Drag items from inventory or click to add</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl animate-fade-in">
                  {selectedItems.map((item, idx) => (
                    <div key={item.id} className="relative aspect-[3/4] group animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover border border-white/10 group-hover:border-white/30 transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[0.5rem] font-bold tracking-widest uppercase text-white">{item.name}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromStage(item.id); }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-red-500/80 border border-white/20"
                      >
                        <Icon icon="solar:close-circle-linear" style={{ fontSize: '0.85rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 bg-black/60 backdrop-blur-md border border-white/5 px-6 py-3">
              <div className="text-center">
                <span className="text-[0.55rem] tracking-[0.4em] uppercase text-neutral-500 block mb-1">Ensemble</span>
                <span className="text-xs font-bold text-white">{selectedItems.length} PIECES</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10"></div>
              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Name this look..."
                className="w-36 bg-transparent border-b border-white/10 py-2 text-[0.6rem] text-white placeholder-neutral-700 focus:outline-none focus:border-[#C5A880]/60 transition-all tracking-widest uppercase"
              />
              <div className="w-[1px] h-8 bg-white/10"></div>
              <button
                onClick={handleCaptureLook}
                disabled={selectedItems.length === 0 || saving}
                className={`text-[0.6rem] font-bold tracking-[0.4em] uppercase transition-all duration-500 flex items-center gap-3 px-5 py-2.5 ${
                  selectedItems.length === 0 || saving
                    ? 'text-neutral-600 cursor-not-allowed'
                    : 'text-[#C5A880] hover:text-black hover:bg-[#C5A880] border border-[#C5A880]/30 hover:border-[#C5A880] hover:shadow-[0_0_25px_rgba(197,168,128,0.2)]'
                }`}
              >
                <Icon icon="solar:camera-minimalistic-linear" />
                {saving ? 'Saving' : 'Capture Look'}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-72 flex flex-col reveal-on-scroll flex-shrink-0" style={{ transitionDelay: '400ms' }}>
            <div className="mb-6 text-right">
              <span className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-neutral-500 mb-2 block">The Studio</span>
              <h2 className="text-2xl font-semibold tracking-tighter uppercase mb-4">Saved Looks</h2>
              <div className="h-[1px] w-12 bg-white/20 ml-auto"></div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
              {savedOutfits.length === 0 ? (
                <div className="text-center py-12">
                  <Icon icon="solar:gallery-wide-linear" className="text-neutral-800 text-4xl mb-3 mx-auto" />
                  <p className="text-[0.55rem] tracking-[0.3em] uppercase text-neutral-600">No looks captured yet</p>
                  <p className="text-[0.5rem] text-neutral-700 mt-2">Compose & capture your first ensemble</p>
                </div>
              ) : (
                savedOutfits.map(outfit => (
                  <div key={outfit.id} className="group border border-white/5 hover:border-white/10 transition-all bg-white/[0.01]">
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[0.6rem] font-bold tracking-widest uppercase">{outfit.name}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editOutfit(outfit)}
                            className="text-neutral-600 hover:text-[#C5A880] transition-colors"
                            title="Edit look"
                          >
                            <Icon icon="solar:pen-linear" style={{ fontSize: '0.7rem' }} />
                          </button>
                          <button
                            onClick={() => deleteOutfit(outfit.id)}
                            className="text-neutral-600 hover:text-red-400 transition-colors"
                            title="Delete look"
                          >
                            <Icon icon="solar:trash-bin-minimalistic-linear" style={{ fontSize: '0.8rem' }} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[0.45rem] text-neutral-600 tracking-wider uppercase mb-3">{outfit.createdAt} · {outfit.items.length} pieces</p>
                      <div className="grid grid-cols-4 gap-1">
                        {outfit.items.slice(0, 4).map(item => (
                          <div key={item.id} className="aspect-[3/4] overflow-hidden border border-white/5">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {outfit.items.map(item => (
                          <span key={item.id} className="text-[0.4rem] text-neutral-500 tracking-wider uppercase border border-white/5 px-1.5 py-0.5">{item.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

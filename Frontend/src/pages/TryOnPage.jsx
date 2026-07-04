import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { saveTryOnSession } from '../api/tryon.api';

const placeholderImageForGender = (gender) => {
  if (gender === 'male') {
    return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80';
  }
  if (gender === 'female') {
    return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80';
  }
  return null;
};

const slotForCategory = (category = '') => {
  const normalized = category.toLowerCase();
  if (normalized.includes('bottom')) return 'Bottoms';
  if (normalized.includes('accessor') || normalized.includes('shoe')) return 'Footwear';
  if (normalized.includes('dress') || normalized.includes('jumpsuit')) return 'Full Body';
  return 'Tops';
};

export default function TryOnPage({ items }) {
  const [userGender, setUserGender] = useState('');
  const [formData, setFormData] = useState({
    heightCm: '',
    weight: '',
    weightUnit: 'kgs',
    bodyStructure: '',
    skinTone: ''
  });
  const [selectedBySlot, setSelectedBySlot] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const selectedItems = useMemo(() => Object.values(selectedBySlot).filter(Boolean), [selectedBySlot]);
  const groupedItems = useMemo(() => {
    return items.reduce((groups, item) => {
      const slot = slotForCategory(item.category);
      groups[slot] = groups[slot] || [];
      groups[slot].push(item);
      return groups;
    }, {});
  }, [items]);

  const skinTones = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Wheatish', 'Brown', 'Dusky', 'Dark', 'Deep'];
  const closetSlots = ['Tops', 'Bottoms', 'Footwear', 'Full Body'];

  const selectGender = (gender) => {
    setUserGender(gender);
    setMessage(`${gender === 'male' ? 'Boy' : 'Girl'} 3D preview selected. Coming soon.`);
  };

  const selectClosetItem = (item) => {
    const slot = slotForCategory(item.category);
    setSelectedBySlot((current) => ({ ...current, [slot]: item }));
  };

  const removeClosetItem = (slot) => {
    setSelectedBySlot((current) => {
      const next = { ...current };
      delete next[slot];
      return next;
    });
  };

  const saveSession = async (e) => {
    e.preventDefault();
    if (!userGender) {
      setMessage('Please confirm him or her before starting the 3D turn.');
      return;
    }
    setSaving(true);
    try {
      await saveTryOnSession({
        ...formData,
        gender: userGender,
        selectedItems
      });
      setMessage(`3D turn saved with ${selectedItems.length} closet item${selectedItems.length === 1 ? '' : 's'}.`);
      window.setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage(err.message || 'Could not save the 3D turn session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-black min-h-screen pt-28 relative overflow-hidden">
      <div className="max-w-[110rem] mx-auto px-6 md:px-12 pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-[22rem_minmax(26rem,1fr)_24rem] gap-6 min-h-[calc(100vh-9rem)]">
          <div className="border border-white/10 bg-neutral-950/70 p-6 overflow-y-auto scrollbar-hide">
            <span className="text-[0.55rem] font-bold tracking-[0.4em] uppercase text-neutral-500 mb-3 block">Gender Analysis</span>
            <h1 className="text-2xl font-semibold tracking-tighter uppercase mb-5">3D Turn Prelude</h1>

            <div className="border border-white/10 bg-white/[0.02] p-5 mb-6">
              <p className="text-[0.68rem] leading-relaxed text-neutral-300 mb-4">
                Before we begin your 3D turn, let's set the stage with a poem. Read the lines below and let your style speak through them, then tell us, are you a him or a her?
              </p>
              <div className="space-y-2 text-[0.7rem] leading-relaxed text-neutral-400 italic">
                <p>In fabrics woven, threads of dreams take flight,</p>
                <p>A silhouette emerges in the morning light.</p>
                <p>Sharp lines or curves, a story to unfold,</p>
                <p>A presence felt, confident, bold.</p>
                <p>Every stitch a whisper, every drape a tale,</p>
                <p>Tell me now, do you wear the veil?</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ['male', 'Boy 3D Virtual', 'solar:men-linear'],
                ['female', 'Girl 3D Virtual', 'solar:women-linear']
              ].map(([gender, label, icon]) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => selectGender(gender)}
                  className={`border px-4 py-4 text-left transition-all ${
                    userGender === gender
                      ? 'border-[#C5A880] bg-[#C5A880]/10 text-[#C5A880]'
                      : 'border-white/10 bg-white/[0.01] text-neutral-400 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <Icon icon={icon} className="text-2xl mb-3 block" />
                  <span className="text-[0.6rem] font-bold tracking-[0.35em] uppercase">{label}</span>
                </button>
              ))}
            </div>

            <form className="space-y-4" onSubmit={saveSession}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  placeholder="Height cm"
                  className="bg-transparent border-b border-white/10 py-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-[#C5A880]"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Weight"
                    className="min-w-0 flex-1 bg-transparent border-b border-white/10 py-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-[#C5A880]"
                  />
                  <select
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    className="w-16 bg-transparent border-b border-white/10 py-2.5 text-[0.55rem] text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="kgs" className="bg-neutral-900">kgs</option>
                    <option value="lbs" className="bg-neutral-900">lbs</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={formData.bodyStructure}
                onChange={(e) => setFormData({ ...formData, bodyStructure: e.target.value })}
                placeholder="Body structure"
                className="w-full bg-transparent border-b border-white/10 py-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-[#C5A880]"
              />

              <select
                value={formData.skinTone}
                onChange={(e) => setFormData({ ...formData, skinTone: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
              >
                <option value="" className="bg-neutral-900 text-neutral-500">Select skin tone</option>
                {skinTones.map((tone) => (
                  <option key={tone} value={tone} className="bg-neutral-900 text-white">{tone}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-white text-black py-3.5 text-[0.6rem] font-bold tracking-[0.35em] uppercase hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                <Icon icon="solar:magic-stick-3-linear" />
                {saving ? 'Saving Turn' : 'Save 3D Turn'}
              </button>
            </form>
          </div>

          <div className="border border-white/10 bg-black relative overflow-hidden min-h-[36rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.12)_0%,rgba(0,0,0,0.15)_35%,rgba(0,0,0,0.92)_72%)]"></div>
            <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between gap-4">
              <div>
                <span className="text-[0.5rem] font-bold tracking-[0.35em] uppercase text-neutral-500 block mb-1">3D Turn</span>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-300">
                  {userGender ? `${userGender === 'male' ? 'Boy' : 'Girl'} 3D model active` : 'Select boy or girl 3D virtual'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetSignal((value) => value + 1)}
                className="border border-white/10 bg-black/50 px-4 py-2 text-[0.55rem] font-bold tracking-[0.25em] uppercase text-neutral-300 hover:border-[#C5A880]/50 hover:text-[#C5A880] transition-all"
              >
                Reset View
              </button>
            </div>

            {userGender ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                  <img
                    src={placeholderImageForGender(userGender)}
                    alt={`${userGender === 'male' ? 'Male' : 'Female'} preview`}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center px-6">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/80">3D preview</span>
                    <h2 className="text-3xl font-bold uppercase text-white">Coming Soon</h2>
                    <p className="max-w-md text-sm leading-relaxed text-neutral-200">
                      {userGender === 'male'
                        ? 'We’re preparing the male 3D try-on experience. Stay tuned for your first model preview.'
                        : 'We’re preparing the female 3D try-on experience. Stay tuned for your first model preview.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                <div>
                  <Icon icon="solar:user-bold" className="text-neutral-800 text-7xl mb-5 mx-auto" />
                  <p className="text-[0.65rem] tracking-[0.4em] uppercase text-neutral-600 font-medium">Select him or her to preview the upcoming 3D experience.</p>
                </div>
              </div>
            )}

            <div className="absolute left-5 right-5 bottom-5 z-20">
              {selectedItems.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {Object.entries(selectedBySlot).map(([slot, item]) => (
                    <span key={slot} className="border border-[#C5A880]/30 bg-black/60 px-3 py-2 text-[0.5rem] tracking-[0.2em] uppercase text-[#C5A880]">
                      {slot}: {item.name}
                    </span>
                  ))}
                </div>
              )}
              {message && (
                <div className="border border-[#C5A880]/30 bg-black/70 px-4 py-3 text-[0.55rem] font-bold tracking-[0.2em] uppercase text-[#C5A880]">
                  {message}
                </div>
              )}
            </div>
          </div>

          <div className="border border-white/10 bg-neutral-950/70 p-6 overflow-y-auto scrollbar-hide">
            <span className="text-[0.55rem] font-bold tracking-[0.4em] uppercase text-neutral-500 mb-2 block">Your Closet</span>
            <h2 className="text-xl font-semibold tracking-tighter uppercase mb-5">Try-On Clothes</h2>

            <div className="space-y-6">
              {closetSlots.map((slot) => (
                <div key={slot}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-neutral-400">{slot}</h3>
                    {selectedBySlot[slot] && (
                      <button
                        type="button"
                        onClick={() => removeClosetItem(slot)}
                        className="text-[0.5rem] font-bold tracking-[0.2em] uppercase text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(groupedItems[slot] || []).slice(0, 8).map((item) => {
                      const selected = selectedBySlot[slot]?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectClosetItem(item)}
                          className={`w-full flex items-center gap-3 text-left border p-2 transition-all ${
                            selected
                              ? 'border-[#C5A880]/60 bg-[#C5A880]/10'
                              : 'border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="w-12 h-14 overflow-hidden border border-white/5 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.58rem] font-bold text-white uppercase tracking-widest truncate">{item.name}</p>
                            <p className="text-[0.48rem] text-neutral-500 uppercase tracking-wider truncate">{item.brand} · {item.category}</p>
                          </div>
                          {selected && <Icon icon="solar:check-circle-bold" className="text-[#C5A880] text-lg" />}
                        </button>
                      );
                    })}
                    {(!groupedItems[slot] || groupedItems[slot].length === 0) && (
                      <p className="border border-dashed border-white/5 px-3 py-4 text-center text-[0.5rem] uppercase tracking-[0.25em] text-neutral-700">
                        No {slot.toLowerCase()} saved
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import Icon from '../components/Icon';

export default function PlannerPage({ items, savedOutfits, events, notice, onAddEvent, onDeleteEvent }) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const blankDays = Array.from({ length: firstDay }, (_, i) => i);

  const [showAddEvent, setShowAddEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', type: 'Casual', assignedClothes: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleClothesItem = (item) => {
    setEventForm(prev => {
      const alreadySelected = prev.assignedClothes.find(c => c.id === item.id);
      if (alreadySelected) {
        return { ...prev, assignedClothes: prev.assignedClothes.filter(c => c.id !== item.id) };
      }
      return { ...prev, assignedClothes: [...prev.assignedClothes, item] };
    });
  };

  const handleAddEvent = async () => {
    if (!eventForm.title.trim()) return;
    const newEvent = {
      date: showAddEvent,
      month: calMonth,
      year: calYear,
      ...eventForm
    };
    setSaving(true);
    setError('');
    try {
      await onAddEvent(newEvent);
      setShowAddEvent(null);
      setEventForm({ title: '', type: 'Casual', assignedClothes: [] });
    } catch (err) {
      setError(err.message || 'Could not plan this event.');
    } finally {
      setSaving(false);
    }
  };

  const getEventsForDate = (day) => events.filter(e => e.date === day && e.month === calMonth && e.year === calYear);

  const deleteEvent = async (eventId) => {
    try {
      await onDeleteEvent(eventId);
    } catch (err) {
      setError(err.message || 'Could not delete this event.');
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else { setCalMonth(calMonth - 1); }
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else { setCalMonth(calMonth + 1); }
  };

  const reminders = events.filter(e => {
    const eventDate = new Date(e.year, e.month, e.date);
    const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3 && diffDays > 0;
  });

  return (
    <section className="bg-black min-h-screen pt-28">
      <div className="px-6 md:px-12 max-w-[100rem] mx-auto pt-8 pb-6">
        <span className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-neutral-500 mb-4 block">The Schedule</span>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter uppercase mb-4 leading-none">Event Planner</h1>
        <p className="text-sm font-light text-neutral-400 max-w-xl tracking-wide">Schedule your aesthetic. Coordinate your wardrobe with your upcoming calendar events.</p>
      </div>

      {(notice || error) && (
        <div className="px-6 md:px-12 max-w-[100rem] mx-auto mb-8">
          <div className={`border px-5 py-4 text-[0.6rem] font-bold tracking-[0.25em] uppercase ${
            error ? 'border-red-400/30 bg-red-400/10 text-red-300' : 'border-[#C5A880]/30 bg-[#C5A880]/10 text-[#C5A880]'
          }`}>
            {error || notice}
          </div>
        </div>
      )}

      {reminders.length > 0 && (
        <div className="px-6 md:px-12 max-w-[100rem] mx-auto mb-8">
          <div className="border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-4 animate-fade-in-up">
            <Icon icon="solar:bell-ringing-linear" className="text-amber-500 text-xl flex-shrink-0" />
            <div>
              <p className="text-[0.6rem] font-bold tracking-widest uppercase text-amber-500 mb-1">Upcoming Events</p>
              {reminders.map(r => (
                <p key={r.id} className="text-[0.55rem] text-neutral-300 tracking-wide">
                  {r.title} &mdash; {monthNames[r.month]} {r.date}, {r.year}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 md:px-12 max-w-[100rem] mx-auto pb-24">
        <div className="mb-6 flex items-center justify-center gap-8">
          <button onClick={prevMonth} className="text-neutral-500 hover:text-white transition-colors p-2">
            <Icon icon="solar:arrow-left-linear" style={{ fontSize: '1.2rem' }} />
          </button>
          <h3 className="text-lg font-semibold tracking-tight uppercase min-w-[200px] text-center">{monthNames[calMonth]} {calYear}</h3>
          <button onClick={nextMonth} className="text-neutral-500 hover:text-white transition-colors p-2">
            <Icon icon="solar:arrow-right-linear" style={{ fontSize: '1.2rem' }} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {dayHeaders.map(day => (
            <div key={day} className="text-center py-3 border-b border-white/10">
              <span className="text-[0.55rem] tracking-widest uppercase font-semibold text-neutral-500">{day}</span>
            </div>
          ))}
          {blankDays.map(i => <div key={`blank-${i}`} className="aspect-[4/5]" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
            return (
              <div key={day} className={`aspect-[4/5] border p-3 flex flex-col justify-between group transition-all duration-300 ${
                isToday ? 'border-[#C5A880]/40 bg-[#C5A880]/5' : 'border-white/5 bg-neutral-900/30 hover:bg-neutral-900 hover:border-white/10'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[0.6rem] font-bold ${isToday ? 'text-[#C5A880]' : 'text-neutral-500'}`}>{day}</span>
                  {isToday && <span className="text-[0.4rem] tracking-widest uppercase text-[#C5A880] font-bold border border-[#C5A880]/30 px-1.5 py-0.5">Today</span>}
                </div>
                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className="group/ev bg-white/5 px-1.5 py-1 text-[0.4rem] tracking-wider uppercase font-medium text-neutral-300 flex justify-between items-center hover:bg-red-500/20 transition-colors">
                      <span className="truncate">{ev.title}</span>
                      <button onClick={() => deleteEvent(ev.id)} className="opacity-0 group-hover/ev:opacity-100 text-red-400 hover:text-red-300 ml-1 flex-shrink-0">
                        <Icon icon="solar:close-circle-linear" style={{ fontSize: '0.6rem' }} />
                      </button>
                    </div>
                  ))}
                  {dayEvents.length > 2 && <span className="text-[0.35rem] text-neutral-600 tracking-wider">+{dayEvents.length - 2} more</span>}
                </div>
                <button
                  onClick={() => { setShowAddEvent(day); setEventForm({ title: '', type: 'Casual', assignedClothes: [] }); }}
                  className="flex items-center justify-center gap-1 py-2 border border-dashed border-white/5 hover:border-[#C5A880]/30 hover:bg-[#C5A880]/5 transition-all text-neutral-600 hover:text-[#C5A880]"
                >
                  <Icon icon="solar:add-circle-linear" style={{ fontSize: '1rem' }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showAddEvent !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4">
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-sm blur-[1px]"></div>
            <div className="relative bg-black/90 backdrop-blur-3xl p-8 md:p-10 border border-white/5 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-base font-light tracking-[0.3em] uppercase text-white">Add Event &mdash; {monthNames[calMonth]} {showAddEvent}, {calYear}</h3>
                <button onClick={() => setShowAddEvent(null)} className="text-neutral-500 hover:text-white transition-colors">
                  <Icon icon="solar:close-circle-linear" style={{ fontSize: '1.5rem' }} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1 group">
                  <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 group-focus-within:text-white transition-colors">Event Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    placeholder="e.g. Paris Fashion Week"
                    className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white placeholder-neutral-800 focus:outline-none focus:border-white/60 transition-all tracking-widest"
                  />
                </div>

                <div className="space-y-1 group">
                  <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 transition-colors">Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                    className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-white focus:outline-none focus:border-white/60 transition-all appearance-none uppercase tracking-widest"
                  >
                    {['Casual', 'Formal', 'Business', 'Party', 'Sport', 'Travel'].map(t => (
                      <option key={t} value={t} className="bg-neutral-900 text-white">{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-neutral-600 transition-colors">
                    Assign Clothes <span className="text-neutral-500 font-normal normal-case tracking-normal">({eventForm.assignedClothes.length} selected)</span>
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-white/10 p-3 space-y-2 scrollbar-hide">
                    {items.length === 0 ? (
                      <p className="text-[0.5rem] text-neutral-600 uppercase tracking-widest text-center py-4">No items in closet</p>
                    ) : (
                      items.map(item => {
                        const isSelected = eventForm.assignedClothes.find(c => c.id === item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleClothesItem(item)}
                            className={`flex items-center gap-4 cursor-pointer transition-all p-2 ${
                              isSelected ? 'bg-[#C5A880]/10 border border-[#C5A880]/30' : 'bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/20'
                            }`}
                          >
                            <div className={`w-5 h-5 flex items-center justify-center border transition-colors flex-shrink-0 ${
                              isSelected ? 'bg-[#C5A880] border-[#C5A880]' : 'border-white/20'
                            }`}>
                              {isSelected && <Icon icon="solar:check-linear" style={{ fontSize: '0.75rem' }} className="text-black" />}
                            </div>
                            <div className="w-14 h-16 overflow-hidden border border-white/5 flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white uppercase tracking-widest truncate">{item.name}</p>
                              <p className="text-[0.55rem] text-neutral-500 uppercase tracking-wider truncate">{item.brand} · {item.category}</p>
                              <p className="text-[0.45rem] text-neutral-600 uppercase tracking-wider">{item.season}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddEvent}
                  disabled={saving}
                  className="w-full bg-white text-black py-4 text-[0.6rem] font-black tracking-[0.5em] uppercase hover:bg-neutral-200 transition-all mt-4 flex items-center justify-center gap-3"
                >
                  <Icon icon="solar:add-circle-linear" />
                  {saving ? 'Saving Event' : 'Add Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

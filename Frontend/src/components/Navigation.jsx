import Icon from './Icon';

export default function Navigation({ isScrolled, setView, view, isAuthenticated, onLogout }) {
  const handleNavClick = (targetView, elementId) => {
    if (isAuthenticated) {
      setView(targetView);
    } else {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        setView('home');
        setTimeout(() => {
          const fallbackEl = document.getElementById(elementId);
          if (fallbackEl) fallbackEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  return (
    <nav
      className={`transition-all duration-700 px-6 md:px-12 flex ease-premium items-center justify-between ${
        isScrolled ? 'bg-white/5 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="flex items-center gap-12">
        <button
          onClick={() => setView('home')}
          className="flex items-center hover:opacity-85 transition-opacity"
        >
          <span
            className="text-white text-base tracking-[0.25em] font-normal uppercase"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              textShadow: '0 2px 10px rgba(255,255,255,0.08)'
            }}
          >
            Velora
          </span>
        </button>

        <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest uppercase text-neutral-300">
          <button
            onClick={() => handleNavClick('closet', 'collection')}
            className={`hover:text-white transition-colors ${view === 'closet' ? 'text-white border-b border-white' : ''}`}
          >
            My Closet
          </button>
          <button
            onClick={() => handleNavClick('builder', 'builder-section')}
            className={`hover:text-white transition-colors ${view === 'builder' ? 'text-white border-b border-white' : ''}`}
          >
            Outfit Builder
          </button>
          <button
            onClick={() => handleNavClick('calendar', 'planner-section')}
            className={`hover:text-white transition-colors ${view === 'calendar' ? 'text-white border-b border-white' : ''}`}
          >
            Planner
          </button>
          <button
            onClick={() => handleNavClick('ai', 'ai-section')}
            className={`hover:text-white transition-colors ${view === 'ai' ? 'text-white border-b border-white' : ''}`}
          >
            AI Suggestions
          </button>
          <button
            onClick={() => handleNavClick('tryon', 'editorial')}
            className={`hover:text-white transition-colors ${view === 'tryon' ? 'text-white border-b border-white' : ''}`}
          >
            3D Try-on
          </button>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-4 md:gap-6 text-white">
        {isAuthenticated ? (
          <>
            <button onClick={onLogout} className="hover:opacity-70 transition-opacity flex items-center gap-2" aria-label="Logout">
              <Icon icon="solar:logout-3-linear" />
              <span className="hidden lg:block text-[0.65rem] font-bold tracking-widest uppercase">Logout</span>
            </button>
            <button onClick={() => setView('profile')} className="hover:opacity-70 transition-opacity flex items-center gap-2" aria-label="Account">
              <Icon icon="solar:user-bold" />
            </button>
          </>
        ) : (
          <button onClick={() => window.dispatchEvent(new CustomEvent('trigger-signin'))} className="hover:opacity-70 transition-opacity flex items-center gap-2" aria-label="Account">
            <Icon icon="solar:user-linear" />
            <span className="hidden lg:block text-[0.65rem] font-bold tracking-widest uppercase">Sign In</span>
          </button>
        )}
        <button onClick={() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-70 transition-opacity" aria-label="Contact">
          <Icon icon="solar:chat-round-call-linear" />
        </button>
      </div>
    </nav>
  );
}

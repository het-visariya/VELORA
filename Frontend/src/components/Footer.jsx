import Icon from './Icon';
import FooterColumn from './FooterColumn';

export default function Footer({ setView, isAuthenticated }) {
  return (
    <footer className="bg-black pt-24 pb-12 px-6 md:px-12 border-t border-white/10 text-neutral-400">
      <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
        <div className="col-span-1 md:col-span-1">
          <button onClick={() => setView('home')} className="text-3xl tracking-[0.2em] uppercase text-white mb-6 block" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Velora</button>
          <p className="text-xs font-light leading-relaxed max-w-xs">Contemporary luxury defined by stark minimalism, precise tailoring, and uncompromising quality.</p>
        </div>

        <FooterColumn title="Explore" links={['New Arrivals', 'The Archive', 'Editorial', 'About the Maison']} />
        <FooterColumn title="Features" links={['My Closet', 'Outfit Builder', 'Planner', 'AI Suggestions', '3D Try-on']} onLinkClick={(link) => {
          const map = {
            'My Closet': { view: 'closet', id: 'collection' },
            'Outfit Builder': { view: 'builder', id: 'builder-section' },
            'Planner': { view: 'calendar', id: 'planner-section' },
            'AI Suggestions': { view: 'ai', id: 'ai-section' },
            '3D Try-on': { view: 'tryon', id: 'editorial' }
          };

          const target = map[link];
          if (!target) return;

          if (isAuthenticated) {
            setView(target.view);
          } else {
            const el = document.getElementById(target.id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              setView('home');
              setTimeout(() => {
                const fallbackEl = document.getElementById(target.id);
                if (fallbackEl) fallbackEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          }
        }} />

        <div id="footer-contact">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-white mb-6">Contact Us</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-light">
              <Icon icon="solar:letter-linear" className="text-neutral-500 flex-shrink-0" />
              <a href="mailto:hello@veloramaison.com" className="hover:text-white transition-colors">hello@veloramaison.com</a>
            </div>
            <div className="flex items-center gap-3 text-sm font-light">
              <Icon icon="solar:phone-linear" className="text-neutral-500 flex-shrink-0" />
              <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
            </div>
            <div className="flex items-center gap-3 text-sm font-light">
              <Icon icon="solar:map-point-linear" className="text-neutral-500 flex-shrink-0" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[100rem] mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-[0.65rem] tracking-widest uppercase font-medium">
        <p>&copy; 2024 VELORA MAISON. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

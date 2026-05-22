import Icon from './Icon';

export default function OutfitBuilderSection({ onEnterStudio }) {
  const benefits = [
    ['solar:layers-minimalistic-linear', <>Dynamic<br />Layering</>],
    ['solar:magic-stick-3-linear', <>Style<br />Generation</>],
    ['solar:folder-favourite-star-linear', <>Save<br />Ensembles</>],
    ['solar:share-circle-linear', <>Community<br />Insights</>],
  ];

  return (
    <section id="builder-section" className="py-24 px-6 md:px-12 border-b border-white/10 bg-black">
      <div className="max-w-4xl mx-auto text-center reveal-on-scroll">
        <div className="flex justify-center gap-2 mb-8 text-amber-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <Icon icon="solar:stars-minimalistic-linear" style={{ fontSize: '1.5rem' }} key={index} />
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-8 leading-relaxed italic">
          "The Outfit Builder transformed how I view my wardrobe. I can now experiment with layering and textures in seconds, discovering looks I never thought possible."
        </h3>
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-500">&mdash; Sophia L., Creative Director</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-24 opacity-60">
        {benefits.map(([icon, label], idx) => (
          <div
            className="flex flex-col items-center text-center gap-4 reveal-on-scroll"
            key={icon}
            style={{ transitionDelay: `${idx * 150}ms` }}
          >
            <Icon icon={icon} style={{ fontSize: '2rem' }} strokeWidth="1" />
            <span className="text-xs tracking-widest uppercase font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-20 flex justify-center reveal-on-scroll" style={{ transitionDelay: '600ms' }}>
        <button
          onClick={onEnterStudio}
          className="border border-[#C5A880]/30 text-[#C5A880] px-16 py-5 text-[0.65rem] font-bold tracking-[0.4em] uppercase hover:bg-[#C5A880] hover:text-black hover:border-[#C5A880] hover:shadow-[0_0_35px_rgba(197,168,128,0.25)] hover:scale-105 transition-all duration-700 ease-premium flex items-center gap-4 group"
        >
          ENTER THE STUDIO
          <Icon icon="solar:arrow-right-linear" className="group-hover:translate-x-2 transition-transform duration-500" />
        </button>
      </div>
    </section>
  );
}

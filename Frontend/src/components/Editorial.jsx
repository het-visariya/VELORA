import Icon from './Icon';

export default function Editorial({ onTryonClick }) {
  return (
    <section id="editorial" className="grid grid-cols-1 lg:grid-cols-2 bg-neutral-950">
      <div className="relative h-[50vh] lg:h-screen w-full overflow-hidden reveal-on-scroll">
        <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600&auto=format&fit=crop" alt="3D Fitting Technology" className="absolute inset-0 w-full h-full object-cover filter grayscale opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/40 to-transparent"></div>
      </div>
      <div className="flex flex-col justify-center px-8 py-20 lg:px-24 reveal-on-scroll" style={{ transitionDelay: '250ms' }}>
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-500 mb-6">The Innovation</span>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter uppercase mb-8 leading-tight">The Future of<br />Virtual<br />Fitting</h2>
        <p className="text-sm font-light text-neutral-400 leading-relaxed mb-8 max-w-md">
          Experience precision like never before. Our advanced 3D scanning technology creates a digital twin of your silhouette, allowing you to visualize exactly how each fabric drapes and moves on your unique form.
        </p>
        <p className="text-sm font-light text-neutral-400 leading-relaxed mb-12 max-w-md">
          Eliminate the guesswork of sizing. Experiment with different textures, colors, and styles in a completely immersive 3D environment designed for the modern digital archive.
        </p>
        <button onClick={onTryonClick} className="inline-flex items-center gap-4 text-xs font-semibold tracking-widest uppercase group w-max">
          <span className="border-b border-transparent group-hover:border-white transition-colors pb-1">Customize your own model</span>
          <Icon icon="solar:arrow-right-linear" className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </section>
  );
}

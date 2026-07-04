const heroMask = {
  animationDelay: '0.2s',
  maskImage: 'linear-gradient(180deg, transparent, black 65%, black 100%, transparent)',
  WebkitMaskImage: 'linear-gradient(180deg, transparent, black 65%, black 100%, transparent)',
};
const titleMask = {
  animationDelay: '0.4s',
  maskImage: 'linear-gradient(180deg, transparent, black 45%, black 100%, transparent)',
  WebkitMaskImage: 'linear-gradient(180deg, transparent, black 45%, black 100%, transparent)',
};

export default function Hero({ onExploreClick }) {
  return (
    <header className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-neutral-900">
        <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg" alt="Hero Background" className="w-full h-full object-cover opacity-60 animate-slow-zoom filter brightness-75" />
        <div className="bg-gradient-to-t from-black via-black/20 to-transparent absolute top-0 right-0 bottom-0 left-0"></div>
      </div>

      <div className="relative z-10 text-center px-4 flex flex-col items-center w-full max-w-5xl mx-auto mt-20">
        <span className="md:text-sm uppercase fade-in-up text-xs font-medium text-white/80 tracking-[0.3em] mb-6 blur-sm" style={heroMask}>Act II: The Shadows</span>
        <h1 className="md:text-7xl lg:text-8xl uppercase leading-[0.9] fade-in-up text-5xl font-semibold text-white tracking-tighter mb-8" style={titleMask}>
          VANTAGE<br />SILHOUETTE
        </h1>
        <p className="text-sm md:text-base font-light text-neutral-300 max-w-md mx-auto mb-10 tracking-wide fade-in-up" style={{ animationDelay: '0.6s' }}>
          Precision-engineered garments for the digital age. A curation of form, function, and uncompromising minimalism. Discover the next evolution of your signature aesthetic.
        </p>
        <div className="flex justify-center fade-in-up w-full" style={{ animationDelay: '0.8s' }}>
          <button
            onClick={onExploreClick}
            className="bg-transparent border border-white text-white px-16 py-5 text-xs font-semibold tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all duration-500 ease-premium w-full sm:w-auto text-center"
          >
            Explore Editorial
          </button>
        </div>
      </div>
    </header>
  );
}

import FeatureHeader from '../components/FeatureHeader';
import Icon from '../components/Icon';

export default function AISuggestionsPage() {
  return (
    <section className="bg-black min-h-screen">
      <FeatureHeader
        title="AI Suggestions"
        description="Intelligent style curation. Algorithms tailored to your unique silhouette and aesthetic preferences."
      />

      <div className="px-6 md:px-12 max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
        {[
          { title: 'The Minimalist Edge', desc: 'Based on your recent interest in monochromatic layers.' },
          { title: 'Evening Resonance', desc: 'Curated for high-profile events in your calendar.' },
          { title: 'Transient Seasonal', desc: 'Adjusting for the upcoming shifts in climate and tone.' },
        ].map((item, i) => (
          <div key={i} className="p-8 border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent reveal-on-scroll" style={{ transitionDelay: `${i * 200}ms` }}>
            <div className="flex justify-between items-start mb-12">
              <Icon icon="solar:stars-minimalistic-linear" className="text-amber-500" style={{ fontSize: '1.5rem' }} />
              <span className="text-[0.6rem] tracking-[0.3em] uppercase text-amber-500 font-bold">Recommended</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight uppercase mb-4">{item.title}</h3>
            <p className="text-sm font-light text-neutral-400 mb-8 leading-relaxed">{item.desc}</p>
            <button className="text-[0.65rem] font-bold tracking-widest uppercase border-b border-white pb-1 hover:text-neutral-400 hover:border-neutral-400 transition-colors">View Selection</button>
          </div>
        ))}
      </div>
    </section>
  );
}

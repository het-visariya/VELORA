import { useState } from 'react';

export default function AISuggestionsSection({ onAnalyzeStyle }) {
  const [email, setEmail] = useState('');

  return (
    <section id="ai-section" className="py-32 px-6 bg-neutral-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605367319989-13e00fc9d737?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 filter grayscale mix-blend-overlay"></div>
      <div className="relative z-10 max-w-xl mx-auto text-center">
        <div className="reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter uppercase mb-4">Intelligent Style Curation</h2>
          <p className="text-sm font-light text-neutral-400 mb-10">Unlock the power of our AI-driven recommendations. Our algorithms analyze your unique silhouette and aesthetic preferences to curate a personalized digital archive.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onAnalyzeStyle(email); }}
          className="flex flex-col sm:flex-row gap-0 w-full border border-white/20 focus-within:border-white transition-colors group reveal-on-scroll"
          style={{ transitionDelay: '250ms' }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="part here is to get function of the google and apple logo with credentials"
            className="flex-1 bg-transparent px-6 py-4 text-xs font-medium tracking-widest text-white placeholder-neutral-600 focus:outline-none w-full"
            required
          />
          <button type="submit" className="bg-white text-black px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-neutral-200 transition-colors sm:w-auto w-full border-t sm:border-t-0 border-white/20 sm:border-l">
            Analyze My Style
          </button>
        </form>
      </div>
    </section>
  );
}

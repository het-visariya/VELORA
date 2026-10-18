import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import aiApi from '../api/ai.api';
import FeatureHeader from '../components/FeatureHeader';
import Icon from '../components/Icon';

export default function AISuggestionsPage({ analysis: initialAnalysis = null, initialEmail = '', onAnalyzeStyle, loading = false, error = '' }) {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState(initialEmail || user?.email || '');
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [internalError, setInternalError] = useState(error);
  const [internalLoading, setInternalLoading] = useState(loading);

  useEffect(() => {
    setEmail(initialEmail || user?.email || '');
  }, [initialEmail, user?.email]);

  useEffect(() => {
    setAnalysis(initialAnalysis);
  }, [initialAnalysis]);

  useEffect(() => {
    setInternalError(error);
  }, [error]);

  useEffect(() => {
    setInternalLoading(loading);
  }, [loading]);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setInternalError('');

    if (onAnalyzeStyle) {
      onAnalyzeStyle(email);
      return;
    }

    if (!email) {
      setInternalError('Please enter your email so we can analyze your wardrobe profile.');
      return;
    }

    setInternalLoading(true);
    try {
      const response = await aiApi.analyzeStyle(email);
      setAnalysis(response.data || response);
    } catch (err) {
      console.error('AI analyze failed', err);
      setInternalError(err.message || 'Unable to generate recommendations right now.');
    } finally {
      setInternalLoading(false);
    }
  };

  const finalLoading = loading || internalLoading;
  const finalError = error || internalError;
  const verdictColor = analysis?.verdict === 'not good' ? 'bg-red-600/10 border-red-500/20 text-red-300' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300';

  return (
    <section className="bg-black min-h-screen pb-20">
      <FeatureHeader
        title="AI Suggestions"
        description="Intelligent style curation. Algorithms tailored to your unique silhouette and aesthetic preferences."
      />

      <div className="px-6 md:px-12 max-w-[100rem] mx-auto space-y-12">
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 shadow-[0_25px_120px_rgba(255,255,255,0.03)]">
            <h2 className="text-4xl font-semibold uppercase tracking-tight mb-4">Analyze your latest outfit builder data</h2>
            <p className="text-sm text-neutral-400 leading-relaxed mb-8">Our AI reads your manual outfit-builder entries, your closet inventory, and your upcoming events to tell you whether your current look is strong or needs refinement.</p>

            <form onSubmit={handleAnalyze} className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
              <label className="flex flex-col gap-2">
                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-neutral-500">Your email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@stylemail.com"
                  className="w-full bg-transparent border border-white/10 px-5 py-4 text-sm text-white placeholder-neutral-600 focus:border-white focus:outline-none transition-all"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-black px-8 py-4 text-xs font-semibold tracking-[0.35em] uppercase hover:bg-neutral-200 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Analyzing…' : 'Analyze My Style'}
              </button>
            </form>

            {error && <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 shadow-[0_25px_120px_rgba(255,255,255,0.03)]">
            <h3 className="text-xl font-semibold uppercase tracking-tight mb-4">What this report includes</h3>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex gap-3 items-start"><span className="mt-1 text-amber-400">•</span>Verdict on whether your current outfit-builder choices are strong.</li>
              <li className="flex gap-3 items-start"><span className="mt-1 text-amber-400">•</span>Why the look is working or where it falls short.</li>
              <li className="flex gap-3 items-start"><span className="mt-1 text-amber-400">•</span>How to improve it using closet pieces you already own.</li>
              <li className="flex gap-3 items-start"><span className="mt-1 text-amber-400">•</span>Three curated outfit recommendations with style tags.</li>
            </ul>
          </div>
        </div>

        {analysis && (
          <div className="grid gap-8">
            <div className={`rounded-3xl border ${verdictColor} border-white/10 p-8`}> 
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[0.65rem] uppercase tracking-[0.35em] text-neutral-400">Style verdict</span>
                  <h3 className="mt-3 text-3xl font-semibold uppercase tracking-tight">{analysis.verdict === 'not good' ? 'Needs refinement' : 'Looks good'}</h3>
                </div>
                <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${analysis.verdict === 'not good' ? 'bg-red-500/15 text-red-200' : 'bg-emerald-500/15 text-emerald-200'}`}>{analysis.verdict}</span>
              </div>
              <p className="mt-6 text-sm leading-7 text-neutral-300">{analysis.summary}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-4">Why</h4>
                <p className="text-sm leading-7 text-neutral-300">{analysis.why}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-4">Improvement</h4>
                <p className="text-sm leading-7 text-neutral-300">{analysis.improvement}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-4">Try with</h4>
                <ol className="space-y-3 text-sm text-neutral-300">
                  {(analysis.tryWith || []).map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 text-amber-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {(analysis.suggestions || []).map((suggestion, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-semibold tracking-tight uppercase">{suggestion.title}</h4>
                    </div>
                    <Icon icon="solar:lightbulb-bold" className="text-amber-500" style={{ fontSize: '1.5rem' }} />
                  </div>
                  <p className="text-sm leading-7 text-neutral-300 mb-6">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {(suggestion.tags || []).map((tag, tagIndex) => (
                      <span key={tagIndex} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-neutral-400">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

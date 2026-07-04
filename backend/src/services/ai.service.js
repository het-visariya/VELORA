// AI Service for Velora — OpenRouter / Google AI Studio / Groq integration

const DEFAULT_SUGGESTIONS = [
  {
    title: 'Urban Luxe Minimalism',
    description: 'Elevate your everyday with clean lines and muted tones. A structured blazer over silk creates effortless sophistication.',
    tags: ['minimalist', 'urban', 'luxe']
  },
  {
    title: 'Evening Opulence',
    description: 'Embrace the night in rich textures and deep hues. Pair a velvet jacket with tailored trousers for a commanding presence.',
    tags: ['evening', 'formal', 'opulent']
  },
  {
    title: 'Effortless Weekend',
    description: 'Casual refinement meets comfort. A cashmere knit with relaxed chinos embodies understated luxury.',
    tags: ['casual', 'weekend', 'comfort']
  }
];

const DEFAULT_ANALYSIS = {
  verdict: 'good',
  summary: 'Your style profile reflects a sophisticated blend of classic tailoring and modern minimalism. Your wardrobe shows a strong foundation in neutral tones and structured pieces, with seasonal accents adding versatility.',
  why: 'Your current outfit-builder selections are well-balanced, but there is room to incorporate more contrast and stronger accessories for a complete luxury statement.',
  improvement: 'Consider pairing neutral foundation pieces with one elevated texture or metallic accent per look, and choose more defined outerwear for cooler events.',
  tryWith: ['White silk shirt + black leather trousers', 'Structured blazer over tonal knitwear', 'Gold hardware bag with polished boots'],
  suggestions: DEFAULT_SUGGESTIONS
};

function tryParseJson(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/```json|```/g, '').replace(/\n/g, ' ').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      return JSON.parse(cleaned.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      return null;
    }
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, ok: response.ok, json, text };
}

async function openRouterGenerate(prompt, systemMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.length < 20) return null;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 900
  };

  const { ok, json, text } = await fetchJson('https://openrouter.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!ok || !json) {
    console.warn('[AI] OpenRouter failed', json || text);
    return null;
  }

  const content = json.choices?.[0]?.message?.content || json.output?.[0]?.content?.find((c) => c.type === 'output_text')?.text;
  return typeof content === 'string' ? content : null;
}

async function googleAistudioGenerate(prompt) {
  const apiKey = process.env.AISTUDIO_API_KEY;
  if (!apiKey || apiKey.length < 20) return null;

  const { ok, json, text } = await fetchJson(
    `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-1:generate?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        maxOutputTokens: 800,
        candidateCount: 1
      })
    }
  );

  if (!ok || !json) {
    console.warn('[AI] AI Studio failed', json || text);
    return null;
  }

  const candidate = json.candidates?.[0] || json.output?.[0];
  const content = candidate?.output || candidate?.content?.[0]?.text || candidate?.content?.find((c) => c.text)?.text;
  return typeof content === 'string' ? content : null;
}

async function groqGenerate(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.length < 20) return null;

  const { ok, json, text } = await fetchJson('https://api.groq.ai/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'groq-1.5-mini',
      input: prompt,
      max_output_tokens: 800,
      temperature: 0.7
    })
  });

  if (!ok || !json) {
    console.warn('[AI] Groq production failed', json || text);
    return null;
  }

  const content = json.output?.[0]?.content?.find((c) => c.type === 'output_text')?.text || json.choices?.[0]?.text || json.output?.[0]?.text;
  return typeof content === 'string' ? content : null;
}

async function generateFromAvailableProvider(prompt, systemMessage) {
  const generators = [openRouterGenerate, googleAistudioGenerate, groqGenerate];
  for (const generator of generators) {
    try {
      const result = await generator(prompt, systemMessage);
      if (result) return result;
    } catch (err) {
      console.warn('[AI] provider error', err.message);
    }
  }
  return null;
}

export async function generateStyleSuggestions() {
  const systemMessage = 'You are a luxury fashion AI stylist for Velora. Generate 3 distinct outfit suggestions. Respond ONLY in valid JSON format: [{ "title": "...", "description": "...", "tags": ["..."] }]';
  const prompt = 'Generate 3 luxury fashion outfit suggestions with evocative titles and style-forward descriptions.';

  const raw = await generateFromAvailableProvider(prompt, systemMessage);
  const parsed = tryParseJson(raw);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed;
  }

  return DEFAULT_SUGGESTIONS;
}

export async function analyzeStyle(closetItems, plannerEvents, savedOutfits) {
  const prompt = `You are a luxury fashion AI stylist for the brand Velora.

The user's wardrobe contains: ${JSON.stringify(closetItems.map((item) => ({ name: item.name, category: item.category, season: item.season })))}
Their upcoming events: ${JSON.stringify(plannerEvents.slice(0, 5))}
Their saved outfits: ${JSON.stringify(savedOutfits.slice(0, 3).map((outfit) => outfit.name))}

Please analyze the outfit-builder data and the wardrobe, then provide a recommendation.
Respond ONLY in valid JSON format with these fields:
{
  "verdict": "good" or "not good",
  "summary": "...",
  "why": "...",
  "improvement": "...",
  "tryWith": ["..."],
  "suggestions": [{ "title": "...", "description": "...", "tags": ["..."] }]
}`;

  const systemMessage = 'You are a luxury fashion AI stylist for Velora. Respond ONLY in valid JSON.';
  const raw = await generateFromAvailableProvider(prompt, systemMessage);
  const parsed = tryParseJson(raw);

  if (parsed && typeof parsed === 'object' && parsed.suggestions && Array.isArray(parsed.suggestions)) {
    return {
      verdict: parsed.verdict || 'good',
      summary: parsed.summary || parsed.analysis || DEFAULT_ANALYSIS.summary,
      why: parsed.why || DEFAULT_ANALYSIS.why,
      improvement: parsed.improvement || DEFAULT_ANALYSIS.improvement,
      tryWith: Array.isArray(parsed.tryWith) ? parsed.tryWith.slice(0, 5) : DEFAULT_ANALYSIS.tryWith,
      suggestions: parsed.suggestions.length > 0 ? parsed.suggestions : DEFAULT_ANALYSIS.suggestions
    };
  }

  return DEFAULT_ANALYSIS;
}

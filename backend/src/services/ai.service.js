// AI Service for Velora — OpenAI / Gemini integration

// Default style suggestions when AI is not configured
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

export async function generateStyleSuggestions() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== 'sk-...' && apiKey.length > 10) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a luxury fashion AI stylist for Velora. Generate 3 distinct outfit suggestions. Respond ONLY in valid JSON format: [{ "title": "...", "description": "...", "tags": ["..."] }]'
          },
          {
            role: 'user',
            content: 'Generate 3 luxury fashion outfit suggestions with evocative titles and style-forward descriptions.'
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      });
      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[AI] OpenAI generation failed, using fallback:', err.message);
    }
  }

  // Fallback to Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'AIza...' && geminiKey.length > 10) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        'You are a luxury fashion AI stylist for Velora. Generate 3 distinct outfit suggestions. Respond ONLY in valid JSON format: [{ "title": "...", "description": "...", "tags": ["..."] }]'
      );
      const text = result.response.text();
      if (text) {
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[AI] Gemini generation failed, using default suggestions:', err.message);
    }
  }

  return DEFAULT_SUGGESTIONS;
}

export async function analyzeStyle(closetItems, plannerEvents, savedOutfits) {
  const prompt = `You are a luxury fashion AI stylist for the brand Velora.
The user's wardrobe contains: ${JSON.stringify(closetItems.map(i => ({ name: i.name, category: i.category, season: i.season })))}
Their upcoming events: ${JSON.stringify(plannerEvents.slice(0, 5))}
Their saved outfits: ${JSON.stringify(savedOutfits.slice(0, 3).map(o => o.name))}

Generate a style analysis and 3 outfit suggestions. Respond ONLY in valid JSON format:
{ "analysis": "...", "suggestions": [{ "title": "...", "description": "...", "tags": ["..."] }] }`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== 'sk-...' && apiKey.length > 10) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a luxury fashion AI stylist for Velora. Respond ONLY in valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      });
      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content.replace(/```json|```/g, '').trim());
      }
    } catch (err) {
      console.warn('[AI] OpenAI analysis failed:', err.message);
    }
  }

  return {
    analysis: 'Your style profile reflects a sophisticated blend of classic tailoring and modern minimalism. Your wardrobe shows a strong foundation in neutral tones and structured pieces, with seasonal accents adding versatility.',
    suggestions: DEFAULT_SUGGESTIONS
  };
}

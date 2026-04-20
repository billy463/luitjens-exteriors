const SYSTEM_PROMPT =
  'You are a residential window estimator. Count visible windows from listing photos and return only JSON.';

const USER_PROMPT = `Analyze these property photos and estimate visible window counts by type.

Return JSON with exactly this shape:
{
  "counts": {
    "double-hung": number,
    "casement": number,
    "sliding": number,
    "picture": number,
    "awning": number,
    "bay-bow": number,
    "garden": number,
    "egress": number
  },
  "confidence": "low" | "medium" | "high",
  "notes": ["short note", "short note"]
}

Rules:
- Count only windows reasonably visible in the provided photos.
- Use 0 where unsure instead of guessing aggressively.
- Bay and bow should be combined as "bay-bow".
- Return only valid JSON with no markdown.`;

const DEFAULT_RESPONSE = {
  counts: {
    'double-hung': 0,
    casement: 0,
    sliding: 0,
    picture: 0,
    awning: 0,
    'bay-bow': 0,
    garden: 0,
    egress: 0,
  },
  confidence: 'low',
  notes: ['Model could not confidently classify windows from provided photos.'],
};

const extractJsonFromText = text => {
  if (!text || typeof text !== 'string') return DEFAULT_RESPONSE;
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return DEFAULT_RESPONSE;
  const maybeJson = trimmed.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(maybeJson);
  return {
    ...DEFAULT_RESPONSE,
    ...parsed,
    counts: {
      ...DEFAULT_RESPONSE.counts,
      ...(parsed?.counts || {}),
    },
    confidence: ['low', 'medium', 'high'].includes(parsed?.confidence)
      ? parsed.confidence
      : 'low',
    notes: Array.isArray(parsed?.notes) ? parsed.notes.slice(0, 5) : DEFAULT_RESPONSE.notes,
  };
};

async function runWithClaude(images, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest',
      max_tokens: 1400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: USER_PROMPT },
            ...images.map(imageUrl => ({
              type: 'image',
              source: { type: 'url', url: imageUrl },
            })),
          ],
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Claude request failed.');
  }

  const textBlock = Array.isArray(payload?.content)
    ? payload.content.find(item => item?.type === 'text')
    : null;

  return extractJsonFromText(textBlock?.text || '');
}

async function runWithOpenAI(images, apiKey) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_WINDOW_MODEL || 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [
            { type: 'input_text', text: USER_PROMPT },
            ...images.map(imageUrl => ({
              type: 'input_image',
              image_url: imageUrl,
              detail: 'high',
            })),
          ],
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI request failed.');
  }

  const rawText =
    payload.output_text ||
    payload.output?.flatMap(item => item.content || []).find(
      item => item.type === 'output_text'
    )?.text ||
    '';

  return extractJsonFromText(rawText);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const images = Array.isArray(req.body?.images)
    ? req.body.images.filter(Boolean)
    : [];

  if (images.length === 0) {
    return res.status(400).json({ error: 'At least one image is required.' });
  }

  const claudeKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    if (claudeKey) {
      const result = await runWithClaude(images, claudeKey);
      return res.status(200).json({ ...result, provider: 'claude', imageCount: images.length });
    }

    if (openaiKey) {
      const result = await runWithOpenAI(images, openaiKey);
      return res.status(200).json({ ...result, provider: 'openai', imageCount: images.length });
    }

    return res.status(500).json({
      error: 'No vision model key is configured. Set CLAUDE_API_KEY (or ANTHROPIC_API_KEY) or OPENAI_API_KEY.',
    });
  } catch (error) {
    return res.status(200).json({
      ...DEFAULT_RESPONSE,
      notes: [
        ...(DEFAULT_RESPONSE.notes || []),
        error.message || 'Vision analysis failed, falling back to manual input.',
      ],
      provider: claudeKey ? 'claude' : 'openai',
      imageCount: images.length,
    });
  }
}

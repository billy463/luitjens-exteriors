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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res
      .status(500)
      .json({ error: 'OPENAI_API_KEY is not configured.' });
  }

  const images = Array.isArray(req.body?.images)
    ? req.body.images.filter(Boolean)
    : [];

  if (images.length === 0) {
    return res.status(400).json({ error: 'At least one image is required.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: SYSTEM_PROMPT }],
          },
          {
            role: 'user',
            content: [
              { type: 'input_text', text: USER_PROMPT },
              ...images.slice(0, 6).map(imageUrl => ({
                type: 'input_image',
                image_url: imageUrl,
                detail: 'high',
              })),
            ],
          },
        ],
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || 'OpenAI request failed.',
        details: payload,
      });
    }

    const rawText =
      payload.output_text ||
      payload.output?.flatMap(item => item.content || []).find(
        item => item.type === 'output_text'
      )?.text ||
      '';

    if (!rawText) {
      return res.status(500).json({ error: 'No model output received.' });
    }

    const parsed = JSON.parse(rawText);
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to analyze property photos.',
      details: error.message,
    });
  }
}

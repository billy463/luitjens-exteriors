import Anthropic from '@anthropic-ai/sdk';

const MODEL_NAME = 'claude-haiku-4-5';

const MANUAL_FALLBACK = {
  counts: {
    single_hung_double_hung: 0,
    picture: 0,
    sliding: 0,
    bay_bow: 0,
    patio_door: 0,
    other: 0,
  },
  total: 0,
  narrative:
    "We couldn't get a clear look at your home from public photos. No problem - just enter your window counts below and we'll take it from there.",
  facesObserved: [],
  imagesAnalyzed: 0,
  model: null,
};

const SYSTEM_PROMPT = `You are analyzing photos of a residential home to give a homeowner a starting
estimate of their window count by type. This is a best guess that the homeowner
will confirm — be direct and confident, not hedging.
Count windows visible in the photos and classify by type:

single_hung_double_hung: standard rectangular windows that slide vertically
picture: large fixed windows that don't open
sliding: horizontal sliding windows
bay_bow: bay or bow windows that project outward
patio_door: sliding glass doors or French doors (back/side of house)
other: anything that doesn't fit above

Then estimate windows you cannot see (typically the back of the house) based
on home size and typical layouts. Include these in your totals.
Write a first-person narrative (3-4 sentences, ~300 characters) describing
what you observed and your estimate. Examples of good narratives:
"I looked at 5 photos of your home — a two-story house with roughly 6 windows
visible on the front and 2 on the side. I estimated another 4-5 on the back
since that side isn't visible in the photos. That puts you around 13 windows
total, plus what looks like a sliding patio door."
"From the 3 photos available, I could see the front of a one-story ranch with
4 windows. Based on the home size, I estimated another 6 on the sides and
back for a total around 10."
Be direct. State what you saw. Name the total. Do not apologize for
limitations — just name them.`;

const OUTPUT_SCHEMA = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      counts: {
        type: 'object',
        properties: {
          single_hung_double_hung: { type: 'integer' },
          picture: { type: 'integer' },
          sliding: { type: 'integer' },
          bay_bow: { type: 'integer' },
          patio_door: { type: 'integer' },
          other: { type: 'integer' },
        },
        required: ['single_hung_double_hung', 'picture', 'sliding', 'bay_bow', 'patio_door', 'other'],
        additionalProperties: false,
      },
      total: { type: 'integer' },
      narrative: { type: 'string' },
      faces_observed: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['counts', 'total', 'narrative', 'faces_observed'],
    additionalProperties: false,
  },
};

const timeoutFetch = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const normalizeMediaType = contentType => {
  if (!contentType || typeof contentType !== 'string') return 'image/jpeg';
  const normalized = contentType.split(';')[0].trim().toLowerCase();
  return normalized.startsWith('image/') ? normalized : 'image/jpeg';
};

const buildPropertyContextText = propertyData => {
  const lines = [];
  if (propertyData?.livingArea != null) lines.push(`Living area: ${propertyData.livingArea} sqft`);
  if (propertyData?.yearBuilt != null) lines.push(`Year built: ${propertyData.yearBuilt}`);
  if (propertyData?.homeType) lines.push(`Home type: ${propertyData.homeType}`);

  if (lines.length === 0) {
    return 'Count the windows and return your structured response.';
  }

  return `Property context:\n\n${lines.join('\n')}\n\nCount the windows and return your structured response.`;
};

const extractStructuredJson = content => {
  if (!Array.isArray(content)) return null;
  const jsonBlock = content.find(item => item?.type === 'output_json' && item?.json);
  return jsonBlock?.json || null;
};

const toNonNegativeInt = value => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const anthropicKey = `${process.env.ANTHROPIC_API_KEY || ''}`.trim();
  if (!anthropicKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const inputImages = Array.isArray(req.body?.images) ? req.body.images.filter(Boolean) : [];
  const images = inputImages.slice(0, 8);
  const propertyData = req.body?.propertyData && typeof req.body.propertyData === 'object' ? req.body.propertyData : null;

  if (images.length === 0) {
    return res.status(200).json(MANUAL_FALLBACK);
  }

  const imageBlocks = [];

  for (const imageUrl of images) {
    try {
      const response = await timeoutFetch(
        imageUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LuitjensBot/1.0)',
          },
        },
        10000,
      );

      if (!response.ok) {
        console.error('[window-count] image fetch non-2xx', { imageUrl, status: response.status });
        continue;
      }

      const mediaType = normalizeMediaType(response.headers.get('content-type'));
      const bytes = await response.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');

      imageBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64,
        },
      });
    } catch (error) {
      console.error('[window-count] image fetch failed', {
        imageUrl,
        error: error?.message,
      });
    }
  }

  if (imageBlocks.length === 0) {
    return res.status(200).json(MANUAL_FALLBACK);
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const userContent = [
    ...imageBlocks,
    {
      type: 'text',
      text: buildPropertyContextText(propertyData),
    },
  ];

  try {
    console.log('[window-count] model request', {
      model: MODEL_NAME,
      imagesSent: imageBlocks.length,
    });

    const response = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
      output_config: {
        format: OUTPUT_SCHEMA,
      },
    });

    const parsed = extractStructuredJson(response?.content);
    if (!parsed) {
      throw new Error('Structured output missing output_json block');
    }

    const normalizedCounts = {
      single_hung_double_hung: toNonNegativeInt(parsed?.counts?.single_hung_double_hung),
      picture: toNonNegativeInt(parsed?.counts?.picture),
      sliding: toNonNegativeInt(parsed?.counts?.sliding),
      bay_bow: toNonNegativeInt(parsed?.counts?.bay_bow),
      patio_door: toNonNegativeInt(parsed?.counts?.patio_door),
      other: toNonNegativeInt(parsed?.counts?.other),
    };

    const summedTotal = Object.values(normalizedCounts).reduce((sum, val) => sum + val, 0);

    return res.status(200).json({
      counts: normalizedCounts,
      total: toNonNegativeInt(parsed?.total) || summedTotal,
      narrative: `${parsed?.narrative || ''}`.trim(),
      facesObserved: Array.isArray(parsed?.faces_observed) ? parsed.faces_observed : [],
      imagesAnalyzed: imageBlocks.length,
      model: MODEL_NAME,
    });
  } catch (error) {
    console.error('[window-count] anthropic error', {
      model: MODEL_NAME,
      message: error?.message,
    });

    return res.status(200).json(MANUAL_FALLBACK);
  }
}

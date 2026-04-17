const normalizeImageUrl = value => {
  if (!value || typeof value !== 'string') return null;

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  if (value.includes('{imageParameters}')) {
    return `https:${value.replace('{imageParameters}', 'fit-in/1200x900/filters:quality(80)')}`;
  }

  return value;
};

const collectImages = input => {
  const found = [];
  const visited = new Set();

  const walk = value => {
    if (!value || typeof value !== 'object') return;
    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    Object.entries(value).forEach(([key, current]) => {
      if (typeof current === 'string') {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('image') ||
          lowerKey.includes('photo') ||
          lowerKey === 'url' ||
          lowerKey === 'src' ||
          lowerKey === 'href'
        ) {
          const normalized = normalizeImageUrl(current);
          if (normalized) found.push(normalized);
        }
      } else {
        walk(current);
      }
    });
  };

  walk(input);

  return [...new Set(found)].filter(Boolean);
};

const fetchJson = async (url, apiKey) => {
  const response = await fetch(url, {
    headers: {
      'x-realtyapi-key': apiKey,
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  return { response, payload };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const address = `${req.query.address || ''}`.trim();
  if (!address) {
    return res.status(400).json({ error: 'Address is required.' });
  }

  const apiKey = process.env.REALTY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'REALTY_API_KEY is not configured.' });
  }

  const encodedAddress = encodeURIComponent(address);
  const endpoints = [
    `https://zillow.realtyapi.io/propimages?byaddress=${encodedAddress}`,
    `https://zillow.realtyapi.io/property_images?byaddress=${encodedAddress}`,
  ];

  const attempts = [];

  try {
    for (const url of endpoints) {
      const { response, payload } = await fetchJson(url, apiKey);
      const images = collectImages(payload);

      attempts.push({
        url,
        status: response.status,
        imageCount: images.length,
      });

      if (response.ok && images.length > 0) {
        return res.status(200).json({
          address,
          images,
          imageCount: images.length,
          source: url,
          raw: payload,
        });
      }
    }

    return res.status(404).json({
      error: 'No property photos were found for this address.',
      attempts,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to reach RealtyAPI.',
      details: error.message,
      attempts,
    });
  }
}

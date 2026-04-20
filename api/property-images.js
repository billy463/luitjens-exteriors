const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const normalizeImageUrl = value => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.includes('{imageParameters}')) {
    return `https:${trimmed.replace('{imageParameters}', 'fit-in/1400x1000/filters:quality(85)')}`;
  }

  return trimmed;
};

const isLikelyPhoto = url => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();

  const definitelyNotPhoto =
    lower.includes('logo') ||
    lower.includes('icon') ||
    lower.includes('sprite') ||
    lower.includes('avatar') ||
    lower.includes('mapbox') ||
    lower.includes('googleapis.com/maps') ||
    lower.includes('streetview');
  if (definitelyNotPhoto) return false;

  if (IMAGE_EXTENSIONS.some(ext => lower.includes(ext))) return true;
  if (lower.includes('photos.zillowstatic.com')) return true;

  return (
    lower.includes('image') ||
    lower.includes('photo') ||
    lower.includes('photos')
  );
};

const scorePhotoUrl = url => {
  const lower = url.toLowerCase();
  let score = 0;
  if (lower.includes('cover')) score += 8;
  if (lower.includes('hero')) score += 7;
  if (lower.includes('main')) score += 6;
  if (lower.includes('listing')) score += 5;
  if (lower.includes('zillow')) score += 4;
  if (lower.includes('photo')) score += 3;
  if (lower.includes('image')) score += 2;
  if (lower.includes('large') || lower.includes('hd')) score += 1;
  return score;
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
        const normalized = normalizeImageUrl(current);
        const keyLooksLikePhoto =
          lowerKey.includes('image') ||
          lowerKey.includes('photo') ||
          lowerKey.includes('src') ||
          lowerKey.includes('cover') ||
          lowerKey.includes('thumbnail');
        const urlLooksLikePhotoHost =
          normalized && normalized.toLowerCase().includes('photos.zillowstatic.com');
        if ((keyLooksLikePhoto || urlLooksLikePhotoHost) && normalized && isLikelyPhoto(normalized)) {
          found.push(normalized);
        }
      } else {
        walk(current);
      }
    });
  };

  walk(input);

  const unique = [...new Set(found)];
  return unique.sort((a, b) => scorePhotoUrl(b) - scorePhotoUrl(a));
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
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

  const apiKey = `${process.env.REALTY_API_KEY || ''}`.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'REALTY_API_KEY is not configured.' });
  }

  const encodedAddress = encodeURIComponent(address);

  const attempts = [];
  const endpoints = [
    {
      url: `https://api.realtyapi.io/pro/byaddress?propertyaddress=${encodedAddress}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    },
    {
      url: `https://zillow.realtyapi.io/propimages?byaddress=${encodedAddress}`,
      headers: {
        'x-realtyapi-key': apiKey,
        Accept: 'application/json',
      },
    },
    {
      url: `https://zillow.realtyapi.io/property_images?byaddress=${encodedAddress}`,
      headers: {
        'x-realtyapi-key': apiKey,
        Accept: 'application/json',
      },
    },
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const { response, payload } = await fetchJson(endpoint.url, {
        headers: endpoint.headers,
      });

      const images = collectImages(payload);
      attempts.push({
        url: endpoint.url,
        status: response.status,
        imageCount: images.length,
      });

      if (response.ok && images.length > 0) {
        return res.status(200).json({
          address,
          images,
          imageCount: images.length,
          source: endpoint.url,
          attempts,
        });
      }
    } catch (error) {
      lastError = error;
      attempts.push({
        url: endpoint.url,
        error: error.message,
      });
    }
  }

  if (lastError && attempts.every(item => item.error)) {
    return res.status(500).json({
      error: 'Unable to reach RealtyAPI.',
      details: lastError.message,
      attempts,
    });
  }

  return res.status(404).json({
    error: 'No property photos were found for this address.',
    attempts,
  });
}

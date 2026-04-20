const REALTY_ENDPOINT = 'https://zillow.realtyapi.io/pro/byaddress';

const URL_BLOCKLIST = ['streetview', 'map', 'logo', 'agent', 'profile', 'static-maps'];
const EXTERIOR_HINTS = ['exterior', 'front', 'back', 'side', 'house'];

const timeoutFetch = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const shortErrorMessage = payload => {
  if (!payload || typeof payload !== 'object') return 'upstream_error';
  const message = payload.error || payload.message || payload.detail || payload.status || 'upstream_error';
  return `${message}`.slice(0, 140);
};

const parseJsonSafe = async response => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 300) };
  }
};

const pickJpegUrl = jpegSources => {
  if (!Array.isArray(jpegSources) || jpegSources.length === 0) return null;
  const candidates = jpegSources
    .filter(item => item && typeof item.url === 'string')
    .map(item => ({
      url: item.url,
      width: Number(item.width) || null,
    }));

  if (candidates.length === 0) return null;

  const exact = candidates.find(item => item.width === 1024);
  if (exact) return exact.url;

  const under2k = candidates
    .filter(item => item.width && item.width <= 2000)
    .sort((a, b) => Math.abs((a.width || 1024) - 1024) - Math.abs((b.width || 1024) - 1024));
  if (under2k.length > 0) return under2k[0].url;

  const fallback = candidates.sort((a, b) => (b.width || 0) - (a.width || 0));
  return fallback[0]?.url || null;
};

const isUsablePhotoUrl = maybeUrl => {
  if (!maybeUrl || typeof maybeUrl !== 'string') return false;
  const url = maybeUrl.trim();
  const lower = url.toLowerCase();
  if (!lower.includes('photos.zillowstatic.com/fp/')) return false;
  return !URL_BLOCKLIST.some(token => lower.includes(token));
};

const normalizePropertyObject = payload => {
  if (!payload || typeof payload !== 'object') return null;
  if (Array.isArray(payload)) return null;

  if (
    Array.isArray(payload.responsivePhotos) ||
    Array.isArray(payload.responsivePhotosOriginalRatio) ||
    Array.isArray(payload.originalPhotos)
  ) {
    return payload;
  }

  const directCandidates = [
    payload.propertyDetails,
    payload.property,
    payload.zillow,
    payload.data,
    payload.result,
  ];
  return directCandidates.find(
    candidate =>
      candidate &&
      typeof candidate === 'object' &&
      (Array.isArray(candidate.responsivePhotos) ||
        Array.isArray(candidate.responsivePhotosOriginalRatio) ||
        Array.isArray(candidate.originalPhotos)),
  ) || payload;
};

const getPropertyData = property => ({
  livingArea: Number(property?.livingArea || property?.livingAreaValue || property?.livingAreaSqFt) || null,
  yearBuilt: Number(property?.yearBuilt) || null,
  bedrooms: Number(property?.bedrooms) || null,
  bathrooms: Number(property?.bathrooms) || Number(property?.bathroomsFull) || null,
  homeType: property?.homeType || property?.propertyType || null,
  stories: Number(property?.resoFacts?.stories || property?.stories) || null,
  lotSize: Number(property?.lotSize || property?.lotAreaValue) || null,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const address = `${req.query.address || ''}`.trim();
  if (!address) {
    return res.status(400).json({ error: 'Address is required.' });
  }

  const apiKey = `${process.env.REALTYAPI_KEY || ''}`.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'REALTYAPI_KEY not configured' });
  }

  const encodedAddress = encodeURIComponent(address);
  const endpointUrl = `${REALTY_ENDPOINT}?propertyaddress=${encodedAddress}`;
  const authMethod = 'x-realtyapi-key';

  let response;
  let payload;

  try {
    response = await timeoutFetch(
      endpointUrl,
      {
        headers: {
          'x-realtyapi-key': apiKey,
          Accept: 'application/json',
        },
      },
      15000,
    );
    payload = await parseJsonSafe(response);
  } catch (error) {
    console.error('[property-images] call failed', {
      endpoint: REALTY_ENDPOINT,
      authMethod,
      error: error?.message,
    });
    return res.status(200).json({
      images: [],
      imageCount: 0,
      source: 'realtyapi',
      error: `fetch_failed ${`${error?.message || 'request failed'}`.slice(0, 120)}`,
    });
  }

  console.log('[property-images] first call', {
    endpoint: REALTY_ENDPOINT,
    authMethod,
    status: response.status,
  });

  if (!response.ok) {
    console.error('[property-images] non-2xx response', {
      status: response.status,
      body: payload,
    });

    return res.status(200).json({
      images: [],
      imageCount: 0,
      source: 'realtyapi',
      error: `${response.status} ${shortErrorMessage(payload)}`,
    });
  }

  const property = normalizePropertyObject(payload) || {};
  const photos =
    (Array.isArray(property?.originalPhotos) && property.originalPhotos) ||
    (Array.isArray(property?.responsivePhotos) && property.responsivePhotos) ||
    (Array.isArray(property?.responsivePhotosOriginalRatio) && property.responsivePhotosOriginalRatio) ||
    [];

  const prioritized = photos
    .map(photo => {
      const caption = `${photo?.caption || ''}`.toLowerCase();
      const score = caption
        ? EXTERIOR_HINTS.some(token => caption.includes(token))
          ? 2
          : 1
        : 3;
      return { photo, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.photo);

  const images = [];
  const seen = new Set();

  for (const photo of prioritized) {
    const url = pickJpegUrl(photo?.mixedSources?.jpeg || []);
    if (!isUsablePhotoUrl(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    images.push(url);
    if (images.length >= 10) break;
  }

  return res.status(200).json({
    images,
    imageCount: images.length,
    source: 'realtyapi',
    propertyData: getPropertyData(property),
  });
}

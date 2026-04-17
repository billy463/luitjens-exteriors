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
    return res
      .status(500)
      .json({ error: 'REALTY_API_KEY is not configured.' });
  }

  try {
    const upstream = await fetch(
      `https://zillow.realtyapi.io/propimages?byaddress=${encodeURIComponent(address)}`,
      {
        headers: {
          'x-realtyapi-key': apiKey,
          Accept: 'application/json',
        },
      }
    );

    const text = await upstream.text();
    let payload = {};

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error:
          payload?.message ||
          payload?.error ||
          'Failed to fetch property images.',
        details: payload,
      });
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to reach RealtyAPI.',
      details: error.message,
    });
  }
}

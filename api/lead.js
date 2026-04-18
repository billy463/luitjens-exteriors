export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, address, message } = req.body || {};

  if (!name || !phone || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Placeholder endpoint for launch tracking.
  // Replace with CRM/email integration after cutover if needed.
  return res.status(200).json({ ok: true, receivedAt: new Date().toISOString(), lead: { name, phone, email, address, message: message || '' } });
}

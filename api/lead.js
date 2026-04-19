import nodemailer from 'nodemailer';

function requiredEnv(name) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, address, message, brand, service, source } = req.body || {};

  if (!name || !phone || !address) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const gmailUser = requiredEnv('GMAIL_USER');
  const gmailAppPassword = requiredEnv('GMAIL_APP_PASSWORD');
  const notifyTo = requiredEnv('LEAD_NOTIFY_TO') || gmailUser;
  const notifyFrom = requiredEnv('LEAD_NOTIFY_FROM') || gmailUser;

  if (!gmailUser || !gmailAppPassword || !notifyTo || !notifyFrom) {
    return res.status(500).json({
      error: 'Lead email notifications are not configured on the server.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const safeService = (service || 'windows').toString().trim() || 'windows';
    const safeBrand = (brand || 'Not sure - help me decide').toString().trim() || 'Not sure - help me decide';
    const safeSource = (source || '/windows hero form').toString().trim() || '/windows hero form';
    const safeMessage = (message || '').toString().trim();
    const safeEmail = (email || '').toString().trim();
    const submittedAt = new Date().toISOString();

    const subject = `New ${safeService} Lead (${safeBrand}): ${name} (${phone})`;

    await transporter.sendMail({
      from: notifyFrom,
      to: notifyTo,
      replyTo: safeEmail || undefined,
      subject,
      text: [
        `New ${safeService} lead submitted`,
        '',
        `Service: ${safeService}`,
        `Brand: ${safeBrand}`,
        `Source: ${safeSource}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${safeEmail || 'N/A'}`,
        `Address: ${address}`,
        `Message: ${safeMessage || 'N/A'}`,
        `Submitted At (UTC): ${submittedAt}`,
      ].join('\n'),
      html: `
        <h2>New ${escapeHtml(safeService)} Lead</h2>
        <p><strong>Service:</strong> ${escapeHtml(safeService)}</p>
        <p><strong>Brand:</strong> ${escapeHtml(safeBrand)}</p>
        <p><strong>Source:</strong> ${escapeHtml(safeSource)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(safeEmail || 'N/A')}</p>
        <p><strong>Address:</strong> ${escapeHtml(address)}</p>
        <p><strong>Message:</strong> ${escapeHtml(safeMessage || 'N/A')}</p>
        <p><strong>Submitted At (UTC):</strong> ${escapeHtml(submittedAt)}</p>
      `,
    });

    return res.status(200).json({
      ok: true,
      receivedAt: submittedAt,
      lead: {
        service: safeService,
        brand: safeBrand,
        source: safeSource,
        name,
        phone,
        email: safeEmail,
        address,
        message: safeMessage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to send lead notification email right now.',
    });
  }
}

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

function formatDisplay(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return '';
  return `$${Math.round(num / 1000)}K`;
}

function buildGhlPayload({ name, phone, email, address, totalWindows, pricing, source }) {
  const trimmedName = (name || '').trim();
  const nameParts = trimmedName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const p = pricing || {};

  return {
    firstName,
    lastName,
    phone,
    email: email || '',
    address1: address,
    total_windows: Number(totalWindows) || 0,
    wincore_low: Number(p.wincore_low) || 0,
    wincore_high: Number(p.wincore_high) || 0,
    wincore_low_display: formatDisplay(p.wincore_low),
    wincore_high_display: formatDisplay(p.wincore_high),
    simonton_low: Number(p.simonton_low) || 0,
    simonton_high: Number(p.simonton_high) || 0,
    simonton_low_display: formatDisplay(p.simonton_low),
    simonton_high_display: formatDisplay(p.simonton_high),
    pella_low: Number(p.pella_low) || 0,
    pella_high: Number(p.pella_high) || 0,
    pella_low_display: formatDisplay(p.pella_low),
    pella_high_display: formatDisplay(p.pella_high),
    lead_source_page: source || '/windows-landing',
  };
}

async function sendGhlWebhook(webhookUrl, lead) {
  if (!webhookUrl) return { configured: false, ok: false };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    throw new Error(`GHL webhook failed with ${response.status}: ${responseText.slice(0, 500)}`);
  }

  return { configured: true, ok: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, address, message, details, service, source, totalWindows, pricing } = req.body || {};

  if (!name || !phone || !address) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const gmailUser = requiredEnv('GMAIL_USER');
  const gmailAppPassword = requiredEnv('GMAIL_APP_PASSWORD');
  const notifyTo = requiredEnv('LEAD_NOTIFY_TO') || gmailUser;
  const notifyFrom = requiredEnv('LEAD_NOTIFY_FROM') || gmailUser;
  const ghlWebhookUrl = requiredEnv('GHL_WEBHOOK_URL');

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
    const safeSource = (source || '/windows hero form').toString().trim() || '/windows hero form';
    const safeMessage = (message || '').toString().trim();
    const safeDetails = (details || '').toString().trim();
    const safeEmail = (email || '').toString().trim();
    const submittedAt = new Date().toISOString();
    const lead = {
      service: safeService,
      source: safeSource,
      name,
      phone,
      email: safeEmail,
      address,
      message: safeMessage,
      details: safeDetails,
      submittedAt,
    };

    const subject = `New ${safeService} Lead: ${name} (${phone})`;

    await transporter.sendMail({
      from: notifyFrom,
      to: notifyTo,
      replyTo: safeEmail || undefined,
      subject,
      text: [
        `New ${safeService} lead submitted`,
        '',
        `Service: ${safeService}`,
        `Source: ${safeSource}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${safeEmail || 'N/A'}`,
        `Address: ${address}`,
        `Message: ${safeMessage || 'N/A'}`,
        `Details: ${safeDetails || 'N/A'}`,
        `Submitted At (UTC): ${submittedAt}`,
      ].join('\n'),
      html: `
        <h2>New ${escapeHtml(safeService)} Lead</h2>
        <p><strong>Service:</strong> ${escapeHtml(safeService)}</p>
        <p><strong>Source:</strong> ${escapeHtml(safeSource)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(safeEmail || 'N/A')}</p>
        <p><strong>Address:</strong> ${escapeHtml(address)}</p>
        <p><strong>Message:</strong> ${escapeHtml(safeMessage || 'N/A')}</p>
        <p><strong>Details:</strong> ${escapeHtml(safeDetails || 'N/A')}</p>
        <p><strong>Submitted At (UTC):</strong> ${escapeHtml(submittedAt)}</p>
      `,
    });

    const ghlPayload = buildGhlPayload({
      name,
      phone,
      email: safeEmail,
      address,
      totalWindows,
      pricing,
      source: safeSource,
    });
    const ghl = await sendGhlWebhook(ghlWebhookUrl, ghlPayload);

    return res.status(200).json({
      ok: true,
      receivedAt: submittedAt,
      integrations: {
        email: { ok: true },
        ghl,
      },
      lead,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to send lead notification email right now.',
    });
  }
}

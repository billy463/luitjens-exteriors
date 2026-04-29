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
    wincore_low: formatDisplay(p.wincore_low),
    wincore_high: formatDisplay(p.wincore_high),
    wincore_low_display: formatDisplay(p.wincore_low),
    wincore_high_display: formatDisplay(p.wincore_high),
    simonton_low: formatDisplay(p.simonton_low),
    simonton_high: formatDisplay(p.simonton_high),
    simonton_low_display: formatDisplay(p.simonton_low),
    simonton_high_display: formatDisplay(p.simonton_high),
    pella_low: formatDisplay(p.pella_low),
    pella_high: formatDisplay(p.pella_high),
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
    const p = pricing || {};

    const pricingRows = [
      { brand: 'Wincore',   low: p.wincore_low,   high: p.wincore_high },
      { brand: 'Simonton',  low: p.simonton_low,  high: p.simonton_high },
      { brand: 'Pella',     low: p.pella_low,     high: p.pella_high },
    ]
      .filter(r => Number(r.low) > 0 || Number(r.high) > 0)
      .map(r => `  ${r.brand}: ${formatDisplay(r.low)} – ${formatDisplay(r.high)}`)
      .join('\n');

    const pricingText = pricingRows
      ? `\nEstimated Pricing\n${pricingRows}\n`
      : '';

    const pricingHtml = pricingRows
      ? `
        <tr><td colspan="2" style="padding:16px 24px 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b8952a;border-top:1px solid #e5e7eb;">Estimated Pricing</td></tr>
        ${[
          { brand: 'Wincore',  low: p.wincore_low,  high: p.wincore_high },
          { brand: 'Simonton', low: p.simonton_low, high: p.simonton_high },
          { brand: 'Pella',    low: p.pella_low,    high: p.pella_high },
        ]
          .filter(r => Number(r.low) > 0 || Number(r.high) > 0)
          .map(r => `<tr>
            <td style="padding:6px 24px;color:#6b7280;font-size:14px;">${escapeHtml(r.brand)}</td>
            <td style="padding:6px 24px;font-size:14px;font-weight:600;">${escapeHtml(formatDisplay(r.low))} – ${escapeHtml(formatDisplay(r.high))}</td>
          </tr>`)
          .join('')}
      `
      : '';

    await transporter.sendMail({
      from: notifyFrom,
      to: notifyTo,
      replyTo: safeEmail || undefined,
      subject,
      text: [
        `NEW ${safeService.toUpperCase()} LEAD`,
        '─────────────────────────────',
        `Name:         ${name}`,
        `Phone:        ${phone}`,
        `Email:        ${safeEmail || 'N/A'}`,
        `Address:      ${address}`,
        '',
        `Service:      ${safeService}`,
        `Source:       ${safeSource}`,
        `Message:      ${safeMessage || 'N/A'}`,
        `Details:      ${safeDetails || 'N/A'}`,
        pricingText,
        `Submitted At: ${submittedAt}`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#0f1e2e;padding:24px;text-align:center;">
            <p style="margin:0;color:#b8952a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">New Lead Notification</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;">New ${escapeHtml(safeService)} Lead</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td colspan="2" style="padding:16px 24px 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b8952a;">Contact</td></tr>
            <tr>
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;width:35%;">Name</td>
              <td style="padding:6px 24px;font-size:14px;font-weight:600;">${escapeHtml(name)}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Phone</td>
              <td style="padding:6px 24px;font-size:14px;font-weight:600;">${escapeHtml(phone)}</td>
            </tr>
            <tr>
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Email</td>
              <td style="padding:6px 24px;font-size:14px;">${escapeHtml(safeEmail || 'N/A')}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Address</td>
              <td style="padding:6px 24px;font-size:14px;">${escapeHtml(address)}</td>
            </tr>
            <tr><td colspan="2" style="padding:16px 24px 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b8952a;border-top:1px solid #e5e7eb;">Lead Details</td></tr>
            <tr>
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Service</td>
              <td style="padding:6px 24px;font-size:14px;">${escapeHtml(safeService)}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Source</td>
              <td style="padding:6px 24px;font-size:14px;">${escapeHtml(safeSource)}</td>
            </tr>
            <tr>
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Message</td>
              <td style="padding:6px 24px;font-size:14px;">${escapeHtml(safeMessage || 'N/A')}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Details</td>
              <td style="padding:6px 24px;font-size:14px;">${escapeHtml(safeDetails || 'N/A')}</td>
            </tr>
            ${pricingHtml}
            <tr style="background:#f9fafb;">
              <td style="padding:6px 24px;color:#6b7280;font-size:14px;">Submitted At</td>
              <td style="padding:6px 24px;font-size:14px;">${escapeHtml(submittedAt)}</td>
            </tr>
          </table>
          <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Luitjens Exteriors · luitjens-exteriors.com</p>
          </div>
        </div>
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

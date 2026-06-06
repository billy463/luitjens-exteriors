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

const STAGE_LABELS = {
  boot: 'Just landed',
  menu: 'Browsed the menu',
  address: 'Was entering their address',
  analyzing: 'Was analyzing their home',
  counts: 'Reviewed their window counts',
  pricing: 'Saw their pricing',
  contact: 'Reached the form (did NOT submit)',
  done: 'Submitted',
};

const VARIANT_ROUTE = {
  default: '/windows-landing',
  mayDiscount: '/may-discount',
  speedPricing: '/speed-pricing',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // sendBeacon may deliver the JSON as a string — parse defensively.
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body && typeof body === 'object' ? body : {};

  const { variant, stageReached, address, totalWindows, totalDoors, pricingLow, pricingHigh, menuViewed, durationSec, transcript } = body;

  const safeTranscript = (transcript || '').toString().trim().slice(0, 8000);
  if (!safeTranscript) return res.status(200).json({ ok: true, skipped: 'empty' });

  const gmailUser = requiredEnv('GMAIL_USER');
  const gmailAppPassword = requiredEnv('GMAIL_APP_PASSWORD');
  const notifyTo = requiredEnv('LEAD_NOTIFY_TO') || gmailUser;
  const notifyFrom = requiredEnv('LEAD_NOTIFY_FROM') || gmailUser;
  if (!gmailUser || !gmailAppPassword || !notifyTo) {
    return res.status(200).json({ ok: false, error: 'email not configured' });
  }

  const stage = STAGE_LABELS[stageReached] || stageReached || 'Unknown';
  const route = VARIANT_ROUTE[variant] || '/windows-landing';
  const viewed = Array.isArray(menuViewed) && menuViewed.length ? menuViewed.join(', ') : 'none';
  const windows =
    totalWindows != null ? `${totalWindows}${totalDoors ? ` + ${totalDoors} door(s)` : ''}` : '—';
  const pricing =
    Number(pricingLow) > 0 && Number(pricingHigh) > 0
      ? `$${Number(pricingLow).toLocaleString()} – $${Number(pricingHigh).toLocaleString()}`
      : '—';
  const duration = Number(durationSec) > 0 ? `${Math.round(Number(durationSec))}s on page` : '—';
  const submittedAt = new Date().toISOString();

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    await transporter.sendMail({
      from: notifyFrom,
      to: notifyTo,
      subject: `Visitor recap — ${stage}${address ? ` · ${address.split(',')[0]}` : ''}`,
      text: [
        'WINDOWS LANDING — VISITOR SESSION RECAP',
        '(They did NOT submit a lead — this is an engagement recap.)',
        '─────────────────────────────',
        `Got to:        ${stage}`,
        `Landing page:  ${route}`,
        `Sections seen: ${viewed}`,
        `Address:       ${address || '—'}`,
        `Windows:       ${windows}`,
        `Saw pricing:   ${pricing}`,
        `Time on page:  ${duration}`,
        '',
        'Conversation',
        '─────────────────────────────',
        safeTranscript,
        '',
        `At: ${submittedAt}`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#0f1e2e;padding:20px 24px;">
            <p style="margin:0;color:#b8952a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Visitor Session Recap</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">${escapeHtml(stage)}</h1>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">No lead submitted — engagement only.</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${[
              ['Landing page', route],
              ['Sections seen', viewed],
              ['Address', address || '—'],
              ['Windows', windows],
              ['Saw pricing', pricing],
              ['Time on page', duration],
            ]
              .map(
                ([k, v], i) =>
                  `<tr${i % 2 ? ' style="background:#f9fafb;"' : ''}><td style="padding:6px 24px;color:#6b7280;width:38%;">${escapeHtml(k)}</td><td style="padding:6px 24px;font-weight:600;">${escapeHtml(v)}</td></tr>`,
              )
              .join('')}
            <tr><td colspan="2" style="padding:16px 24px 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#b8952a;border-top:1px solid #e5e7eb;">Conversation</td></tr>
            <tr><td colspan="2" style="padding:6px 24px 16px;"><pre style="margin:0;white-space:pre-wrap;word-break:break-word;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">${escapeHtml(safeTranscript)}</pre></td></tr>
          </table>
          <div style="background:#f9fafb;padding:14px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Luitjens Exteriors · visitor analytics</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: false, error: 'send failed' });
  }
}

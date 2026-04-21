import nodemailer from 'nodemailer';

const DEFAULT_GHL_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/hSzTh8kcrzc121KdLlOo/webhook-trigger/662e3b01-d60c-41d4-a258-0520f12e9e38';

const PER_WINDOW_RANGES = {
  wincore: { low: 1000, high: 1455 },
  simonton: { low: 1275, high: 1635 },
  pella: { low: 1365, high: 1725 },
  andersen: { low: 1635, high: 2180 },
};

const PATIO_DOOR_RANGES = {
  wincore: { low: 2400, high: 3400 },
  simonton: { low: 3200, high: 4500 },
  pella: { low: 3800, high: 5500 },
  andersen: { low: 4200, high: 6500 },
};

const STYLE_MULTIPLIERS = {
  single_hung_double_hung: 1.0,
  picture: 0.88,
  sliding: 0.95,
  casement: 1.15,
  bay_bow: 3.4,
  patio_door: 1.0,
};

const PRICE_FLOOR_PER_WINDOW = 850;
const WINDOW_COUNT_KEYS = Object.keys(STYLE_MULTIPLIERS);

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

function normalizeCount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return 0;
  return Math.round(numericValue);
}

function normalizeCounts(counts = {}) {
  return WINDOW_COUNT_KEYS.reduce((normalized, key) => {
    normalized[key] = normalizeCount(counts?.[key]);
    return normalized;
  }, {});
}

function sumCounts(counts = {}) {
  return WINDOW_COUNT_KEYS.reduce((sum, key) => sum + normalizeCount(counts?.[key]), 0);
}

function getVolumeDiscountRate(totalWindows) {
  if (totalWindows >= 20) return 0.07;
  if (totalWindows >= 15) return 0.05;
  if (totalWindows >= 10) return 0.03;
  return 0;
}

function roundToNearestHundred(value) {
  return Math.round(value / 100) * 100;
}

function formatDisplay(value) {
  return `$${Math.round(value / 1000)}K`;
}

function getNumericPropertyValue(propertyData, keys) {
  for (const key of keys) {
    const value = Number(propertyData?.[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

export function computeManufacturerPricing({ counts, totalWindows, propertyData } = {}) {
  const normalizedCounts = normalizeCounts(counts);
  const safeTotalWindows = normalizeCount(totalWindows) || sumCounts(normalizedCounts);
  const volumeDiscountRate = getVolumeDiscountRate(safeTotalWindows);
  const yearBuilt = getNumericPropertyValue(propertyData, ['yearBuilt', 'year_built', 'year']);
  const stories = getNumericPropertyValue(propertyData, ['stories', 'storyCount', 'story_count']);

  return Object.keys(PER_WINDOW_RANGES).reduce((pricing, manufacturer) => {
    const windowSubtotal = Object.entries(normalizedCounts).reduce(
      (totals, [type, count]) => {
        if (!count || type === 'patio_door') return totals;

        const multiplier = STYLE_MULTIPLIERS[type] || 1;
        const lowEach = Math.max(PER_WINDOW_RANGES[manufacturer].low * multiplier, PRICE_FLOOR_PER_WINDOW);
        const highEach = Math.max(PER_WINDOW_RANGES[manufacturer].high * multiplier, PRICE_FLOOR_PER_WINDOW);

        return {
          low: totals.low + lowEach * count,
          high: totals.high + highEach * count,
        };
      },
      { low: 0, high: 0 },
    );

    const patioDoorCount = normalizedCounts.patio_door || 0;
    let projectLow = windowSubtotal.low + PATIO_DOOR_RANGES[manufacturer].low * patioDoorCount;
    let projectHigh = windowSubtotal.high + PATIO_DOOR_RANGES[manufacturer].high * patioDoorCount;

    if (volumeDiscountRate) {
      projectLow *= 1 - volumeDiscountRate;
      projectHigh *= 1 - volumeDiscountRate;
    }

    if (yearBuilt && yearBuilt < 1978) {
      projectLow *= 1.08;
      projectHigh *= 1.08;
    }

    if (stories && stories >= 2) {
      projectLow *= 1.05;
      projectHigh *= 1.05;
    }

    const low = roundToNearestHundred(projectLow);
    const high = roundToNearestHundred(projectHigh);

    pricing[manufacturer] = {
      low,
      high,
      lowDisplay: formatDisplay(low),
      highDisplay: formatDisplay(high),
    };

    return pricing;
  }, {});
}

function splitName(name = '') {
  const trimmedName = String(name || '').trim();
  const [firstName = '', ...lastParts] = trimmedName.split(/\s+/);
  return {
    firstName,
    lastName: lastParts.join(' '),
  };
}

function parseAddress(address = '') {
  const trimmedAddress = String(address || '').trim();
  const parts = trimmedAddress.split(',').map(part => part.trim()).filter(Boolean);
  const stateZipMatch = parts[2]?.match(/^([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);

  if (parts.length >= 3 && stateZipMatch) {
    return {
      address1: parts[0],
      city: parts[1] || '',
      state: stateZipMatch[1] || '',
      postalCode: stateZipMatch[2] || '',
    };
  }

  return {
    address1: trimmedAddress,
    city: '',
    state: '',
    postalCode: '',
  };
}

function normalizePhone(phone = '') {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return String(phone || '').trim();
}

export function buildGhlPayload({ name, phone, email, address, totalWindows, pricing, source } = {}) {
  const { firstName, lastName } = splitName(name);
  const { address1, city, state, postalCode } = parseAddress(address);
  const safePricing = pricing || {};
  const sourcePage = String(source || '').trim().startsWith('/windows-landing')
    ? '/windows-landing'
    : String(source || '').trim() || '/windows-landing';

  return {
    firstName,
    lastName,
    phone: normalizePhone(phone),
    email: String(email || '').trim(),
    address1,
    city,
    state,
    postalCode,
    total_windows: normalizeCount(totalWindows),
    wincore_low: safePricing.wincore?.low || 0,
    wincore_high: safePricing.wincore?.high || 0,
    wincore_low_display: safePricing.wincore?.lowDisplay || '',
    wincore_high_display: safePricing.wincore?.highDisplay || '',
    simonton_low: safePricing.simonton?.low || 0,
    simonton_high: safePricing.simonton?.high || 0,
    simonton_low_display: safePricing.simonton?.lowDisplay || '',
    simonton_high_display: safePricing.simonton?.highDisplay || '',
    pella_low: safePricing.pella?.low || 0,
    pella_high: safePricing.pella?.high || 0,
    pella_low_display: safePricing.pella?.lowDisplay || '',
    pella_high_display: safePricing.pella?.highDisplay || '',
    andersen_low: safePricing.andersen?.low || 0,
    andersen_high: safePricing.andersen?.high || 0,
    andersen_low_display: safePricing.andersen?.lowDisplay || '',
    andersen_high_display: safePricing.andersen?.highDisplay || '',
    lead_source_page: sourcePage,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    phone,
    email,
    address,
    message,
    details,
    brand,
    service,
    source,
    counts,
    totalWindows,
    propertyData,
  } = req.body || {};

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
    const safeMessage = (message || details || '').toString().trim();
    const safeEmail = (email || '').toString().trim();
    const submittedAt = new Date().toISOString();
    const safeCounts = normalizeCounts(counts);
    const safeTotalWindows = normalizeCount(totalWindows) || sumCounts(safeCounts);
    const pricing = computeManufacturerPricing({
      counts: safeCounts,
      totalWindows: safeTotalWindows,
      propertyData,
    });

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

    const ghlWebhookUrl = requiredEnv('GHL_WEBHOOK_URL') || DEFAULT_GHL_WEBHOOK_URL;
    if (ghlWebhookUrl) {
      const ghlPayload = buildGhlPayload({
        name,
        phone,
        email: safeEmail,
        address,
        totalWindows: safeTotalWindows,
        pricing,
        source: safeSource,
      });

      try {
        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ghlPayload),
        });

        if (!ghlResponse.ok) {
          console.error('[lead] ghl webhook returned non-2xx', ghlResponse.status);
        }
      } catch (error) {
        console.error('[lead] ghl webhook failed', error?.message || error);
      }
    }

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
      pricing,
    });
  } catch (error) {
    console.error('[lead] email notification failed', error?.message || error);
    return res.status(500).json({
      error: 'Unable to send lead notification email right now.',
    });
  }
}

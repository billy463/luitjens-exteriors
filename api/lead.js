import nodemailer from 'nodemailer';

function requiredEnv(name) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, address, message } = req.body || {};

  if (!name || !phone || !email || !address) {
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

    const safeMessage = (message || '').trim();
    const submittedAt = new Date().toISOString();
    const subject = `New Window Lead: ${name} (${phone})`;

    await transporter.sendMail({
      from: notifyFrom,
      to: notifyTo,
      replyTo: email,
      subject,
      text: [
        'New lead submitted from luitjens-exteriors.com/windows',
        '',
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Address: ${address}`,
        `Message: ${safeMessage || 'N/A'}`,
        `Submitted At (UTC): ${submittedAt}`,
      ].join('\n'),
      html: `
        <h2>New Window Lead</h2>
        <p><strong>Source:</strong> luitjens-exteriors.com/windows</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Message:</strong> ${safeMessage || 'N/A'}</p>
        <p><strong>Submitted At (UTC):</strong> ${submittedAt}</p>
      `,
    });

    return res.status(200).json({
      ok: true,
      receivedAt: submittedAt,
      lead: { name, phone, email, address, message: safeMessage },
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to send lead notification email right now.',
    });
  }
}

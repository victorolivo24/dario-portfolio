const fs = require('fs');
const path = require('path');

const RESUME_PATH = path.join(__dirname, '_resume', 'MartinezDarioResume.pdf');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

async function sendResendEmail(apiKey, payload) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Resend request failed (${response.status}): ${errText}`);
    }
    return response;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const body = req.body || {};
    const { name, email, company } = body;

    // Honeypot: real users never see or fill this field.
    if (company) {
        return res.status(200).json({ ok: true });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Name is required.' });
    }
    const cleanName = name.trim().slice(0, 100);

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const cleanEmail = email.trim().slice(0, 200);

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const SHEET_WEBAPP_URL = process.env.SHEET_WEBAPP_URL;

    if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
        console.error('request-resume: missing RESEND_API_KEY or NOTIFY_EMAIL env var');
        return res.status(500).json({ error: 'Server is not configured. Please email dario3martinez@gmail.com directly.' });
    }

    let pdfBase64;
    try {
        pdfBase64 = fs.readFileSync(RESUME_PATH).toString('base64');
    } catch (err) {
        console.error('request-resume: failed to read resume PDF', err);
        return res.status(500).json({ error: 'Could not load the resume file. Please email dario3martinez@gmail.com directly.' });
    }

    try {
        await sendResendEmail(RESEND_API_KEY, {
            from: `Dario Martinez III <${FROM_EMAIL}>`,
            to: [cleanEmail],
            subject: 'Dario Martinez III — Resume',
            html: `<p>Hi ${escapeHtml(cleanName)},</p><p>Thanks for your interest — my resume is attached.</p><p>Best,<br/>Dario Martinez III</p>`,
            attachments: [
                {
                    filename: 'Dario_Martinez_Resume.pdf',
                    content: pdfBase64,
                },
            ],
        });
    } catch (err) {
        console.error('request-resume: failed to send requester email', err);
        return res.status(500).json({ error: 'Something went wrong sending your resume. Please try again or email dario3martinez@gmail.com directly.' });
    }

    // Notification + sheet log are best-effort — a failure here shouldn't
    // fail the response since the requester already has their resume.
    const timestamp = new Date().toISOString();

    sendResendEmail(RESEND_API_KEY, {
        from: `Portfolio Resume Requests <${FROM_EMAIL}>`,
        to: [NOTIFY_EMAIL],
        subject: `Resume requested by ${cleanName}`,
        html: `<p><strong>${escapeHtml(cleanName)}</strong> requested your resume.</p><p>Email: ${escapeHtml(cleanEmail)}</p><p>Time: ${timestamp}</p>`,
    }).catch((err) => console.error('request-resume: notify email failed', err));

    if (SHEET_WEBAPP_URL) {
        fetch(SHEET_WEBAPP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: cleanName, email: cleanEmail, timestamp }),
        }).catch((err) => console.error('request-resume: sheet log failed', err));
    }

    return res.status(200).json({ ok: true });
};

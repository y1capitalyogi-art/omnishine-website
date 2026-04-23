// Cloudflare Pages Function: POST /api/quote
// Validates, verifies Turnstile, sends two emails via Resend.
// Env vars (set in Cloudflare Pages dashboard):
//   RESEND_API_KEY        - Resend API key (re_xxx)
//   TURNSTILE_SECRET_KEY  - Cloudflare Turnstile secret key
//   FROM_EMAIL            - e.g. 'Omni Shine <info@omnishine.co.uk>' (domain must be verified in Resend)

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  FROM_EMAIL: string;
}

type PagesFunctionLike = (ctx: {
  request: Request;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
}) => Promise<Response>;

const MAX = {
  name: 80,
  email: 120,
  postcode: 10,
  service: 80,
  message: 1500,
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]!));
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip ?? '' }),
    });
    const body = await res.json() as { success?: boolean };
    return body.success === true;
  } catch {
    return false;
  }
}

async function sendEmail(
  env: Env,
  to: string[],
  bcc: string[],
  subject: string,
  html: string,
  replyTo?: string,
): Promise<Response> {
  const payload: Record<string, unknown> = {
    from: env.FROM_EMAIL,
    to,
    subject,
    html,
  };
  if (bcc.length > 0) payload.bcc = bcc;
  if (replyTo) payload.reply_to = replyTo;
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

function validEmail(s: string): boolean {
  // Pragmatic RFC 5322 subset — good enough for form input validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function clamp(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

export const onRequestPost: PagesFunctionLike = async ({ request, env }) => {
  // Quick env sanity check
  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY || !env.FROM_EMAIL) {
    return json({ error: 'Contact form is not configured on this deployment.' }, 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Could not read the form.' }, 400);
  }

  // Honeypot — silently accept (so the bot thinks it worked) and drop.
  const honey = String(form.get('company_site') ?? '').trim();
  if (honey !== '') return json({ ok: true });

  // Consent
  if (form.get('consent') !== 'on') {
    return json({ error: 'Please tick the consent box to continue.' }, 400);
  }

  // Extract + normalise fields
  const name = clamp(String(form.get('name') ?? '').trim(), MAX.name);
  const email = clamp(String(form.get('email') ?? '').trim().toLowerCase(), MAX.email);
  const postcode = clamp(String(form.get('postcode') ?? '').trim().toUpperCase(), MAX.postcode);
  const service = clamp(String(form.get('service') ?? '').trim(), MAX.service);
  const message = clamp(String(form.get('message') ?? '').trim(), MAX.message);

  if (name.length < 2) return json({ error: 'Please add your name.' }, 400);
  if (!validEmail(email)) return json({ error: 'Please check your email address.' }, 400);
  if (postcode.length < 2) return json({ error: 'Please add a postcode.' }, 400);
  if (service.length < 2) return json({ error: 'Please choose a service.' }, 400);

  // Turnstile
  const token = String(form.get('cf-turnstile-response') ?? '');
  if (!token) return json({ error: 'Spam check failed. Please reload and try again.' }, 400);
  const ip = request.headers.get('CF-Connecting-IP');
  const ok = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);
  if (!ok) return json({ error: 'Spam check failed. Please reload and try again.' }, 400);

  const submittedAt = new Date().toISOString();
  const firstName = name.split(/\s+/)[0] || name;

  const teamHtml = `
<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#1e3a8a;color:#fff;padding:16px 24px">
      <h1 style="margin:0;font-size:18px">New Omni Shine quote request</h1>
    </div>
    <div style="padding:24px">
      <p style="margin:0 0 6px"><strong>Name:</strong> ${esc(name)}</p>
      <p style="margin:0 0 6px"><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
      <p style="margin:0 0 6px"><strong>Postcode:</strong> ${esc(postcode)}</p>
      <p style="margin:0 0 6px"><strong>Service:</strong> ${esc(service)}</p>
      <p style="margin:16px 0 6px"><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0">${esc(message || '(none)')}</p>
      <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0">
      <p style="font-size:12px;color:#64748b;margin:0">Submitted via omnishine.co.uk at ${esc(submittedAt)}. Reply directly to this email to respond to the customer.</p>
    </div>
  </div>
</body></html>`;

  const userHtml = `
<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#172554,#1e3a8a);color:#fff;padding:20px 24px">
      <h1 style="margin:0;font-size:20px">Thanks ${esc(firstName)} — we got your request.</h1>
    </div>
    <div style="padding:24px;line-height:1.6">
      <p style="margin:0 0 12px">We'll reply during our opening hours — usually within two working hours.</p>
      <p style="margin:0 0 6px"><strong>Opening hours:</strong><br>Mon–Fri 5pm–9pm · Sat–Sun 8am–9pm</p>
      <p style="margin:16px 0 6px"><strong>Your submission</strong></p>
      <table style="font-size:14px;border-collapse:collapse"><tbody>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Postcode</td><td style="padding:4px 0">${esc(postcode)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Service</td><td style="padding:4px 0">${esc(service)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">Message</td><td style="padding:4px 0;white-space:pre-wrap">${esc(message || '(none)')}</td></tr>
      </tbody></table>
      <p style="margin:18px 0 0">If anything needs correcting, just reply to this email.</p>
      <p style="margin:12px 0 0">— Sangita, Omni Shine Cleaning</p>
      <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0">
      <p style="font-size:12px;color:#64748b;margin:0">Omni Shine Cleaning · Oldham, Greater Manchester · <a href="https://omnishine.co.uk" style="color:#1d4ed8">omnishine.co.uk</a></p>
    </div>
  </div>
</body></html>`;

  // Fire both — team first (critical), then user confirmation (best-effort)
  const teamRes = await sendEmail(
    env,
    ['info@omnishine.co.uk'],
    ['sangitachavda11@gmail.com', email],
    `New quote request: ${service} — ${postcode}`,
    teamHtml,
    email,
  );

  if (!teamRes.ok) {
    const err = await teamRes.text().catch(() => '');
    // Log via console so it's visible in Cloudflare logs
    console.error('Resend team email failed', teamRes.status, err);
    return json({ error: 'Could not send your request. Please email info@omnishine.co.uk directly.' }, 502);
  }

  // User auto-reply — don't fail the whole request if this fails
  const userRes = await sendEmail(env, [email], [], `We've got your Omni Shine quote request`, userHtml);
  if (!userRes.ok) {
    const err = await userRes.text().catch(() => '');
    console.error('Resend user confirmation failed', userRes.status, err);
  }

  return json({ ok: true });
};

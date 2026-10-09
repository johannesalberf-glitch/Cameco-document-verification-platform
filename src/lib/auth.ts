import crypto from 'node:crypto';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cameco.ca';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CamecoAdmin2026!';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'cameco_session_secret_key_2026';
export const COOKIE_NAME = 'cameco_admin_token';

export function createToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + hmac;
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const [payloadB64, hmac] = token.split('.');
    if (!payloadB64 || !hmac) return null;
    const payload = Buffer.from(payloadB64, 'base64').toString('utf8');
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      const data = JSON.parse(payload);
      if (Date.now() < data.exp) {
        return { email: data.email };
      }
    }
  } catch {
    return null;
  }
  return null;
}


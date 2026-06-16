import { SignJWT, jwtVerify } from 'jose';

export type TokenPayload = {
  sub: string;
  role: string;
  full_name: string;
  counter_no: string;
};

const SESSION_COOKIE = 'session';
const TOKEN_TTL = '24h';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set in .env (min 32 characters)');
  }
  return new TextEncoder().encode(secret);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    full_name: payload.full_name,
    counter_no: payload.counter_no,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    if (!sub || typeof sub !== 'string') return null;

    return {
      sub,
      role: String(payload.role || 'cashier'),
      full_name: String(payload.full_name || sub),
      counter_no: String(payload.counter_no || 'Counter 1'),
    };
  } catch {
    return null;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lang = body.lang === 'en' ? 'en' : 'si';
  const response = NextResponse.json({ success: true, lang });
  response.cookies.set('lang', lang, getSessionCookieOptions());
  return response;
}

import { NextResponse } from 'next/server';
import { clearAllAuthCookies } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAllAuthCookies(response);
  return response;
}

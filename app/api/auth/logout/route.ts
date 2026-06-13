import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieNames = ['username', 'role', 'full_name', 'counter_no', 'lang'];
  for (const name of cookieNames) {
    response.cookies.set(name, '', { maxAge: 0 });
  }
  return response;
}

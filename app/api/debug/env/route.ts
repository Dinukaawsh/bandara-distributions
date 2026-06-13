import { NextResponse } from 'next/server';

export async function GET() {
  const mongoUrl = process.env.MONGO_URL;
  return NextResponse.json({
    mongoUrlLoaded: !!mongoUrl,
    mongoUrlLength: mongoUrl?.length || 0,
    mongoUrlFirstChar: mongoUrl?.[0] || null,
    mongoUrlLastChar: mongoUrl?.[mongoUrl.length - 1] || null,
    hasWhitespace: mongoUrl !== mongoUrl?.trim(),
    trimmedUrl: mongoUrl?.trim(),
    nodeEnv: process.env.NODE_ENV,
  });
}

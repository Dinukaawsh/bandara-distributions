import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Sinhala } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: '--font-noto-sinhala',
  subsets: ['sinhala'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Bandara Store - Billing System',
  description: 'Bandara Store billing and inventory management',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="si"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSinhala.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'AgriAssist - Farmer Digital Ecosystem',
    template: '%s | AgriAssist',
  },
  description: 'Enterprise agricultural SaaS platform connecting farmers, buyers, transport, and industries.',
  keywords: ['agriculture', 'farmers', 'digital platform', 'agritech', 'B2B marketplace'],
  authors: [{ name: 'AgriAssist Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

import { AiChatAssistant } from '@/components/shared/AiChatAssistant';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <AiChatAssistant />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

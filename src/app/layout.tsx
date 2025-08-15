import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/react';

import '../styles/global.css';

export const metadata: Metadata = {
  title: 'Mapa redistribuído',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className={`antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

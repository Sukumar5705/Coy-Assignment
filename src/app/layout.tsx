import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Header, TabBar } from '@/components/shell';

export const metadata: Metadata = { title: 'Coy' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="sheet">
          <Header />
          <TabBar />
          {children}
        </main>
      </body>
    </html>
  );
}

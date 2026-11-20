import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import '@/styles/globals.css';
import { Header, TabBar } from '@/components/shell';

const font = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

export const metadata: Metadata = { title: 'Coy' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
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

import type { ReactNode } from 'react';
import { SubToggle } from '@/components/shell';

export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SubToggle />
      {children}
    </>
  );
}

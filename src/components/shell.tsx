'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  return (
    <header className="top">
      <Link href="/" className="wordmark">coy</Link>
    </header>
  );
}

export function TabBar() {
  const p = usePathname();
  const tab = (href: string, label: string, on: boolean) => (
    <Link href={href} className={`tab ${on ? 'on' : ''}`} aria-current={on ? 'page' : undefined}>{label}</Link>
  );
  return (
    <nav className="tabs" aria-label="Main">
      {tab('/', 'Home', p === '/')}
      {tab('/discover', 'Discover', p.startsWith('/discover'))}
    </nav>
  );
}

export function SubToggle() {
  const p = usePathname();
  const tab = (href: string, label: string, on: boolean) => (
    <Link href={href} className={`tab ${on ? 'on' : ''}`}>{label}</Link>
  );
  return (
    <div className="tabs" role="tablist" aria-label="Discover">
      {tab('/discover', 'Deck', p === '/discover')}
      {tab('/discover/matches', 'Matches', p.startsWith('/discover/matches'))}
    </div>
  );
}

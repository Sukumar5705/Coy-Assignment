'use client';
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export function Button({
  variant = 'primary',
  block,
  className = '',
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline'; block?: boolean }) {
  return <button {...p} className={`btn ${variant === 'outline' ? 'outline' : ''} ${block ? 'block' : ''} ${className}`} />;
}

export function Badge({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <span className="badge" style={style}>{children}</span>;
}

const AVATAR_BG = ['#E8E0FF', '#FFE23D', '#FFE0D1', '#D6EAFF', '#FFE1EC'];
export function Avatar({ name, photo, i = 0 }: { name: string; photo?: string; i?: number }) {
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ background: photo ? `url(${photo}) center/cover` : AVATAR_BG[i % AVATAR_BG.length] }}
    >
      {photo ? '' : name.charAt(0).toUpperCase()}
    </span>
  );
}

export function Dialog({ open, onClose, labelId, children }: { open: boolean; onClose: () => void; labelId: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-labelledby={labelId} onClose={onClose}>
      {children}
    </dialog>
  );
}

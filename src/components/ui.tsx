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

export function Badge({
  children,
  style,
  className = '',
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return <span className={`badge ${className}`} style={style}>{children}</span>;
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

export function Dialog({
  open,
  onClose,
  labelId,
  describedById,
  className = '',
  syncKey,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelId: string;
  /** Optional id of an element describing the dialog's content, wired to aria-describedby. */
  describedById?: string;
  className?: string;
  /**
   * Changing this while `open` stays `true` forces the native <dialog> to re-sync.
   * Needed for queued content: e.g. advancing from match A to match B never flips
   * `open` (it's true the whole time), and if the user dismissed A with Escape,
   * the browser has already closed the native element even though React's `open`
   * prop never changed — without this, B would never visibly reopen it.
   */
  syncKey?: string | number | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Set right before we close the dialog ourselves (because `open` already went
  // false) so the native `close` event that follows doesn't re-invoke onClose
  // and double-advance whatever queue onClose is driving.
  const suppressNextClose = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      suppressNextClose.current = true;
      el.close();
    }
  }, [open, syncKey]);

  function handleNativeClose() {
    if (suppressNextClose.current) {
      suppressNextClose.current = false;
      return;
    }
    onClose();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelId}
      aria-describedby={describedById}
      className={className}
      onClose={handleNativeClose}
    >
      {children}
    </dialog>
  );
}
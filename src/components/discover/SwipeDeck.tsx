'use client';
import { useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { useSwipeDeck } from '@/lib/useSwipeDeck';
import { Badge, Button } from '../ui';
import { MatchCelebration } from './MatchCelebration';
import type { Profile, SwipeDirection } from '@/types/profile';

const THRESHOLD = 120;
const FLICK = 500;
const EXIT_X = 600;
const EXIT_MS = 0.2;
const LOCK_MS = 220; // blocks accidental double-taps from swiping two cards

function Body({ p, priority }: { p: Profile; priority?: boolean }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.photo}
        alt=""
        draggable={false}
        decoding="async"
        loading={priority ? 'eager' : undefined}
        fetchPriority={priority ? 'high' : undefined}
      />
      <div className="info">
        <h2>{p.name}{p.age ? `, ${p.age}` : ''}</h2>
        {p.location && <p>{p.location}</p>}
        {p.bio && <p style={{ color: 'var(--color-ink)' }}>{p.bio}</p>}
        <div className="tags">{p.interests?.map((t) => <Badge key={t}>{t}</Badge>)}</div>
      </div>
    </>
  );
}

/**
 * The draggable top card. Each card owns its own motion values and is keyed by profile id,
 * so a new card always starts at x=0 (no shared-state reset, no flash of the old position).
 * Exit animation runs via AnimatePresence AFTER the card has already been removed from the
 * queue, so it never waits for the network.
 */
function TopCard({
  p,
  exitDir,
  onSwipe,
}: {
  p: Profile;
  exitDir: SwipeDirection;
  onSwipe: (dir: SwipeDirection) => void;
}) {
  const present = useIsPresent();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const likeO = useTransform(x, [40, THRESHOLD], [0, 1]);
  const passO = useTransform(x, [-THRESHOLD, -40], [1, 0]);
  const tintO = useTransform(x, [0, 160], [0, 0.22]);
  const passTintO = useTransform(x, [-160, 0], [0.18, 0]);

  const springBack = () => {
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 });
  };

  function onDragEnd(_: unknown, i: PanInfo) {
    const v = i.velocity.x;
    if (i.offset.x > THRESHOLD || v > FLICK) onSwipe('LIKE');
    else if (i.offset.x < -THRESHOLD || v < -FLICK) onSwipe('PASS');
    else springBack();
  }

  return (
    <motion.div
      className="card pc"
      style={{ x, y, rotate, cursor: 'grab', zIndex: present ? 1 : 2, pointerEvents: present ? 'auto' : 'none' }}
      drag={present}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.94, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1, transition: { duration: 0.15 } }}
      variants={{
        exit: (dir: SwipeDirection) => ({
          x: dir === 'LIKE' ? EXIT_X : -EXIT_X,
          opacity: 0,
          transition: { duration: EXIT_MS, ease: 'easeIn' },
        }),
      }}
      exit="exit"
      custom={exitDir}
    >
      <Body p={p} priority />
      <motion.div className="tint" style={{ opacity: tintO, background: 'var(--color-accent)' }} />
      <motion.div className="tint" style={{ opacity: passTintO, background: 'var(--color-ink)' }} />
      <motion.span className="stamp like" style={{ opacity: likeO }}>LIKE</motion.span>
      <motion.span className="stamp pass" style={{ opacity: passO }}>PASS</motion.span>
    </motion.div>
  );
}

export function SwipeDeck({ initialFeed }: { initialFeed?: Profile[] }) {
  const d = useSwipeDeck(initialFeed);
  const [exitDir, setExitDir] = useState<SwipeDirection>('LIKE');
  const lockUntil = useRef(0);

  function handleSwipe(dir: SwipeDirection) {
    const now = performance.now();
    if (now < lockUntil.current) return;
    lockUntil.current = now + LOCK_MS;
    setExitDir(dir); // batched with the queue update inside d.swipe -> exit uses the right direction
    d.swipe(dir);
  }

  // IMPORTANT: loading/error/empty are just different *content* for the deck area.
  // They must never early-`return` before the match celebration below, or a confirmed
  // match queued while the deck is loading/erroring/empty would never be shown.
  let content: ReactNode;

  if (d.loading) {
    content = <div className="skel" aria-busy="true" aria-label="Loading" />;
  } else if (d.error) {
    content = (
      <div className="err" role="alert">
        <span>Couldn&apos;t load profiles.</span>
        <Button variant="outline" onClick={d.reload}>Try again</Button>
      </div>
    );
  } else {
    const [top, next] = d.queue;
    content = (
      <>
        <div className="deck">
          {next && <div className="card pc back" aria-hidden="true"><Body p={next} /></div>}
          <AnimatePresence custom={exitDir} initial={false}>
            {top && <TopCard key={top.id} p={top} exitDir={exitDir} onSwipe={handleSwipe} />}
          </AnimatePresence>
          {!top && (
            <div className="empty"><b>You&apos;re all caught up</b>No more profiles right now.</div>
          )}
        </div>
        {d.swipeError && <p className="err" role="alert">Couldn&apos;t save that swipe. Try again.</p>}
        <div className="controls">
          <Button variant="outline" disabled={!top} onClick={() => handleSwipe('PASS')} aria-label="Pass">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            Pass
          </Button>
          <Button disabled={!top} onClick={() => handleSwipe('LIKE')} aria-label="Like">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-9.4-9C1.3 8.3 3.3 4.8 6.9 4.8c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 3.6 0 5.6 3.5 4.3 6.7-1.9 4.6-9.4 9-9.4 9z" /></svg>
            Like
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {content}
      <MatchCelebration match={d.match} onContinue={d.clearMatch} />
    </>
  );
}
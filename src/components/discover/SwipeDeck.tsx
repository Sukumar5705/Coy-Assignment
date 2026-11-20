'use client';
import { useRef } from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useSwipeDeck } from '@/lib/useSwipeDeck';
import { Badge, Button, Dialog, Avatar } from '../ui';
import type { Profile, SwipeDirection } from '@/types/profile';

const THRESHOLD = 120;
const FLICK = 500;

function Body({ p }: { p: Profile }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.photo} alt="" draggable={false} />
      <div className="info">
        <h2>{p.name}{p.age ? `, ${p.age}` : ''}</h2>
        {p.location && <p>{p.location}</p>}
        {p.bio && <p style={{ color: 'var(--color-ink)' }}>{p.bio}</p>}
        <div className="tags">{p.interests?.map((t) => <Badge key={t}>{t}</Badge>)}</div>
      </div>
    </>
  );
}

export function SwipeDeck() {
  const d = useSwipeDeck();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const likeO = useTransform(x, [40, THRESHOLD], [0, 1]);
  const passO = useTransform(x, [-THRESHOLD, -40], [1, 0]);
  const tintO = useTransform(x, [0, 160], [0, 0.22]);
  const passTintO = useTransform(x, [-160, 0], [0.18, 0]);

  const flying = useRef(false);

  const springBack = () => {
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 });
  };

  async function fling(dir: SwipeDirection) {
    if (d.busy || flying.current) return;
    flying.current = true;
    try {
      await animate(x, dir === 'LIKE' ? 700 : -700, { duration: 0.25 });
      const ok = await d.swipe(dir);
      if (ok) { x.set(0); y.set(0); } else springBack();
    } finally {
      flying.current = false;
    }
  }

  function onDragEnd(_: unknown, i: PanInfo) {
    const v = i.velocity.x;
    if (i.offset.x > THRESHOLD || v > FLICK) fling('LIKE');
    else if (i.offset.x < -THRESHOLD || v < -FLICK) fling('PASS');
    else springBack();
  }

  if (d.loading) return <div className="skel" aria-busy="true" aria-label="Loading" />;
  if (d.error)
    return (
      <div className="err" role="alert">
        <span>Couldn&apos;t load profiles.</span>
        <Button variant="outline" onClick={d.reload}>Try again</Button>
      </div>
    );
  if (!d.queue.length)
    return (
      <div className="empty"><b>You&apos;re all caught up</b>No more profiles right now.</div>
    );

  const [top, next] = d.queue;
  return (
    <>
      <div className="deck">
        {next && <div className="card pc back" aria-hidden="true"><Body p={next} /></div>}
        <motion.div
          key={top.id}
          className="card pc"
          style={{ x, y, rotate, cursor: d.busy ? 'wait' : 'grab' }}
          drag={!d.busy && !flying.current}
          initial={{ scale: 0.94, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          dragElastic={0.9}
          onDragEnd={onDragEnd}
        >
          <Body p={top} />
          <motion.div className="tint" style={{ opacity: tintO, background: 'var(--color-accent)' }} />
          <motion.div className="tint" style={{ opacity: passTintO, background: 'var(--color-ink)' }} />
          <motion.span className="stamp like" style={{ opacity: likeO }}>LIKE</motion.span>
          <motion.span className="stamp pass" style={{ opacity: passO }}>PASS</motion.span>
        </motion.div>
      </div>
      {d.swipeError && <p className="err" role="alert">Something went wrong. Try again.</p>}
      <div className="controls">
        <Button variant="outline" disabled={d.busy} onClick={() => fling('PASS')} aria-label="Pass">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          Pass
        </Button>
        <Button disabled={d.busy} onClick={() => fling('LIKE')} aria-label="Like">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-9.4-9C1.3 8.3 3.3 4.8 6.9 4.8c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 3.6 0 5.6 3.5 4.3 6.7-1.9 4.6-9.4 9-9.4 9z" /></svg>
          Like
        </Button>
      </div>

      <Dialog open={!!d.match} onClose={d.clearMatch} labelId="match-title">
        {d.match && (
          <>
            <Badge style={{ background: 'var(--color-accent)', color: '#fff', transform: 'rotate(-3deg)' }}>MATCH</Badge>
            <h2 id="match-title">It&apos;s a Match!</h2>
            <Avatar name={d.match.name} photo={d.match.photo} />
            <p>You and <b>{d.match.name}</b> like each other.</p>
            <Button block onClick={d.clearMatch}>Continue</Button>
          </>
        )}
      </Dialog>
    </>
  );
}

'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, Badge, Button, Dialog } from '../ui';
import type { Profile } from '@/types/profile';

export interface MatchCelebrationProps {
    /** The currently confirmed, queued-to-show match, or null when none is pending. */
    match: Profile | null;
    /** Dismiss the current celebration and advance to the next queued match, if any. */
    onContinue: () => void;
}

type Particle = {
    id: number;
    size: number;
    /** Final horizontal burst distance in px (negative = left). */
    dx: number;
    /** Peak upward displacement during the burst, in px (negative = up). */
    burstY: number;
    /** Extra downward displacement added during the fall stage, in px. */
    fallExtra: number;
    /** Final rotation in degrees. */
    rotate: number;
    delay: number;
    duration: number;
    color: string;
};

/**
 * Fixed, hand-authored particle configuration — deliberately never Math.random()
 * at render time, so server and client markup always match (no hydration drift)
 * and the burst always reads as "designed" rather than noisy.
 */
const PARTICLES: Particle[] = [
    { id: 0, size: 34, dx: 0, burstY: -70, fallExtra: 160, rotate: -8, delay: 0, duration: 1.5, color: 'var(--color-accent)' },
    { id: 1, size: 18, dx: -70, burstY: -40, fallExtra: 140, rotate: -24, delay: 0.05, duration: 1.3, color: '#E8E0FF' },
    { id: 2, size: 18, dx: 68, burstY: -46, fallExtra: 150, rotate: 20, delay: 0.04, duration: 1.4, color: '#FFE0D1' },
    { id: 3, size: 14, dx: -110, burstY: -10, fallExtra: 130, rotate: -32, delay: 0.1, duration: 1.2, color: '#FFE23D' },
    { id: 4, size: 14, dx: 104, burstY: -14, fallExtra: 135, rotate: 28, delay: 0.09, duration: 1.25, color: '#FFE1EC' },
    { id: 5, size: 22, dx: -38, burstY: -85, fallExtra: 170, rotate: -14, delay: 0.12, duration: 1.6, color: 'var(--color-accent)' },
    { id: 6, size: 22, dx: 40, burstY: -82, fallExtra: 165, rotate: 16, delay: 0.14, duration: 1.55, color: '#E8E0FF' },
    { id: 7, size: 16, dx: -140, burstY: 10, fallExtra: 120, rotate: -40, delay: 0.18, duration: 1.3, color: '#FFE0D1' },
    { id: 8, size: 16, dx: 136, burstY: 6, fallExtra: 125, rotate: 36, delay: 0.2, duration: 1.35, color: '#FFE23D' },
    { id: 9, size: 26, dx: -16, burstY: -100, fallExtra: 180, rotate: -6, delay: 0.06, duration: 1.7, color: '#FFE1EC' },
    { id: 10, size: 26, dx: 18, burstY: -96, fallExtra: 175, rotate: 8, delay: 0.08, duration: 1.65, color: 'var(--color-accent)' },
    { id: 11, size: 14, dx: -170, burstY: 30, fallExtra: 110, rotate: -48, delay: 0.24, duration: 1.2, color: '#E8E0FF' },
    { id: 12, size: 14, dx: 166, burstY: 26, fallExtra: 115, rotate: 44, delay: 0.26, duration: 1.25, color: '#FFE0D1' },
    { id: 13, size: 20, dx: -56, burstY: -58, fallExtra: 155, rotate: -18, delay: 0.16, duration: 1.45, color: '#FFE23D' },
];

/** Same heart silhouette already used on the Like button, for visual consistency. */
function HeartIcon({ size, color }: { size: number; color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
            <path d="M12 20.5s-7.5-4.4-9.4-9C1.3 8.3 3.3 4.8 6.9 4.8c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 3.6 0 5.6 3.5 4.3 6.7-1.9 4.6-9.4 9-9.4 9z" />
        </svg>
    );
}

function MatchConfetti({ reduced }: { reduced: boolean }) {
    return (
        <div className="match-celebration__confetti" aria-hidden="true">
            {PARTICLES.map((pt) => (
                <motion.span
                    key={pt.id}
                    className="match-heart"
                    style={{
                        left: '50%',
                        top: '38%',
                        marginLeft: -pt.size / 2,
                        marginTop: -pt.size / 2,
                    }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
                    animate={
                        reduced
                            ? { opacity: [0, 1, 0] }
                            : {
                                opacity: [0, 1, 0],
                                x: [0, pt.dx * 0.6, pt.dx],
                                y: [0, pt.burstY, pt.burstY + pt.fallExtra],
                                rotate: [0, pt.rotate * 0.6, pt.rotate],
                                scale: [0.4, 1, 0.9],
                            }
                    }
                    transition={
                        reduced
                            ? { duration: 0.9, delay: pt.delay * 0.4, ease: 'easeOut' }
                            : { duration: pt.duration, delay: pt.delay, ease: 'easeOut', times: [0, 0.35, 1] }
                    }
                >
                    <HeartIcon size={pt.size} color={pt.color} />
                </motion.span>
            ))}
        </div>
    );
}

/**
 * Celebration shown when the backend confirms a mutual match (`SwipeResponse.match === true`).
 * Purely a presentation of an already-confirmed server result — it never decides on its own
 * whether a match happened.
 *
 * Keying the inner content on `match.id` means React remounts it for every new match, which
 * is what gives each queued match its own fresh confetti run "for free" instead of needing
 * manual animation-reset logic.
 */
export function MatchCelebration({ match, onContinue }: MatchCelebrationProps) {
    const reduced = useReducedMotion();

    return (
        <Dialog
            open={!!match}
            onClose={onContinue}
            labelId="match-title"
            describedById="match-desc"
            className="match-dialog"
            syncKey={match?.id ?? null}
        >
            {match && (
                <motion.div
                    key={match.id}
                    className="match-celebration"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 26 }}
                >
                    <MatchConfetti reduced={!!reduced} />

                    <div className="match-celebration__content">
                        <Badge
                            className="match-badge"
                            style={{ background: 'var(--color-accent)', color: '#fff', transform: 'rotate(-3deg)' }}
                        >
                            MATCH
                        </Badge>

                        <span className="match-profile">
                            <Avatar name={match.name} photo={match.photo} />
                        </span>

                        <h2 id="match-title" className="match-title">It&apos;s a Match!</h2>
                        <p id="match-desc" className="match-description">
                            You and <b>{match.name}</b> like each other.
                        </p>

                        <Button block className="match-continue" onClick={onContinue}>
                            Continue Discovering
                        </Button>
                    </div>
                </motion.div>
            )}
        </Dialog>
    );
}
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Logo } from "@slogodle/logos";
import type { GameStatus, Guess } from "../lib/game-logic";
import { LogoCard } from "./LogoCard";
import shared from "../styles/shared.module.css";
import styles from "./LogoCardPile.module.css";

interface LogoCardPileProps {
  logos: Logo[];
  pileIndex: number;
  status: GameStatus;
  guesses: Guess[];
  maxTries: number;
  /** Called with a card's index when a non-active (background) card is clicked. */
  onSelect: (index: number) => void;
  /** Extra content (guess form, reveal panel, ...) rendered inside the active card. */
  children?: ReactNode;
}

// Rank 0 sits flat on top (active); higher ranks peek out rotated behind it.
// A finished card doesn't vanish — it wraps around to the back-most rank and
// stays there, visible, until it cycles back to the front.
function rankOf(index: number, pileIndex: number, total: number): number {
  return ((index - pileIndex) % total + total) % total;
}

export function LogoCardPile({
  logos,
  pileIndex,
  status,
  guesses,
  maxTries,
  onSelect,
  children,
}: LogoCardPileProps) {
  const activeCardRef = useRef<HTMLDivElement>(null);
  // The active card's content (guess form vs. reveal panel) varies in height;
  // every pile slot is always position:absolute (never toggled to/from
  // in-flow) so the transform/opacity change on advance always animates, and
  // the other cards mirror the active card's measured height via JS so they
  // stack flush instead of poking out unevenly.
  const [cardHeight, setCardHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = activeCardRef.current;
    if (!el) return;
    const measure = () => setCardHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pileIndex, status]);

  // Track which card just left the active slot so it can play the
  // "slide left, duck behind, settle at the back" exit animation instead of
  // snapping straight to its new resting position.
  const [lastPileIndex, setLastPileIndex] = useState(pileIndex);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  if (pileIndex !== lastPileIndex) {
    setExitingIndex(lastPileIndex);
    setLastPileIndex(pileIndex);
  }

  return (
    <div
      className={styles.pile}
      style={cardHeight ? { height: cardHeight } : undefined}
    >
      {logos.map((logo, index) => {
        const isActive = index === pileIndex;
        const isExiting = index === exitingIndex;
        const rank = rankOf(index, pileIndex, logos.length);
        return (
          <div
            key={logo.name}
            className={styles.pileSlot}
            data-depth={isExiting ? "exiting" : rank}
            onAnimationEnd={
              isExiting ? () => setExitingIndex(null) : undefined
            }
          >
            <div
              ref={isActive ? activeCardRef : undefined}
              className={`${shared.card} ${isActive ? "" : styles.bgCard}`}
              style={
                !isActive && cardHeight ? { height: cardHeight } : undefined
              }
              onClick={!isActive ? () => onSelect(index) : undefined}
              role={!isActive ? "button" : undefined}
              tabIndex={!isActive ? 0 : undefined}
              onKeyDown={
                !isActive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(index);
                      }
                    }
                  : undefined
              }
            >
              <LogoCard
                dayIndex={index}
                status={isActive ? status : "playing"}
                logo={logo}
                guesses={isActive ? guesses : []}
                maxTries={maxTries}
              />
              {isActive && children}
            </div>
          </div>
        );
      })}
    </div>
  );
}

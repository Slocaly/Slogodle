import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Logo } from "@slogodle/logos";
import { GuessHints } from "./GuessHints";
import { loadJSON, saveJSON } from "../lib/storage";
import {
  SPEED_LETTER_RE,
  SPEED_MASK_AFTER_MISSES,
  SPEED_MAX_RUN_MS,
  SPEED_MISS_PENALTY_MS,
  formatTime,
  isCorrectSpeedGuess,
  shuffle,
  speedScore,
  type SpeedResult,
} from "../lib/speed";
import { m } from "../paraglide/messages.js";
import { GithubIcon } from "./icons/GithubIcon";
import { ShareIcon } from "./icons/ShareIcon";
import styles from "./SpeedGame.module.css";

/** Local cache of a run, so a reload resumes where the player was. */
interface SavedRun {
  startedAt: number | null;
  /** Every guess typed per logo, in order (the last one is the correct one once solved). */
  guessLog: string[][];
  solved: boolean[];
  finishedAt: number | null;
}

function loadRun(key: string, size: number): SavedRun | null {
  const run = loadJSON<SavedRun | null>(key, null);
  if (
    !run ||
    (run.startedAt !== null && typeof run.startedAt !== "number") ||
    run.solved?.length !== size ||
    run.guessLog?.length !== size
  ) {
    return null;
  }
  return run;
}

/**
 * Server-timed mode (daily series). Timestamps are on the server's clock;
 * `clockOffset` (server minus local) converts "now" into it.
 */
export interface SpeedRemote {
  startedAt: number | null;
  result: SpeedResult | null;
  /** The run was left unfinished past the time cap (locked, not ranked). */
  expired: boolean;
  clockOffset: number;
  onStart: () => Promise<{ startedAt: number; clockOffset: number }>;
  onFinish: (guessLog: string[][]) => Promise<SpeedResult>;
}

interface SpeedGameProps {
  logos: Logo[];
  playBubble: () => void;
  /** Saves the run under this localStorage key so a reload resumes it. */
  persistKey?: string;
  /** Daily mode: the server owns the clock and the result; no replay. */
  remote?: SpeedRemote;
  /** Rendered as the third column of the layout (below the stage on phones). */
  rightPanel?: ReactNode;
  /** Shows a "Play again" button once finished (practice mode). */
  onRestart?: () => void;
  /** Daily series number (0-based); enables the share button on the result. */
  dayIndex?: number;
  /** Heading of the series list; defaults to "Today's series". */
  title?: string;
  /** Replay of a past series: the result is kept but never ranked. */
  replay?: boolean;
}

export function SpeedGame({
  logos,
  playBubble,
  persistKey,
  remote,
  rightPanel,
  onRestart,
  dayIndex,
  title = "Today's series",
  replay = false,
}: SpeedGameProps) {
  // Per logo: the order in which its letters get revealed (random, fixed for the round).
  const revealOrders = useMemo(
    () =>
      logos.map((l) =>
        shuffle(
          [...l.name].flatMap((ch, i) => (SPEED_LETTER_RE.test(ch) ? [i] : [])),
        ),
      ),
    [logos],
  );

  const [initialRun] = useState<SavedRun>(() => {
    const cached = persistKey ? loadRun(persistKey, logos.length) : null;
    // A cached run only applies to the server run it was started under.
    if (cached && (!remote || cached.startedAt === remote.startedAt)) return cached;
    return {
      startedAt: remote?.startedAt ?? null,
      guessLog: logos.map(() => []),
      solved: logos.map(() => false),
      finishedAt: null,
    };
  });
  const [current, setCurrent] = useState(() =>
    Math.max(0, initialRun.solved.indexOf(false)),
  );
  const [guessLog, setGuessLog] = useState(initialRun.guessLog);
  const [solved, setSolved] = useState(initialRun.solved);
  const [startedAt, setStartedAt] = useState(initialRun.startedAt);
  const [localFinishedAt, setLocalFinishedAt] = useState(initialRun.finishedAt);
  const [clockOffset, setClockOffset] = useState(remote?.clockOffset ?? 0);
  const [serverResult, setServerResult] = useState<SpeedResult | null>(
    remote?.result ?? null,
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [starting, setStarting] = useState(false);
  // Set when the server rejects a late submit as expired.
  const [submitExpired, setSubmitExpired] = useState(false);
  const [now, setNow] = useState(() => Date.now() + clockOffset);
  const [shaking, setShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  // Finished runs: the logo opened from the list (null shows the result panel).
  const [viewing, setViewing] = useState<number | null>(null);

  const started = startedAt !== null;
  const allSolved = solved.every(Boolean);
  const finished = serverResult !== null || (!remote && localFinishedAt !== null);
  const wrongCounts = guessLog.map((list, i) => list.length - (solved[i] ? 1 : 0));
  // Only server-timed runs can time out; the admin practice mode stays local.
  const timedOut =
    remote !== undefined &&
    !finished &&
    started &&
    (remote.expired ||
      submitExpired ||
      (!allSolved && now - startedAt > SPEED_MAX_RUN_MS));

  useEffect(() => {
    if (!persistKey) return;
    saveJSON<SavedRun>(persistKey, {
      startedAt,
      guessLog,
      solved,
      finishedAt: localFinishedAt,
    });
  }, [persistKey, startedAt, guessLog, solved, localFinishedAt]);

  // Load and decode every logo up front so switching between them never
  // shows a blank frame. Holding the Image objects keeps them in memory.
  useEffect(() => {
    const images = logos.map((l) => {
      const img = new Image();
      img.src = l.icon;
      img.decode().catch(() => {});
      return img;
    });
    return () => {
      images.length = 0;
    };
  }, [logos]);

  useEffect(() => {
    if (!started || finished || allSolved || timedOut) return;
    const id = setInterval(() => setNow(Date.now() + clockOffset), 100);
    return () => clearInterval(id);
  }, [started, finished, allSolved, timedOut, clockOffset]);

  // Series complete: freeze the clock locally, and in daily mode send the
  // guesses so the server can validate them and stamp the result.
  useEffect(() => {
    if (!started || !allSolved || finished || timedOut) return;
    if (!remote) {
      setLocalFinishedAt(Date.now());
      return;
    }
    if (saveState === "saving") return;
    void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, allSolved, finished, timedOut]);

  async function submit() {
    if (!remote) return;
    setSaveState("saving");
    try {
      setServerResult(await remote.onFinish(guessLog));
      setSaveState("idle");
    } catch {
      // A submit that lands after the cap is rejected for good: don't offer a retry.
      if (startedAt !== null && Date.now() + clockOffset - startedAt > SPEED_MAX_RUN_MS) {
        setSubmitExpired(true);
      }
      setSaveState("error");
    }
  }

  const localResult = useMemo<SpeedResult | null>(() => {
    if (remote || localFinishedAt === null || startedAt === null) return null;
    const misses = guessLog.reduce((sum, list) => sum + list.length - 1, 0);
    return speedScore(localFinishedAt - startedAt, misses);
  }, [remote, localFinishedAt, startedAt, guessLog]);
  const result = serverResult ?? localResult;

  const elapsed = result
    ? result.durationMs
    : startedAt === null
      ? 0
      : Math.max(0, now - startedAt);
  const logo = logos[current];

  async function handleStart() {
    if (starting) return;
    if (!remote) {
      const t = Date.now();
      setNow(t);
      setStartedAt(t);
      return;
    }
    setStarting(true);
    try {
      const run = await remote.onStart();
      setClockOffset(run.clockOffset);
      setNow(Date.now() + run.clockOffset);
      setStartedAt(run.startedAt);
    } finally {
      setStarting(false);
    }
  }

  async function handleShare() {
    if (!result || dayIndex === undefined) return;
    playBubble();
    const wrong = result.wrongCount;
    const text =
      `⚡ ${m.site_title()} Speed #${dayIndex + 1}\n` +
      `⏱ ${formatTime(result.scoreMs)} (${formatTime(result.durationMs)} + ${wrong} wrong)\n\n` +
      `Beat my time 👇\n` +
      `${window.location.origin}/speed`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; nothing to fall back to
    }
  }

  function goToNextUnsolved(from: number, nextSolved: boolean[]) {
    for (let step = 1; step <= logos.length; step++) {
      const i = (from + step) % logos.length;
      if (!nextSolved[i]) {
        setCurrent(i);
        return;
      }
    }
  }

  function handleGuess(text: string) {
    if (!started || finished || solved[current]) return;
    setGuessLog((log) => log.map((list, i) => (i === current ? [...list, text] : list)));
    if (isCorrectSpeedGuess(text, logo.name)) {
      playBubble();
      const nextSolved = solved.map((s, i) => s || i === current);
      setSolved(nextSolved);
      goToNextUnsolved(current, nextSolved);
    } else {
      setShaking(true);
    }
  }

  function handleSkip() {
    goToNextUnsolved(current, solved);
  }

  // The guess input unmounts on finish; move focus to the result heading so keyboard and
  // screen-reader users land on the score (also when returning from a logo's detail panel).
  const showingResult = finished && !!result && viewing === null;
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (showingResult) resultHeadingRef.current?.focus();
  }, [showingResult]);

  const solvedCount = solved.filter(Boolean).length;
  const showLogo = started && !allSolved && !finished && !timedOut;
  // A timed-out run can't be retried, so its answers are shown for learning.
  const showAnswers = finished || timedOut;
  const penaltySeconds = SPEED_MISS_PENALTY_MS / 1000;

  return (
    <div className={styles.layout} data-ladder={rightPanel ? "true" : "false"}>
      <aside className={styles.aside} aria-label="Series">
        <h2 className={styles.asideTitle}>{title}</h2>
        <ol className={styles.list}>
          {logos.map((l, i) => (
            <li key={l.name}>
              <button
                type="button"
                className={styles.item}
                data-active={showAnswers ? viewing === i : showLogo && i === current}
                data-solved={solved[i] || showAnswers}
                onClick={() => {
                  setCurrent(i);
                  if (showAnswers) setViewing(i);
                }}
                disabled={!showLogo && !showAnswers}
              >
                <span className={styles.itemNumber}>{i + 1}</span>
                <span className={styles.itemLabel}>
                  {solved[i] || showAnswers ? l.name : "???"}
                </span>
                {(solved[i] || showAnswers) && <span className={styles.check} aria-hidden />}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <main className={styles.main}>
        {!started && !finished ? (
          <div className={styles.panel}>
            <h1 className={styles.panelTitle}>Speed round</h1>
            <p className={styles.panelLead}>
              Name {logos.length} logos against the clock.
            </p>
            <ul className={styles.rules}>
              {[
                "Type the name. Capitals, dots and dashes don't matter.",
                `Every wrong guess adds ${penaltySeconds} ${penaltySeconds === 1 ? "second" : "seconds"} to your score and unlocks a hint.`,
                "Stuck? Skip, or jump to any logo from the list.",
              ].map((rule, i) => (
                <li key={rule} style={{ "--i": i } as React.CSSProperties}>
                  {rule}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.primary}
              onClick={handleStart}
              disabled={starting}
            >
              Start the clock
            </button>
          </div>
        ) : showAnswers && viewing !== null ? (
          <div className={styles.panel}>
            <div className={styles.logoTile}>
              <img
                key={logos[viewing].name}
                className={styles.logo}
                src={logos[viewing].icon}
                alt={logos[viewing].name}
              />
            </div>
            <div className={styles.solvedInfo}>
              <h2 className={styles.solvedName}>{logos[viewing].name}</h2>
              <p className={styles.solvedDescription}>{logos[viewing].description}</p>
              <p className={styles.solvedFact}>{logos[viewing].funFact}</p>
              <GithubLink href={logos[viewing].gitLink} />
            </div>
            <button type="button" className={styles.skip} onClick={() => setViewing(null)}>
              {m.speed_back_to_results()}
            </button>
          </div>
        ) : finished && result ? (
          <div className={styles.panel}>
            <div className={styles.scoreBlock}>
              <h1
                ref={resultHeadingRef}
                tabIndex={-1}
                className={styles.scoreLabel}
                aria-describedby="speed-score"
              >
                {replay ? m.speed_score_label_replay() : m.speed_score_label()}
              </h1>
              <div id="speed-score" className={styles.doneTime}>
                {formatTime(result.scoreMs)}
              </div>
            </div>
            <ul className={styles.recap}>
              {logos.map((l, i) => (
                <li
                  key={l.name}
                  className={styles.recapItem}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className={styles.recapButton}
                    onClick={() => setViewing(i)}
                    aria-label={m.speed_recap_details({ name: l.name })}
                  >
                    <span className={styles.recapTile}>
                      <img src={l.icon} alt="" className={styles.recapLogo} />
                    </span>
                    <span className={styles.recapName}>{l.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.recapHint}>{m.speed_recap_hint()}</p>
            <p className={styles.breakdown}>
              <span>{m.speed_solve_time({ time: formatTime(result.durationMs) })}</span>
              {result.wrongCount === 0 ? (
                <strong className={styles.flawless}>{m.speed_flawless()}</strong>
              ) : (
                <>
                  <span aria-hidden="true">+</span>
                  <span>
                    {result.wrongCount === 1
                      ? m.speed_wrong_one({ count: result.wrongCount })
                      : m.speed_wrong_other({ count: result.wrongCount })}{" "}
                    <strong className={styles.penalty}>
                      (+{formatTime(result.wrongCount * SPEED_MISS_PENALTY_MS)})
                    </strong>
                  </span>
                </>
              )}
            </p>
            {dayIndex !== undefined && (
              <button type="button" className={styles.shareBtn} onClick={handleShare}>
                <ShareIcon />
                <span role="status" aria-live="polite">
                  {copied ? m.share_copied() : m.share_button()}
                </span>
              </button>
            )}
            {onRestart ? (
              <button type="button" className={styles.primary} onClick={onRestart}>
                {m.speed_play_again()}
              </button>
            ) : replay ? (
              <p className={styles.note}>{m.speed_replay_unranked()}</p>
            ) : (
              <p className={styles.note}>{m.speed_come_back()}</p>
            )}
          </div>
        ) : timedOut ? (
          <div className={styles.panel}>
            <div className={styles.scoreBlock}>
              <h1 className={styles.scoreLabel} aria-describedby="speed-timeout-count">
                {m.speed_timeout_title()}
              </h1>
              <div id="speed-timeout-count" className={styles.doneTime}>
                {solvedCount}
                <span className={styles.doneTotal}>/{logos.length}</span>
              </div>
            </div>
            <p className={styles.panelLead}>
              {m.speed_timeout_lead({
                minutes: Math.max(1, Math.round(SPEED_MAX_RUN_MS / 60000)),
              })}
            </p>
            <ul className={styles.recap}>
              {logos.map((l, i) => (
                <li
                  key={l.name}
                  className={styles.recapItem}
                  data-found={solved[i]}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className={styles.recapButton}
                    onClick={() => setViewing(i)}
                    aria-label={m.speed_recap_details({ name: l.name })}
                  >
                    <span className={styles.recapTile}>
                      <img src={l.icon} alt="" className={styles.recapLogo} />
                    </span>
                    <span className={styles.recapName}>{l.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.recapHint}>{m.speed_recap_hint()}</p>
            <p className={styles.note}>
              {replay ? m.speed_replay_unranked() : m.speed_timeout_unranked()}
              {" "}
              {m.speed_come_back()}
            </p>
          </div>
        ) : allSolved ? (
          <div className={styles.panel}>
            <h1 className={styles.panelTitle}>
              {saveState === "error" ? "Couldn't save your result" : "Saving your time"}
            </h1>
            {saveState === "error" && (
              <button type="button" className={styles.primary} onClick={submit}>
                Try again
              </button>
            )}
          </div>
        ) : (
          <div
            className={styles.stage}
            data-shake={shaking}
            onAnimationEnd={() => setShaking(false)}
          >
            <div className={styles.stageHead}>
              <div
                className={styles.pips}
                role="img"
                aria-label={`${solvedCount} of ${logos.length} solved`}
              >
                {logos.map((l, i) => (
                  <span
                    key={l.name}
                    className={styles.pip}
                    data-solved={solved[i]}
                    data-active={i === current && !solved[i]}
                  />
                ))}
              </div>
              <div className={styles.timer} aria-live="off">
                {formatTime(elapsed)}
              </div>
            </div>
            <div className={styles.logoTile}>
              <img
                key={logo.name}
                className={styles.logo}
                src={logo.icon}
                alt="Logo to guess"
              />
            </div>
            {solved[current] ? (
              <div className={styles.solvedInfo}>
                <h2 className={styles.solvedName}>{logo.name}</h2>
                <p className={styles.solvedDescription}>{logo.description}</p>
                <p className={styles.solvedFact}>{logo.funFact}</p>
                <GithubLink href={logo.gitLink} />
              </div>
            ) : (
              <>
                <NameMask
                  name={logo.name}
                  visible={wrongCounts[current] >= SPEED_MASK_AFTER_MISSES}
                  revealed={revealOrders[current].slice(
                    0,
                    Math.max(0, wrongCounts[current] - SPEED_MASK_AFTER_MISSES),
                  )}
                />
                <PlainGuessForm
                  key={current}
                  logo={logo}
                  attemptCount={wrongCounts[current]}
                  onSubmit={handleGuess}
                />
                <button type="button" className={styles.skip} onClick={handleSkip}>
                  Skip this one
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {rightPanel && <div className={styles.side}>{rightPanel}</div>}
    </div>
  );
}

function GithubLink({ href }: { href: string }) {
  return (
    <a className={styles.githubLink} href={href} target="_blank" rel="noreferrer noopener">
      <GithubIcon />
      <span>{m.reveal_github_cta()}</span>
    </a>
  );
}

interface PlainGuessFormProps {
  logo: Logo;
  attemptCount: number;
  onSubmit: (text: string) => void;
}

/** Free-text guess: no suggestions, matching is case-insensitive (see `isCorrectGuess`). */
function PlainGuessForm({ logo, attemptCount, onSubmit }: PlainGuessFormProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    setValue("");
    onSubmit(text);
  }

  return (
    <form className={styles.guessForm} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.guessInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Name this logo"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-form-type="other"
        aria-label="Logo name"
      />
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={!value.trim()}
      >
        Submit
      </button>
      <GuessHints logo={logo} attemptCount={attemptCount} />
    </form>
  );
}

interface NameMaskProps {
  name: string;
  visible: boolean;
  revealed: number[];
}

/**
 * Letter-count hint. The row is always rendered (hidden until it applies) so
 * showing it never shifts the layout.
 */
function NameMask({ name, visible, revealed }: NameMaskProps) {
  const shown = new Set(revealed);
  return (
    <div
      className={styles.mask}
      data-visible={visible}
      aria-hidden={!visible}
    >
      {[...name].map((ch, i) => {
        if (!SPEED_LETTER_RE.test(ch)) {
          return (
            <span key={i} className={styles.maskGap}>
              {ch === " " ? "\u00A0" : ch}
            </span>
          );
        }
        return (
          <span key={i} className={styles.maskLetter}>
            {shown.has(i) ? ch.toUpperCase() : ""}
          </span>
        );
      })}
    </div>
  );
}

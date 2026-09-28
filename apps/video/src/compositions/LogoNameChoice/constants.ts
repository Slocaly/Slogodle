export const REVEAL_SCENE_FRAMES = 180; // hold after reveal before the Outro starts — long enough to read the fun fact
export const OUTRO_TRANSITION_FRAMES = 20; // content cross-fades out into the Outro scene

export const SETTLE_FRAMES = 15; // 0.5s — everything is visible at frame 0, this is just a settle-in spring window
export const REVEAL_TRANSITION_FRAMES = 15; // 0.5s — wrong-option shake/flash, correct-option ring+pop, countdown fade-out

export const COUNTDOWN_FONT_SIZE = 128;
export const COUNTDOWN_BADGE_SIZE = 200; // fixed width = height so the badge is always a perfect circle, regardless of digit width
export const COUNTDOWN_BAR_WIDTH_RATIO = 0.58; // keeps the bar's right edge clear of the right-15% safe-zone line
export const COUNTDOWN_BOTTOM_OFFSET = 80;

export const TITLE_TOP = 90;
export const LOGO_SIZE = 420;
export const LOGO_CENTER_Y = 560;

export const OPTION_WIDTH = 720; // centred, so the right edge (900px) stays clear of the right-15% safe zone (918px)
export const OPTION_HEIGHT = 112;
export const OPTION_GAP = 28;
export const OPTIONS_TOP = 900;
export const OPTION_BADGE_SIZE = 72;
export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];
export const OPTION_STAGGER_FRAMES = 3;
export const LOSER_FADE_FRAMES = 20;

export const REVEAL_LIFT = 40; // px the logo moves up after the reveal (into the space the title frees), making room for the answer + info
// The correct option keeps its green highlight in place for a beat, then slides up under the logo and stays as the answer.
export const WINNER_HOLD_FRAMES = 15;
export const WINNER_TOP = 840; // leaves ~90px of air under the lifted (and popped) logo

export const WINNER_TO_DESCRIPTION_GAP = 80;
export const DESCRIPTION_TO_FUN_FACT_GAP = 64;

export const DESCRIPTION_DELAY_FRAMES = WINNER_HOLD_FRAMES + 20;
export const DESCRIPTION_FADE_FRAMES = 15;
export const FUN_FACT_DELAY_FRAMES = WINNER_HOLD_FRAMES + 30;
export const FUN_FACT_FADE_FRAMES = 15;

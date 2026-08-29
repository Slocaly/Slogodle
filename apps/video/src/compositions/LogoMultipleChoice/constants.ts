export const SETTLE_FRAMES = 15; // 0.5s — everything is visible at frame 0, this is just a settle-in spring window
export const COUNTDOWN_FRAMES = 120; // 4.0s countdown, runs during [0, REVEAL_AT_FRAME)
export const REVEAL_AT_FRAME = SETTLE_FRAMES + COUNTDOWN_FRAMES; // 135
export const REVEAL_TRANSITION_FRAMES = 15; // 0.5s — wrong-card shake/flash, correct-card ring+pop
export const HOLD_START_FRAME = REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES; // 150
export const HOLD_FRAMES = 135; // 4.5s answer hold
export const OUTRO_START_FRAME = HOLD_START_FRAME + HOLD_FRAMES; // 285
export const OUTRO_BEAT_FRAMES = 90; // 3.0s trimmed Outro scene
export const TOTAL_FRAMES = OUTRO_START_FRAME + OUTRO_BEAT_FRAMES; // 375 (12.5s @ 30fps)
export const OUTRO_TRANSITION_FRAMES = 20; // content (question + cards) cross-fades out into the Outro scene

export const COUNTDOWN_FONT_SIZE = 128;
export const COUNTDOWN_BADGE_SIZE = 200; // fixed width = height so the badge is always a perfect circle, regardless of digit width
export const COUNTDOWN_BAR_WIDTH_RATIO = 0.58; // keeps the bar's right edge clear of the right-15% safe-zone line
export const COUNTDOWN_BOTTOM_OFFSET = 80;

export const WINNER_Z_INDEX = 10000;
export const CARD_SIZE = 400;
export const CARD_GAP = 96;
export const GRID_COLUMNS = 2;
export const LOSER_FADE_FRAMES = 20;
export const WINNER_MOVE_FRAMES = 25;
export const WINNER_SCALE = 1.5;
export const WINNER_CENTER_Y_OFFSET = -350;
export const DESCRIPTION_DELAY_FRAMES = 20;
export const DESCRIPTION_FADE_FRAMES = 15;
export const NAME_DELAY_FRAMES = 35;
export const NAME_FADE_FRAMES = 15;

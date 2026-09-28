export const REVEAL_SCENE_FRAMES = 180; // hold after reveal before the Outro starts — long enough to read the fun fact
export const OUTRO_TRANSITION_FRAMES = 20; // content cross-fades out into the Outro scene

export const SETTLE_FRAMES = 15; // 0.5s — everything is visible at frame 0, this is just a settle-in spring window
export const REVEAL_TRANSITION_FRAMES = 15; // 0.5s — countdown fade-out, logo pop, title shrink

export const COUNTDOWN_FONT_SIZE = 128;
export const COUNTDOWN_BADGE_SIZE = 200; // fixed width = height so the badge is always a perfect circle, regardless of digit width
export const COUNTDOWN_BAR_WIDTH_RATIO = 0.58; // keeps the bar's right edge clear of the right-15% safe-zone line
export const COUNTDOWN_BOTTOM_OFFSET = 80;

export const REVEAL_LIFT = 380; // px the logo moves up after the reveal, making room for the description / fun fact / name stack
export const REVEAL_INFO_BOTTOM_OFFSET = 420; // bottom of the name, clear of the bottom 20% safe zone
export const REVEAL_INFO_GAP = 24;

export const NAME_DELAY_FRAMES = 20;
export const NAME_FADE_FRAMES = 15;
export const DESCRIPTION_DELAY_FRAMES = 35;
export const DESCRIPTION_FADE_FRAMES = 15;
export const FUN_FACT_DELAY_FRAMES = 45;
export const FUN_FACT_FADE_FRAMES = 15;

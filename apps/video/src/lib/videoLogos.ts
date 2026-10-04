import { LOGOS, type Logo } from "@slogodle/logos";

// Slogodle itself is never a game answer, so it lives here instead of in @slogodle/logos.
export const SLOGODLE_LOGO: Logo = {
  name: "Slogodle",
  industry: "Daily logo guessing game",
  founded: 2026,
  description:
    "Slogodle is a daily guessing game where you have three tries to name the tech logo of the day.",
  funFact: "You just played a mini Slogodle round! A new logo drops every day at midnight.",
  icon: "/slogodle-mark.svg",
  aspect: 1,
  gitLink: "https://tech.slogodle.com",
};

/** Every logo a video can feature: the game's logos plus Slogodle. */
export const VIDEO_LOGOS: Logo[] = [...LOGOS, SLOGODLE_LOGO];

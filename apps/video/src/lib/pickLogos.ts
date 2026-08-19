import { LOGOS, type Logo } from "@slogodle/logos";

export function resolveLogoIcon(icon: string): string {
  return icon.startsWith("/") ? icon.slice(1) : icon;
}

export function pickRandomLogo(
  logos: Logo[] = LOGOS,
  random: () => number = Math.random,
): Logo {
  return logos[Math.floor(random() * logos.length)];
}

export function pickLogoQuiz(
  logos: Logo[] = LOGOS,
  choiceCount = 4,
  random: () => number = Math.random,
): { target: Logo; choices: Logo[] } {
  if (choiceCount < 2) {
    throw new Error("choiceCount must be at least 2");
  }
  if (logos.length < choiceCount) {
    throw new Error("Not enough logos to pick from");
  }

  const shuffled = [...logos];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const choices = shuffled.slice(0, choiceCount);
  const target = choices[Math.floor(random() * choices.length)];

  return { target, choices };
}

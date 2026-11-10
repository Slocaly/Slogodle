import type { Logo } from "@slogodle/logos";

export function createTestingLogo(overrides: Partial<Logo> = {}): Logo {
  return {
    aspect: 1,
    description: "A UI library for building interfaces.",
    founded: 2013,
    funFact: "It was first used on a news feed.",
    gitLink: "https://github.com/example/react",
    icon: "/logos/react.svg",
    industry: "Frontend library",
    name: "React",
    ...overrides,
  };
}

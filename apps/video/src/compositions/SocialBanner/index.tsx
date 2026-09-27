import { useMemo } from "react";
import { AbsoluteFill, Img, random, staticFile, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import Matter from "matter-js";
import { LOGOS, type Logo } from "@slogodle/logos";
import { resolveLogoIcon } from "../../lib/pickLogos";
import { theme } from "../../lib/theme";

export const SOCIAL_BANNER_WIDTH = 2048;
export const SOCIAL_BANNER_HEIGHT = 1152;
export const YOUTUBE_BANNER_WIDTH = 2560;
export const YOUTUBE_BANNER_HEIGHT = 1440;

const TITLE_FONT_FAMILY = "Yang Bagus";
const TITLE_TEXT = "Slogodle";
const TITLE_GROUP_SIZES = [3, 2, 3];
const TITLE_LETTER_COLORS = [
  "oklch(0.72 0.16 320)",
  "oklch(0.69 0.13 190)",
  "oklch(0.77 0.14 80)",
];
const titleGroupEnds = TITLE_GROUP_SIZES.reduce<number[]>((ends, size) => {
  ends.push((ends.at(-1) ?? 0) + size);
  return ends;
}, []);

const PILE_SEED = "social-banner";
const SPAWN_STAGGER = 70;
const SIMULATION_STEPS = 1400;
const WALL_THICKNESS = 200;
// Icons referenced in @slogodle/logos that have no file under public/logos yet.
const MISSING_ICONS = new Set(["/logos/denojs.svg"]);

loadFont({
  family: TITLE_FONT_FAMILY,
  url: staticFile("font/YangBagus.ttf"),
  weight: "normal",
});

interface PiledLogo {
  logo: Logo;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

function shuffledLogos(seed: string): Logo[] {
  const shuffled = LOGOS.filter((logo) => !MISSING_ICONS.has(logo.icon));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(`${seed}-shuffle-${i}`) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface SocialBannerProps {
  pileLogoCount: number;
  logoSizeRange: [number, number];
  titleFontSize: number;
  /** Omit to drop the tagline and keep the card to just the wordmark. */
  subtitleFontSize?: number;
  /** Shifts the card up from the exact centre, as a ratio of the banner height. */
  cardLiftRatio: number;
  /**
   * Fixed card size. When set, the card is also a static body in the simulation, so the
   * pile heaps up on both sides of it (YouTube only shows a thin strip around the card
   * on desktop, so the logos need to reach up there).
   */
  cardObstacle?: { width: number; height: number };
}

interface CardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Drops logos into a box the width of the banner and lets matter-js settle them into a
// pile, the same way the website's footer pile works. Every random value is seeded, so
// the still renders identically each time.
function simulatePile(
  width: number,
  height: number,
  count: number,
  [sizeMin, sizeMax]: [number, number],
  card: CardRect | null,
): PiledLogo[] {
  Matter.Common._seed = 42;
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } });

  const floor = Matter.Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width * 2, WALL_THICKNESS, {
    isStatic: true,
  });
  const leftWall = Matter.Bodies.rectangle(-WALL_THICKNESS / 2, 0, WALL_THICKNESS, height * 20, { isStatic: true });
  const rightWall = Matter.Bodies.rectangle(width + WALL_THICKNESS / 2, 0, WALL_THICKNESS, height * 20, {
    isStatic: true,
  });
  Matter.Composite.add(engine.world, [floor, leftWall, rightWall]);
  if (card) {
    Matter.Composite.add(
      engine.world,
      Matter.Bodies.rectangle(card.x, card.y, card.width, card.height, { isStatic: true }),
    );
  }

  const logos = shuffledLogos(PILE_SEED).slice(0, count);
  const entries = logos.map((logo, i) => {
    const seed = `${PILE_SEED}-${i}`;
    const longEdge = sizeMin + random(`${seed}-size`) * (sizeMax - sizeMin);
    const aspect = logo.aspect || 1;
    const bodyWidth = aspect >= 1 ? longEdge : longEdge * aspect;
    const bodyHeight = aspect >= 1 ? longEdge / aspect : longEdge;
    // With a card obstacle, logos drop on either side of it rather than on top of it.
    const sideWidth = card ? (width - card.width) / 2 - bodyWidth : width - bodyWidth;
    const sideOffset = card && random(`${seed}-side`) < 0.5 ? width - sideWidth - bodyWidth : 0;
    const x = bodyWidth / 2 + sideOffset + random(`${seed}-x`) * sideWidth;
    const y = height * 0.4 - i * SPAWN_STAGGER;
    const body = Matter.Bodies.rectangle(x, y, bodyWidth, bodyHeight, {
      angle: (random(`${seed}-angle`) - 0.5) * Math.PI,
      chamfer: { radius: Math.min(bodyWidth, bodyHeight) * 0.2 },
      restitution: 0.2,
      friction: 0.6,
    });
    Matter.Composite.add(engine.world, body);
    return { logo, body, width: bodyWidth, height: bodyHeight };
  });

  for (let step = 0; step < SIMULATION_STEPS; step++) {
    Matter.Engine.update(engine, 1000 / 60);
  }

  return entries.map(({ logo, body, width: w, height: h }) => ({
    logo,
    x: body.position.x,
    y: body.position.y,
    width: w,
    height: h,
    angle: body.angle,
  }));
}

export const SocialBanner: React.FC<SocialBannerProps> = ({
  pileLogoCount,
  logoSizeRange,
  titleFontSize,
  subtitleFontSize,
  cardLiftRatio,
  cardObstacle,
}) => {
  const { width, height } = useVideoConfig();
  const cardRect = cardObstacle
    ? { x: width / 2, y: height / 2 - height * cardLiftRatio, ...cardObstacle }
    : null;
  const pile = useMemo(
    () => simulatePile(width, height, pileLogoCount, logoSizeRange, cardRect),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height, pileLogoCount, logoSizeRange[0], logoSizeRange[1], cardObstacle?.width, cardObstacle?.height, cardLiftRatio],
  );

  return (
    <AbsoluteFill
      style={{
        fontFamily: theme.fontFamily,
        background: [
          `radial-gradient(circle at 12% 18%, ${theme.colors.bg3} 0%, transparent 42%)`,
          `radial-gradient(circle at 88% 12%, ${theme.colors.bg2} 0%, transparent 45%)`,
          `radial-gradient(circle at 50% 50%, ${theme.colors.cardBg} 0%, transparent 38%)`,
          theme.colors.bg1,
        ].join(", "),
      }}
    >
      {pile.map(({ logo, x, y, width: w, height: h, angle }, i) => (
        <Img
          key={i}
          src={staticFile(resolveLogoIcon(logo.icon))}
          style={{
            position: "absolute",
            left: x - w / 2,
            top: y - h / 2,
            width: w,
            height: h,
            objectFit: "contain",
            transform: `rotate(${angle}rad)`,
            filter: "drop-shadow(0 6px 10px oklch(0.3 0.05 290 / 0.18))",
          }}
        />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: height * cardLiftRatio * 2 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "40px 80px 48px",
            boxSizing: "border-box",
            width: cardObstacle?.width,
            height: cardObstacle?.height,
            borderRadius: 64,
            background: "oklch(0.995 0.01 90 / 0.7)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 24px 60px oklch(0.3 0.05 290 / 0.15)",
          }}
        >
          <div style={{ fontFamily: TITLE_FONT_FAMILY, fontSize: titleFontSize, lineHeight: 1 }}>
            {[...TITLE_TEXT].map((letter, i) => (
              <span
                key={i}
                style={{
                  color: TITLE_LETTER_COLORS[titleGroupEnds.findIndex((end) => i < end) % TITLE_LETTER_COLORS.length],
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          {subtitleFontSize ? (
            <div style={{ fontSize: subtitleFontSize, fontWeight: 500, color: theme.colors.muted }}>
              Logo games every day
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

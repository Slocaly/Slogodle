import { AbsoluteFill, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { theme } from "../../lib/theme";
import { FallingLogos } from "./FallingLogos";

export const OUTRO_FRAMES = 120;

const TITLE_FONT_FAMILY = "Yang Bagus";

const TITLE_LETTER_COLORS = [
  "oklch(0.72 0.16 320)",
  "oklch(0.69 0.13 190)",
  "oklch(0.77 0.14 80)",
];
const TITLE_GROUP_SIZES = [3, 2, 3];
const TITLE_TEXT = "Slogodle";
const titleGroupEnds = TITLE_GROUP_SIZES.reduce<number[]>((ends, size) => {
  ends.push((ends.at(-1) ?? 0) + size);
  return ends;
}, []);
const LETTER_STAGGER = 3;
const BUBBLE_PITCH_STEP = 0.1;
const SUBTITLE_DELAY = TITLE_TEXT.length * LETTER_STAGGER + 6;

loadFont({
  family: TITLE_FONT_FAMILY,
  url: staticFile("font/YangBagus.ttf"),
  weight: "normal",
});

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const subtitleOpacity = interpolate(
    frame,
    [SUBTITLE_DELAY, SUBTITLE_DELAY + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <FallingLogos />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: TITLE_FONT_FAMILY,
            fontSize: 170,
            fontWeight: 700,
          }}
        >
          {[...TITLE_TEXT].map((letter, i) => {
            const letterFrame = frame - i * LETTER_STAGGER;
            const letterScale = spring({
              frame: letterFrame,
              fps,
              config: { damping: 7, stiffness: 190, mass: 0.75 },
            });
            const letterOpacity = interpolate(letterFrame, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span key={i}>
                <Sequence from={i * LETTER_STAGGER} layout="none">
                  <Html5Audio
                    src={staticFile("sounds/bubble.wav")}
                    volume={0.8}
                    playbackRate={1 + i * BUBBLE_PITCH_STEP}
                    preservePitch={false}
                    toneFrequency={1 + i * BUBBLE_PITCH_STEP}
                  />
                </Sequence>
                <span
                  style={{
                    display: "inline-block",
                    scale: letterScale,
                    opacity: letterOpacity,
                    color:
                      TITLE_LETTER_COLORS[
                      titleGroupEnds.findIndex((end) => i < end) % TITLE_LETTER_COLORS.length
                      ],
                  }}
                >
                  {letter}
                </span>
              </span>
            );
          })}
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 500,
            color: theme.colors.muted,
            opacity: subtitleOpacity,
          }}
        >
          Logo games every day
        </div>
      </div>
    </AbsoluteFill>
  );
};

import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  interpolateColors,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LOGOS, type Logo } from "@slogodle/logos";
import { theme } from "../../lib/theme";
import { useAnimatedGradientBackground } from "../../lib/animatedGradientBackground";
import { resolveLogoIcon } from "../../lib/pickLogos";
import { Outro, OUTRO_FRAMES } from "../Outro";
import { MusicBed } from "../GuessTheLogo/components/MusicBed";
import { SafeZoneOverlay } from "../GuessTheLogo/components/SafeZoneOverlay";
import { NameOption } from "./components/NameOption";
import {
  COUNTDOWN_BADGE_SIZE,
  COUNTDOWN_BAR_WIDTH_RATIO,
  COUNTDOWN_BOTTOM_OFFSET,
  COUNTDOWN_FONT_SIZE,
  DESCRIPTION_DELAY_FRAMES,
  DESCRIPTION_FADE_FRAMES,
  DESCRIPTION_TO_FUN_FACT_GAP,
  FUN_FACT_DELAY_FRAMES,
  FUN_FACT_FADE_FRAMES,
  LOGO_CENTER_Y,
  LOGO_SIZE,
  OUTRO_TRANSITION_FRAMES,
  OPTION_HEIGHT,
  REVEAL_LIFT,
  REVEAL_SCENE_FRAMES,
  REVEAL_TRANSITION_FRAMES,
  SETTLE_FRAMES,
  TITLE_TOP,
  WINNER_TO_DESCRIPTION_GAP,
  WINNER_TOP,
} from "./constants";
import type { LogoNameChoiceProps } from "./schema";

export { REVEAL_SCENE_FRAMES } from "./constants";

function resolveLogo(name: string): Logo {
  const logo = LOGOS.find((candidate) => candidate.name === name);
  if (!logo) {
    throw new Error(`Unknown logo: ${name}`);
  }
  return logo;
}

export const LogoNameChoice: React.FC<LogoNameChoiceProps> = ({
  targetLogoName,
  decoyLogoNames,
  revealDelayInFrames,
  musicSrc,
  debugSafeZones,
}) => {
  const target = resolveLogo(targetLogoName);
  // Deterministic (not Math.random) so the option order stays identical across frame renders.
  const targetIndex = Math.floor(random(targetLogoName) * (decoyLogoNames.length + 1));
  const choices = [
    ...decoyLogoNames.slice(0, targetIndex),
    target.name,
    ...decoyLogoNames.slice(targetIndex),
  ];
  const background = useAnimatedGradientBackground();

  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: theme.fontFamily,
      }}
    >
      <MusicBed
        src={musicSrc}
        revealAtFrame={revealDelayInFrames}
        revealTransitionFrames={REVEAL_TRANSITION_FRAMES}
      />
      <Sequence name="Guess" durationInFrames={revealDelayInFrames + REVEAL_SCENE_FRAMES}>
        <GuessSceneWithFade logo={target} choices={choices} revealDelayInFrames={revealDelayInFrames} />
      </Sequence>
      <Sequence
        name="Outro"
        from={revealDelayInFrames + REVEAL_SCENE_FRAMES}
        durationInFrames={OUTRO_FRAMES}
      >
        <Outro />
      </Sequence>
      {debugSafeZones && <SafeZoneOverlay />}
    </AbsoluteFill>
  );
};

function getTickFrames(revealDelayInFrames: number, fps: number): number[] {
  const frames: number[] = [];
  for (let k = 1; revealDelayInFrames - k * fps > SETTLE_FRAMES; k++) {
    frames.push(revealDelayInFrames - k * fps);
  }
  return frames;
}

type SceneProps = { logo: Logo; choices: string[]; revealDelayInFrames: number };

const GuessSceneWithFade: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const sceneEnd = props.revealDelayInFrames + REVEAL_SCENE_FRAMES;
  const contentOpacity = interpolate(
    frame,
    [sceneEnd - OUTRO_TRANSITION_FRAMES, sceneEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: contentOpacity }}>
      <GuessScene {...props} />
    </AbsoluteFill>
  );
};

const GuessScene: React.FC<SceneProps> = ({ logo, choices, revealDelayInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealDelayInFrames;
  const secondsLeft = Math.max(1, Math.ceil((revealDelayInFrames - frame) / fps));

  // Settle only — title and logo are already fully visible at frame 0, this
  // just eases them in from a slightly smaller/lower resting position.
  const settle = spring({ frame, fps, config: { damping: 14 }, durationInFrames: SETTLE_FRAMES });
  const titleScale = 0.94 + settle * 0.06;
  const logoEntranceScale = 0.9 + settle * 0.1;

  // Quick overshoot pop on the logo once the answer is revealed.
  const logoRevealPop = revealed
    ? spring({
        frame: frame - revealDelayInFrames,
        fps,
        config: { damping: 7, stiffness: 160 },
        durationInFrames: REVEAL_TRANSITION_FRAMES,
      })
    : 0;
  const logoScale = logoEntranceScale * (1 + logoRevealPop * 0.1);

  // Once revealed, the logo springs up into the space the title frees, making
  // room for the answer and the description / fun fact below it.
  const revealLift = revealed
    ? spring({
        frame: frame - revealDelayInFrames,
        fps,
        config: { damping: 12, stiffness: 120, mass: 0.8 },
      }) * REVEAL_LIFT
    : 0;

  // The prompt shrinks/fades away once revealed, handing focus to the answer.
  const titleRevealShrink = interpolate(
    frame,
    [revealDelayInFrames, revealDelayInFrames + REVEAL_TRANSITION_FRAMES],
    [1, 0.55],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleRevealOpacity = interpolate(
    frame,
    [revealDelayInFrames, revealDelayInFrames + REVEAL_TRANSITION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleTop = interpolate(
    frame,
    [revealDelayInFrames, revealDelayInFrames + REVEAL_TRANSITION_FRAMES],
    [TITLE_TOP, 32],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const countdownOpacity = interpolate(
    frame,
    [revealDelayInFrames, revealDelayInFrames + REVEAL_TRANSITION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const drainProgress = interpolate(frame, [SETTLE_FRAMES, revealDelayInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urgentColor = interpolateColors(
    drainProgress,
    [0.6, 1],
    [theme.colors.accentPink, theme.colors.danger],
  );

  const descriptionOpacity = interpolate(
    frame,
    [
      revealDelayInFrames + DESCRIPTION_DELAY_FRAMES,
      revealDelayInFrames + DESCRIPTION_DELAY_FRAMES + DESCRIPTION_FADE_FRAMES,
    ],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const funFactProgress = interpolate(
    frame,
    [
      revealDelayInFrames + FUN_FACT_DELAY_FRAMES,
      revealDelayInFrames + FUN_FACT_DELAY_FRAMES + FUN_FACT_FADE_FRAMES,
    ],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const tickFrames = getTickFrames(revealDelayInFrames, fps);

  return (
    <AbsoluteFill>
      {tickFrames.map((tickFrame) => (
        <Sequence key={tickFrame} from={tickFrame} layout="none">
          <Audio src={staticFile("sounds/tick.wav")} volume={0.3} />
        </Sequence>
      ))}
      <Sequence from={revealDelayInFrames} layout="none">
        <Audio src={staticFile("sounds/confirm.wav")} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: titleTop,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 120,
          fontWeight: 700,
          color: theme.colors.text,
          opacity: titleRevealOpacity,
          transform: `scale(${titleScale * titleRevealShrink})`,
        }}
      >
        Name this logo!
      </div>
      <Img
        src={staticFile(resolveLogoIcon(logo.icon))}
        style={{
          position: "absolute",
          top: LOGO_CENTER_Y - LOGO_SIZE / 2,
          left: `calc(50% - ${LOGO_SIZE / 2}px)`,
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          objectFit: "contain",
          transform: `translateY(${-revealLift}px) scale(${logoScale})`,
        }}
      />
      {choices.map((name, index) => (
        <NameOption
          key={name}
          index={index}
          name={name}
          isCorrect={name === logo.name}
          revealAtFrame={revealDelayInFrames}
        />
      ))}
      {!revealed && (
        <div
          style={{
            position: "absolute",
            bottom: COUNTDOWN_BOTTOM_OFFSET,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div
            style={{
              width: COUNTDOWN_BADGE_SIZE,
              height: COUNTDOWN_BADGE_SIZE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: COUNTDOWN_FONT_SIZE,
              lineHeight: 1,
              fontWeight: 800,
              color: urgentColor,
              opacity: countdownOpacity,
              backgroundColor: theme.colors.cardBg,
              border: `6px solid ${urgentColor}`,
              borderRadius: "50%",
              boxShadow: `0 8px 32px ${urgentColor}55`,
            }}
          >
            {secondsLeft}
          </div>
          <div
            style={{
              width: `${COUNTDOWN_BAR_WIDTH_RATIO * 100}%`,
              height: 28,
              borderRadius: 999,
              backgroundColor: theme.colors.border,
              opacity: countdownOpacity,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(1 - drainProgress) * 100}%`,
                height: "100%",
                borderRadius: 999,
                backgroundColor: urgentColor,
              }}
            />
          </div>
        </div>
      )}
      {revealed && (
        // Top-anchored right under the answer entry, which stays on screen as the name.
        <div
          style={{
            position: "absolute",
            top: WINNER_TOP + OPTION_HEIGHT + WINNER_TO_DESCRIPTION_GAP,
            left: "10%",
            width: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: DESCRIPTION_TO_FUN_FACT_GAP,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.4,
              fontWeight: 600,
              color: theme.colors.text,
              opacity: descriptionOpacity,
            }}
          >
            {logo.description}
          </div>
          <div
            style={{
              width: "100%",
              padding: "24px 32px",
              boxSizing: "border-box",
              backgroundColor: theme.colors.cardBg,
              border: `4px solid ${theme.colors.accentLavender}`,
              borderRadius: 32,
              boxShadow: `0 8px 32px ${theme.colors.accentLavender}55`,
              opacity: funFactProgress,
              transform: `translateY(${(1 - funFactProgress) * 20}px)`,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: theme.colors.accentPink,
                marginBottom: 8,
              }}
            >
              💡 Fun fact
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                fontWeight: 500,
                color: theme.colors.muted,
              }}
            >
              {logo.funFact}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

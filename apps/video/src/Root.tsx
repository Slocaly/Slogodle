import { Composition, Still } from "remotion";
import { pickRandomLogo } from "./lib/pickLogos";
import { GuessTheLogo } from "./compositions/GuessTheLogo";
import { REVEAL_SCENE_FRAMES } from "./compositions/GuessTheLogo/constants";
import { GuessTheLogoSchema, type LogoName } from "./compositions/GuessTheLogo/schema";
import {
  LogoMultipleChoice,
} from "./compositions/LogoMultipleChoice/LogoMultipleChoice";
import { LogoMultipleChoiceSchema } from "./compositions/LogoMultipleChoice/schema";
import { LogoNameChoice, REVEAL_SCENE_FRAMES as NAME_CHOICE_REVEAL_SCENE_FRAMES } from "./compositions/LogoNameChoice";
import { LogoNameChoiceSchema } from "./compositions/LogoNameChoice/schema";
import { Outro, OUTRO_FRAMES } from "./compositions/Outro";
import { TOTAL_FRAMES } from "./compositions/LogoMultipleChoice/constants";
import {
  SocialBanner,
  SOCIAL_BANNER_HEIGHT,
  SOCIAL_BANNER_WIDTH,
  YOUTUBE_BANNER_HEIGHT,
  YOUTUBE_BANNER_WIDTH,
} from "./compositions/SocialBanner";

const defaultGuess = pickRandomLogo();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GuessTheLogo"
        component={GuessTheLogo}
        schema={GuessTheLogoSchema}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={150 + REVEAL_SCENE_FRAMES + OUTRO_FRAMES}
        defaultProps={{
          logoName: "Jasmine" as const,
          revealDelayInFrames: 150,
          musicSrc: "music/HoliznaCC0 - The Best Of Times.mp3" as const,
          debugSafeZones: false,
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.revealDelayInFrames + REVEAL_SCENE_FRAMES + OUTRO_FRAMES,
        })}
      />
      <Composition
        id="LogoMultipleChoice"
        component={LogoMultipleChoice}
        schema={LogoMultipleChoiceSchema}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={TOTAL_FRAMES}
        defaultProps={{
          targetLogoName: "Brain.js" as const,
          decoyLogoNames: [
            "Spring" as const,
            "Solidity" as const,
            "Waku" as const,
          ],
          musicSrc: "music/HoliznaCC0 - The Best Of Times.mp3" as const,
          debugSafeZones: false,
        }}
      />
      <Composition
        id="LogoNameChoice"
        component={LogoNameChoice}
        schema={LogoNameChoiceSchema}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={150 + NAME_CHOICE_REVEAL_SCENE_FRAMES + OUTRO_FRAMES}
        defaultProps={{
          targetLogoName: "Brain.js" as const,
          decoyLogoNames: [
            "Spring" as const,
            "Solidity" as const,
            "Waku" as const,
          ],
          revealDelayInFrames: 150,
          musicSrc: "music/HoliznaCC0 - Tetrapod.mp3" as const,
          debugSafeZones: false,
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.revealDelayInFrames + NAME_CHOICE_REVEAL_SCENE_FRAMES + OUTRO_FRAMES,
        })}
      />
      <Composition
        id="Outro"
        component={Outro}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={OUTRO_FRAMES}
      />
      <Still
        id="SocialBanner"
        component={SocialBanner}
        width={SOCIAL_BANNER_WIDTH}
        height={SOCIAL_BANNER_HEIGHT}
        defaultProps={{
          pileLogoCount: 40,
          logoSizeRange: [96, 150] as [number, number],
          titleFontSize: 230,
          subtitleFontSize: 64,
          cardLiftRatio: 0.09,
        }}
      />
      {/* YouTube only guarantees the centre 1546x423 on every device, so the card fills it. */}
      <Still
        id="YoutubeBanner"
        component={SocialBanner}
        width={YOUTUBE_BANNER_WIDTH}
        height={YOUTUBE_BANNER_HEIGHT}
        defaultProps={{
          pileLogoCount: 75,
          logoSizeRange: [100, 150] as [number, number],
          titleFontSize: 220,
          cardLiftRatio: 0,
          cardObstacle: { width: 1400, height: 300 },
        }}
      />
    </>
  );
};

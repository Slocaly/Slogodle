import { Composition } from "remotion";
import { pickRandomLogo } from "./lib/pickLogos";
import { GuessTheLogo } from "./compositions/GuessTheLogo";
import { REVEAL_SCENE_FRAMES } from "./compositions/GuessTheLogo/constants";
import { GuessTheLogoSchema, type LogoName } from "./compositions/GuessTheLogo/schema";
import {
  LogoMultipleChoice,
} from "./compositions/LogoMultipleChoice/LogoMultipleChoice";
import { LogoMultipleChoiceSchema } from "./compositions/LogoMultipleChoice/schema";
import { Outro, OUTRO_FRAMES } from "./compositions/Outro";
import { TOTAL_FRAMES } from "./compositions/LogoMultipleChoice/constants";

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
          logoName: defaultGuess.name as LogoName,
          revealDelayInFrames: 150,
          musicSrc: "music/HoliznaCC0 - Tetrapod.mp3",
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
          musicSrc: "music/HoliznaCC0 - Break from Reality.mp3",
          debugSafeZones: false,
        }}
      />
      <Composition
        id="Outro"
        component={Outro}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={OUTRO_FRAMES}
      />
    </>
  );
};

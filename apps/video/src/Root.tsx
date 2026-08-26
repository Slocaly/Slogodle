import { Composition } from "remotion";
import { pickRandomLogo, pickLogoQuiz } from "./lib/pickLogos";
import { GuessTheLogo, REVEAL_SCENE_FRAMES } from "./compositions/GuessTheLogo";
import { GuessTheLogoSchema } from "./compositions/GuessTheLogo/schema";
import {
  LogoMultipleChoice,
} from "./compositions/LogoMultipleChoice/LogoMultipleChoice";
import { LogoMultipleChoiceSchema } from "./compositions/LogoMultipleChoice/schema";
import { Outro, OUTRO_FRAMES } from "./compositions/Outro";
import { QUESTION_FRAMES, REVEAL_HOLD_FRAMES } from "./compositions/LogoMultipleChoice/constants";
import { getChoicesFrames } from "./compositions/LogoMultipleChoice/utils/get-choices-frames";

const defaultGuess = pickRandomLogo();
const defaultQuiz = pickLogoQuiz();
const defaultDecoyNames = defaultQuiz.choices
  .filter((logo) => logo.name !== defaultQuiz.target.name)
  .map((logo) => logo.name);

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
        defaultProps={{ logoName: defaultGuess.name, revealDelayInFrames: 150 }}
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
        durationInFrames={
          QUESTION_FRAMES +
          getChoicesFrames(defaultDecoyNames.length + 1) +
          REVEAL_HOLD_FRAMES +
          OUTRO_FRAMES
        }
        defaultProps={{
          targetLogoName: defaultQuiz.target.name,
          decoyLogoNames: defaultDecoyNames,
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames:
            QUESTION_FRAMES +
            getChoicesFrames(props.decoyLogoNames.length + 1) +
            REVEAL_HOLD_FRAMES +
            OUTRO_FRAMES,
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
    </>
  );
};

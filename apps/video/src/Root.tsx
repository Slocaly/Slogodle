import { Composition } from "remotion";
import { pickRandomLogo, pickLogoQuiz } from "./lib/pickLogos";
import { GuessTheLogo, REVEAL_SCENE_FRAMES } from "./compositions/GuessTheLogo";
import { GuessTheLogoSchema } from "./compositions/GuessTheLogo/schema";
import {
  LogoMultipleChoice,
  getChoicesFrames,
  QUESTION_FRAMES,
  REVEAL_HOLD_FRAMES,
} from "./compositions/LogoMultipleChoice";
import { LogoMultipleChoiceSchema } from "./compositions/LogoMultipleChoice/schema";

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
        durationInFrames={90 + REVEAL_SCENE_FRAMES}
        defaultProps={{ logoName: defaultGuess.name, revealDelayInFrames: 90 }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.revealDelayInFrames + REVEAL_SCENE_FRAMES,
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
          QUESTION_FRAMES + getChoicesFrames(defaultDecoyNames.length + 1) + REVEAL_HOLD_FRAMES
        }
        defaultProps={{
          questionText: `Which of these is the ${defaultQuiz.target.name} logo?`,
          targetLogoName: defaultQuiz.target.name,
          decoyLogoNames: defaultDecoyNames,
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames:
            QUESTION_FRAMES +
            getChoicesFrames(props.decoyLogoNames.length + 1) +
            REVEAL_HOLD_FRAMES,
        })}
      />
    </>
  );
};

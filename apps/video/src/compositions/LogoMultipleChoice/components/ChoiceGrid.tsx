import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";
import { Logo } from "@slogodle/logos";
import { ChoiceCard } from "./ChoiceCard";
import { RevealedInfo } from "./RevealedInfo";
import { ProgressBar } from "./ProgressBar";
import { REVEAL_AT_FRAME } from "../constants";

export const ChoiceGrid: React.FC<{ choices: Logo[]; target: Logo }> = ({
    choices,
    target,
}) => {
    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Sequence from={REVEAL_AT_FRAME} layout="none">
                <Html5Audio src={staticFile("sounds/confirm.wav")} />
            </Sequence>
            <div style={{ position: "relative", width: 0, height: 0 }}>
                {choices.map((choice, index) => (
                    <ChoiceCard
                        key={choice.name}
                        index={index}
                        choice={choice}
                        target={target}
                        choicesLength={choices.length}
                    />
                ))}
            </div>
            <RevealedInfo target={target} />
            <ProgressBar />
        </AbsoluteFill>
    );
};

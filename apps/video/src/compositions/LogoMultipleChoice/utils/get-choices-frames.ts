import { CHOICE_STAGGER_FRAMES, CHOICES_HOLD_FRAMES } from "../constants";

export function getChoicesFrames(choiceCount: number): number {
    return CHOICE_STAGGER_FRAMES * choiceCount + CHOICES_HOLD_FRAMES;
}

import { Player } from "@remotion/player";
import { PLAYER_COMPOSITIONS } from "video/player";
import type { CompositionId } from "video/schedule";

interface VideoPreviewProps {
  compositionId: CompositionId;
  inputProps: Record<string, unknown>;
}

// Loaded lazily by /admin/videos, after it points remotion_staticBase at the video assets:
// the compositions call staticFile() as soon as they're imported (fonts).
export default function VideoPreview({
  compositionId,
  inputProps,
}: VideoPreviewProps) {
  const composition = PLAYER_COMPOSITIONS[compositionId];

  return (
    <Player
      component={composition.component}
      inputProps={inputProps}
      durationInFrames={composition.durationInFrames(inputProps)}
      fps={composition.fps}
      compositionWidth={composition.width}
      compositionHeight={composition.height}
      style={{ width: "100%", aspectRatio: `${composition.width} / ${composition.height}` }}
      controls
      clickToPlay
      // Default is 5; the choice videos stack music, tick, confirm and one click per option.
      numberOfSharedAudioTags={16}
      acknowledgeRemotionLicense
    />
  );
}

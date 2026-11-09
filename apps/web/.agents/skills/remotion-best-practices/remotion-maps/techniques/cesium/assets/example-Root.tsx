import React from "react";
import { Composition } from "remotion";
import { CesiumFlythrough } from "./CesiumFlythrough";
import type { CesiumFlythroughProps } from "./CesiumFlythrough";
import cityPath from "./city-path.json";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LandscapeFlyover"
      component={CesiumFlythrough}
      defaultProps={{ mode: "landscape" } satisfies CesiumFlythroughProps}
      durationInFrames={24 * 30}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="CityFlyover"
      component={CesiumFlythrough}
      defaultProps={
        {
          altitudeEnd: 500,
          altitudeStart: 700,
          lookAheadKm: 0.7,
          maximumScreenSpaceError: 6,
          mode: "city",
          path: cityPath as [number, number][],
          pitchFromNadir: 72,
          travelKm: 4.5,
          verticalExaggeration: 1,
        } satisfies CesiumFlythroughProps
      }
      durationInFrames={18 * 30}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);

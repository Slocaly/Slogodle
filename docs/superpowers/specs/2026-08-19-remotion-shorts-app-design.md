# Remotion shorts app — design

## Purpose

Add a new workspace app, `apps/video`, that generates short-form vertical
quiz videos (TikTok / Instagram Reels / YouTube Shorts) about the logos in
`packages/logos`. Two initial formats:

1. "Which of these logos is X?" — multiple choice.
2. "Guess the logo" — obscured logo, countdown, reveal.

## Constraints

- `apps/video` must not depend on `apps/web` (no cross-app coupling). Its
  only workspace dependency is `@slogodle/logos`.
- Logo selection is random, independent of the live game's daily
  archive/rotation — deliberately decoupled from game state.
- Rendering is local only (`remotion render` / `remotion studio`); no
  Remotion Lambda / cloud rendering.
- The user tests manually (Studio preview, render) — implementation does
  not drive a dev server or browser automation to verify.

## Project setup

- Scaffold with `create-video` (blank template, no Tailwind), then adapt
  into the pnpm workspace: `package.json` name `"video"`, matching
  `engines.node` with the rest of the monorepo. `pnpm-workspace.yaml`
  already covers `apps/*`, no change needed there.
- Add `zod` (for schema-driven props) and `@remotion/zod-types` (for
  `zColor` if needed).

## Compositions

Both vertical, 1080×1920, 30fps, driven by a Zod props schema so variants
render without code changes (and are editable in Remotion Studio's
sidebar).

### `LogoMultipleChoice`

- Props: `questionText`, `targetLogoId`, `decoyLogoIds` (array).
- Renders: question card intro → grid of logo choices → correct choice
  highlighted on reveal.
- `calculateMetadata` adjusts duration based on number of choices.

### `GuessTheLogo`

- Props: `logoId`, timing (reveal delay).
- Renders: obscured/zoomed-in logo → countdown → reveal with logo name.

### `lib/pickLogos.ts`

Shared helper that randomly samples a target + N decoys from
`@slogodle/logos`, used to generate `defaultProps` for both compositions.

### `lib/theme.ts`

Colors and font choices copied (by value, not import) from
`apps/web/src/styles/global.css`'s oklch pastel palette, so output looks
on-brand without creating a dependency on `apps/web`.

## Audio

- `<Audio>` layer wired into both compositions from v1: a reveal sting and
  right/wrong stings.
- `confirm.wav`, `error.wav`, `click.wav` are copied (physical file copy,
  not a package/code dependency) from `apps/web/public/sounds/` into
  `apps/video/public/sounds/`.
- A `musicSrc` prop/slot is wired up (volume, looping) for background
  music, but no music file is added — the user will supply a licensed
  track later.

## Folder structure

```
apps/video/
  package.json          (name: "video")
  src/
    Root.tsx
    compositions/
      LogoMultipleChoice/{index.tsx, schema.ts}
      GuessTheLogo/{index.tsx, schema.ts}
    lib/{pickLogos.ts, theme.ts}
  public/
    sounds/              (copied from apps/web)
    music/                (empty, user-supplied later)
```

## Testing

No automated tests. The user previews via
`pnpm --filter video exec remotion studio` and renders via
`pnpm --filter video exec remotion render <composition-id>` themselves.

## Out of scope (v1)

- Batch-rendering many variants in one command (e.g. a script that renders
  every logo as a "Guess the logo" video). Can be added later once the two
  compositions are proven out.
- Captions/voiceover pipeline (`remotion-captions` skill covers this if
  wanted later).
- Remotion Lambda / cloud rendering.

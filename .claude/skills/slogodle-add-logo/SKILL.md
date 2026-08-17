---
name: slogodle-add-logo
description: Scan public/logos for SVG files that aren't yet registered in src/data/logos.ts, and add a clean, correctly-formatted entry for each one.
disable-model-invocation: true
allowed-tools: Read, Edit, Bash, Glob, Grep, WebSearch, WebFetch, AskUserQuestion
---

Add missing logos to `src/data/logos.ts`, keeping that file clean and every entry accurate. This skill only adds/repairs entries — it never touches game logic, components, or SVG files themselves.

## 1. Find what's new

- List every `*.svg` file in `public/logos/`.
- Extract every `icon: "/logos/....svg"` path already present in `src/data/logos.ts`.
- New logos = SVG files with no matching `icon` entry.
- Also flag the reverse case: any `icon` path in `logos.ts` whose SVG file no longer exists under `public/logos/` (stale entry — a broken image in the running game). List these separately; don't delete them without saying so in your final summary.

If there are no new SVGs and no stale entries, say so and stop — do not touch the file.

## 2. Gather info for each new logo

Read the `Logo` interface at the top of `src/data/logos.ts` for the exact fields required. For each new file, determine:

- **name** — the tool/technology's proper display name (correct casing, e.g. `github-actions.svg` → `GitHub Actions`, `mysql.svg` → `MySQL`).
- **industry** — a short category phrase, 2-4 words, in the same register as existing entries (e.g. "CI/CD service", "Containerization platform", "Programming language"). Look at neighboring entries in the file for tone/length calibration.
- **founded** — the year the project/product was first released or founded. Use your knowledge; if genuinely unsure, use WebSearch to confirm rather than guessing.
- **funFact** — one sentence, specific and verifiable (a real origin detail, naming story, or notable technical trivia) — not a generic marketing description. Match the style of existing `funFact` values. Verify via WebSearch if you're not confident the fact is accurate; never fabricate a fact.
- **icon** — `/logos/<filename>.svg`.
- **aspect** — the SVG's intrinsic width/height ratio. Read the file's `viewBox="minX minY width height"` (or `width`/`height` attributes if no viewBox) and compute `width / height`, rounded to 3 decimals. Use `1` only if the SVG is genuinely square.
- **gitLink** — the canonical `https://github.com/...` URL for the project's primary repository (the org/repo that actually hosts the source, not a docs mirror or unrelated fork).

If, after using WebSearch/WebFetch, you're still genuinely unsure about a field (ambiguous name for a generic-looking filename, conflicting founding years, no verifiable fun fact, an ambiguous or unofficial repo for `gitLink`), use `AskUserQuestion` to ask the user rather than guessing or silently picking the most plausible option. Batch multiple unresolved fields (even across different logos) into as few question calls as possible instead of asking one at a time.

## 3. Edit the file

- Append new entries at the end of the `LOGOS` array. Never reorder the array as a whole or insert new entries alphabetically — the existing entries' order must stay exactly as-is; new logos always go after the last existing entry.
- Match the existing formatting exactly: 2-space indent, double-quoted strings, trailing comma after every property including the last, object entries separated by a blank-free `},\n  {`.
- For `funFact`, follow the file's existing convention: keep `funFact: "..."` on one line if it stays reasonably short like the majority of entries; when it runs long, wrap it exactly like the `Vue.js`/`React Router` entries do — `funFact:` alone on its line, the quoted string indented 6 spaces on the next line.
- Remove any stale entries you flagged in step 1 (dead icon reference), but only after telling the user about them in your summary — don't silently drop data if you're unsure a removal is correct.
- Don't reorder or reformat any existing, still-valid entries.

## 4. Report

Summarize: how many logos were added (list their names), any stale entries removed, and any fields you asked the user about in step 2 along with the answer used.

Do not run the dev server, build, or typecheck to verify — describe the change and let the user check it. Do not run any git commands (add/commit) — the user commits their own work.

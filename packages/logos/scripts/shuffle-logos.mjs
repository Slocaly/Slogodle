#!/usr/bin/env node
// Randomizes the order of entries in src/logos.ts. LOGOS is indexed by day
// (see apps/web/src/hooks/useGameState.ts), so this changes which logo
// appears on which day going forward.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const filePath = join(__dirname, "../src/logos.ts")

const source = readFileSync(filePath, "utf8")

const arrayMarker = "export const LOGOS: Logo[] = ["
const arrayStart = source.indexOf(arrayMarker)
if (arrayStart === -1) throw new Error("Could not find LOGOS array in logos.ts")
const bodyStart = arrayStart + arrayMarker.length
const arrayEnd = source.lastIndexOf("]")
const header = source.slice(0, bodyStart)
const footer = source.slice(arrayEnd)
const body = source.slice(bodyStart, arrayEnd)

// Split the array body into top-level `{ ... },` entries by tracking brace depth,
// so multi-line string values (e.g. funFact) don't confuse the split.
const entries = []
let depth = 0
let start = -1
for (let i = 0; i < body.length; i++) {
  const char = body[i]
  if (char === "{") {
    if (depth === 0) start = i
    depth++
  } else if (char === "}") {
    depth--
    if (depth === 0) {
      let end = i + 1
      if (body[end] === ",") end++
      entries.push(body.slice(start, end).trim())
    }
  }
}

if (entries.length === 0) throw new Error("No logo entries found to shuffle")

// Fisher-Yates shuffle.
for (let i = entries.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[entries[i], entries[j]] = [entries[j], entries[i]]
}

const newBody = "\n" + entries.map((entry) => "  " + entry).join("\n") + "\n"

writeFileSync(filePath, header + newBody + footer)
console.log(`Shuffled ${entries.length} logos in ${filePath}`)

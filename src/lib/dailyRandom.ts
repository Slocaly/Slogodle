// src/lib/dailyRandom.ts
export function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickDailySubset<T>(pool: T[], seed: number, count: number): T[] {
  const random = mulberry32(seed)
  const shuffled = pool.slice()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, pool.length))
}

// Like pickDailySubset, but when count exceeds the pool size it cycles through a
// single seeded shuffle of the whole pool repeatedly, so repeats are spread evenly
// instead of clustering. Callers needing unique identity per slot (e.g. React keys)
// should pair each item with its index.
export function pickDailySequence<T>(pool: T[], seed: number, count: number): T[] {
  const shuffled = pickDailySubset(pool, seed, pool.length)
  const sequence: T[] = []
  for (let i = 0; i < count; i++) {
    sequence.push(shuffled[i % shuffled.length])
  }
  return sequence
}

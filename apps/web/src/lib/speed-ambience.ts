/**
 * Ambient sound for the speed round: a soft clock tick every second,
 * synthesized with the Web Audio API (no audio file).
 */

const FADE_OUT_S = 0.2;
const TICK_GAIN = 0.2;
const TICK_INTERVAL_MS = 1000;

export interface SpeedAmbience {
  /** Starts ticking. Safe to call right after a user gesture. */
  start: () => void;
  /** Stops ticking and releases the audio context. */
  stop: () => void;
}

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext ??
    null
  );
}

function scheduleTick(ctx: AudioContext, destination: AudioNode, at: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1100, at);
  osc.frequency.exponentialRampToValueAtTime(700, at + 0.05);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(TICK_GAIN, at + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
  osc.connect(gain).connect(destination);
  osc.start(at);
  osc.stop(at + 0.08);
}

/** Returns null when the browser has no Web Audio support. */
export function createSpeedAmbience(): SpeedAmbience | null {
  const Supported = getAudioContextCtor();
  if (!Supported) return null;
  const AudioContextClass: AudioContextCtor = Supported;

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let tickTimer: ReturnType<typeof setInterval> | null = null;
  let resumeOnGesture: (() => void) | null = null;

  function removeGestureListeners() {
    if (!resumeOnGesture) return;
    window.removeEventListener("pointerdown", resumeOnGesture);
    window.removeEventListener("keydown", resumeOnGesture);
    resumeOnGesture = null;
  }

  function start() {
    if (ctx) return;
    const context = new AudioContextClass();
    ctx = context;

    const output = context.createGain();
    output.connect(context.destination);
    master = output;

    // One soft tick per second, the first one a second after the clock starts.
    tickTimer = setInterval(() => {
      scheduleTick(context, output, context.currentTime + 0.02);
    }, TICK_INTERVAL_MS);

    // Browsers keep the context suspended until a gesture; a run resumed after a
    // reload starts without one, so pick it up on the first interaction.
    if (context.state === "suspended") {
      void context.resume().catch(() => {});
      resumeOnGesture = () => {
        void context.resume().catch(() => {});
        removeGestureListeners();
      };
      window.addEventListener("pointerdown", resumeOnGesture);
      window.addEventListener("keydown", resumeOnGesture);
    }
  }

  function stop() {
    const context = ctx;
    if (!context || !master) return;
    ctx = null;
    removeGestureListeners();
    if (tickTimer !== null) clearInterval(tickTimer);
    tickTimer = null;

    // Let a tick already in flight ring out before releasing the context.
    master = null;
    setTimeout(() => {
      void context.close().catch(() => {});
    }, FADE_OUT_S * 1000);
  }

  return { start, stop };
}

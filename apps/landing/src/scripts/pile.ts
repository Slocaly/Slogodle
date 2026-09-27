import Matter from "matter-js";
import { LOGOS, type Logo } from "@slogodle/logos";

const MARK = "/slogodle-mark.svg";
// Icons referenced in @slogodle/logos that have no file under public/logos yet.
const MISSING_ICONS = new Set(["/logos/denojs.svg"]);
const WALL = 60;
const SCATTER_RADIUS = 425;

export interface Pile {
  /** Throw `n` extra logos in from one side of the screen */
  launch: (n: number) => void;
  /** Remove every logo added by `launch` */
  clearLaunched: () => void;
  stop: () => void;
}

interface Item {
  el: HTMLDivElement;
  body: Matter.Body;
  w: number;
  h: number;
  launched?: boolean;
}

function randomLogos(n: number): Logo[] {
  const pool = LOGOS.filter((logo) => !MISSING_ICONS.has(logo.icon));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/**
 * Physics pile of random logos from the game resting at the bottom of `container`.
 * Logos thrown in by `launch` are the Slogodle mark.
 * Clicking anywhere in `hero` (outside interactive elements) scatters it.
 */
export function startPile(container: HTMLElement, hero: HTMLElement, maxCount = 45): Pile {
  const { Engine, Bodies, Body, Composite, Events, Runner } = Matter;
  container.innerHTML = "";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const engine = Engine.create();
  let W = container.clientWidth;
  let H = container.clientHeight;
  let walls: Matter.Body[] = [];

  const makeWalls = () => {
    if (walls.length) Composite.remove(engine.world, walls);
    const o = { isStatic: true, friction: 0.8 };
    walls = [
      Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, o),
      Bodies.rectangle(-WALL / 2, H / 2 - 400, WALL, H + 1000, o),
      Bodies.rectangle(W + WALL / 2, H / 2 - 400, WALL, H + 1000, o),
      Bodies.rectangle(W / 2, -900 - WALL / 2, W + WALL * 2, WALL, o),
    ];
    Composite.add(engine.world, walls);
  };
  makeWalls();

  const mobile = W < 640 || window.innerHeight < 600;
  const [mn, mx] = mobile ? [36, 60] : [64, 104];
  const band = window.innerHeight * 0.3;
  const avg = ((mn + mx) / 2) ** 2;
  const count = Math.min(maxCount, Math.max(6, Math.floor((W * band * 0.55) / avg)));
  const randomSize = () => mn + Math.random() * (mx - mn);

  const makeEl = (src: string, w: number, h: number) => {
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;top:0;left:0;width:${w}px;height:${h}px;will-change:transform;transform:translate(-200vw,-200vh)`;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.style.cssText = `display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 8px var(--shadow))`;
    el.appendChild(img);
    container.appendChild(el);
    return el;
  };

  const makeBody = (x: number, y: number, w: number, h: number) =>
    Bodies.rectangle(x, y, w, h, {
      chamfer: { radius: Math.min(w, h) * 0.18 },
      restitution: 0.15,
      friction: 0.6,
      frictionAir: 0.02,
      angle: Math.random() * Math.PI * 2,
    });

  let items: Item[] = [];
  for (const logo of randomLogos(count)) {
    const s = randomSize();
    const aspect = logo.aspect || 1;
    const w = aspect >= 1 ? s : s * aspect;
    const h = aspect >= 1 ? s / aspect : s;
    const el = makeEl(logo.icon, w, h);
    const x = w / 2 + Math.random() * Math.max(W - w, 1);
    const y = reduced ? H - h / 2 - Math.random() * 60 : -h - Math.random() * 700;
    const body = makeBody(x, y, w, h);
    if (!reduced) {
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 30, y: Math.random() * 6 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.6);
    }
    items.push({ el, body, w, h });
  }
  Composite.add(
    engine.world,
    items.map((i) => i.body),
  );

  Events.on(engine, "afterUpdate", () => {
    for (const { el, body, w, h } of items) {
      el.style.transform = `translate(${body.position.x - w / 2}px,${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
    }
  });
  const runner = Runner.create();
  Runner.run(runner, engine);

  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('a,button,input,summary,[role="button"]')) return;
    const r = container.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    for (const { body } of items) {
      const dx = body.position.x - cx;
      const dy = body.position.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      if (d > SCATTER_RADIUS) continue;
      const imp = (1 - d / SCATTER_RADIUS) * 40;
      Body.setVelocity(body, { x: body.velocity.x + (dx / d) * imp, y: body.velocity.y + (dy / d) * imp });
      Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.6);
    }
  };
  hero.addEventListener("pointerdown", onDown);

  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = container.clientWidth;
      H = container.clientHeight;
      makeWalls();
    }, 150);
  });
  ro.observe(container);

  const timers: ReturnType<typeof setTimeout>[] = [];

  return {
    launch(n) {
      if (reduced) return;
      const left = Math.random() < 0.5;
      for (let k = 0; k < n; k++) {
        timers.push(
          setTimeout(() => {
            const s = randomSize();
            const el = makeEl(MARK, s, s);
            const x = left ? s / 2 + 10 : W - s / 2 - 10;
            const y = H * 0.55 + Math.random() * H * 0.15;
            const body = makeBody(x, y, s, s);
            const sp = 30 + Math.random() * 10;
            Body.setVelocity(body, { x: left ? sp : -sp, y: -(15 + Math.random() * 10) });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 1);
            Composite.add(engine.world, body);
            items.push({ el, body, w: s, h: s, launched: true });
          }, k * 90),
        );
      }
    },
    clearLaunched() {
      const gone = items.filter((i) => i.launched);
      if (!gone.length) return;
      Composite.remove(
        engine.world,
        gone.map((i) => i.body),
      );
      gone.forEach((i) => i.el.remove());
      items = items.filter((i) => !i.launched);
    },
    stop() {
      timers.forEach(clearTimeout);
      ro.disconnect();
      clearTimeout(resizeTimer);
      hero.removeEventListener("pointerdown", onDown);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      container.innerHTML = "";
    },
  };
}

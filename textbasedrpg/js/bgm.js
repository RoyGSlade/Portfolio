// bgm.js
let bgm;

export function initBgm(path = 'sounds/LostInSpace.mp3') {
  if (bgm) return bgm; // singleton
  bgm = new Audio(path);
  bgm.loop = true;
  bgm.volume = 0.4; // start softer
  return bgm;
}

export function startBgm(path = 'sounds/LostInSpace.mp3') {
  if (bgm) return;                 // already playing/initialized
  bgm = new Audio(path);
  bgm.loop = true;
  bgm.volume = 0.35;
  bgm.play().catch(() => {});      // should succeed because inventory click is a user gesture
}

export function stopBgm() { bgm?.pause(); }
export function setVolume(v) { if (bgm) bgm.volume = v; }

// Optional fade helper
export function fadeTo(target = 0.4, ms = 1000) {
  if (!bgm) return;
  const steps = 30;
  const start = bgm.volume;
  let i = 0;
  const tick = setInterval(() => {
    i++;
    bgm.volume = start + (target - start) * (i / steps);
    if (i >= steps) clearInterval(tick);
  }, ms / steps);
}

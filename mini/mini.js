document.documentElement.classList.remove('no-js');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
// Layout viewport size. On iOS innerWidth/innerHeight follow the visual
// viewport, so they shrink while pinch-zoomed and grow as Safari's toolbar
// tucks away; the pinned sections are sized in svh, so measure what CSS sees.
const root = document.documentElement;
const viewW = () => root.clientWidth;
const viewH = () => root.clientHeight;

// Split headings into words so each can rise out of its own mask. Line breaks
// and inline markup are kept; screen readers get the heading's text once.
document.querySelectorAll('.split').forEach(heading => {
  heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
  let index = 0;
  const walk = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(' '); continue; }
          const word = document.createElement('span');
          word.className = 'w';
          word.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.textContent = part;
          inner.style.setProperty('--i', index++);
          word.append(inner);
          frag.append(word);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    }
  };
  walk(heading);
  heading.classList.add('is-split');
});

// Fade and rise once as elements enter the viewport.
const revealer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealer.unobserve(entry.target);
  }
}, {rootMargin:'0px 0px -8% 0px', threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

// Numbers count up the first time they're seen.
const counter = new IntersectionObserver(entries => {
  for (const {target, isIntersecting} of entries) {
    if (!isIntersecting) continue;
    counter.unobserve(target);
    const to = Number(target.dataset.count);
    if (!to || reducedMotion.matches) continue;
    const start = performance.now();
    const step = now => {
      const t = clamp((now - start) / 1400);
      target.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}, {threshold:.6});
document.querySelectorAll('[data-count]').forEach(el => counter.observe(el));

// Frame sequences rendered by the Blender pipeline (the hero turntable).
// Only the first frame loads up front; the rest stream in coarse-to-fine once
// the page itself has finished loading, and the canvas crossfades between
// neighbouring frames, so a few dozen frames scrub smoothly.
const pageLoaded = new Promise(resolve => {
  if (document.readyState === 'complete') resolve();
  else addEventListener('load', resolve, {once:true});
}).then(() => new Promise(resolve => {
  if (window.requestIdleCallback) requestIdleCallback(resolve, {timeout:1500});
  else setTimeout(resolve, 400);
}));

class Sequence {
  // Small windows load the lighter -sm set when there is one; phones and
  // retina screens get the full-size frames so the product stays sharp.
  // The render's margins are wide, so at the end of the turn the canvas is
  // far wider than the product (the hero's endBox): on a phone it overflows
  // the screen about twice over, and that width is what the frames must fill.
  static async load(canvas) {
    const full = canvas.dataset.seq;
    const need = Math.min(viewW() * .84 / .44, viewH() * .6 / .64 * 4 / 3) * (devicePixelRatio || 1);
    for (const base of need <= 1300 ? [`${full}-sm`, full] : [full]) {
      const response = await fetch(`${base}.json`).catch(() => null);
      if (response?.ok) return new Sequence(canvas, base, await response.json());
    }
    throw new Error(`missing ${full}.json`);
  }
  constructor(canvas, base, manifest) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingQuality = 'high';
    this.count = manifest.frames;
    this.images = new Array(this.count);
    this.drawn = '';
    this.target = 0;
    this.base = base;
    canvas.width = manifest.width;
    canvas.height = manifest.height;
    const order = [this.count - 1];
    for (const stride of [8, 4, 2, 1]) {
      for (let i = 0; i < this.count; i += stride) if (!order.includes(i)) order.push(i);
    }
    this.ready = this.fetch(order);
  }
  frameUrl(i) { return `${this.base}-${String(i).padStart(3, '0')}.webp`; }
  async fetch(order) {
    await this.loadFrame(0);
    this.draw(this.target, true);
    await pageLoaded;
    const queue = order.filter(i => i !== 0);
    const worker = async () => {
      while (queue.length) {
        await this.loadFrame(queue.shift());
        this.draw(this.target, true);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  }
  loadFrame(i) {
    return new Promise(resolve => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { this.images[i] = img; this.onFrame?.(i); resolve(); };
      img.onerror = resolve;
      img.src = this.frameUrl(i);
    });
  }
  // Where the product sits in frame i, as fractions of the frame, measured
  // from the frame's alpha (the soft contact shadow is ignored).
  bounds(i) {
    if (this.boxes?.[i]) return this.boxes[i];
    const img = this.images[i];
    if (!img) return null;
    const w = Math.max(1, Math.round(img.naturalWidth / 8));
    const h = Math.max(1, Math.round(img.naturalHeight / 8));
    const probe = document.createElement('canvas');
    probe.width = w;
    probe.height = h;
    const ctx = probe.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(img, 0, 0, w, h);
    let data;
    try { data = ctx.getImageData(0, 0, w, h).data; } catch { return null; }
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] < 128) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return null;
    (this.boxes ||= {})[i] = {x0: x0 / w, x1: (x1 + 1) / w, y0: y0 / h, y1: (y1 + 1) / h};
    return this.boxes[i];
  }
  nearest(i) {
    for (let d = 0; d < this.count; d++) {
      if (this.images[i - d]) return i - d;
      if (this.images[i + d]) return i + d;
    }
    return -1;
  }
  // Draw progress p: blend the two frames either side of it when both have
  // loaded, otherwise show the nearest frame that has. A blend of two angles
  // is soft, so once scrolling pauses the canvas settles on one frame.
  draw(p, force = false) {
    this.target = p;
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.paint(Math.round(clamp(this.target) * (this.count - 1)) / (this.count - 1)), 140);
    this.paint(p, force);
  }
  paint(p, force = false) {
    const f = clamp(p) * (this.count - 1);
    const lo = Math.floor(f);
    const hi = Math.min(lo + 1, this.count - 1);
    const mix = f - lo;
    let a = lo, b = hi, t = mix;
    if (!(this.images[lo] && this.images[hi])) {
      a = b = this.nearest(Math.round(f));
      t = 0;
      if (a < 0) return;
    }
    const key = `${a}:${b}:${t.toFixed(2)}`;
    if (key === this.drawn && !force) return;
    this.drawn = key;
    const {width, height} = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.globalAlpha = 1;
    this.ctx.drawImage(this.images[a], 0, 0, width, height);
    if (t > .01 && b !== a) {
      this.ctx.globalAlpha = t;
      this.ctx.drawImage(this.images[b], 0, 0, width, height);
      this.ctx.globalAlpha = 1;
    }
  }
}

// One scroll loop drives everything scroll-linked. [data-scroll] elements get
// --p from 0 (bottom edge entering) to 1 (top edge leaving); [data-pin]
// sections get --p across the distance they stay pinned.
const scrollers = [...document.querySelectorAll('[data-scroll]')];
const pinned = [...document.querySelectorAll('[data-pin]')];
const pinHandlers = new Map();
function viewProgress(el) {
  const box = el.getBoundingClientRect();
  const vh = viewH();
  return clamp((vh - box.top) / (vh + box.height));
}
function pinProgress(el) {
  const box = el.getBoundingClientRect();
  const travel = box.height - viewH();
  return travel > 0 ? clamp(-box.top / travel) : 0;
}

const header = document.querySelector('.site-header');
const bar = document.querySelector('.request-bar');
const hero = document.querySelector('.hero');
const closing = document.querySelector('.closing');
const heroActions = document.querySelector('.hero .actions');
const navLinks = [...document.querySelectorAll('.navlinks a')];
const navTargets = navLinks.map(a => document.querySelector(a.getAttribute('href')));
const navToggle = document.querySelector('.nav-toggle');
function setMenu(open) {
  header.classList.toggle('is-menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) header.classList.remove('is-hidden');
}
const menuOpen = () => header.classList.contains('is-menu-open');
navToggle.addEventListener('click', () => setMenu(!menuOpen()));
navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen()) { setMenu(false); navToggle.focus(); } });
addEventListener('pointerdown', e => { if (menuOpen() && !header.contains(e.target)) setMenu(false); });
matchMedia('(min-width:1001px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
let lastY = scrollY;
let travel = 0;
let frameQueued = false;

function onFrame() {
  frameQueued = false;
  const y = scrollY;
  const vh = viewH();
  if (!reducedMotion.matches) {
    for (const el of scrollers) el.style.setProperty('--p', viewProgress(el).toFixed(4));
    for (const el of pinned) {
      const p = pinProgress(el);
      el.style.setProperty('--p', p.toFixed(4));
      pinHandlers.get(el)?.(p);
    }
  }
  header.classList.toggle('is-scrolled', y > 8);
  // Tuck the header away while reading down; bring it back on a deliberate
  // scroll up. Movement is summed per direction so the tiny steps at the end
  // of an iOS fling, and the bounce past either end of the page, can't flip it.
  const maxY = root.scrollHeight - vh;
  if (y >= 0 && y <= maxY) {
    const dy = y - lastY;
    travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
    if (y <= vh) header.classList.remove('is-hidden');
    else if (travel > 24 && !menuOpen()) header.classList.add('is-hidden');
    else if (travel < -24) header.classList.remove('is-hidden');
    lastY = y;
  }
  // The floating buy bar appears once the hero's buttons have gone.
  const heroGone = hero.classList.contains('has-seq')
    ? pinProgress(hero) > .3 || hero.getBoundingClientRect().bottom < vh
    : heroActions.getBoundingClientRect().bottom < 0;
  // It steps aside while the day section is pinned, so it never covers the
  // rail, and once the closing section with its own Buy button comes into view,
  // so the footer needs no room reserved for it.
  const dayBox = day.getBoundingClientRect();
  const dayPinned = dayBox.top <= 1 && dayBox.bottom >= vh - 1;
  const atClosing = closing.getBoundingClientRect().top < vh * .85;
  bar.classList.toggle('is-visible', heroGone && !dayPinned && !atClosing);
  updateDay();
  updateHeaderTone();
  // Highlight the nav link for the section in view.
  const mid = vh * .4;
  navLinks.forEach((link, i) => {
    const box = navTargets[i]?.getBoundingClientRect();
    link.classList.toggle('is-current', !!box && box.top <= mid && box.bottom >= mid);
  });
}
const requestFrame = () => {
  if (!frameQueued) { frameQueued = true; requestAnimationFrame(onFrame); }
};
addEventListener('scroll', requestFrame, {passive:true});
addEventListener('resize', requestFrame);

// Over dark sections the header switches to its dark treatment.
const toneSections = [...document.querySelectorAll('.day, .closing')];
function updateHeaderTone() {
  const probe = 40;
  header.classList.toggle('is-dark', toneSections.some(section => {
    const box = section.getBoundingClientRect();
    const dark = !section.classList.contains('day') || section.classList.contains('is-night');
    return dark && box.top <= probe && box.bottom >= probe;
  }));
}

// Hero: pin and scrub the turntable once its manifest loads; otherwise keep
// the looping film. Reduced motion keeps the film's poster frame.
const heroCanvas = document.querySelector('.hero-seq');
if (!reducedMotion.matches) {
  Sequence.load(heroCanvas).then(seq => {
    hero.classList.add('has-seq');
    pinned.includes(hero) || pinned.push(hero);
    const stage = hero.querySelector('.hero-stage');
    const head = hero.querySelector('.hero-head');
    const stats = hero.querySelector('.hero-stats');
    const aspect = heroCanvas.width / heroCanvas.height;
    // Start: the room under the headline. End: mini, facing you, grouped with
    // the reveal line above it between the nav and the stats. The frame keeps
    // its aspect and is capped by the width. Both are measured inside the
    // sticky box itself, which clips the stage, so mini can never be placed
    // past its bottom edge.
    const sticky = hero.querySelector('.hero-sticky');
    const reveal = hero.querySelector('.hero-reveal');
    const box = (top, bottom) => {
      const h = Math.max(120, Math.min(bottom - top, sticky.clientWidth / aspect));
      return {top: top + (bottom - top - h) / 2, h};
    };
    // The product's own bounds in the last frame, so the empty margins of the
    // render don't count: until it loads, use the rendered face-on framing.
    const last = seq.count - 1;
    const fallback = {x0: .28, x1: .72, y0: .24, y1: .88};
    seq.onFrame = i => { if (i === last) requestFrame(); };
    const endBox = room => {
      const b = seq.bounds(last) || fallback;
      const bw = b.x1 - b.x0;
      const bh = b.y1 - b.y0;
      const top = 72;
      const bottom = room - stats.offsetHeight;
      const gap = clamp(room * .035, 14, 36);
      const title = reveal.offsetHeight;
      const h = Math.max(120, Math.min(
        (bottom - top - title - gap * 2) / bh,
        sticky.clientWidth * .84 / (aspect * bw),
        room * .6 / bh,
      ));
      const group = title + gap + h * bh;
      const groupTop = top + Math.max(0, (bottom - top - group) / 2);
      return {reveal: groupTop, top: groupTop + title + gap - b.y0 * h, h};
    };
    pinHandlers.set(hero, p => {
      seq.draw(clamp((p - .04) / .72));
      const room = sticky.clientHeight;
      const start = box(head.offsetTop + head.offsetHeight + 12, room - 16);
      const end = endBox(room);
      const t = clamp((p - .12) / .55);
      const e = t * t * (3 - 2 * t);
      const h = start.h + (end.h - start.h) * e;
      stage.style.setProperty('--st', `${start.top + (end.top - start.top) * e}px`);
      stage.style.setProperty('--sh', `${h}px`);
      stage.style.setProperty('--sw', `${h * aspect}px`);
      reveal.style.setProperty('--rt', `${end.reveal}px`);
    });
    requestFrame();
  }).catch(() => videoWatcher.observe(hero.querySelector('.hero-video')));
}

// Videos load when they approach the viewport and pause off-screen. Visitors
// who prefer reduced motion keep the poster frames.
const videoWatcher = new IntersectionObserver(entries => {
  for (const {target:video, isIntersecting} of entries) {
    if (isIntersecting && getComputedStyle(video).display !== 'none') {
      if (!video.src) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
}, {rootMargin:'200px 0px', threshold:.05});
if (!reducedMotion.matches) {
  // The hero film is only a fallback: it's watched once the turntable fails.
  document.querySelectorAll('.lazy-video:not(.hero-video)').forEach(video => videoWatcher.observe(video));
}

// The grid, decoded: a flipbook of catalog renders that lights rows, then
// columns, then fills today. Each state is tagged with what it teaches, so the
// matching habit or day label, and the matching line of the key, light with
// it. Labels are pinned to the grid geometry the render recorded.
const weekFigure = document.querySelector('.week-figure');
const weekFrame = weekFigure.querySelector('.week-frame');
const weekFlip = weekFrame.querySelector('.week-flip');
const weekOverlay = weekFrame.querySelector('.week-overlay');
const weekCaption = weekFigure.querySelector('.week-caption');
const weekKey = document.querySelector('.week .key');
const weekDays = [...weekOverlay.querySelectorAll('.week-days span')];
const weekHabits = [...weekOverlay.querySelectorAll('.week-habits span')];
const weekKeyRows = [...weekKey.querySelectorAll('[data-focus]')];
const CAPTIONS = {
  row: 'Each row is a habit',
  col: 'Each column is a day',
  history: 'A light is a day you did it',
  fill: 'Today fills in as you log',
  done: 'Your week, at a glance',
};
let explain = null;
let explainTimer;
let explainAt = 0;
// The finished week is in the markup as a poster; the loop fades in over it.
let explainOn = weekFlip.querySelector('img');
let explainLayer = 1;
function pinWeekLabels({grid, body}) {
  const px = (grid.columns[7] - grid.columns[0]) / 7;
  const py = (grid.rows[7] - grid.rows[0]) / 7;
  const gx = grid.columns[0] - px / 2;
  const gy = grid.rows[0] - py / 2;
  const gw = px * 8;
  const gh = py * 8;
  const pct = v => `${(v * 100).toFixed(3)}%`;
  weekFrame.style.setProperty('--gx', pct(gx));
  weekFrame.style.setProperty('--gy', pct(gy));
  weekFrame.style.setProperty('--gw', pct(gw));
  weekFrame.style.setProperty('--gh', pct(gh));
  // Clear the case by a little under half a grid step.
  const top = body ? body.y[0] : gy - py;
  const left = body ? body.x[0] : gx - px;
  weekFrame.style.setProperty('--dg', pct((gy - top + py * .4) / gh));
  weekFrame.style.setProperty('--hg', pct((gx - left + px * .4) / gw));
}
function setExplainFocus(focus = '') {
  const [kind, value] = focus.split(':');
  const n = Number(value);
  weekOverlay.classList.toggle('has-focus', kind === 'row' || kind === 'col' || kind === 'fill');
  weekHabits.forEach((el, i) => el.classList.toggle('is-focus', (kind === 'row' || kind === 'fill') && i === n));
  weekDays.forEach((el, i) => el.classList.toggle('is-focus',
    (kind === 'col' && i === n) || (kind === 'fill' && i === weekDays.length - 1)));
  weekKey.classList.toggle('has-focus', kind in CAPTIONS && kind !== 'done');
  weekKeyRows.forEach(el => el.classList.toggle('is-focus', el.dataset.focus === kind));
  const text = CAPTIONS[kind] || '';
  if (weekCaption.dataset.text === text) return;
  weekCaption.dataset.text = text;
  weekCaption.classList.add('is-changing');
  setTimeout(() => {
    weekCaption.textContent = text;
    weekCaption.classList.remove('is-changing');
  }, 180);
}
// Fade the next state in over the current one, then drop the old one, so the
// case never goes see-through mid-fade.
function showExplainState(state) {
  const next = explain.images[state];
  if (next === explainOn) return;
  const prev = explainOn;
  explainOn = next;
  next.style.zIndex = ++explainLayer;
  next.classList.add('is-on');
  if (prev) {
    prev.classList.replace('is-on', 'is-under');
    setTimeout(() => prev.classList.remove('is-under'), 300);
  }
}
function playExplain() {
  clearTimeout(explainTimer);
  const [state, ms, focus] = explain.timeline[explainAt];
  showExplainState(state);
  setExplainFocus(focus);
  explainAt = (explainAt + 1) % explain.timeline.length;
  explainTimer = setTimeout(playExplain, ms);
}
new IntersectionObserver((entries, observer) => {
  if (!entries[0].isIntersecting) return;
  observer.disconnect();
  const base = weekFrame.dataset.explain;
  fetch(`${base}.json`).then(r => r.ok ? r.json() : Promise.reject()).then(async manifest => {
    const images = [];
    for (let i = 0; i < manifest.states; i++) {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.width = manifest.width;
      img.height = manifest.height;
      img.src = `${base}-${String(i).padStart(2, '0')}.webp`;
      images.push(img);
    }
    // Swap over once the frames the loop opens on have decoded.
    await Promise.all(images.slice(0, 10).map(img => img.decode()));
    weekFlip.append(...images);
    explain = {images, timeline: manifest.timeline_ms};
    pinWeekLabels(manifest);
    if (reducedMotion.matches) {
      // Hold the finished week, with no label singled out.
      showExplainState(explain.timeline[explain.timeline.length - 1][0]);
      setExplainFocus('done');
      return;
    }
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) playExplain();
      else clearTimeout(explainTimer);
    }, {threshold:.35}).observe(weekFrame);
  }).catch(() => {});
}, {rootMargin:'900px 0px'}).observe(weekFrame);

// App to mini: fill today's column one habit at a time while visible.
const syncStage = document.querySelector('.sync-stage');
const syncStatus = document.querySelector('#sync-status');
const syncMessages = [
  'Watch today’s column fill, one habit at a time.',
  '1 of 5 habits done today.',
  '2 of 5 habits done today.',
  '3 of 5 habits done today.',
  '4 of 5 habits done today.',
  'All five done. Today’s column is full.',
];
let syncStep = 0;
let syncTimer;
function setSync(step) {
  syncStep = step;
  syncStage.dataset.state = String(step);
  syncStatus.textContent = syncMessages[step];
}
function runSync(delay) {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    setSync(syncStep === 5 ? 0 : syncStep + 1);
    runSync(syncStep === 5 ? 2200 : syncStep === 0 ? 900 : 1200);
  }, delay);
}
if (reducedMotion.matches) {
  setSync(5);
} else {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) runSync(700);
    else clearTimeout(syncTimer);
  }, {threshold:.45}).observe(syncStage);
}

// Morning to midnight: the section pins while mini steps through its day.
// Scroll progress picks the mode, fills the rail and blends the section's
// colour from morning to night; each time of day holds before it changes.
const day = document.querySelector('.day');
const dayStage = day.querySelector('.day-stage');
const dayPanels = [...day.querySelectorAll('.day-panel')];
const dayStops = [...day.querySelectorAll('.day-stop')];
const dayNow = day.querySelector('.day-now b');
const DAY_COLOURS = [
  [241, 237, 228], // 08:00 morning paper
  [236, 240, 244], // 13:00 cool daylight
  [44, 37, 52],    // 21:00 dusk
  [13, 12, 16],    // 23:00 night
];
// Until the day stills are rendered, fall back to the evening set.
document.querySelectorAll('.mode-visual').forEach(img => {
  const fallback = () => {
    if (img.dataset.fallback && img.getAttribute('src') !== img.dataset.fallback) {
      img.src = img.dataset.fallback;
    }
  };
  img.addEventListener('error', fallback);
  if (img.complete && !img.naturalWidth && img.getAttribute('src')) fallback();
});
let dayIndex = -1;
function setDayMode(index) {
  if (index === dayIndex) return;
  dayIndex = index;
  const panel = dayPanels[index];
  dayStage.dataset.mode = panel.dataset.mode;
  dayNow.textContent = panel.dataset.time;
  dayPanels.forEach((p, i) => p.classList.toggle('is-active', i === index));
  dayStops.forEach((stop, i) => {
    stop.classList.toggle('is-active', i === index);
    stop.setAttribute('aria-selected', String(i === index));
  });
  panel.dataset.mode === 'clock' ? playClock() : stopClock();
}
function updateDay() {
  const p = pinProgress(day);
  const pos = clamp(p * DAY_COLOURS.length, 0, DAY_COLOURS.length - .001);
  setDayMode(Math.floor(pos));
  day.style.setProperty('--rail', p.toFixed(4));
  // Hold each colour for most of its step, then change over to the next.
  const i = Math.floor(pos);
  const last = i >= DAY_COLOURS.length - 1;
  const held = last ? 0 : clamp((pos - i - .72) / .28);
  const eased = held * held * (3 - 2 * held);
  const next = DAY_COLOURS[last ? i : i + 1];
  const rgb = DAY_COLOURS[i].map((c, k) => Math.round(c + (next[k] - c) * eased));
  day.style.setProperty('--day-bg', `rgb(${rgb})`);
  day.classList.toggle('is-night', (rgb[0] * .3 + rgb[1] * .59 + rgb[2] * .11) < 120);
}
// The rail's stops jump to their time of day.
dayStops.forEach((stop, i) => stop.addEventListener('click', () => {
  const travel = day.offsetHeight - viewH();
  const top = day.getBoundingClientRect().top + scrollY;
  scrollTo({top: top + travel * (i + .5) / dayStops.length, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
}));

// The clock is a flipbook of transparent stills, so it sits on any colour.
const clockImage = day.querySelector('.mode-visual[data-mode="clock"]');
const clockBase = clockImage.getAttribute('src').replace(/-00\.webp.*$/, '');
let clockFlipbook = null;
let clockTimer;
// Its frames only download once the day section is close.
new IntersectionObserver((entries, observer) => {
  if (!entries[0].isIntersecting) return;
  observer.disconnect();
  fetch(`${clockBase}.json`).then(r => r.ok ? r.json() : Promise.reject()).then(manifest => {
    const frames = [];
    for (let i = 0; i < manifest.states; i++) frames.push(`${clockBase}-${String(i).padStart(2, '0')}.webp`);
    frames.forEach(src => { new Image().src = src; });
    clockImage.src = frames[0];
    clockFlipbook = {frames, timeline: manifest.timeline_ms};
    if (dayPanels[dayIndex]?.dataset.mode === 'clock') playClock();
  }).catch(() => {});
}, {rootMargin:'1200px 0px'}).observe(day);
function playClock() {
  stopClock();
  if (!clockFlipbook || reducedMotion.matches) return;
  let at = 0;
  const tick = () => {
    const [state, ms] = clockFlipbook.timeline[at];
    clockImage.src = clockFlipbook.frames[state];
    at = (at + 1) % clockFlipbook.timeline.length;
    clockTimer = setTimeout(tick, ms);
  };
  tick();
}
function stopClock() { clearTimeout(clockTimer); }

// Finish and angle viewer.
const views = [
  {stem:'front', label:'Front'},
  {stem:'front-left', label:'Left'},
  {stem:'front-right', label:'Right'},
];
const galleryImage = document.querySelector('#gallery-image');
// The asset folder comes from the markup, so the viewer works wherever the
// page is served from.
const galleryBase = galleryImage.dataset.base;
const finishes = {
  white: {label:'White', path:galleryBase},
  sakura: {label:'Sakura', path:`${galleryBase}sakura/`},
  'blue-grey': {label:'Blue grey', path:`${galleryBase}blue-grey/`},
};
const viewOptions = document.querySelector('#view-options');
let viewIndex = 0;
let finish = 'white';
function showView(index) {
  viewIndex = (index + views.length) % views.length;
  const view = views[viewIndex];
  const src = `${finishes[finish].path}${view.stem}.webp`;
  viewOptions.querySelectorAll('button').forEach((button, i) => {
    button.classList.toggle('is-active', i === viewIndex);
    button.setAttribute('aria-pressed', String(i === viewIndex));
  });
  if (galleryImage.getAttribute('src') === src) return;
  // Swap once the next image has decoded, so the crossfade never flashes.
  const next = new Image();
  next.src = src;
  galleryImage.classList.add('is-swapping');
  Promise.all([next.decode().catch(() => {}), new Promise(r => setTimeout(r, 180))]).then(() => {
    galleryImage.src = src;
    galleryImage.alt = `${view.label} view of Ritlum mini in ${finishes[finish].label}`;
    galleryImage.classList.remove('is-swapping');
  });
}
views.forEach((view, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'view-option';
  button.textContent = view.label;
  button.addEventListener('click', () => showView(index));
  viewOptions.append(button);
});
document.querySelectorAll('.finish-option').forEach(button => {
  button.addEventListener('click', () => {
    finish = button.dataset.finish;
    document.querySelectorAll('.finish-option').forEach(option => {
      const active = option === button;
      option.classList.toggle('is-active', active);
      option.setAttribute('aria-pressed', String(active));
    });
    showView(viewIndex);
  });
});
document.querySelector('.gallery-arrow.prev').addEventListener('click', () => showView(viewIndex - 1));
document.querySelector('.gallery-arrow.next').addEventListener('click', () => showView(viewIndex + 1));
showView(0);

document.querySelector('#year').textContent = new Date().getFullYear();
onFrame();

// Notify-me form: same Supabase waitlist table as the main page.
const notifyForm = document.querySelector('#notify');
if (notifyForm) {
  const SUPABASE_URL = 'https://vryollgtsaiktxyidusb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_qJAJ33itN-OewOspeW24dA_gm5A7Jck';
  const msg = notifyForm.querySelector('.notify-msg');
  const btn = notifyForm.querySelector('button');
  const input = notifyForm.querySelector('input');
  notifyForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !input.checkValidity()) {
      msg.className = 'notify-msg is-error';
      msg.textContent = 'Please enter a valid email address.';
      return;
    }
    btn.disabled = true;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email }),
      });
      // 409 = this email already joined.
      if (!res.ok && res.status !== 409) throw new Error(res.status);
      input.value = '';
      msg.className = 'notify-msg is-ok';
      msg.textContent = 'You’re on the list. We’ll email you at launch.';
    } catch {
      msg.className = 'notify-msg is-error';
      msg.textContent = 'Something went wrong. Please try again.';
    }
    btn.disabled = false;
  });
}

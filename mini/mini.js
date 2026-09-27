document.documentElement.classList.remove('no-js');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

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
  // Small windows and phones load the lighter -sm set when there is one;
  // retina desktops get the full-size frames so the product stays sharp.
  static async load(canvas) {
    const full = canvas.dataset.seq;
    const need = Math.min(innerWidth, innerHeight * 4 / 3) * (devicePixelRatio || 1);
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
      img.onload = () => { this.images[i] = img; resolve(); };
      img.onerror = resolve;
      img.src = this.frameUrl(i);
    });
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
  return clamp((innerHeight - box.top) / (innerHeight + box.height));
}
function pinProgress(el) {
  const box = el.getBoundingClientRect();
  const travel = box.height - innerHeight;
  return travel > 0 ? clamp(-box.top / travel) : 0;
}

const header = document.querySelector('.site-header');
const bar = document.querySelector('.request-bar');
const hero = document.querySelector('.hero');
const heroActions = document.querySelector('.hero .actions');
const navLinks = [...document.querySelectorAll('.navlinks a')];
const navTargets = navLinks.map(a => document.querySelector(a.getAttribute('href')));
let lastY = scrollY;
let frameQueued = false;

function onFrame() {
  frameQueued = false;
  const y = scrollY;
  if (!reducedMotion.matches) {
    for (const el of scrollers) el.style.setProperty('--p', viewProgress(el).toFixed(4));
    for (const el of pinned) {
      const p = pinProgress(el);
      el.style.setProperty('--p', p.toFixed(4));
      pinHandlers.get(el)?.(p);
    }
  }
  header.classList.toggle('is-scrolled', y > 8);
  // Tuck the header away while reading down; bring it back on any scroll up.
  header.classList.toggle('is-hidden', y > innerHeight && y > lastY + 2);
  if (y < lastY - 2 || y <= innerHeight) header.classList.remove('is-hidden');
  lastY = y;
  // The floating buy bar appears once the hero's buttons have gone.
  const heroGone = hero.classList.contains('has-seq')
    ? pinProgress(hero) > .3 || hero.getBoundingClientRect().bottom < innerHeight
    : heroActions.getBoundingClientRect().bottom < 0;
  // It steps aside while the day section is pinned, so it never covers the rail.
  const dayBox = day.getBoundingClientRect();
  bar.classList.toggle('is-visible', heroGone && !(dayBox.top <= 1 && dayBox.bottom >= innerHeight - 1));
  updateDay();
  updateHeaderTone();
  // Highlight the nav link for the section in view.
  const mid = innerHeight * .4;
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
    // Start: the room under the headline. End: the room between the nav and
    // the stats. The frame keeps its aspect and is capped by the width.
    const box = (top, bottom) => {
      const h = Math.max(120, Math.min(bottom - top, innerWidth / aspect));
      return {top: top + (bottom - top - h) / 2, h};
    };
    pinHandlers.set(hero, p => {
      seq.draw(clamp((p - .04) / .72));
      const start = box(head.offsetTop + head.offsetHeight + 12, innerHeight - 16);
      const end = box(72, innerHeight - stats.offsetHeight + 8);
      const t = clamp((p - .12) / .55);
      const e = t * t * (3 - 2 * t);
      const h = start.h + (end.h - start.h) * e;
      stage.style.setProperty('--st', `${start.top + (end.top - start.top) * e}px`);
      stage.style.setProperty('--sh', `${h}px`);
      stage.style.setProperty('--sw', `${h * aspect}px`);
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
  const travel = day.offsetHeight - innerHeight;
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

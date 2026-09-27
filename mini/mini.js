document.documentElement.classList.remove('no-js');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Sticky header gains a frosted background once the page moves.
const header = document.querySelector('.site-header');
const bar = document.querySelector('.request-bar');
const heroActions = document.querySelector('.hero .actions');
let queued = false;
function onScroll() {
  header.classList.toggle('is-scrolled', scrollY > 8);
  // The floating buy bar appears once the hero buttons have scrolled away.
  bar.classList.toggle('is-visible', heroActions.getBoundingClientRect().bottom < 0);
  queued = false;
}
addEventListener('scroll', () => {
  if (!queued) { queued = true; requestAnimationFrame(onScroll); }
}, {passive:true});
onScroll();
// Over the evening sections the header switches to its dark treatment.
const darkSections = [...document.querySelectorAll('.modes, .closing')];
function updateHeaderTone() {
  const probe = header.offsetHeight / 2;
  header.classList.toggle('is-dark', darkSections.some(section => {
    const box = section.getBoundingClientRect();
    return box.top <= probe && box.bottom >= probe;
  }));
}
addEventListener('scroll', () => requestAnimationFrame(updateHeaderTone), {passive:true});
updateHeaderTone();

// Fade sections in once as they enter the viewport.
const revealer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealer.unobserve(entry.target);
  }
}, {rootMargin:'0px 0px -8% 0px', threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

// Videos load when they approach the viewport and pause off-screen. Visitors
// who prefer reduced motion keep the poster frames.
const videoWatcher = new IntersectionObserver(entries => {
  for (const {target:video, isIntersecting} of entries) {
    if (isIntersecting) {
      if (!video.src) video.src = video.dataset.src;
      if (!video.closest('.modes-stage') || video.closest('.modes-stage').dataset.mode === video.dataset.mode) {
        video.play().catch(() => {});
      }
    } else {
      video.pause();
    }
  }
}, {rootMargin:'200px 0px', threshold:.05});
if (!reducedMotion.matches) {
  document.querySelectorAll('.lazy-video').forEach(video => videoWatcher.observe(video));
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

// Morning to midnight: tabs cycle through mini's day while in view.
const modeStage = document.querySelector('.modes-stage');
const modeTabs = [...document.querySelectorAll('.mode-tab')];
const modeList = document.querySelector('.mode-tabs');
const modeClock = document.querySelector('.mode-clock');
const MODE_MS = 6000;
let modeIndex = 0;
let modeTimer;
let modeVisible = false;
let modePaused = false;
modeList.style.setProperty('--mode-ms', `${MODE_MS}ms`);
function showMode(index) {
  modeIndex = (index + modeTabs.length) % modeTabs.length;
  const tab = modeTabs[modeIndex];
  modeStage.dataset.mode = tab.dataset.mode;
  modeClock.textContent = tab.dataset.time;
  modeTabs.forEach(t => {
    const active = t === tab;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    // Restart the progress line on the newly active tab.
    const line = t.querySelector('.mode-progress');
    line.style.animation = 'none';
    void line.offsetWidth;
    line.style.animation = '';
  });
  modeStage.querySelectorAll('video').forEach(video => {
    if (video.dataset.mode === tab.dataset.mode && modeVisible && !reducedMotion.matches) {
      if (!video.src) video.src = video.dataset.src;
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
  scheduleMode();
}
function scheduleMode() {
  clearTimeout(modeTimer);
  if (!modeVisible || modePaused || reducedMotion.matches) return;
  modeTimer = setTimeout(() => showMode(modeIndex + 1), MODE_MS);
}
modeTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showMode(index));
  tab.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    showMode(modeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    modeTabs[modeIndex].focus();
  });
});
// Hovering or focusing the list holds the current moment.
const holdModes = paused => {
  modePaused = paused;
  modeList.classList.toggle('is-paused', paused);
  if (paused) clearTimeout(modeTimer);
  else scheduleMode();
};
modeList.addEventListener('pointerenter', () => holdModes(true));
modeList.addEventListener('pointerleave', () => holdModes(false));
modeList.addEventListener('focusin', () => holdModes(true));
modeList.addEventListener('focusout', () => holdModes(false));
new IntersectionObserver(entries => {
  modeVisible = entries[0].isIntersecting;
  if (modeVisible) showMode(modeIndex);
  else clearTimeout(modeTimer);
}, {threshold:.35}).observe(modeStage);

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

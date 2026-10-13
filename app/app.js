document.documentElement.classList.remove('no-js');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const root = document.documentElement;
const viewH = () => root.clientHeight;

document.querySelectorAll('.split').forEach(heading => {
  heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
  let index = 0;
  for (const child of [...heading.childNodes]) {
    if (child.nodeType !== Node.TEXT_NODE) continue;
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
  }
  heading.classList.add('is-split');
});

const revealer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealer.unobserve(entry.target);
  }
}, {rootMargin:'0px 0px -8% 0px', threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

const videoWatcher = new IntersectionObserver(entries => {
  for (const {target:video, isIntersecting} of entries) {
    if (isIntersecting) {
      if (!video.src) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
}, {rootMargin:'200px 0px', threshold:.05});
if (!reducedMotion.matches) document.querySelectorAll('.lazy-video').forEach(video => videoWatcher.observe(video));

const header = document.querySelector('.site-header');
const navLinks = [...document.querySelectorAll('.navlinks a')];
const navTargets = navLinks.map(a => a.hash && a.pathname === location.pathname ? document.querySelector(a.hash) : null);
const navToggle = document.querySelector('.nav-toggle');
const scrollers = [...document.querySelectorAll('[data-scroll]')];
const darkSections = [...document.querySelectorAll('.band, .closing')];
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
    for (const el of scrollers) {
      const box = el.getBoundingClientRect();
      el.style.setProperty('--p', clamp((vh - box.top) / (vh + box.height)).toFixed(4));
    }
  }
  header.classList.toggle('is-scrolled', y > 8);
  // Summed per direction so iOS fling tails and edge bounces can't flip it.
  const maxY = root.scrollHeight - vh;
  if (y >= 0 && y <= maxY) {
    const dy = y - lastY;
    travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
    if (y <= vh) header.classList.remove('is-hidden');
    else if (travel > 24 && !menuOpen()) header.classList.add('is-hidden');
    else if (travel < -24) header.classList.remove('is-hidden');
    lastY = y;
  }
  header.classList.toggle('is-dark', darkSections.some(section => {
    const box = section.getBoundingClientRect();
    return box.top <= 40 && box.bottom >= 40;
  }));
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
onFrame();

document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('a[href*="apps.apple.com"]').forEach(a => a.addEventListener('click', () => window.gtag?.('event', 'app_store_click', {transport_type: 'beacon'})));

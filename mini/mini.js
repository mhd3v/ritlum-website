const galleryViews = [
  {src:'../assets/mini/front.webp?v=neutral-white-1', label:'Front'},
  {src:'../assets/mini/front-left.webp?v=neutral-white-1', label:'Front left'},
  {src:'../assets/mini/front-right.webp?v=neutral-white-1', label:'Front right'},
];
const heroVideo = document.querySelector('.hero-video');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (heroVideo && !reducedMotion.matches) {
  heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-ready'), {once:true});
  heroVideo.src = heroVideo.dataset.src;
  heroVideo.play().catch(() => {});
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) heroVideo.play().catch(() => {});
    else heroVideo.pause();
  }, {threshold:.05}).observe(document.querySelector('.hero'));
}
const clockVideo = document.querySelector('.clock-video');
if (clockVideo && !reducedMotion.matches) {
  const clockObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!clockVideo.src) clockVideo.src = clockVideo.dataset.src;
      clockVideo.play().catch(() => {});
    } else {
      clockVideo.pause();
    }
  }, {rootMargin:'180px 0px', threshold:.05});
  clockObserver.observe(clockVideo);
}
const weekVideo = document.querySelector('.week-video');
if (weekVideo && !reducedMotion.matches) {
  weekVideo.addEventListener('playing', () => weekVideo.classList.add('is-ready'), {once:true});
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!weekVideo.src) weekVideo.src = weekVideo.dataset.src;
      weekVideo.play().catch(() => {});
    } else {
      weekVideo.pause();
    }
  }, {rootMargin:'160px 0px', threshold:.05}).observe(weekVideo);
}
const gallery = document.querySelector('#gallery');
const galleryImage = document.querySelector('#gallery-image');
const galleryDots = document.querySelector('#gallery-dots');
let galleryPosition = 0;
function showGalleryView(index) {
  galleryPosition = (index + galleryViews.length) % galleryViews.length;
  const view = galleryViews[galleryPosition];
  galleryImage.src = view.src;
  galleryImage.alt = `${view.label} view of Ritlum mini`;
  document.querySelector('#gallery-label').textContent = view.label;
  galleryDots.querySelectorAll('button').forEach((dot, i) => {
    dot.classList.toggle('active', i === galleryPosition);
    dot.setAttribute('aria-pressed', String(i === galleryPosition));
  });
}
galleryViews.forEach((view,index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-dot';
  button.setAttribute('aria-label', `Show ${view.label.toLowerCase()} view`);
  button.addEventListener('click', () => showGalleryView(index));
  galleryDots.append(button);
});
showGalleryView(0);
gallery.querySelector('.prev').addEventListener('click', () => showGalleryView(galleryPosition - 1));
gallery.querySelector('.next').addEventListener('click', () => showGalleryView(galleryPosition + 1));
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showGalleryView(galleryPosition + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
const phoneShell = document.querySelector('.phone-sync');
const phoneSource = document.querySelector('.phone-source');
const sizePhone = () => phoneSource.style.transform = `scale(${phoneShell.clientWidth / 400})`;
new ResizeObserver(sizePhone).observe(phoneShell);
sizePhone();
// Keep the checkout action available after the hero.
const bar = document.querySelector('.request-bar');
const hero = document.querySelector('.hero');
let queued = false;
function updateBar() {
  bar.hidden = hero.getBoundingClientRect().bottom > 0;
  queued = false;
}
addEventListener('scroll', () => {
  if (!queued) { queued = true; requestAnimationFrame(updateBar); }
}, {passive:true});
addEventListener('resize', updateBar);
updateBar();

document.querySelector("#year").textContent = new Date().getFullYear();

const galleryViews = [
  {src:'../assets/mini/front.webp', label:'Front'},
  {src:'../assets/mini/front-left.webp', label:'Front left'},
  {src:'../assets/mini/front-right.webp', label:'Front right'},
];
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
  document.querySelector('#gallery-index').textContent = `${String(galleryPosition + 1).padStart(2,'0')} / ${String(galleryViews.length).padStart(2,'0')}`;
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
// Keep the action available after the hero, then clear it when the actual
// request form is on screen. Native anchors also work without JavaScript.
const bar = document.querySelector('.request-bar');
const hero = document.querySelector('.hero');
const buy = document.querySelector('#buy');
let queued = false;
function updateBar() {
  bar.hidden = hero.getBoundingClientRect().bottom > 0 || buy.getBoundingClientRect().top < innerHeight;
  queued = false;
}
addEventListener('scroll', () => {
  if (!queued) { queued = true; requestAnimationFrame(updateBar); }
}, {passive:true});
addEventListener('resize', updateBar);
updateBar();

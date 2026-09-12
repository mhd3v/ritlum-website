// Fill today's column one habit at a time while this section is visible.
// Pause off-screen, and hold the complete state for reduced-motion visitors.
const MiniSyncDemo = () => {
  const [step, setStep] = React.useState(0);
  const stepRef = React.useRef(0);
  const visible = React.useRef(false);
  React.useEffect(() => {
    let timer;
    let framesReady = false;
    let disposed = false;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const schedule = (delay = 1050) => {
      clearTimeout(timer);
      if (!visible.current || !framesReady || motion.matches) return;
      timer = setTimeout(() => {
        stepRef.current = stepRef.current === 5 ? 0 : stepRef.current + 1;
        setStep(stepRef.current);
        schedule(stepRef.current === 5 ? 1800 : stepRef.current === 0 ? 700 : 1050);
      }, delay);
    };
    const observer = new IntersectionObserver(entries => {
      visible.current = entries[0].isIntersecting;
      if (visible.current && framesReady) schedule(800);
      else clearTimeout(timer);
    }, {threshold: .55});
    observer.observe(document.querySelector('.app-visual'));
    const trackerFrames = [...document.querySelectorAll('.tracker-sync img')];
    const prepareFrame = image => {
      if (typeof image.decode === 'function') return image.decode();
      if (image.complete) {
        return image.naturalWidth ? Promise.resolve() : Promise.reject();
      }
      return new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, {once: true});
        image.addEventListener('error', reject, {once: true});
      });
    };
    Promise.all(trackerFrames.map(prepareFrame))
      .then(() => {
        if (disposed) return;
        framesReady = true;
        if (visible.current) schedule(800);
      })
      .catch(() => {});
    if (motion.matches) {
      stepRef.current = 5;
      setStep(5);
    }
    return () => {disposed = true; clearTimeout(timer); observer.disconnect();};
  }, []);
  React.useEffect(() => {
    document.querySelector('.tracker-sync').dataset.state = String(step);
    document.querySelector('#demo-status').textContent = step === 5
      ? 'Five habits complete. Today’s column is full.'
      : step === 0
        ? 'Watch today’s column fill, one habit at a time.'
        : `${step} of 5 habits complete today.`;
  }, [step]);
  const ids = ['meditate', 'exercise', 'read', 'hydrate', 'journal'].slice(0, step);
  return <PhoneFrame width={400}><TodayScreen completedIds={ids} activeHabitId={step ? ids[step - 1] : null}/></PhoneFrame>;
};
ReactDOM.createRoot(document.querySelector('#mini-today-phone')).render(<MiniSyncDemo/>);

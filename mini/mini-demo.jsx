// Fill today's column one habit at a time while this section is visible.
// Pause off-screen, and hold the complete state for reduced-motion visitors.
const MiniSyncDemo = () => {
  const [step, setStep] = React.useState(0);
  const stepRef = React.useRef(0);
  const visible = React.useRef(false);
  React.useEffect(() => {
    let timer;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const schedule = (delay = 1050) => {
      clearTimeout(timer);
      if (!visible.current || motion.matches) return;
      timer = setTimeout(() => {
        stepRef.current = stepRef.current === 5 ? 0 : stepRef.current + 1;
        setStep(stepRef.current);
        schedule(stepRef.current === 5 ? 1800 : stepRef.current === 0 ? 700 : 1050);
      }, delay);
    };
    const observer = new IntersectionObserver(entries => {
      visible.current = entries[0].isIntersecting;
      if (visible.current) schedule(800);
      else clearTimeout(timer);
    }, {threshold: .55});
    observer.observe(document.querySelector('.app-visual'));
    if (motion.matches) {
      stepRef.current = 5;
      setStep(5);
    }
    return () => {clearTimeout(timer); observer.disconnect();};
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

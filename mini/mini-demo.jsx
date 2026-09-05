// A single completion is the story. Auto-play once while visible, then let
// visitors replay it. Reduced-motion visitors always control it themselves.
const MiniSyncDemo = () => {
  const [step, setStep] = React.useState(2);
  const manuallyUsed = React.useRef(false);
  React.useEffect(() => {
    const button = document.querySelector('#demo-toggle');
    const onClick = () => {
      manuallyUsed.current = true;
      setStep(value => value === 2 ? 3 : 2);
    };
    button.hidden = false;
    button.addEventListener('click', onClick);
    let timer;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !motion.matches && !manuallyUsed.current) {
        timer = setTimeout(() => {
          if (!manuallyUsed.current && !motion.matches) setStep(3);
          observer.disconnect();
        }, 2600);
      } else {
        clearTimeout(timer);
      }
    }, {threshold: .55});
    observer.observe(document.querySelector('.app-visual'));
    return () => {clearTimeout(timer); observer.disconnect(); button.removeEventListener('click', onClick);};
  }, []);
  React.useEffect(() => {
    document.querySelector('.tracker-sync').dataset.state = String(step);
    document.querySelector('#demo-toggle').textContent = step === 3 ? 'Try again ↺' : 'Complete Read +';
    document.querySelector('#demo-status').textContent = step === 3
      ? 'Read, done. One more light in your day.'
      : 'Watch today’s light in the orange row.';
  }, [step]);
  const ids = ['meditate', 'exercise', 'read'].slice(0, step);
  return <PhoneFrame width={400}><TodayScreen completedIds={ids} activeHabitId={step === 3 ? 'read' : null}/></PhoneFrame>;
};
ReactDOM.createRoot(document.querySelector('#mini-today-phone')).render(<MiniSyncDemo/>);

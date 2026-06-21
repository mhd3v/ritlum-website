// ──────────────────────────────────────────────────────────────
// ritlumi — physical device renders (pure CSS) + small utilities
//   · TrackerDevice  — light-plastic body + glowing 16-wide LED matrix
//   · clock mode     — same matrix renders the time as pixels
//   · NfcToken       — the round "habit token" NFC disc
//   · Scaler         — fits a fixed design canvas into any width
//   · useRaf         — looping animation clock
// ──────────────────────────────────────────────────────────────

const { useState, useEffect, useRef, useCallback } = React;

// ── looping requestAnimationFrame clock ───────────────────────
// Throttled to ~30fps. The signature scenes are slow 4–5s loops, so 30fps
// is visually identical to 60fps but halves React reconciliations/frame.
function useRaf(active = true, fps = 30) {
  const [t, setT] = useState(0);
  const start = useRef(null);
  const last = useRef(0);
  useEffect(() => {
    if (!active) return;
    const minStep = 1000 / fps;
    let raf;
    const tick = (now) => {
      if (start.current == null) { start.current = now; last.current = now; }
      if (now - last.current >= minStep) {
        last.current = now;
        setT(now - start.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, fps]);
  const reset = useCallback(() => { start.current = null; last.current = 0; setT(0); }, []);
  return [t, reset];
}

// ── fit a fixed w×h canvas into the available width ───────────
const Scaler = ({ w, h, maxScale = 1, align = 'center', children }) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(maxScale);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth;
      if (cw) setScale(Math.min(maxScale, cw / w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, maxScale]);
  return (
    <div ref={ref} style={{ width: '100%', height: h * scale, position: 'relative' }}>
      <div style={{
        width: w, height: h, transform: `scale(${scale})`,
        transformOrigin: align === 'center' ? 'top center' : 'top left',
        position: 'absolute', top: 0,
        left: align === 'center' ? '50%' : 0,
        marginLeft: align === 'center' ? -w / 2 : 0,
      }}>{children}</div>
    </div>
  );
};

// ── 3×5 pixel font for clock mode ─────────────────────────────
const GLYPHS = {
  '0': ['111','101','101','101','111'],
  '1': ['010','110','010','010','111'],
  '2': ['111','001','111','100','111'],
  '3': ['111','001','111','001','111'],
  '4': ['101','101','111','001','001'],
  '5': ['111','100','111','001','111'],
  '6': ['111','100','111','101','111'],
  '7': ['111','001','010','010','010'],
  '8': ['111','101','111','101','111'],
  '9': ['111','101','111','001','111'],
  ':': ['0','0','1','0','1'],   // colon dots sit lower-ish
  ' ': ['0','0','0','0','0'],
};
const glyphW = (ch) => (GLYPHS[ch] ? GLYPHS[ch][0].length : 3);

// build a rows×cols boolean grid stamping the time string, vertically centered
function clockMask(time, cols, rowsN) {
  const grid = Array.from({ length: rowsN }, () => Array(cols).fill(false));
  const chars = time.split('');
  const total = chars.reduce((s, c) => s + glyphW(c), 0) + (chars.length - 1); // 1px gaps
  let x = Math.floor((cols - total) / 2);
  const yOff = Math.floor((rowsN - 5) / 2);
  for (const ch of chars) {
    const g = GLYPHS[ch] || GLYPHS[' '];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < g[r].length; c++) {
        if (g[r][c] === '1') {
          const gy = yOff + r, gx = x + c;
          if (gy >= 0 && gy < rowsN && gx >= 0 && gx < cols) grid[gy][gx] = true;
        }
      }
    }
    x += glyphW(ch) + 1;
  }
  return grid;
}

// Realistic tracker rows — same 16-char `days` bitstrings the companion
// app's DotGridPreview uses (1 = completed). Rightmost-but-two column is
// "today". These mirror the mockup data so every tracker render on the
// site shows believable progress, not a uniform fill.
const TRACKER_ROWS = [
  { color: LED_COLORS[0], days: '1110111110111100' }, // Meditate  — done today
  { color: LED_COLORS[1], days: '1111011110111100' }, // Exercise  — done today
  { color: LED_COLORS[2], days: '1101111011111100' }, // Read      — done today
  { color: LED_COLORS[3], days: '1110110111111100' }, // Hydrate   — done today
  { color: LED_COLORS[4], days: '0111101111011100' }, // Journal   — done today
  { color: LED_COLORS[5], days: '1110110111110000' }, // No Sugar  — not yet today
  { color: LED_COLORS[6], days: '1110111101111110' },
];

// ── LED matrix ────────────────────────────────────────────────
// rows: [{ color, days } | { color, lit }]  — habit mode
//   · `days`  : 16-char bitstring (1 = lit)  — realistic per-day pattern
//   · `lit`   : count from the left          — simple progressive fill
// clock: time string                               — clock mode
const TrackerDeviceBase = ({
  width = 240,
  rows,
  cols = 16,
  mode = 'habits',
  clock = '9:41',
  clockColor = '#FCE9C8',
  glowOn = true,
  breathe = false,
  highlightRow = null,
  dim = false,
}) => {
  const rowsN = mode === 'clock' ? 7 : rows.length;
  const aspect = 1.62;
  const bodyH = width / aspect;
  const padX = width * 0.058;
  const padTop = width * 0.05;
  const padBottom = width * 0.072;
  const r = width * 0.058;
  const gap = Math.max(1, width * 0.013);
  const screenR = width * 0.032;
  const screenPad = width * 0.04;

  const mask = mode === 'clock' ? clockMask(clock, cols, rowsN) : null;

  const screenRef = useRef(null);
  const [breatheOn, setBreatheOn] = useState(true);
  useEffect(() => {
    if (!breathe) return;
    const el = screenRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setBreatheOn(e.intersectionRatio > 0.35), {
      threshold: [0, 0.35],
    });
    io.observe(el);
    return () => io.disconnect();
  }, [breathe]);

  return (
    <div style={{
      width, position: 'relative', display: 'inline-block', fontFamily: T.font,
      contain: 'layout paint style', isolation: 'isolate',
    }}>
      {/* desk contact shadow */}
      <div style={{
        position: 'absolute', left: '7%', right: '7%',
        bottom: -bodyH * 0.055, height: bodyH * 0.13,
        background: 'radial-gradient(50% 100% at 50% 50%, rgba(64,52,34,0.18), rgba(64,52,34,0) 72%)',
        zIndex: 0,
      }} />
      {/* plastic body */}
      <div style={{
        position: 'relative', zIndex: 1, borderRadius: r,
        padding: `${padTop}px ${padX}px ${padBottom}px`,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ffffff 0%, #f3f1ea 62%, #e7e4db 100%)',
        border: '0.5px solid rgba(20,18,12,0.10)',
        boxShadow: dim
          ? '0 6px 16px -10px rgba(0,0,0,0.3)'
          : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(120,110,90,0.18), 0 8px 18px -16px rgba(40,36,28,0.34)',
        filter: dim ? 'grayscale(0.5)' : undefined,
      }}>
        {/* frosted diffuser screen */}
        <div ref={screenRef} className={breathe && breatheOn ? 'rt-breathe' : undefined} style={{
          position: 'relative', borderRadius: screenR, padding: screenPad,
          background: 'radial-gradient(120% 150% at 50% 25%, #ffffff 0%, #f6f5f1 70%, #edece6 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(40,36,28,0.07), inset 0 1px 4px rgba(40,36,28,0.10), inset 0 -1px 3px rgba(120,110,90,0.08)',
          contain: 'paint', isolation: 'isolate',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: screenR, pointerEvents: 'none',
            background: 'linear-gradient(105deg, rgba(255,255,255,0.34), rgba(255,255,255,0.02) 42%, rgba(120,110,90,0.06) 100%)',
            opacity: 0.52,
            zIndex: 3,
          }} />
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
            columnGap: gap, rowGap: gap * 1.35,
            position: 'relative', zIndex: 2,
          }}>
            {Array.from({ length: rowsN }).map((_, ri) => {
              const rowColor = mode === 'clock' ? clockColor : rows[ri].color;
              const litCount = mode === 'clock' ? 0 : (rows[ri].lit || 0);
              const dayStr   = mode === 'clock' ? null : rows[ri].days;
              const isHi = highlightRow === ri;
              return Array.from({ length: cols }).map((_, ci) => {
                const lit = mode === 'clock'
                  ? mask[ri][ci]
                  : dayStr ? dayStr[ci % dayStr.length] === '1' : ci < litCount;
                const c = rowColor;
                return (
                  <span key={`${ri}-${ci}`} style={{
                    width: '100%', aspectRatio: '1 / 1', borderRadius: 99,
                    background: lit ? c : 'rgba(40,36,28,0.07)',
                    outline: isHi && lit ? `1px solid ${c}88` : 'none',
                    transition: 'background 90ms linear',
                  }} />
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── NFC habit token — round disc the phone taps ───────────────
// White, to match the physical token; carries the same habit icon
// the app mockups use (PI from rt-phone.jsx), tinted in the habit's color.
const NfcToken = ({ size = 88, color = T.habit.blue, icon = 'leaf', label, rippling = false, pressed = false }) => {
  const Icon = PI[icon];
  return (
    <div style={{ position: 'relative', width: size, height: size, fontFamily: T.font }}>
      {/* emitted ripples */}
      {[0, 1, 2].map(i => (
        <span key={i} className={rippling ? 'rt-ripple' : undefined} style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: 0, animationDelay: `${i * 0.22}s`, pointerEvents: 'none',
        }} />
      ))}
      {/* disc */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(130% 130% at 32% 22%, #ffffff 0%, #f6f4ef 55%, #ece9e0 100%)',
        boxShadow: pressed
          ? `inset 0 0 0 1px rgba(20,18,12,0.07), 0 0 ${size * 0.4}px ${color}88, 0 8px 18px -8px rgba(20,16,10,0.4)`
          : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(120,110,90,0.16), 0 10px 22px -10px rgba(20,16,10,0.35)',
        border: '0.5px solid rgba(20,18,12,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 160ms ease',
      }}>
        {/* tinted icon badge */}
        <span style={{
          width: '60%', height: '60%', borderRadius: '50%',
          background: `${color}1c`,
          boxShadow: pressed ? `0 0 ${size * 0.16}px ${color}99` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'box-shadow 160ms ease',
        }}>
          {Icon
            ? <Icon size={size * 0.3} color={color} sw={1.9} />
            : <span style={{ width: '28%', height: '28%', borderRadius: '50%', background: color }} />}
        </span>
      </div>
      {label && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          marginTop: 10, whiteSpace: 'nowrap', fontSize: 12, letterSpacing: 0.3,
          color: RT.darkMuted, fontWeight: 600,
        }}>{label}</div>
      )}
    </div>
  );
};

// Memoize so the 112-LED matrix only rebuilds when a row's day-pattern
// actually changes (≈1×/cycle), not on every parent RAF tick (60×/s).
// The parent always passes a *new* `rows` array, so a shallow memo would
// never bail — we deep-compare the color/days/lit of each row instead.
const _rowsKey = (rows) => rows ? rows.map(r => `${r.color}|${r.days || ''}|${r.lit || 0}`).join(';') : '';
const TrackerDevice = React.memo(TrackerDeviceBase, (a, b) =>
  a.width === b.width && a.cols === b.cols && a.mode === b.mode &&
  a.clock === b.clock && a.clockColor === b.clockColor && a.glowOn === b.glowOn &&
  a.breathe === b.breathe && a.highlightRow === b.highlightRow && a.dim === b.dim &&
  _rowsKey(a.rows) === _rowsKey(b.rows)
);

Object.assign(window, { useRaf, Scaler, TrackerDevice, NfcToken, LED_COLORS, TRACKER_ROWS });

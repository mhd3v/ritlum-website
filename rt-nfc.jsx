// ──────────────────────────────────────────────────────────────
// ritlum — signature moment
// Tap a habit token → the matching row lights up on the tracker.
// Auto-loops; respects reduced-motion.
//
// Perf note: the continuous per-frame values (phone position, beam
// travel) are written straight to the DOM via refs inside the rAF
// loop — they never touch React state, so they never trigger a
// reconciliation. React state is reserved for the handful of
// discrete flips per cycle (pressed/rippling/done/toast/row-lit),
// so a ~4.5s loop costs ~8 renders instead of ~270 (at 60fps).
// ──────────────────────────────────────────────────────────────

const { useState, useEffect, useRef } = React;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// Eases the phone through an ordered list of {t,x,y,r} waypoints —
// used to choreograph "tap token 1 → tap token 2 → lift away" as one
// continuous gesture instead of a single approach/retreat pair.
const keyframe = (t, points) => {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i],
      b = points[i + 1];
    if (t < b.t) {
      const k = smooth(a.t, b.t, t);
      return {
        x: lerp(a.x, b.x, k),
        y: lerp(a.y, b.y, k),
        r: lerp(a.r, b.r, k),
      };
    }
  }
  const last = points[points.length - 1];
  return { x: last.x, y: last.y, r: last.r };
};

// Scene timeline (ms) — two taps per loop: Meditate (token 1) then Read (token 2).
const TAP1 = 680,
  RIPPLE1_END = TAP1 + 600,
  BEAM1_START = TAP1 + 320,
  BEAM1_END = TAP1 + 640,
  FILL1_START = TAP1 + 540,
  TOAST1_START = TAP1 + 140;
const TAP2 = 1900,
  RIPPLE2_END = TAP2 + 600,
  BEAM2_START = TAP2 + 320,
  BEAM2_END = TAP2 + 640,
  FILL2_START = TAP2 + 540,
  TOAST2_START = TAP2 + 140;
const TOAST1_END = 1780,
  TOAST2_END = 4200,
  LIFT_START = 2680,
  LIFT_END = 4300,
  CYCLE = 4900;

// phone waypoints: hover → tap token 1 → tap token 2 → lift away → (loop)
// Both tokens sit in the same column (see layout below), so the phone only
// ever leans a small, consistent amount in x — it never has to cross over
// the other token's position, which is what caused the phone to visually
// pass behind/through token 1 on its way to token 2.
// "Lift away" pulls the phone back toward its resting x (not further past
// it) — pushing x further right at this stage is what put the phone's
// bounding box directly on top of both tokens.
const PHONE_PATH = [
  { t: 0, x: 0, y: 0, r: -7 },
  { t: TAP1, x: 46, y: -14, r: -3 },
  { t: TAP1 + 120, x: 46, y: -14, r: -3 },
  { t: TAP2, x: 52, y: 26, r: -1.4 },
  { t: TAP2 + 240, x: 52, y: 26, r: -1.4 },
  { t: LIFT_START, x: 52, y: 26, r: -1.4 },
  { t: LIFT_END, x: 10, y: -30, r: -6 },
  { t: CYCLE, x: 0, y: 0, r: -7 },
];
const BEAM1_TRAVEL = 134;
const BEAM2_TRAVEL = 122;

// Scene-specific tracker rows. The active habits carry the clearest history;
// inactive rows stay sparse so the completion moment is easy to read.
const NFC_ROWS_BASE = [
  { color: LED_COLORS[1], days: "1010010100101000" }, // green
  { color: LED_COLORS[2], days: "0101100010100100" }, // yellow
  { color: LED_COLORS[4], days: "1000101001010000" }, // pink
  { color: LED_COLORS[5], days: "0110001010001010" }, // cyan
  { color: LED_COLORS[6], days: "0010100101001000" }, // purple
];

// one habit row inside the scene phone — pending state or logged checkmark
const NfcHabitRow = ({ color, name, done, pendingSub }) => (
  <div
    style={{
      background: T.card,
      borderRadius: 18,
      padding: "14px 14px",
      boxShadow: done ? `0 0 0 2px ${color}55, ${T.shadow}` : T.shadow,
      display: "grid",
      gridTemplateColumns: "12px 1fr auto",
      gap: 11,
      alignItems: "center",
      transition: "box-shadow 200ms ease",
    }}
  >
    <Dot color={color} size={11} />
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 14.5,
          color: T.ink,
          fontWeight: 500,
          letterSpacing: -0.3,
        }}
      >
        {name}
      </div>
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>
        {done ? "Done · 7:14 AM" : pendingSub}
      </div>
    </div>
    {done ? (
      <CheckPill color={color} />
    ) : (
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 99,
          border: `2px solid ${T.borderStrong}`,
        }}
      />
    )}
  </div>
);

// compact phone used inside the scene
const NfcScenePhone = React.memo(
  ({ done1, done2, toastOn, toastColor, toastLabel, toastSub }) => (
    <PhoneFrame width={196}>
      <PhoneStatus time="7:14" />
      <div style={{ padding: "8px 16px 0" }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: T.muted,
            textTransform: "uppercase",
          }}
        >
          Friday
        </div>
        <h2
          style={{
            margin: "3px 0 0",
            fontFamily: T.fontDisplay,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: -0.9,
            color: T.ink,
          }}
        >
          Today
        </h2>
      </div>
      <div
        style={{
          padding: "14px 14px 0",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <NfcHabitRow
          color={T.habit.blue}
          name="Meditate"
          done={done1}
          pendingSub="Tap token to log"
        />
        <NfcHabitRow
          color={T.habit.orange}
          name="Read"
          done={done2}
          pendingSub="Tap token to log"
        />
        <div
          style={{
            background: T.card,
            borderRadius: 16,
            padding: "11px 14px",
            boxShadow: T.shadowSoft,
            display: "flex",
            alignItems: "center",
            gap: 11,
            opacity: 0.5,
          }}
        >
          <Dot color={T.habit.green} size={10} />
          <span
            style={{
              height: 8,
              width: 92,
              borderRadius: 99,
              background: T.bgAlt,
            }}
          />
        </div>
      </div>
      {/* completion toast */}
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 16,
          background: "#16151a",
          borderRadius: 16,
          padding: "11px 13px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 12px 28px -10px rgba(0,0,0,0.5)",
          transform: toastOn ? "translateY(0)" : "translateY(160%)",
          opacity: toastOn ? 1 : 0,
          transition:
            "transform 360ms cubic-bezier(.2,.9,.2,1), opacity 240ms ease",
        }}
      >
        <CheckPill color={toastColor} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              color: "#fff",
              fontWeight: 600,
              letterSpacing: -0.2,
            }}
          >
            {toastLabel}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            {toastSub}
          </div>
        </div>
      </div>
    </PhoneFrame>
  ),
);

const NFC_PHASE_INIT = {
  pressed1: false,
  rippling1: false,
  beamActive1: false,
  dotLit1: false,
  toast1: false,
  rowGlow1: false,
  pressed2: false,
  rippling2: false,
  beamActive2: false,
  dotLit2: false,
  toast2: false,
  rowGlow2: false,
  cycleIdx: 0,
};
const NFC_PHASE_REDUCED = {
  pressed1: false,
  rippling1: false,
  beamActive1: false,
  dotLit1: true,
  toast1: false,
  rowGlow1: false,
  pressed2: false,
  rippling2: false,
  beamActive2: false,
  dotLit2: true,
  toast2: false,
  rowGlow2: false,
  cycleIdx: 0,
};

const NfcAnimation = () => {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sceneRef = useRef(null);
  const stageRef = useRef(null);
  const phoneRef = useRef(null);
  const beam1DotRef = useRef(null);
  const beam2DotRef = useRef(null);
  const beam1VisibleRef = useRef(false);
  const beam2VisibleRef = useRef(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [phase, setPhase] = useState(
    reduced ? NFC_PHASE_REDUCED : NFC_PHASE_INIT,
  );
  const phaseRef = useRef(phase);

  useEffect(() => {
    if (reduced || !inView) return;
    let raf;
    let startTime = null;
    const loop = (now) => {
      if (startTime == null) startTime = now;
      const elapsed = now - startTime;
      const tt = elapsed % CYCLE;
      const cycleIdx = Math.floor(elapsed / CYCLE);
      const loopOpacity = Math.min(
        smooth(0, 260, tt),
        1 - smooth(CYCLE - 360, CYCLE, tt),
      );

      const { x: px, y: py, r: pr } = keyframe(tt, PHONE_PATH);
      // travel progress is monotonic (dot keeps moving forward, never snaps back);
      // opacity is a separate fade-in/fade-out layered on top once it arrives.
      const beam1Progress = smooth(BEAM1_START, BEAM1_END, tt);
      const beam1Opacity =
        beam1Progress * (1 - smooth(BEAM1_END, BEAM1_END + 260, tt));
      const beam2Progress = smooth(BEAM2_START, BEAM2_END, tt);
      const beam2Opacity =
        beam2Progress * (1 - smooth(BEAM2_END, BEAM2_END + 260, tt));

      // continuous values — straight to the DOM, no React involved
      if (stageRef.current)
        stageRef.current.style.opacity = loopOpacity.toFixed(3);
      if (phoneRef.current)
        phoneRef.current.style.transform = `translate(${px}px, ${py}px) rotate(${pr}deg)`;
      if (beam1DotRef.current && beam1Opacity > 0.02) {
        beam1DotRef.current.style.transform = `translateX(${beam1Progress * BEAM1_TRAVEL}px)`;
        if (!beam1VisibleRef.current) {
          beam1VisibleRef.current = true;
          beam1DotRef.current.style.opacity = "1";
        }
      } else if (beam1DotRef.current && beam1VisibleRef.current) {
        beam1VisibleRef.current = false;
        beam1DotRef.current.style.opacity = "0";
      }
      if (beam2DotRef.current && beam2Opacity > 0.02) {
        beam2DotRef.current.style.transform = `translateX(${beam2Progress * BEAM2_TRAVEL}px)`;
        if (!beam2VisibleRef.current) {
          beam2VisibleRef.current = true;
          beam2DotRef.current.style.opacity = "1";
        }
      } else if (beam2DotRef.current && beam2VisibleRef.current) {
        beam2VisibleRef.current = false;
        beam2DotRef.current.style.opacity = "0";
      }

      // discrete values — only commit a render when one actually flips
      const next = {
        pressed1: tt > TAP1 - 40 && tt < RIPPLE1_END,
        rippling1: tt > TAP1 - 20 && tt < RIPPLE1_END + 300,
        beamActive1: beam1Opacity > 0.02,
        dotLit1: tt >= FILL1_START,
        toast1: tt > TOAST1_START && tt < TOAST1_END,
        rowGlow1: tt >= BEAM1_END && tt < BEAM1_END + 450,
        pressed2: tt > TAP2 - 100 && tt < RIPPLE2_END,
        rippling2: tt > TAP2 - 80 && tt < RIPPLE2_END + 300,
        beamActive2: beam2Opacity > 0.02,
        dotLit2: tt >= FILL2_START,
        toast2: tt > TOAST2_START && tt < TOAST2_END,
        rowGlow2: tt >= BEAM2_END && tt < BEAM2_END + 450,
        cycleIdx,
      };
      const prev = phaseRef.current;
      if (Object.keys(next).some((k) => next[k] !== prev[k])) {
        phaseRef.current = next;
        setPhase(next);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  const {
    pressed1,
    rippling1,
    beamActive1,
    dotLit1,
    toast1,
    rowGlow1,
    pressed2,
    rippling2,
    beamActive2,
    dotLit2,
    toast2,
    rowGlow2,
    cycleIdx,
  } = phase;
  const highlightRow = rowGlow1 ? 0 : rowGlow2 ? 3 : null;

  // Meditate & Read rows: realistic per-day patterns; only today's dot
  // (index 13) lights on completion of its respective tap.
  const meditateDays = dotLit1 ? "1110111110111100" : "1110111110111000";
  const readDays = dotLit2 ? "1110110111111100" : "1110110111111000";
  const rows = [
    { color: T.habit.blue, days: meditateDays },
    NFC_ROWS_BASE[0],
    NFC_ROWS_BASE[1],
    { color: T.habit.orange, days: readDays },
    NFC_ROWS_BASE[2],
    NFC_ROWS_BASE[3],
    NFC_ROWS_BASE[4],
  ];

  // Once a habit is logged the connecting line should read as a steady,
  // visible link — not fade back to the same near-invisible idle state
  // it had before the tap. Only "never tapped yet" stays barely-there.
  const beam1Alpha = beamActive1 ? "99" : dotLit1 ? "55" : "18";
  const beam2Alpha = beamActive2 ? "99" : dotLit2 ? "55" : "18";

  const toastOn = toast1 || toast2;
  const toastColor = toast1 ? T.habit.blue : T.habit.orange;
  const toastLabel = toast1 ? "Meditate logged" : "Read logged";
  const toastSub = toast1
    ? "via habit token · 28-day streak"
    : "via habit token · 15-day streak";

  return (
    <div
      ref={sceneRef}
      style={{ contain: "layout paint style", isolation: "isolate" }}
    >
      <Scaler w={920} h={540} maxScale={1}>
        <div
          ref={stageRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: reduced ? 1 : 0,
            willChange: "opacity",
          }}
        >
          {/* connecting beams: token 1 → tracker, token 2 → tracker */}
          <div
            style={{
              position: "absolute",
              left: 398,
              top: 153,
              width: BEAM1_TRAVEL,
              height: 4,
              borderRadius: 99,
              transform: "rotate(23deg)",
              transformOrigin: "left center",
              background: `linear-gradient(90deg, ${T.habit.blue}00, ${T.habit.blue}${beam1Alpha})`,
              transition: "background 200ms ease",
            }}
          >
            <span
              ref={beam1DotRef}
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: 12,
                height: 12,
                marginLeft: -6,
                marginTop: -6,
                borderRadius: 99,
                background: T.habit.blue,
                opacity: 0,
                transform: "translateX(0px)",
                willChange: "transform",
                outline: `4px solid ${T.habit.blue}33`,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 398,
              top: 362,
              width: BEAM2_TRAVEL,
              height: 4,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${T.habit.orange}00, ${T.habit.orange}${beam2Alpha})`,
              transition: "background 200ms ease",
            }}
          >
            <span
              ref={beam2DotRef}
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: 12,
                height: 12,
                marginLeft: -6,
                marginTop: -6,
                borderRadius: 99,
                background: T.habit.orange,
                opacity: 0,
                transform: "translateX(0px)",
                willChange: "transform",
                outline: `4px solid ${T.habit.orange}33`,
              }}
            />
          </div>

          {/* NFC tokens — stacked in one column, well clear of the phone's
              lean range, so the phone never crosses over either token */}
          <div
            key={`${cycleIdx}-1`}
            style={{ position: "absolute", left: 310, top: 110 }}
          >
            <NfcToken
              size={88}
              color={T.habit.blue}
              icon="leaf"
              label="Meditate"
              rippling={rippling1}
              pressed={pressed1}
            />
          </div>
          <div
            key={`${cycleIdx}-2`}
            style={{ position: "absolute", left: 310, top: 320 }}
          >
            <NfcToken
              size={88}
              color={T.habit.orange}
              icon="book"
              label="Read"
              rippling={rippling2}
              pressed={pressed2}
            />
          </div>

          {/* tracker */}
          <div style={{ position: "absolute", left: 520, top: 170 }}>
            <TrackerDevice
              width={372}
              rows={rows}
              highlightRow={highlightRow}
            />
          </div>

          {/* phone — rendered last so it always sits above the tokens it taps */}
          <div
            ref={phoneRef}
            style={{
              position: "absolute",
              left: 44,
              top: 44,
              willChange: "transform",
              transform: "translate(0px, 0px) rotate(-7deg)",
              transformOrigin: "70% 30%",
            }}
          >
            <NfcScenePhone
              done1={dotLit1}
              done2={dotLit2}
              toastOn={toastOn}
              toastColor={toastColor}
              toastLabel={toastLabel}
              toastSub={toastSub}
            />
          </div>
        </div>
      </Scaler>
    </div>
  );
};

Object.assign(window, { NfcAnimation });

// ──────────────────────────────────────────────────────────────
// MirrorAnimation — the sibling signature moment.
// Mark a habit done in the app → the matching row lights up on the
// desk tracker. Auto-loops; respects reduced-motion.
// (Lives visually on a light surface, so its chrome is light-themed.)
// Same ref-driven approach as NfcAnimation above — see perf note up top.
// ──────────────────────────────────────────────────────────────

// Scene timeline (ms) — separate namespace from the NFC scene above.
const M_TAP = 680,
  M_RIPPLE_END = 1060;
const M_TOAST_START = 820;
const M_BEAM_START = 780,
  M_BEAM_END = 1320;
const M_FILL_START = 1240,
  M_FILL_END = 1900;
const M_CHECK_END = 900;
const M_HOLD_END = 2250,
  M_CYCLE = 3100;

// Read (orange, tracker row 3) is the habit that completes in the scene.

const MirrorScenePhone = React.memo(({ done, rippling, pressed, toast }) => (
  <PhoneFrame width={196}>
    <PhoneStatus time="7:14" />
    <div style={{ padding: "8px 16px 0" }}>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: 0.5,
          color: T.muted,
          textTransform: "uppercase",
        }}
      >
        Friday
      </div>
      <h2
        style={{
          margin: "3px 0 0",
          fontFamily: T.fontDisplay,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: -0.9,
          color: T.ink,
        }}
      >
        Today
      </h2>
    </div>
    <div style={{ padding: "14px 14px 0" }}>
      {/* Read — the row that completes */}
      <div
        style={{
          background: T.card,
          borderRadius: 18,
          padding: "14px 14px",
          boxShadow: done
            ? `0 0 0 2px ${T.habit.orange}55, ${T.shadow}`
            : T.shadow,
          display: "grid",
          gridTemplateColumns: "12px 1fr auto",
          gap: 11,
          alignItems: "center",
          transition: "box-shadow 200ms ease",
        }}
      >
        <Dot color={T.habit.orange} size={11} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14.5,
              color: T.ink,
              fontWeight: 500,
              letterSpacing: -0.3,
            }}
          >
            Read
          </div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>
            {done ? "Done · 7:14 AM" : "12 / 20 pages"}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {rippling && (
            <span
              className="rt-ripple"
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                border: `2px solid ${T.habit.orange}`,
                opacity: 0,
                pointerEvents: "none",
              }}
            />
          )}
          {done ? (
            <span
              style={{
                transform: "scale(1)",
                transition: "transform 200ms cubic-bezier(.3,1.4,.6,1)",
                display: "inline-flex",
              }}
            >
              <CheckPill color={T.habit.orange} />
            </span>
          ) : (
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 99,
                border: `2px solid ${T.borderStrong}`,
                background: pressed ? `${T.habit.orange}1a` : "transparent",
                transition: "background 120ms ease",
              }}
            />
          )}
        </div>
      </div>
      {/* dimmed neighbours */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          opacity: 0.5,
        }}
      >
        {[T.habit.blue, T.habit.pink].map((c, i) => (
          <div
            key={i}
            style={{
              background: T.card,
              borderRadius: 16,
              padding: "11px 14px",
              boxShadow: T.shadowSoft,
              display: "flex",
              alignItems: "center",
              gap: 11,
            }}
          >
            <Dot color={c} size={10} />
            <span
              style={{
                height: 8,
                width: i ? 70 : 92,
                borderRadius: 99,
                background: T.bgAlt,
              }}
            />
          </div>
        ))}
      </div>
    </div>
    {/* completion toast */}
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 16,
        background: "#16151a",
        borderRadius: 16,
        padding: "11px 13px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 12px 28px -10px rgba(0,0,0,0.5)",
        transform: toast ? "translateY(0)" : "translateY(160%)",
        opacity: toast ? 1 : 0,
        transition:
          "transform 360ms cubic-bezier(.2,.9,.2,1), opacity 240ms ease",
      }}
    >
      <CheckPill color={T.habit.orange} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.5,
            color: "#fff",
            fontWeight: 600,
            letterSpacing: -0.2,
          }}
        >
          Read logged
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          15-day streak · synced to desk tracker
        </div>
      </div>
    </div>
  </PhoneFrame>
));

const M_PHASE_INIT = {
  pressed: false,
  rippling: false,
  beamActive: false,
  done: false,
  toast: false,
  dotLit: false,
  rowGlow: false,
  cycleIdx: 0,
};

const MirrorAnimation = () => {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sceneRef = useRef(null);
  const stageRef = useRef(null);
  const beamDotRef = useRef(null);
  const beamVisibleRef = useRef(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [phase, setPhase] = useState(
    reduced
      ? {
          pressed: false,
          rippling: false,
          beamActive: false,
          done: true,
          toast: false,
          dotLit: true,
          rowGlow: false,
          cycleIdx: 0,
        }
      : M_PHASE_INIT,
  );
  const phaseRef = useRef(phase);

  useEffect(() => {
    if (reduced || !inView) return;
    let raf;
    let startTime = null;
    const loop = (now) => {
      if (startTime == null) startTime = now;
      const elapsed = now - startTime;
      const tt = elapsed % M_CYCLE;
      const cycleIdx = Math.floor(elapsed / M_CYCLE);
      const loopOpacity = Math.min(
        smooth(0, 200, tt),
        1 - smooth(M_CYCLE - 260, M_CYCLE, tt),
      );

      const beamProgress = smooth(M_BEAM_START, M_BEAM_END, tt);
      const beamOpacity =
        beamProgress * (1 - smooth(M_BEAM_END + 20, M_BEAM_END + 180, tt));
      if (stageRef.current)
        stageRef.current.style.opacity = loopOpacity.toFixed(3);
      if (beamDotRef.current && beamOpacity > 0.02) {
        beamDotRef.current.style.transform = `translateX(${beamProgress * 214}px)`;
        if (!beamVisibleRef.current) {
          beamVisibleRef.current = true;
          beamDotRef.current.style.opacity = "1";
        }
      } else if (beamDotRef.current && beamVisibleRef.current) {
        beamVisibleRef.current = false;
        beamDotRef.current.style.opacity = "0";
      }

      const next = {
        pressed: tt > M_TAP - 50 && tt < M_TAP + 140,
        rippling: tt > M_TAP - 30 && tt < M_RIPPLE_END,
        beamActive: beamOpacity > 0.02,
        done: tt > M_CHECK_END,
        toast: tt > M_TOAST_START && tt < M_HOLD_END + 150,
        dotLit: tt >= M_FILL_START,
        rowGlow: tt >= M_BEAM_END && tt < M_BEAM_END + 260,
        cycleIdx,
      };
      const prev = phaseRef.current;
      if (Object.keys(next).some((k) => next[k] !== prev[k])) {
        phaseRef.current = next;
        setPhase(next);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  const {
    pressed,
    rippling,
    beamActive,
    done,
    toast,
    dotLit,
    rowGlow,
    cycleIdx,
  } = phase;

  // tracker: realistic rows; only today's dot (index 13) on the Read row lights on completion.
  const rows = TRACKER_ROWS.map((r, i) => {
    if (i !== 3) {
      const quietDays = [
        "1010010100101000",
        "0101100010100100",
        "1000101001010000",
        "0110001010001010",
        "0010100101001000",
        "0100011010010000",
      ];
      return { color: r.color, days: quietDays[i] || "0000100001000000" };
    }
    const days = dotLit ? "1110110111111100" : "1110110111111000";
    return { color: r.color, days };
  });

  return (
    <div
      ref={sceneRef}
      style={{ contain: "layout paint style", isolation: "isolate" }}
    >
      <Scaler w={920} h={500} maxScale={1}>
        <div
          ref={stageRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: reduced ? 1 : 0,
            willChange: "opacity",
          }}
        >
          {/* beam phone → tracker */}
          <div
            style={{
              position: "absolute",
              left: 256,
              top: 246,
              width: 214,
              height: 4,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${T.habit.orange}00, ${T.habit.orange}${beamActive ? "88" : "22"})`,
            }}
          >
            <span
              ref={beamDotRef}
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: 12,
                height: 12,
                marginLeft: -6,
                marginTop: -6,
                borderRadius: 99,
                background: T.habit.orange,
                opacity: 0,
                transform: "translateX(0px)",
                willChange: "transform",
                outline: `4px solid ${T.habit.orange}33`,
              }}
            />
          </div>

          {/* phone */}
          <div
            key={cycleIdx}
            style={{ position: "absolute", left: 60, top: 40 }}
          >
            <MirrorScenePhone
              done={done}
              rippling={rippling}
              pressed={pressed}
              toast={toast}
            />
          </div>

          {/* tracker */}
          <div style={{ position: "absolute", left: 470, top: 132 }}>
            <TrackerDevice
              width={372}
              rows={rows}
              highlightRow={rowGlow ? 3 : null}
            />
          </div>
        </div>
      </Scaler>
    </div>
  );
};

Object.assign(window, { MirrorAnimation });

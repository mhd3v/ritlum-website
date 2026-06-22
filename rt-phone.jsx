// ──────────────────────────────────────────────────────────────
// ritlum - companion app mockups (phone frames)
//   · PhoneFrame    - iOS-style chrome with dynamic island
//   · PhoneStatus   - status bar (time + signal/wifi/battery)
//   · TodayPhone    - the real Today screen (16-col dot grid + habit list)
//   · HistoryPhone  - the real History screen (calendar + summary + month list)
//   · StatsPhone    - the real Stats · Overview screen (stat cards + chart)
// Faithful static reproductions of the app's actual screens, rendered at a
// native canvas width and scaled down for display via <PhoneScaler>.
// Built from the same tokens (T) and the same component patterns as the
// real app so the site and product read as one system.
// ──────────────────────────────────────────────────────────────

// ── inline icon set (paths mirrored from the app's icons.jsx) ─────
const PhIcon = ({
  d,
  size = 22,
  color = "currentColor",
  sw = 1.6,
  fill = "none",
  children,
  vb = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${vb} ${vb}`}
    fill={fill}
    stroke={fill === "none" ? color : "none"}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {d && <path d={d} />}
    {children}
  </svg>
);
const PI = {
  today: (p) => (
    <PhIcon {...p}>
      <rect x="4" y="4" width="6" height="6" rx="1.4" />
      <rect x="14" y="4" width="6" height="6" rx="1.4" />
      <rect x="4" y="14" width="6" height="6" rx="1.4" />
      <rect x="14" y="14" width="6" height="6" rx="1.4" />
    </PhIcon>
  ),
  history: (p) => (
    <PhIcon {...p}>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9h16" />
      <path d="M8 3v4M16 3v4" />
      <path d="M9 13l2 2 4-4" />
    </PhIcon>
  ),
  stats: (p) => (
    <PhIcon {...p}>
      <path d="M5 19V11" />
      <path d="M12 19V5" />
      <path d="M19 19v-6" />
    </PhIcon>
  ),
  device: (p) => (
    <PhIcon {...p}>
      <path d="M4 18l8-12 8 12z" />
      <circle
        cx="9"
        cy="15"
        r="0.6"
        fill={p?.color || "currentColor"}
        stroke="none"
      />
      <circle
        cx="12"
        cy="15"
        r="0.6"
        fill={p?.color || "currentColor"}
        stroke="none"
      />
      <circle
        cx="15"
        cy="15"
        r="0.6"
        fill={p?.color || "currentColor"}
        stroke="none"
      />
    </PhIcon>
  ),
  settings: (p) => (
    <PhIcon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 00.32 1.76l.06.06a2 2 0 11-2.82 2.82l-.06-.06a1.6 1.6 0 00-1.76-.32 1.6 1.6 0 00-.97 1.47V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1.04-1.47 1.6 1.6 0 00-1.76.32l-.06.06A2 2 0 014.29 16.99l.06-.06A1.6 1.6 0 004.67 15a1.6 1.6 0 00-1.47-.97H3a2 2 0 110-4h.1a1.6 1.6 0 001.47-1.04 1.6 1.6 0 00-.32-1.76l-.06-.06A2 2 0 117 4.29l.06.06a1.6 1.6 0 001.76.32H9a1.6 1.6 0 00.97-1.47V3a2 2 0 114 0v.1a1.6 1.6 0 00.97 1.47 1.6 1.6 0 001.76-.32l.06-.06a2 2 0 112.82 2.82l-.06.06a1.6 1.6 0 00-.32 1.76V9a1.6 1.6 0 001.47.97H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.47.97z" />
    </PhIcon>
  ),
  plus: (p) => <PhIcon {...p} sw={2} d="M12 5v14M5 12h14" />,
  check: (p) => <PhIcon {...p} sw={2.2} d="M5 12l4 4 10-10" />,
  filter: (p) => (
    <PhIcon {...p} sw={1.8}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </PhIcon>
  ),
  chevronRight: (p) => <PhIcon {...p} sw={2} d="M9 5l7 7-7 7" />,
  chevronDown: (p) => <PhIcon {...p} sw={2} d="M5 9l7 7 7-7" />,
  arrowUp: (p) => <PhIcon {...p} sw={2} d="M12 19V5M6 11l6-6 6 6" />,
  target: (p) => (
    <PhIcon {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="12"
        cy="12"
        r="1.2"
        fill={p?.color || "currentColor"}
        stroke="none"
      />
    </PhIcon>
  ),
  fire: (p) => (
    <PhIcon {...p}>
      <path d="M15.36 5.21A8.25 8.25 0 0112 21a8.25 8.25 0 01-5.96-13.95A8.29 8.29 0 009 9.6a8.98 8.98 0 013.36-6.87 8.21 8.21 0 003 2.48z" />
      <path d="M12 18a3.75 3.75 0 00.5-7.47 5.99 5.99 0 00-1.93 3.55 5.97 5.97 0 01-2.13-1A3.75 3.75 0 0012 18z" />
    </PhIcon>
  ),
  star: (p) => (
    <PhIcon
      {...p}
      d="M12 3l2.8 6 6.2.8-4.5 4.3 1.1 6.2L12 17.5 6.4 20.3 7.5 14 3 9.8 9.2 9z"
    />
  ),
  chevronLeft: (p) => <PhIcon {...p} sw={2} d="M15 5l-7 7 7 7" />,
  more: (p) => (
    <PhIcon {...p} sw={1.8}>
      <circle
        cx="5"
        cy="12"
        r="1.4"
        fill={p?.color || "currentColor"}
        stroke="none"
      />
      <circle
        cx="12"
        cy="12"
        r="1.4"
        fill={p?.color || "currentColor"}
        stroke="none"
      />
      <circle
        cx="19"
        cy="12"
        r="1.4"
        fill={p?.color || "currentColor"}
        stroke="none"
      />
    </PhIcon>
  ),
  moon: (p) => (
    <PhIcon {...p} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  ),
  leaf: (p) => (
    <PhIcon {...p}>
      <path d="M19 5c-7 0-13 5-13 13 0 .5 0 1 .1 1.4C13.6 18.5 19 12.8 19 5z" />
      <path d="M6.8 17.8c2.4-3.4 5.6-6.8 9.7-9.2" />
    </PhIcon>
  ),
  book: (p) => (
    <PhIcon {...p}>
      <path d="M4 5.8C4 4.8 4.8 4 5.8 4H11a2 2 0 012 2v14a2 2 0 00-2-1.6H5.8c-1 0-1.8-.8-1.8-1.8z" />
      <path d="M20 5.8c0-1-.8-1.8-1.8-1.8H13a2 2 0 00-2 2v14a2 2 0 012-1.6h5.2c1 0 1.8-.8 1.8-1.8z" />
    </PhIcon>
  ),
  minus: (p) => <PhIcon {...p} sw={2.2} d="M5 12h14" />,
  play: (p) => <PhIcon {...p} sw={1.8} d="M8 5l11 7-11 7z" />,
  close: (p) => <PhIcon {...p} sw={2} d="M6 6l12 12M18 6l-12 12" />,
  bluetooth: (p) => (
    <PhIcon {...p}>
      <path d="M7 7l10 10l-5 4V3l5 4l-10 10" />
    </PhIcon>
  ),
  battery: (p) => (
    <PhIcon {...p}>
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <path d="M22 10v4M7 10v4M10 10v4M13 10v4M16 10v4" />
    </PhIcon>
  ),
  refresh: (p) => (
    <PhIcon {...p} sw={1.8}>
      <path d="M1 4v6h6" />
      <path d="M3.5 15.5A9 9 0 0015.5 3.5" fill="none" />
      <path d="M23 20v-6h-6" />
      <path d="M20.5 8.5A9 9 0 008.5 20.5" fill="none" />
    </PhIcon>
  ),
  undo: (p) => (
    <PhIcon {...p} sw={1.8}>
      <path d="M4 7h10a6 6 0 010 12H7" />
      <path d="M4 7l4-4M4 7l4 4" />
    </PhIcon>
  ),
  cloud: (p) => (
    <PhIcon {...p}>
      <path d="M12 3a7 7 0 00-7 7c0 .7.1 1.4.3 2A5 5 0 006 21h12a5 5 0 001.7-9.7c.2-.8.3-1.5.3-2.3a7 7 0 00-7-7z" />
    </PhIcon>
  ),
  phone: (p) => (
    <PhIcon {...p}>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M12 18h.01" />
    </PhIcon>
  ),
  clock: (p) => (
    <PhIcon {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 3" />
    </PhIcon>
  ),
  alert: (p) => (
    <PhIcon {...p} sw={1.8}>
      <path d="M12 2L2 20h20z" />
      <path d="M12 10v4M12 17.5v.5" />
    </PhIcon>
  ),
  sun: (p) => (
    <PhIcon {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </PhIcon>
  ),
};

// ── phone chrome ───────────────────────────────────────────────
const PhoneFrame = ({ width = 260, children, screenBg = T.bg }) => {
  const h = width * 2.165;
  const bezel = Math.max(2, width * 0.013);
  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: width * 0.14,
        position: "relative",
        background: screenBg,
        overflow: "hidden",
        fontFamily: T.font,
        boxShadow: `0 0 0 ${bezel}px #1c1b1f, 0 0 0 ${bezel + 0.5}px rgba(0,0,0,0.55), 0 22px 34px -26px rgba(20,15,5,0.42)`,
      }}
    >
      {/* dynamic island */}
      <div
        style={{
          position: "absolute",
          top: width * 0.028,
          left: "50%",
          transform: "translateX(-50%)",
          width: width * 0.26,
          height: width * 0.072,
          borderRadius: 99,
          background: "#000",
          zIndex: 40,
        }}
      />
      {children}
    </div>
  );
};

const PhoneStatus = ({ time = "9:41", dark = false }) => {
  const c = dark ? "#fff" : T.ink;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 28px 0",
        height: 54,
        fontFamily: T.font,
        position: "relative",
        zIndex: 5,
      }}
    >
      <span
        style={{ fontWeight: 600, fontSize: 16, color: c, letterSpacing: -0.2 }}
      >
        {time}
      </span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="6.5" width="2.8" height="4" rx="0.6" fill={c} />
          <rect x="4.4" y="4.5" width="2.8" height="6" rx="0.6" fill={c} />
          <rect x="8.8" y="2.5" width="2.8" height="8" rx="0.6" fill={c} />
          <rect x="13.2" y="0" width="2.8" height="10.5" rx="0.6" fill={c} />
        </svg>
        <svg width="15" height="11" viewBox="0 0 17 12">
          <path
            d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z"
            fill={c}
          />
          <path
            d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z"
            fill={c}
          />
          <circle cx="8.5" cy="10.5" r="1.3" fill={c} />
        </svg>
        <svg width="24" height="11" viewBox="0 0 27 13">
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="12"
            rx="3.5"
            stroke={c}
            strokeOpacity="0.4"
            fill="none"
          />
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c} />
          <path
            d="M25 4.5V8.5C25.8 8.2 26.5 7.5 26.5 6.5C26.5 5.5 25.8 4.8 25 4.5Z"
            fill={c}
            fillOpacity="0.5"
          />
        </svg>
      </span>
    </div>
  );
};

// small primitives shared with rt-nfc
const Dot = ({ color, size = 11 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: 99,
      background: color,
      flexShrink: 0,
      boxShadow: `0 0 0 4px ${color}1f`,
    }}
  />
);
const CheckPill = ({ color }) => (
  <span
    style={{
      width: 28,
      height: 28,
      borderRadius: 99,
      background: color,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path
        d="M2.5 7.5 L5.5 10.5 L11.5 3.5"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

// ── shared app building blocks (ported static from components.jsx) ──
const HabitColorDot = ({ color, size = 12 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: 99,
      background: color,
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

const StatusChip = ({ label = "Synced" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13,
      color: T.muted,
      fontWeight: 500,
      fontFamily: T.font,
    }}
  >
    {label}
    <span
      style={{ width: 7, height: 7, borderRadius: 99, background: T.green }}
    />
  </span>
);

const CircleButton = ({ children, size = 38 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: 99,
      background: T.card,
      border: `0.5px solid ${T.border}`,
      boxShadow: T.shadowSoft,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </span>
);

const Card = ({ children, style = {}, padding = 0 }) => (
  <div
    style={{
      background: T.card,
      borderRadius: T.r.xxl,
      border: `0.5px solid ${T.border}`,
      boxShadow: T.shadowSoft,
      padding,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const ScreenHeader = ({ title, subtitle, dateLine, trailing }) => (
  <div
    style={{
      padding: "8px 22px 16px",
      position: "relative",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 14,
    }}
  >
    <div style={{ flex: 1 }}>
      <h1
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: -1.1,
          color: T.ink,
          lineHeight: 1.05,
        }}
      >
        {title}
      </h1>
      {(subtitle || dateLine) && (
        <div
          style={{
            marginTop: 6,
            fontSize: 15,
            color: T.muted,
            letterSpacing: -0.2,
          }}
        >
          {subtitle || dateLine}
        </div>
      )}
    </div>
    {trailing && <div style={{ paddingTop: 8 }}>{trailing}</div>}
  </div>
);

const TabBar = ({ active = "today", deviceDot = false }) => {
  const tabs = [
    { id: "today", label: "Today", icon: "today" },
    { id: "history", label: "History", icon: "history" },
    { id: "stats", label: "Stats", icon: "stats" },
    { id: "device", label: "Device", icon: "device" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `0.5px solid ${T.divider}`,
        background: "rgba(250,248,244,0.96)",
        padding: "8px 12px 22px",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: T.font,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const color = isActive ? T.green : T.muted;
        const showDot = deviceDot && tab.id === "device" && !isActive;
        const I = PI[tab.icon];
        return (
          <div
            key={tab.id}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              position: "relative",
            }}
          >
            <div style={{ position: "relative" }}>
              <I size={24} color={color} sw={isActive ? 1.9 : 1.5} />
              {showDot && (
                <span
                  style={{
                    position: "absolute",
                    top: -1,
                    right: -3,
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: T.green,
                    boxShadow: `0 0 0 2px ${T.bg}`,
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 10.5,
                color,
                letterSpacing: -0.1,
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// 16×N dot-grid hero - matches the in-app DotGridPreview exactly.
// Days run left→right (oldest→newst); todayCol is highlighted with a
// column band + day-of-week labels. Each row carries a 16-char `days`
// bitstring (1 = completed).
const DotGridPreview = ({
  rows,
  cols = 16,
  todayCol = 13,
  todayDow = 4,
  cellGap = 5,
}) => {
  const DOW = ["S", "M", "T", "W", "T", "F", "S"];
  const dayLabel = (ci) => DOW[(((todayDow - (todayCol - ci)) % 7) + 7) % 7];
  const litAt = (row, ci) =>
    row.empty
      ? false
      : row.days
        ? row.days[ci] === "1"
        : ci < (row.filled || 0);
  return (
    <div style={{ width: "100%", padding: "4px 2px", position: "relative" }}>
      {/* day-of-week header */}
      <div
        style={{
          display: `grid`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: cellGap,
          marginBottom: 8,
        }}
      >
        {Array.from({ length: cols }).map((_, ci) => {
          const isToday = ci === todayCol;
          return (
            <span
              key={ci}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: isToday ? 700 : 500,
                color: isToday ? T.ink : T.faint,
                letterSpacing: 0.4,
                fontFamily: T.font,
                lineHeight: 1,
              }}
            >
              {dayLabel(ci)}
            </span>
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: cellGap,
          position: "relative",
        }}
      >
        {/* today column band */}
        <span
          style={{
            gridColumn: `${todayCol + 1} / span 1`,
            gridRow: `1 / span ${rows.length}`,
            background: "rgba(15,15,15,0.045)",
            borderRadius: 8,
            margin: `-4px -${Math.max(2, cellGap - 1)}px`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        {rows.map((row, ri) =>
          Array.from({ length: cols }).map((_, ci) => {
            const lit = litAt(row, ci);
            const isFuture = ci > todayCol;
            const off = isFuture
              ? "rgba(15,15,15,0.05)"
              : "rgba(15,15,15,0.08)";
            return (
              <span
                key={`${ri}-${ci}`}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: 99,
                  background: lit ? row.color : off,
                  alignSelf: "center",
                  justifySelf: "center",
                  gridColumn: ci + 1,
                  gridRow: ri + 1,
                  position: "relative",
                  zIndex: 1,
                }}
              />
            );
          }),
        )}
      </div>
    </div>
  );
};

// Today habit row - Habit · Today · Streak columns
const TodayHabitRow = ({ h, last }) => {
  const status = h.done ? "done" : h.kind === "count" ? "count" : "idle";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 70px 50px",
        alignItems: "center",
        padding: "14px 18px",
        borderBottom: last ? "none" : `0.5px solid ${T.divider}`,
        fontFamily: T.font,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}
      >
        <HabitColorDot color={h.color} size={11} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
              color: T.ink,
              letterSpacing: -0.3,
              fontWeight: 500,
            }}
          >
            {h.name}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: T.muted,
              marginTop: 1,
              letterSpacing: -0.1,
            }}
          >
            {h.sub}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {status === "done" ? (
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 99,
              background: T.greenSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PI.check size={15} color={T.green} sw={2.4} />
          </span>
        ) : status === "count" ? (
          <span
            style={{
              fontSize: 15,
              color: T.ink,
              fontVariantNumeric: "tabular-nums",
              fontWeight: 500,
              letterSpacing: -0.2,
            }}
          >
            {h.count}
          </span>
        ) : (
          <span style={{ fontSize: 17, color: T.faint }}>-</span>
        )}
      </div>
      <div
        style={{
          textAlign: "right",
          fontSize: 15,
          color: T.muted,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -0.2,
        }}
      >
        {h.streak}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// TODAY SCREEN
// ════════════════════════════════════════════════════════════
const TODAY_GRID = [
  { color: T.habit.blue, days: "1110111110111100" }, // done today
  { color: T.habit.green, days: "1111011110111100" }, // done today
  { color: T.habit.orange, days: "1101111011111100" }, // done today
  { color: T.habit.pink, days: "1110110111111100" }, // done today
  { color: T.habit.cyan, days: "0111101111011100" }, // done today
];

const TodayScreen = () => {
  const habits = HABITS;
  const completed = habits.filter((h) => h.done).length;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.font,
        color: T.ink,
        position: "relative",
      }}
    >
      <PhoneStatus />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <ScreenHeader
          title="Today"
          dateLine="Thursday · May 15"
          trailing={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusChip label="Synced" />
              <CircleButton>
                <PI.plus size={18} color={T.ink2} sw={2} />
              </CircleButton>
            </div>
          }
        />
        {/* hero summary card */}
        <div style={{ padding: "0 18px 16px" }}>
          <Card padding={18} style={{ background: T.card }}>
            <DotGridPreview rows={TODAY_GRID} />
            <div
              style={{
                paddingTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    color: T.ink,
                    letterSpacing: -0.7,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {completed} / {habits.length}
                </span>
                <span
                  style={{ fontSize: 14, color: T.muted, letterSpacing: -0.2 }}
                >
                  completed today
                </span>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 99,
                  background: "#FDEFE0",
                  color: "#B26528",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: -0.1,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <PI.fire size={13} color="#D9743E" sw={1.6} /> 7-day streak
              </span>
            </div>
          </Card>
        </div>
        {/* habit list */}
        <div style={{ padding: "0 18px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 70px 50px",
              padding: "0 18px 8px",
              fontSize: 12,
              color: T.muted,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            <span>Habit</span>
            <span style={{ textAlign: "center" }}>Today</span>
            <span style={{ textAlign: "right" }}>Streak</span>
          </div>
          <Card>
            {habits.map((h, i) => (
              <TodayHabitRow key={h.id} h={h} last={i === habits.length - 1} />
            ))}
          </Card>
          <div
            style={{
              marginTop: 10,
              background: T.card,
              borderRadius: T.r.xxl,
              border: `0.5px dashed ${T.borderStrong}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "15px 18px",
              color: T.muted,
              fontSize: 15,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 99,
                background: T.bgAlt,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PI.plus size={14} color={T.ink2} sw={2} />
            </span>
            Add habit
          </div>
        </div>
      </div>
      <TabBar active="today" deviceDot />
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// HISTORY SCREEN (v2 - filter pills · day strip · day detail · highlights)
// Static port of the app's redesigned History screen.
// ════════════════════════════════════════════════════════════
const HIST_HABITS = [
  {
    id: "meditate",
    name: "Meditate",
    color: T.habit.blue,
    pattern: "11101111111111",
  },
  {
    id: "exercise",
    name: "Exercise",
    color: T.habit.green,
    pattern: "11110111111111",
  },
  {
    id: "read",
    name: "Read",
    color: T.habit.orange,
    pattern: "11001101101111",
  },
  {
    id: "hydrate",
    name: "Hydrate",
    color: T.habit.pink,
    pattern: "11101101111110",
  },
  {
    id: "journal",
    name: "Journal",
    color: T.habit.cyan,
    pattern: "01111011101111",
  },
  {
    id: "nosugar",
    name: "No Sugar",
    color: T.habit.purple,
    pattern: "11101101110100",
  },
];
const HIST_TODAY = new Date(2024, 4, 15);
const HIST_DOW = ["S", "M", "T", "W", "T", "F", "S"];
const HIST_FULL_DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HIST_MON = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const HIST_SEL_AGO = 1; // yesterday selected
const HIST_DETAIL = {
  meditate: "7:50 AM · 12 min",
  exercise: "7:00 AM · 35 min · Bike",
  read: "24 pages",
  hydrate: "8 / 8 cups",
  journal: "morning + evening",
  nosugar: "dessert",
};
const histDoneAt = (h, ago) => h.pattern[(13 - (ago % 14) + 14) % 14] === "1";
const histDoneCount = (ago) =>
  HIST_HABITS.reduce((a, h) => a + (histDoneAt(h, ago) ? 1 : 0), 0);
const histPct = () => {
  let d = 0;
  for (const h of HIST_HABITS)
    for (let i = 0; i < 14; i++) if (histDoneAt(h, i)) d++;
  return Math.round((d / (HIST_HABITS.length * 14)) * 100);
};

const HLight = ({ overline, icon, accent, primary, stat, secondary }) => (
  <Card padding="12px 14px" style={{ minHeight: 96 }}>
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 99,
          background: `${accent}1F`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: T.muted,
          textTransform: "uppercase",
        }}
      >
        {overline}
      </span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 6,
        marginTop: "auto",
      }}
    >
      <span
        style={{
          fontSize: 14.5,
          fontWeight: 600,
          color: T.ink,
          letterSpacing: -0.25,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}
      >
        {primary}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: accent,
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        {stat}
      </span>
    </div>
    <div
      style={{
        fontSize: 11.5,
        color: T.muted,
        marginTop: 4,
        letterSpacing: -0.1,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {secondary}
    </div>
  </Card>
);

const HistoryScreen = () => {
  const pct = histPct();
  const selDate = new Date(HIST_TODAY);
  selDate.setDate(selDate.getDate() - HIST_SEL_AGO);
  const selDone = histDoneCount(HIST_SEL_AGO);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.font,
        color: T.ink,
        position: "relative",
      }}
    >
      <PhoneStatus />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <ScreenHeader
          title="History"
          subtitle={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                color: T.muted,
              }}
            >
              May 2024 <PI.chevronDown size={12} color={T.muted} sw={2.2} />
            </span>
          }
          trailing={
            <div
              style={{
                display: "inline-flex",
                background: T.bgAlt,
                borderRadius: 99,
                padding: 2,
              }}
            >
              {["7D", "14D", "30D"].map((t, i) => (
                <span
                  key={t}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 99,
                    background: i === 1 ? T.card : "transparent",
                    boxShadow: i === 1 ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: i === 1 ? T.ink : T.muted,
                    letterSpacing: 0.2,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          }
        />
        {/* filter pills */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            padding: "0 18px 12px",
            scrollbarWidth: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "7px 12px",
              borderRadius: 99,
              background: T.ink,
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            All
          </span>
          {HIST_HABITS.map((h) => (
            <span
              key={h.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                borderRadius: 99,
                background: T.card,
                border: `0.5px solid ${T.border}`,
                color: T.ink2,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: h.color,
                }}
              />
              {h.name}
            </span>
          ))}
        </div>
        <div
          style={{
            padding: "0 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* label + day strip */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                padding: "2px 4px 8px",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: -0.4,
                }}
              >
                Last 14 days
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: T.muted,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: T.ink, fontWeight: 600 }}>{pct}%</span>{" "}
                completed
              </span>
            </div>
            <Card padding="12px 10px">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(14, 1fr)",
                  gap: 2,
                }}
              >
                {Array.from({ length: 14 }).map((_, i) => {
                  const ago = 13 - i;
                  const d = new Date(HIST_TODAY);
                  d.setDate(d.getDate() - ago);
                  const isToday = ago === 0;
                  const isSel = ago === HIST_SEL_AGO;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        padding: "5px 0",
                        borderRadius: 12,
                        background: isSel ? T.ink : "transparent",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          color: isSel
                            ? "rgba(255,255,255,0.7)"
                            : isToday
                              ? T.ink2
                              : T.faint,
                          letterSpacing: 0.3,
                          textTransform: "uppercase",
                        }}
                      >
                        {HIST_DOW[d.getDay()]}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontVariantNumeric: "tabular-nums",
                          fontWeight: isToday || isSel ? 700 : 500,
                          color: isSel ? "#fff" : isToday ? T.ink : T.ink2,
                          letterSpacing: -0.2,
                          lineHeight: 1,
                        }}
                      >
                        {d.getDate()}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          padding: "1px 0",
                          minHeight: 18,
                          alignItems: "center",
                        }}
                      >
                        {HIST_HABITS.map((h) => (
                          <span
                            key={h.id}
                            style={{
                              width: 14,
                              height: 2.5,
                              borderRadius: 1.5,
                              background: histDoneAt(h, ago)
                                ? h.color
                                : isSel
                                  ? "rgba(255,255,255,0.22)"
                                  : "rgba(15,15,15,0.08)",
                            }}
                          />
                        ))}
                      </div>
                      {isToday && !isSel ? (
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 99,
                            background: T.green,
                          }}
                        />
                      ) : (
                        <span style={{ width: 4, height: 4 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          {/* day detail */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                padding: "2px 4px 8px",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: -0.4,
                }}
              >
                Yesterday · {HIST_FULL_DOW[selDate.getDay()]},{" "}
                {HIST_MON[selDate.getMonth()]} {selDate.getDate()}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: T.muted,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {selDone} of {HIST_HABITS.length} done
              </span>
            </div>
            <Card>
              {HIST_HABITS.map((h, i) => {
                const done = histDoneAt(h, HIST_SEL_AGO);
                return (
                  <div
                    key={h.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "20px 1fr auto",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom:
                        i === HIST_HABITS.length - 1
                          ? "none"
                          : `0.5px solid ${T.divider}`,
                    }}
                  >
                    <HabitColorDot color={h.color} size={9} />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          color: T.ink,
                          letterSpacing: -0.25,
                          fontWeight: 500,
                          opacity: done ? 1 : 0.7,
                        }}
                      >
                        {h.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: T.muted,
                          letterSpacing: -0.1,
                          marginTop: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {HIST_DETAIL[h.id] || (done ? "done" : "-")}
                      </div>
                    </div>
                    {done ? (
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          background: T.greenSoft,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PI.check size={12} color={T.green} sw={2.6} />
                      </span>
                    ) : (
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          background: T.bgAlt,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: T.faint,
                          fontSize: 14,
                        }}
                      >
                        -
                      </span>
                    )}
                  </div>
                );
              })}
            </Card>
          </div>
          {/* highlights */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                padding: "2px 4px 8px",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: T.ink,
                  letterSpacing: -0.4,
                }}
              >
                Highlights
              </span>
              <span style={{ fontSize: 13, color: T.muted }}>
                Notable moments · last 14 days
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <HLight
                overline="Best run"
                icon={<PI.fire size={11} color={T.habit.orange} sw={1.6} />}
                accent={T.habit.orange}
                primary={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <HabitColorDot color={T.habit.blue} size={7} /> Meditate
                  </span>
                }
                stat="10d"
                secondary="consecutive days"
              />
              <HLight
                overline="Perfect day"
                icon={<PI.check size={11} color={T.green} sw={2.4} />}
                accent={T.green}
                primary="Fri May 3"
                stat="6/6"
                secondary="all habits done"
              />
              <HLight
                overline="Comeback"
                icon={<PI.arrowUp size={11} color={T.habit.cyan} sw={2.2} />}
                accent={T.habit.cyan}
                primary={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <HabitColorDot color={T.habit.orange} size={7} /> Read
                  </span>
                }
                stat="Mon May 6"
                secondary="back after 2-day gap"
              />
              <HLight
                overline="Quietest day"
                icon={<PI.moon size={11} color={T.habit.purple} sw={1.7} />}
                accent={T.habit.purple}
                primary="Sun May 5"
                stat="3/6"
                secondary="habits done"
              />
            </div>
          </div>
        </div>
      </div>
      <TabBar active="history" />
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STATS · OVERVIEW SCREEN
// ════════════════════════════════════════════════════════════
const StatCard = ({ icon, iconBg, value, label, delta, sub }) => (
  <Card padding={14}>
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 99,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
      }}
    >
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: -0.7,
        lineHeight: 1.05,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: 13,
        color: T.muted,
        letterSpacing: -0.1,
        marginTop: 2,
      }}
    >
      {label}
    </div>
    {delta && (
      <div
        style={{
          fontSize: 12,
          color: T.green,
          marginTop: 6,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <PI.arrowUp size={10} color={T.green} sw={2.4} />{" "}
        {delta.replace(/^\+/, "")}
      </div>
    )}
    {sub && (
      <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{sub}</div>
    )}
  </Card>
);

const StatsLineChart = () => {
  const pts = [50, 58, 75, 92, 65, 75, 88];
  const W = 320,
    H = 130,
    P = 8;
  const dx = (W - P * 2) / (pts.length - 1);
  const yFor = (v) => H - P - (v / 100) * (H - P * 2 - 8);
  const linePath = pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${P + i * dx} ${yFor(v)}`)
    .join(" ");
  const areaPath = `${linePath} L ${P + (pts.length - 1) * dx} ${H - P} L ${P} ${H - P} Z`;
  return (
    <div style={{ display: "flex", alignItems: "stretch", height: H + 24 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontSize: 10,
          color: T.muted,
          paddingRight: 8,
          paddingBottom: 22,
          paddingTop: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
      <div style={{ flex: 1 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          preserveAspectRatio="none"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line
              key={i}
              x1={P}
              x2={W - P}
              y1={P + p * (H - P * 2 - 8)}
              y2={P + p * (H - P * 2 - 8)}
              stroke={T.divider}
              strokeWidth="0.5"
            />
          ))}
          <path d={areaPath} fill="url(#rt-grn)" opacity="0.7" />
          <path
            d={linePath}
            fill="none"
            stroke={T.green}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {pts.map((v, i) => (
            <circle
              key={i}
              cx={P + i * dx}
              cy={yFor(v)}
              r="2.5"
              fill={T.green}
            />
          ))}
          <defs>
            <linearGradient id="rt-grn" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={T.green} stopOpacity="0.18" />
              <stop offset="100%" stopColor={T.green} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            fontSize: 11,
            color: T.muted,
            textAlign: "center",
            paddingTop: 6,
          }}
        >
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsOverviewScreen = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: T.font,
      color: T.ink,
      position: "relative",
    }}
  >
    <PhoneStatus />
    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
      <ScreenHeader
        title="Stats"
        subtitle="Your progress at a glance"
        trailing={
          <CircleButton size={36}>
            <PI.filter size={15} color={T.ink2} sw={1.8} />
          </CircleButton>
        }
      />
      <div style={{ padding: "0 18px 24px" }}>
        {/* segmented tabs */}
        <div
          style={{
            display: "flex",
            background: T.bgAlt,
            borderRadius: 99,
            padding: 3,
            marginBottom: 18,
          }}
        >
          {["Overview", "Habits", "Trends", "Streaks"].map((s, i) => (
            <span
              key={s}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 99,
                background: i === 0 ? T.card : "transparent",
                boxShadow: i === 0 ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                fontSize: 13,
                fontWeight: 600,
                color: i === 0 ? T.green : T.muted,
                letterSpacing: -0.2,
              }}
            >
              {s}
            </span>
          ))}
        </div>
        {/* section label */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            padding: "0 4px 12px",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: T.ink,
              letterSpacing: -0.4,
            }}
          >
            Summary
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              color: T.muted,
            }}
          >
            This week <PI.chevronDown size={12} color={T.muted} sw={2} />
          </span>
        </div>
        {/* 2×2 stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <StatCard
            icon={<PI.check color={T.green} sw={2.4} />}
            iconBg={T.greenSoft}
            value="28"
            label="Completions"
            delta="18% vs last week"
          />
          <StatCard
            icon={<PI.target color={T.blue} sw={1.7} />}
            iconBg="#EAF0FE"
            value="78%"
            label="Success rate"
            delta="12% vs last week"
          />
          <StatCard
            icon={<PI.fire color={T.habit.orange} sw={1.7} />}
            iconBg="#FDEFE0"
            value="12"
            label="Current streak"
            sub="Best · 28 days"
          />
          <StatCard
            icon={
              <PI.star color={T.habit.purple} fill={T.habit.purple} sw={1.5} />
            }
            iconBg="#F0EBFB"
            value="5"
            label="Habits on track"
            sub="Out of 6"
          />
        </div>
        {/* completion chart */}
        <Card padding={16}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}
            >
              Completion rate
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                color: T.muted,
              }}
            >
              This week <PI.chevronDown size={12} color={T.muted} sw={2} />
            </span>
          </div>
          <StatsLineChart />
        </Card>
      </div>
    </div>
    <TabBar active="stats" />
  </div>
);

// ════════════════════════════════════════════════════════════
// STATS · HABITS SCREEN
// ════════════════════════════════════════════════════════════
const STATS_HABITS = [
  {
    id: "meditate",
    name: "Meditate",
    color: T.habit.blue,
    streak: 28,
    rate: 93,
    pattern: "11011111111111",
  },
  {
    id: "journal",
    name: "Journal",
    color: T.habit.cyan,
    streak: 21,
    rate: 86,
    pattern: "01111011101111",
  },
  {
    id: "read",
    name: "Read",
    color: T.habit.orange,
    streak: 15,
    rate: 71,
    pattern: "11011101101111",
  },
  {
    id: "exercise",
    name: "Exercise",
    color: T.habit.green,
    streak: 12,
    rate: 64,
    pattern: "11110111111011",
  },
  {
    id: "hydrate",
    name: "Hydrate",
    color: T.habit.pink,
    streak: 7,
    rate: 50,
    pattern: "11101101111110",
    atRisk: true,
  },
  {
    id: "nosugar",
    name: "No Sugar",
    color: T.habit.purple,
    streak: 5,
    rate: 43,
    pattern: "11101101110100",
    atRisk: true,
  },
];

const StatsHabitsScreen = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: T.font,
      color: T.ink,
      position: "relative",
    }}
  >
    <PhoneStatus />
    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
      <ScreenHeader
        title="Stats"
        subtitle="Your progress at a glance"
        trailing={
          <CircleButton size={36}>
            <PI.filter size={15} color={T.ink2} sw={1.8} />
          </CircleButton>
        }
      />
      <div style={{ padding: "0 18px 20px" }}>
        {/* segmented tabs */}
        <div
          style={{
            display: "flex",
            background: T.bgAlt,
            borderRadius: 99,
            padding: 3,
            marginBottom: 18,
          }}
        >
          {["Overview", "Habits", "Trends", "Streaks"].map((s, i) => (
            <span
              key={s}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 99,
                background: i === 1 ? T.card : "transparent",
                boxShadow: i === 1 ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                fontSize: 13,
                fontWeight: 600,
                color: i === 1 ? T.green : T.muted,
                letterSpacing: -0.2,
              }}
            >
              {s}
            </span>
          ))}
        </div>
        {/* insight */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: T.r.lg,
            marginBottom: 14,
            background: T.greenSoft,
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 99,
              background: T.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PI.star size={13} color="#fff" fill="#fff" sw={1.5} />
          </span>
          <span
            style={{
              fontSize: 12.5,
              color: "#1c7a44",
              letterSpacing: -0.1,
              lineHeight: 1.35,
            }}
          >
            <strong>Meditate</strong> is your strongest habit right now - 28
            days and counting.
          </span>
        </div>
        {/* sort chips */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: T.muted,
              letterSpacing: -0.1,
              flexShrink: 0,
            }}
          >
            Sort by
          </span>
          {["Streak", "Rate", "Name"].map((s, i) => (
            <span
              key={s}
              style={{
                padding: "5px 10px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
                background: i === 0 ? T.ink : T.card,
                color: i === 0 ? "#fff" : T.ink2,
                border: i === 0 ? "none" : `0.5px solid ${T.border}`,
                letterSpacing: -0.1,
              }}
            >
              {s}
            </span>
          ))}
        </div>
        {/* per-habit list */}
        <Card padding="6px 0">
          {STATS_HABITS.map((h, i) => {
            const cells = h.pattern
              .slice(-7)
              .split("")
              .map((c) => c === "1");
            return (
              <div
                key={h.id}
                style={{
                  padding: "11px 14px",
                  borderBottom:
                    i < STATS_HABITS.length - 1
                      ? `0.5px solid ${T.divider}`
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 7,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <HabitColorDot color={h.color} size={10} />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: T.ink,
                        letterSpacing: -0.2,
                      }}
                    >
                      {h.name}
                    </span>
                    {h.atRisk && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: 99,
                          background: "#FEF3E0",
                          color: "#96710A",
                          letterSpacing: 0.1,
                        }}
                      >
                        Log today
                      </span>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 3 }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: h.streak >= 21 ? T.habit.orange : T.ink2,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {h.streak}d
                    </span>
                    {h.streak >= 7 && (
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 99,
                          background: h.streak >= 14 ? "#FDE8CE" : T.bgAlt,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PI.fire
                          size={9}
                          color={h.streak >= 14 ? T.habit.orange : T.faint}
                          sw={1.6}
                        />
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 99,
                      background: "rgba(15,15,15,0.07)",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        height: "100%",
                        width: `${h.rate}%`,
                        borderRadius: 99,
                        background: h.color,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: T.muted,
                      letterSpacing: -0.1,
                      minWidth: 28,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {h.rate}%
                  </span>
                </div>
                {/* mini 7-day heatmap */}
                <div style={{ display: "flex", gap: 4 }}>
                  {cells.map((done, ci) => (
                    <div
                      key={ci}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: done ? h.color : "rgba(15,15,15,0.06)",
                        border:
                          ci === 6 && !done ? `1.5px solid ${h.color}` : "none",
                        boxSizing: "border-box",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
    <TabBar active="stats" />
  </div>
);

// ════════════════════════════════════════════════════════════
// DETAIL SCREEN DATA (shared by all three)
// ════════════════════════════════════════════════════════════
const DETAIL_DAYS = 84;
const DETAIL_NOW = new Date(2024, 4, 16);
const DETAIL_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ONCE_MISSES = new Set([4, 11, 17, 27, 34, 41, 53, 62, 70, 80]);
const ONCE_DATA = Array.from({ length: DETAIL_DAYS }, (_, i) => ({
  date: new Date(DETAIL_NOW.getTime() - (DETAIL_DAYS - 1 - i) * 86400000),
  done: !ONCE_MISSES.has(i),
}));

const COUNT_DATA = Array.from({ length: DETAIL_DAYS }, (_, i) => {
  const base =
    6 + Math.round(Math.sin(i * 0.55) * 2 + Math.cos(i * 0.27) * 1.6);
  let v = Math.max(2, Math.min(11, base));
  if (i === DETAIL_DAYS - 1) v = 3;
  if (i === DETAIL_DAYS - 2) v = 9;
  if (i === DETAIL_DAYS - 9) v = 0;
  return {
    date: new Date(DETAIL_NOW.getTime() - (DETAIL_DAYS - 1 - i) * 86400000),
    value: v,
    target: 8,
  };
});

const TIMER_DATA = Array.from({ length: DETAIL_DAYS }, (_, i) => {
  const skips = new Set([6, 14, 23, 31, 42, 53, 61, 68, 78]);
  if (skips.has(i))
    return {
      date: new Date(DETAIL_NOW.getTime() - (DETAIL_DAYS - 1 - i) * 86400000),
      sessions: [],
      target: 20,
    };
  const base = Math.round(15 + Math.sin(i * 0.38) * 6 + (i % 3 === 0 ? 4 : 0));
  if (i % 9 === 4)
    return {
      date: new Date(DETAIL_NOW.getTime() - (DETAIL_DAYS - 1 - i) * 86400000),
      sessions: [Math.max(8, base - 6), Math.max(6, base - 8)],
      target: 20,
    };
  if (i === DETAIL_DAYS - 1)
    return { date: DETAIL_NOW, sessions: [], target: 20 };
  return {
    date: new Date(DETAIL_NOW.getTime() - (DETAIL_DAYS - 1 - i) * 86400000),
    sessions: [Math.max(6, Math.min(34, base))],
    target: 20,
  };
});

// ── shared detail components ─────────────────────────────────
const DetailHeader = ({ name, color, sub }) => (
  <div>
    <div
      style={{
        padding: "8px 18px 4px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <CircleButton size={36}>
        <PI.chevronLeft size={16} color={T.ink2} sw={2} />
      </CircleButton>
      <CircleButton size={36}>
        <PI.more size={16} color={T.ink2} />
      </CircleButton>
    </div>
    <div style={{ padding: "4px 22px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <HabitColorDot color={color} size={16} />
          <h1
            style={{
              margin: 0,
              fontFamily: T.fontDisplay,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: -0.9,
            }}
          >
            {name}
          </h1>
        </div>
        <StatusChip label="Synced" />
      </div>
      <div
        style={{
          fontSize: 14,
          color: T.muted,
          letterSpacing: -0.2,
          marginBottom: 14,
        }}
      >
        {sub}
      </div>
    </div>
  </div>
);

const DetailSectionLabel = ({ left, right }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "8px 6px 8px",
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: T.faint,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {left}
    </span>
    {right && (
      <span
        style={{
          fontSize: 12,
          color: T.muted,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {right}
      </span>
    )}
  </div>
);

const DetailStatsStrip = ({ items }) => (
  <Card padding="14px 8px">
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-around",
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            padding: "0 2px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 2,
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: T.ink,
                letterSpacing: -0.7,
                fontVariantNumeric: "tabular-nums",
                fontFamily: T.fontDisplay,
              }}
            >
              {it.value}
            </span>
            {it.unit && (
              <span style={{ fontSize: 11, color: T.muted }}>{it.unit}</span>
            )}
          </div>
          <span style={{ fontSize: 10.5, color: T.muted, textAlign: "center" }}>
            {it.label}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

const DetailFooterCards = ({ color }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <Card padding="12px 14px">
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: `${color}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PI.bluetooth size={12} color={color} sw={1.6} />
        </span>
        <span style={{ flex: 1, color: T.ink, fontWeight: 500 }}>
          Desk Tracker
        </span>
        <span style={{ color: T.green, fontWeight: 600, fontSize: 11 }}>
          ON
        </span>
      </div>
    </Card>
    <Card padding="12px 14px">
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: T.bgAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PI.clock size={12} color={T.ink2} sw={1.6} />
        </span>
        <span style={{ flex: 1, color: T.ink, fontWeight: 500 }}>Reminder</span>
        <span style={{ color: T.muted }}>Daily · 7:00 AM</span>
      </div>
    </Card>
  </div>
);

// ── HeatmapGrid (once-type) ──────────────────────────────────
const DetailHeatmap = ({ data, color, cols = 14 }) => {
  const todayDow = (DETAIL_NOW.getDay() + 6) % 7;
  const DOW = ["M", "T", "W", "T", "F", "S", "S"];
  const grid = Array.from({ length: cols * 7 }, () => null);
  let c = cols - 1,
    r = todayDow;
  for (let i = data.length - 1; i >= 0; i--) {
    if (c < 0) break;
    grid[c * 7 + r] = { done: data[i].done, date: data[i].date };
    r -= 1;
    if (r < 0) {
      r = 6;
      c -= 1;
    }
  }
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingTop: 12,
        }}
      >
        {DOW.map((d, i) => (
          <span
            key={i}
            style={{
              fontSize: 8,
              color: T.faint,
              letterSpacing: 0.4,
              lineHeight: 1,
              height: 10,
              display: "flex",
              alignItems: "center",
              visibility: i % 2 === 0 ? "visible" : "hidden",
            }}
          >
            {d}
          </span>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 3,
            marginBottom: 3,
            height: 10,
          }}
        >
          {Array.from({ length: cols }).map((_, ci) => {
            let prevMonth = null;
            for (let ri = 0; ri < 7; ri++) {
              const cell = grid[(ci - 1) * 7 + ri];
              if (cell) {
                prevMonth = cell.date.getMonth();
                break;
              }
            }
            let firstCell = null;
            for (let ri = 0; ri < 7; ri++) {
              const cell = grid[ci * 7 + ri];
              if (cell) {
                firstCell = cell;
                break;
              }
            }
            const show =
              firstCell &&
              (ci === 0 || firstCell.date.getMonth() !== prevMonth);
            return (
              <span
                key={ci}
                style={{
                  fontSize: 8,
                  color: T.faint,
                  fontWeight: 500,
                  letterSpacing: 0.3,
                  lineHeight: 1,
                  visibility: show ? "visible" : "hidden",
                }}
              >
                {show ? DETAIL_MONTHS[firstCell.date.getMonth()] : ""}
              </span>
            );
          })}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 3,
          }}
        >
          {Array.from({ length: cols }).map((_, ci) => (
            <div
              key={ci}
              style={{
                display: "grid",
                gridTemplateRows: "repeat(7, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 7 }).map((__, ri) => {
                const cell = grid[ci * 7 + ri];
                const isToday = ci === cols - 1 && ri === todayDow;
                if (!cell)
                  return <span key={ri} style={{ aspectRatio: "1/1" }} />;
                return (
                  <span
                    key={ri}
                    style={{
                      aspectRatio: "1/1",
                      borderRadius: 3,
                      background: cell.done ? color : "rgba(15,15,15,0.05)",
                      boxShadow: isToday
                        ? cell.done
                          ? `inset 0 0 0 2px rgba(255,255,255,0.55)`
                          : `0 0 0 1.5px ${color}`
                        : "none",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── DailyBars (count/timer types) ────────────────────────────
const DetailBars = ({ data, color, target, valueOf, days = 28, unit }) => {
  const slice = data.slice(-days);
  const maxVal = Math.max(target * 1.3, ...slice.map(valueOf));
  const pt = (v) => Math.max(2, (v / maxVal) * 100);
  const targetPct = (target / maxVal) * 100;
  return (
    <div style={{ position: "relative" }}>
      {/* target line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: `${targetPct}%`,
          height: 0,
          borderTop: `1px dashed ${color}aa`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <span
        style={{
          position: "absolute",
          right: 0,
          bottom: `${targetPct + 0.5}%`,
          fontSize: 8,
          color: T.muted,
          pointerEvents: "none",
          zIndex: 1,
          lineHeight: 1,
        }}
      >
        {target}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          height: 82,
          padding: "2px 0",
        }}
      >
        {slice.map((d, i) => {
          const v = valueOf(d);
          const isToday = i === slice.length - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
              }}
            >
              <span
                style={{
                  width: "100%",
                  height: `${pt(v)}%`,
                  borderRadius: "3px 3px 0 0",
                  background: isToday ? color : `${color}88`,
                  opacity: v === 0 ? 0.3 : 1,
                  minHeight: v > 0 ? 3 : 2,
                }}
              />
              {isToday && (
                <span
                  style={{
                    marginTop: 4,
                    width: 3,
                    height: 3,
                    borderRadius: 99,
                    background: color,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 06a · DETAIL · ONCE (Meditate)
// ════════════════════════════════════════════════════════════
const HabitDetailOnceScreen = () => {
  const color = T.habit.blue;
  const doneToday = ONCE_DATA[ONCE_DATA.length - 1].done;
  const currentStreak = (() => {
    let s = 0;
    for (let i = ONCE_DATA.length - 1; i >= 0; i--) {
      if (ONCE_DATA[i].done) s++;
      else break;
    }
    return s;
  })();
  const bestStreak = (() => {
    let s = 0,
      max = 0;
    for (const d of ONCE_DATA) {
      if (d.done) {
        s++;
        max = Math.max(max, s);
      } else s = 0;
    }
    return max;
  })();
  const totalDone = ONCE_DATA.filter((d) => d.done).length;
  const last30Done = ONCE_DATA.slice(-30).filter((d) => d.done).length;
  const recent = ONCE_DATA.filter((d) => d.done)
    .slice(-5)
    .reverse();
  const recentTimes = ["7:14 AM", "7:08 AM", "7:22 AM", "7:11 AM", "6:58 AM"];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.font,
        color: T.ink,
        position: "relative",
      }}
    >
      <PhoneStatus />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <DetailHeader
          name="Meditate"
          color={color}
          sub="Daily · Morning · 10 min · Started Mar 2024"
        />
        <div style={{ padding: "0 18px 20px" }}>
          {/* Log card */}
          <Card padding="16px 16px" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 99,
                  flexShrink: 0,
                  background: doneToday ? color : T.card,
                  border: doneToday ? "none" : `1.8px solid ${T.borderStrong}`,
                  boxShadow: doneToday
                    ? `0 6px 16px ${color}55`
                    : `inset 0 0 0 6px ${T.card}, 0 0 0 0.5px ${T.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {doneToday && <PI.check size={28} color="#fff" sw={2.6} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: T.ink,
                    letterSpacing: -0.3,
                  }}
                >
                  {doneToday ? "Done for today" : "Tap to log today"}
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
                  {doneToday ? "Logged today · 7:19 AM" : "Thursday, May 16"}
                </div>
                {doneToday && (
                  <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: T.muted,
                        padding: "4px 8px",
                        borderRadius: 99,
                        background: T.bgAlt,
                      }}
                    >
                      Undo
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: T.muted,
                        padding: "4px 8px",
                        borderRadius: 99,
                        background: T.bgAlt,
                      }}
                    >
                      + Note
                    </span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center", paddingRight: 2 }}>
                <div
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 28,
                    fontWeight: 700,
                    color: T.ink,
                    letterSpacing: -0.8,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {currentStreak}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: T.muted,
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontWeight: 600,
                  }}
                >
                  day streak
                </div>
              </div>
            </div>
          </Card>
          {/* Heatmap */}
          <DetailSectionLabel
            left="Past 12 weeks"
            right={`${totalDone} / ${DETAIL_DAYS} days`}
          />
          <Card padding="14px 12px 10px" style={{ marginBottom: 12 }}>
            <DetailHeatmap data={ONCE_DATA} color={color} cols={14} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                paddingTop: 10,
                borderTop: `0.5px solid ${T.divider}`,
                fontSize: 11,
                color: T.muted,
                letterSpacing: -0.1,
              }}
            >
              <span>Each square is one day · today outlined</span>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: "rgba(15,15,15,0.05)",
                  }}
                />
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: color,
                  }}
                />
              </span>
            </div>
          </Card>
          {/* Stats */}
          <DetailStatsStrip
            items={[
              { value: currentStreak, unit: "days", label: "Current streak" },
              { value: bestStreak, unit: "days", label: "Best streak" },
              {
                value: `${Math.round((last30Done * 100) / 30)}`,
                unit: "%",
                label: "Last 30 days",
              },
            ]}
          />
          <div style={{ height: 14 }} />
          {/* Recent completions */}
          <DetailSectionLabel
            left="Recent completions"
            right={`Last ${recent.length}`}
          />
          <Card style={{ marginBottom: 12 }}>
            {recent.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderBottom:
                    i === recent.length - 1
                      ? "none"
                      : `0.5px solid ${T.divider}`,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: `${color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PI.check size={12} color={color} sw={2.6} />
                </span>
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: T.ink,
                    letterSpacing: -0.2,
                  }}
                >
                  {i === 0
                    ? "Today"
                    : i === 1
                      ? "Yesterday"
                      : `${DETAIL_MONTHS[d.date.getMonth()]} ${d.date.getDate()}`}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {recentTimes[i % recentTimes.length]}
                </span>
              </div>
            ))}
          </Card>
          <DetailFooterCards color={color} />
        </div>
      </div>
      <TabBar active="today" />
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 06b · DETAIL · COUNT (Hydrate)
// ════════════════════════════════════════════════════════════
const HabitDetailCountScreen = () => {
  const color = T.habit.pink;
  const today = COUNT_DATA[COUNT_DATA.length - 1];
  const value = today.value;
  const target = today.target;
  const last30 = COUNT_DATA.slice(-30);
  const daysHit = last30.filter((d) => d.value >= target).length;
  const avg = (last30.reduce((s, d) => s + d.value, 0) / 30).toFixed(1);
  const currentStreak = (() => {
    let s = 0;
    for (let i = COUNT_DATA.length - 2; i >= 0; i--) {
      if (COUNT_DATA[i].value >= target) s++;
      else break;
    }
    return s;
  })();
  const todayEntries = [
    { t: "7:30 AM", n: "+1 cup" },
    { t: "9:15 AM", n: "+1 cup" },
    { t: "11:02 AM", n: "+1 cup" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.font,
        color: T.ink,
        position: "relative",
      }}
    >
      <PhoneStatus />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <DetailHeader
          name="Hydrate"
          color={color}
          sub="Daily · 8 cups · Count habit"
        />
        <div style={{ padding: "0 18px 20px" }}>
          {/* Stepper log card */}
          <Card padding="14px 14px 12px" style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 40,
                    fontWeight: 700,
                    color: T.ink,
                    letterSpacing: -1.2,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 20,
                    fontWeight: 600,
                    color: T.faint,
                    letterSpacing: -0.5,
                    marginLeft: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  /{target}
                </span>
                <span style={{ fontSize: 13, color: T.muted, marginLeft: 6 }}>
                  cups today
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    background: T.bgAlt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PI.minus size={14} color={T.ink2} sw={2.4} />
                </span>
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 99,
                    background: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${color}55`,
                  }}
                >
                  <PI.plus size={18} color="#fff" sw={2.6} />
                </span>
              </div>
            </div>
            {/* pips */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${target}, 1fr)`,
                gap: 3,
              }}
            >
              {Array.from({ length: target }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    height: 8,
                    borderRadius: 3,
                    background: i < value ? color : `${color}22`,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: T.muted,
                letterSpacing: -0.1,
              }}
            >
              <span>{Math.round((value * 100) / target)}% of today</span>
              <span>{target - value} cups left</span>
            </div>
            {/* quick log chips */}
            <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
              {["+1", "+2", "+3", "Custom"].map((l) => (
                <span
                  key={l}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "7px 0",
                    borderRadius: 99,
                    background: T.bgAlt,
                    color: T.ink2,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: -0.1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </Card>
          {/* Bar chart */}
          <DetailSectionLabel
            left="Past 28 days"
            right={`Target ${target} cups · ${daysHit}/30 days hit`}
          />
          <Card padding="14px 12px 10px" style={{ marginBottom: 12 }}>
            <DetailBars
              data={COUNT_DATA}
              color={color}
              target={target}
              valueOf={(d) => d.value}
              days={28}
              unit="cups"
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 8,
                borderTop: `0.5px solid ${T.divider}`,
                fontSize: 11,
                color: T.muted,
                letterSpacing: -0.1,
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 12,
                    height: 0,
                    borderTop: `1px dashed ${color}aa`,
                  }}
                />{" "}
                Daily target ({target})
              </span>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: color,
                  }}
                />{" "}
                Today
              </span>
            </div>
          </Card>
          {/* Stats */}
          <DetailStatsStrip
            items={[
              { value: avg, label: "Avg per day", unit: "" },
              { value: daysHit, unit: "/30", label: "Days hit target" },
              {
                value: currentStreak,
                unit: "days",
                label: "Hit-target streak",
              },
            ]}
          />
          <div style={{ height: 14 }} />
          {/* Today's logs */}
          <DetailSectionLabel
            left="Today's logs"
            right={`${todayEntries.length} entries`}
          />
          <Card style={{ marginBottom: 12 }}>
            {todayEntries.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderBottom:
                    i === todayEntries.length - 1
                      ? "none"
                      : `0.5px solid ${T.divider}`,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: `${color}22`,
                    color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  +1
                </span>
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: T.ink,
                    letterSpacing: -0.2,
                  }}
                >
                  {e.n}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    fontVariantNumeric: "tabular-nums",
                    marginRight: 6,
                  }}
                >
                  {e.t}
                </span>
                <PI.undo size={12} color={T.faint} sw={1.8} />
              </div>
            ))}
          </Card>
          <DetailFooterCards color={color} />
        </div>
      </div>
      <TabBar active="today" />
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 06c · DETAIL · TIMER (Read)
// ════════════════════════════════════════════════════════════
const HabitDetailTimerScreen = () => {
  const color = T.habit.orange;
  const target = 20;
  const sumMins = (s) => s.reduce((a, b) => a + b, 0);
  const last30 = TIMER_DATA.slice(-30);
  const totalMonth = last30.reduce((s, d) => s + sumMins(d.sessions), 0);
  const daysHit = last30.filter((d) => sumMins(d.sessions) >= target).length;
  const allSessions = TIMER_DATA.flatMap((d) => d.sessions);
  const longest = Math.max(...allSessions);
  const avgMins = Math.round(totalMonth / 30);

  const recentSessions = [];
  for (
    let i = TIMER_DATA.length - 1;
    i >= 0 && recentSessions.length < 5;
    i--
  ) {
    const d = TIMER_DATA[i];
    for (let si = d.sessions.length - 1; si >= 0; si--) {
      const startH = 14 + ((si + i) % 7);
      const startM = (si * 13 + 32) % 60;
      recentSessions.push({
        date: d.date,
        mins: d.sessions[si],
        startH,
        startM,
        dayIdx: i,
      });
      if (recentSessions.length >= 5) break;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.font,
        color: T.ink,
        position: "relative",
      }}
    >
      <PhoneStatus />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <DetailHeader
          name="Read"
          color={color}
          sub="Daily · 20 min · Timer habit"
        />
        <div style={{ padding: "0 18px 20px" }}>
          {/* Session card */}
          <Card padding="16px 16px 14px" style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 12,
              }}
            >
              {/* Ring */}
              <div
                style={{
                  position: "relative",
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                }}
              >
                <svg width={56} height={56} viewBox="0 0 56 56">
                  <circle
                    cx={28}
                    cy={28}
                    r={24}
                    fill="none"
                    stroke={`${color}22`}
                    strokeWidth={4.5}
                  />
                  <circle
                    cx={28}
                    cy={28}
                    r={24}
                    fill="none"
                    stroke={color}
                    strokeWidth={4.5}
                    strokeDasharray="0 151"
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: T.fontDisplay,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.ink,
                    letterSpacing: -0.3,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  0:00
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: T.ink,
                    letterSpacing: -0.3,
                  }}
                >
                  No session yet today
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
                  Target {target} min · 0 / {target} logged
                </div>
              </div>
            </div>
            {/* preset chips + start */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: 5,
                marginBottom: 8,
              }}
            >
              {["10", "20", "30"].map((p) => (
                <span
                  key={p}
                  style={{
                    textAlign: "center",
                    padding: "8px 0",
                    borderRadius: 12,
                    background: p === "20" ? `${color}22` : T.bgAlt,
                    color: p === "20" ? color : T.ink2,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: -0.1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {p} min
                </span>
              ))}
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: T.bgAlt,
                  color: T.ink2,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Custom
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 44,
                borderRadius: 99,
                background: color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: -0.2,
                boxShadow: `0 4px 12px ${color}55`,
              }}
            >
              <PI.play size={14} color="#fff" /> Start 20-min session
            </div>
          </Card>
          {/* Bar chart */}
          <DetailSectionLabel
            left="Past 28 days · minutes"
            right={`Target ${target} min · ${daysHit}/30 days hit`}
          />
          <Card padding="14px 12px 10px" style={{ marginBottom: 12 }}>
            <DetailBars
              data={TIMER_DATA}
              color={color}
              target={target}
              valueOf={(d) => d.sessions.reduce((a, b) => a + b, 0)}
              days={28}
              unit="min"
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 8,
                borderTop: `0.5px solid ${T.divider}`,
                fontSize: 11,
                color: T.muted,
                letterSpacing: -0.1,
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    background: color,
                  }}
                />{" "}
                1st session
              </span>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 12,
                    height: 0,
                    borderTop: `1px dashed ${color}aa`,
                  }}
                />{" "}
                Target
              </span>
            </div>
          </Card>
          {/* Stats */}
          <DetailStatsStrip
            items={[
              { value: avgMins, unit: "min", label: "Avg per day" },
              {
                value: `${Math.floor(totalMonth / 60)}h ${totalMonth % 60}m`,
                label: "Logged · 30 D",
              },
              { value: longest, unit: "min", label: "Longest session" },
            ]}
          />
          <div style={{ height: 14 }} />
          {/* Recent sessions */}
          <DetailSectionLabel
            left="Recent sessions"
            right={`Last ${recentSessions.length}`}
          />
          <Card style={{ marginBottom: 12 }}>
            {recentSessions.map((s, i) => {
              const endH = s.startH + Math.floor((s.startM + s.mins) / 60);
              const endM = (s.startM + s.mins) % 60;
              const isToday = s.dayIdx === TIMER_DATA.length - 1;
              const isYday = s.dayIdx === TIMER_DATA.length - 2;
              const hit = s.mins >= target;
              const fmt = (h, m) =>
                `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderBottom:
                      i === recentSessions.length - 1
                        ? "none"
                        : `0.5px solid ${T.divider}`,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${color}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: T.fontDisplay,
                      fontSize: 11,
                      fontWeight: 700,
                      color,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.mins}m
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: T.ink,
                        letterSpacing: -0.2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {isToday
                        ? "Today"
                        : isYday
                          ? "Yesterday"
                          : `${DETAIL_MONTHS[s.date.getMonth()]} ${s.date.getDate()}`}
                      {hit && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: T.green,
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: T.greenSoft,
                          }}
                        >
                          Target
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: T.muted,
                        marginTop: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmt(s.startH, s.startM)} → {fmt(endH, endM)}
                    </div>
                  </div>
                  <PI.chevronRight size={12} color={T.faint} sw={2.2} />
                </div>
              );
            })}
          </Card>
          <DetailFooterCards color={color} />
        </div>
      </div>
      <TabBar active="today" />
    </div>
  );
};

// ── display wrappers ───────────────────────────────────────────
// Render at a native canvas width, then scale down to a fixed display size.
const PhoneScaler = ({ width = 400, scale = 0.62, children }) => {
  const h = width * 2.165;
  return (
    <div
      style={{
        width: width * scale,
        height: h * scale,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const NATIVE = 400,
  SCALE = 0.62;

const TodayPhone = () => (
  <PhoneScaler width={NATIVE} scale={SCALE}>
    <PhoneFrame width={NATIVE}>
      <TodayScreen />
    </PhoneFrame>
  </PhoneScaler>
);
const HistoryPhone = () => (
  <PhoneScaler width={NATIVE} scale={SCALE}>
    <PhoneFrame width={NATIVE}>
      <HistoryScreen />
    </PhoneFrame>
  </PhoneScaler>
);
const StatsPhone = () => (
  <PhoneScaler width={NATIVE} scale={SCALE}>
    <PhoneFrame width={NATIVE}>
      <StatsOverviewScreen />
    </PhoneFrame>
  </PhoneScaler>
);

Object.assign(window, {
  PhoneFrame,
  PhoneStatus,
  PhoneScaler,
  Dot,
  CheckPill,
  TodayPhone,
  HistoryPhone,
  StatsPhone,
  TodayScreen,
  HistoryScreen,
  StatsOverviewScreen,
  HabitDetailOnceScreen,
  HabitDetailCountScreen,
  HabitDetailTimerScreen,
  StatsHabitsScreen,
  HabitColorDot,
  StatusChip,
  TodayHabitRow,
  PI,
});

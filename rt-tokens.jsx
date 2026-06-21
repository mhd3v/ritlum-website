// ──────────────────────────────────────────────────────────────
// ritlum — landing site tokens
// Reuses the companion app's design tokens verbatim so the site and
// product read as one system, then adds a dark "campaign" palette
// for the hero / NFC / closing moments.
// ──────────────────────────────────────────────────────────────

const T = {
  // Surfaces
  bg: "#FAF8F4",
  bgAlt: "#F2EFEA",
  card: "#FFFFFF",
  cardSoft: "#F7F5F1",
  border: "rgba(15,15,15,0.07)",
  borderStrong: "rgba(15,15,15,0.12)",
  divider: "rgba(15,15,15,0.06)",

  // Text
  ink: "#0A0A0A",
  ink2: "#3A3A3A",
  muted: "#7A7570",
  faint: "#B6B1AA",

  // States
  green: "#2FB463",
  greenSoft: "#E6F4EB",
  blue: "#3D7BF7",

  // Habit pastels
  habit: {
    blue: "#5B9DF9",
    green: "#62C089",
    yellow: "#EFC557",
    orange: "#F0A05A",
    pink: "#E78AAE",
    cyan: "#6FC8D6",
    purple: "#A893DB",
  },

  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", system-ui, sans-serif',
  fontDisplay:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro", system-ui, sans-serif',

  r: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 26, pill: 9999 },
  shadow: "0 1px 2px rgba(20,20,20,0.04), 0 6px 18px rgba(20,20,20,0.04)",
  shadowSoft: "0 1px 2px rgba(20,20,20,0.03)",
};

// Dark campaign palette — the device-screen black, used full-bleed
const RT = {
  dark: "#141217",
  darkPanel: "#1B1920",
  darkCard: "#211F27",
  darkInk: "#F7F5F1",
  darkMuted: "rgba(247,245,241,0.58)",
  darkFaint: "rgba(247,245,241,0.34)",
  darkLine: "rgba(255,255,255,0.09)",
  darkLineStrong: "rgba(255,255,255,0.16)",
};

// Ordered 7-row LED palette for the tracker matrix
const LED_COLORS = [
  T.habit.blue,
  T.habit.green,
  T.habit.yellow,
  T.habit.orange,
  T.habit.pink,
  T.habit.cyan,
  T.habit.purple,
];

// Habits used in app mockups
const HABITS = [
  {
    id: "meditate",
    name: "Meditate",
    color: T.habit.blue,
    streak: 28,
    sub: "28-day streak",
    done: true,
    kind: "once",
  },
  {
    id: "exercise",
    name: "Exercise",
    color: T.habit.green,
    streak: 12,
    sub: "12-day streak",
    done: true,
    kind: "timer",
  },
  {
    id: "read",
    name: "Read",
    color: T.habit.orange,
    streak: 15,
    sub: "12 / 20 pages",
    done: false,
    kind: "count",
    count: "12 / 20",
  },
  {
    id: "hydrate",
    name: "Hydrate",
    color: T.habit.pink,
    streak: 7,
    sub: "3 / 8 glasses",
    done: false,
    kind: "count",
    count: "3 / 8",
  },
  {
    id: "journal",
    name: "Journal",
    color: T.habit.cyan,
    streak: 21,
    sub: "21-day streak",
    done: true,
    kind: "once",
  },
];

window.T = T;
window.RT = RT;
window.LED_COLORS = LED_COLORS;
window.HABITS = HABITS;

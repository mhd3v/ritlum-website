// ──────────────────────────────────────────────────────────────
// ritlum - page sections + assembly
// ──────────────────────────────────────────────────────────────

// ── small shared pieces ───────────────────────────────────────
const LogoMark = ({ size = 26 }) => {
  const dots = [
    T.habit.blue,
    T.habit.green,
    "rgba(255,255,255,0.10)",
    T.habit.orange,
    T.habit.pink,
    T.habit.cyan,
    "rgba(255,255,255,0.10)",
    T.habit.purple,
    T.habit.blue,
  ];
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.235,
        background: "#16151a",
        display: "inline-grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: size * 0.085,
        padding: size * 0.2,
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      {dots.map((c, i) => (
        <span
          key={i}
          style={{
            borderRadius: 99,
            background: c,
          }}
        />
      ))}
    </span>
  );
};

const Wordmark = ({ color = T.ink, size = 21 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      fontFamily: T.fontDisplay,
    }}
  >
    <LogoMark size={size * 1.25} />
    <span
      style={{ fontSize: size, fontWeight: 600, letterSpacing: -0.6, color }}
    >
      Ritlum
    </span>
  </span>
);

const Eyebrow = ({ children, dark }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: 12.5,
      fontWeight: 600,
      letterSpacing: 0.3,
      color: dark ? RT.darkMuted : T.muted,
      padding: "7px 13px",
      borderRadius: 99,
      background: dark ? "rgba(255,255,255,0.05)" : T.bgAlt,
      border: `1px solid ${dark ? RT.darkLine : T.border}`,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: 99,
        background: T.green,
        boxShadow: `0 0 8px ${T.green}`,
      }}
    />
    {children}
  </span>
);

const AppStoreButton = () => (
  <a
    href="https://testflight.apple.com/join/Z6FS9jDE"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-flex",
      alignItems: "center",
      textDecoration: "none",
      width: 176,
      height: "auto",
      cursor: "pointer",
    }}
  >
    <img
      src="assets/testflight-badge.png"
      alt="Available on TestFlight"
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  </a>
);

const SUPABASE_URL = "https://vryollgtsaiktxyidusb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qJAJ33itN-OewOspeW24dA_gm5A7Jck";

const NotifyForm = ({ dark, compact }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setError(false);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email: value }),
      });
      // 409 = unique-constraint conflict, i.e. this email already joined.
      if (!res.ok && res.status !== 409) throw new Error(`status ${res.status}`);
      setSent(true);
    } catch (_) {
      setError(true);
    }
  };
  if (sent)
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 18px",
          borderRadius: 14,
          background: dark ? "rgba(47,180,99,0.16)" : T.greenSoft,
          color: T.green,
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        <CheckPill color={T.green} /> You're on the list - we'll email you at
        launch.
      </div>
    );
  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        gap: 12,
        flexDirection: "column",
        alignItems: "stretch",
        width: compact ? "100%" : "min(100%, 560px)",
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        style={{
          width: "100%",
          minWidth: 0,
          padding: "13px 16px",
          borderRadius: 14,
          fontSize: 15,
          fontFamily: T.font,
          background: dark ? "rgba(255,255,255,0.06)" : "#fff",
          color: dark ? RT.darkInk : T.ink,
          border: `1px solid ${dark ? RT.darkLineStrong : T.borderStrong}`,
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "13px 22px",
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 600,
          fontFamily: T.font,
          background: T.green,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Notify me
      </button>
      {error && (
        <div style={{ color: "#d14343", fontSize: 13 }}>
          Something went wrong — please try again.
        </div>
      )}
    </form>
  );
};

// scroll reveal
const Reveal = ({ children, delay = 0, style }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    // reveal immediately if already in view on mount
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || 800) * 0.92 && r.bottom > 0;
    };
    if (inView()) {
      setShown(true);
      return;
    }
    let done = false;
    const reveal = () => {
      if (!done) {
        done = true;
        setShown(true);
      }
    };
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            reveal();
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    // safety net - never leave content invisible
    const t = setTimeout(reveal, 2200);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(22px)",
        transition: `opacity 700ms ease ${delay}ms, transform 700ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const Section = ({ dark, panel, children, id, style }) => (
  <section
    id={id}
    style={{
      background: dark ? RT.dark : panel ? T.bgAlt : T.bg,
      color: dark ? RT.darkInk : T.ink,
      padding: "0",
      position: "relative",
      contentVisibility: "auto",
      containIntrinsicSize: "auto 900px",
      ...style,
    }}
  >
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px" }}>
      {children}
    </div>
  </section>
);

const SectionLabel = ({ children, dark }) => (
  <div
    style={{
      fontSize: 12.5,
      fontWeight: 700,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: dark ? RT.darkFaint : T.faint,
      marginBottom: 18,
    }}
  >
    {children}
  </div>
);

// ── NAV ───────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "#tracker", label: "Tracker" },
  { href: "#app", label: "App" },
  { href: "#tokens", label: "Tokens" },
  { href: "#kit", label: "DIY Kit" },
  { href: "#timeline", label: "Timeline" },
  { href: "#faq", label: "FAQ" },
];

const Nav = () => {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [menuOpen]);
  const link = {
    color: T.muted,
    textDecoration: "none",
    fontSize: 14.5,
    fontWeight: 500,
    letterSpacing: -0.1,
  };
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background:
          solid || menuOpen ? "rgba(250,248,244,0.82)" : "transparent",
        backdropFilter: solid || menuOpen ? "saturate(180%) blur(16px)" : "none",
        WebkitBackdropFilter:
          solid || menuOpen ? "saturate(180%) blur(16px)" : "none",
        borderBottom: `1px solid ${solid || menuOpen ? T.border : "transparent"}`,
        transition: "background 240ms ease, border-color 240ms ease",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#"
          style={{ display: "inline-flex", textDecoration: "none" }}
        >
          <Wordmark />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div className="rt-navlinks" style={{ display: "flex", gap: 26 }}>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} style={link}>
                {l.label}
              </a>
            ))}
          </div>
          <a
            href="#notify"
            style={{
              ...link,
              color: T.ink,
              fontWeight: 600,
              padding: "9px 16px",
              borderRadius: 99,
              background: T.card,
              border: `1px solid ${T.borderStrong}`,
            }}
          >
            Notify me
          </a>
          <button
            className="rt-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "none",
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 19,
                height: 13,
                display: "inline-block",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: i === 0 ? 0 : i === 1 ? 5.5 : 11,
                    height: 1.6,
                    borderRadius: 1,
                    background: T.ink,
                    transition: "transform 200ms ease, opacity 200ms ease",
                    transform:
                      menuOpen && i === 0
                        ? "translateY(5.5px) rotate(45deg)"
                        : menuOpen && i === 2
                          ? "translateY(-5.5px) rotate(-45deg)"
                          : "none",
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div
          className="rt-nav-mobile-menu"
          style={{
            borderTop: `1px solid ${T.border}`,
            padding: "10px 28px 18px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                ...link,
                color: T.ink,
                padding: "12px 0",
                borderBottom: `1px solid ${T.border}`,
                fontSize: 16,
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

// ── HERO ──────────────────────────────────────────────────────
// Realistic per-day patterns - same data the app's dot grid shows.
const HERO_ROWS = TRACKER_ROWS;

const Hero = () => (
  <Section
    style={{ paddingTop: 120, paddingBottom: 96, overflow: "hidden" }}
  >
    {/* soft ambient wash */}
    <div
      style={{
        position: "absolute",
        top: "-10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 900,
        height: 600,
        pointerEvents: "none",
        background:
          "radial-gradient(50% 50% at 50% 50%, rgba(91,157,249,0.07), rgba(231,138,174,0.05) 45%, rgba(250,248,244,0) 70%)",
      }}
    />
    <div
      style={{
        position: "relative",
        textAlign: "center",
        maxWidth: 880,
        margin: "0 auto",
      }}
    >
      <Reveal>
        <Eyebrow>
          <span className="rt-hide-mobile">
            iOS app out now · Ritlum tracker on Kickstarter this summer
          </span>
          <span className="rt-show-mobile">iOS app out now</span>
        </Eyebrow>
      </Reveal>
      <Reveal delay={60}>
        <h1
          style={{
            margin: "26px 0 0",
            fontFamily: T.fontDisplay,
            fontWeight: 700,
            fontSize: "clamp(42px, 7vw, 86px)",
            lineHeight: 1.02,
            letterSpacing: -2.4,
            color: T.ink,
          }}
        >
          Your habits,
          <br />
          brought into the light.
        </h1>
      </Reveal>
      <Reveal delay={120}>
        <p
          style={{
            margin: "24px auto 0",
            maxWidth: 560,
            fontSize: "clamp(16px, 2.2vw, 19px)",
            lineHeight: 1.55,
            color: T.muted,
            letterSpacing: -0.2,
          }}
        >
          A beautifully simple habit app - and{" "}
          <span style={{ color: T.ink, fontWeight: 600 }}>Ritlum</span>, a
          physical desk tracker that mirrors your progress in glowing light. Tap
          a token, watch your habit light up.
        </p>
      </Reveal>
      <Reveal delay={180}>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 34,
          }}
        >
          <AppStoreButton />
          <a
            href="#notify"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              textDecoration: "none",
              padding: "13px 22px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              color: T.ink,
              background: T.card,
              border: `1px solid ${T.borderStrong}`,
            }}
          >
            Notify me →
          </a>
        </div>
      </Reveal>
    </div>
    {/* product studio shot - its own cream background blends into the section */}
    <Reveal delay={240} style={{ marginTop: 56 }}>
      <div
        className="rt-hero-image"
        style={{
          position: "relative",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <img
          src="hero-device-v3.png"
          alt="The Ritlum iOS app and the Ritlum desk tracker side by side, both showing the same habits"
          loading="eager"
          style={{
            position: "relative",
            display: "block",
            width: "100%",
            height: "auto",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, #000 11%, #000 89%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 7%, #000 94%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0, #000 11%, #000 89%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 7%, #000 94%, transparent 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      </div>
    </Reveal>
  </Section>
);

// ── NFC SECTION ───────────────────────────────────────────────
const TokensSection = () => (
  <Section
    panel
    id="tokens"
    style={{
      paddingTop: 96,
      paddingBottom: 104,
      borderTop: `1px solid ${T.border}`,
    }}
  >
    <Reveal
      style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 8px" }}
    >
      <SectionLabel>Habit tokens · NFC</SectionLabel>
      <h2
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontWeight: 700,
          fontSize: "clamp(32px, 5vw, 56px)",
          lineHeight: 1.04,
          letterSpacing: -1.6,
          color: T.ink,
        }}
      >
        Tap. Light up. Done.
      </h2>
      <p
        style={{
          margin: "18px auto 0",
          maxWidth: 540,
          fontSize: 17,
          lineHeight: 1.55,
          color: T.muted,
        }}
      >
        Map any habit to a little NFC{" "}
        <span style={{ color: T.ink, fontWeight: 600 }}>habit token</span>{" "}
        in the app. Keep it by the door, the kettle, your gym bag - tap your
        phone to log a completion in under a second. It lights up on your
        tracker instantly.
      </p>
    </Reveal>
    <Reveal delay={80} style={{ marginTop: 44 }}>
      <NfcAnimation />
    </Reveal>
  </Section>
);

// ── TRACKER DEEP-DIVE ─────────────────────────────────────────
const TrackerFeature = ({ title, body, children }) => (
  <div
    style={{
      background: T.card,
      borderRadius: 24,
      padding: 26,
      boxShadow: T.shadow,
      border: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >
    {children}
    <div>
      <h3
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: -0.5,
          color: T.ink,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 15,
          lineHeight: 1.55,
          color: T.muted,
          letterSpacing: -0.1,
        }}
      >
        {body}
      </p>
    </div>
  </div>
);

const Callout = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13,
      fontWeight: 600,
      color: T.ink2,
      background: "rgba(255,255,255,0.50)",
      border: "1px solid rgba(20,18,12,0.07)",
      padding: "10px 15px",
      borderRadius: 99,
      width: "max-content",
      maxWidth: "100%",
    }}
  >
    <span
      style={{
        width: 21,
        height: 21,
        borderRadius: 99,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1.5px solid rgba(20,18,12,0.72)",
        color: T.ink,
        fontSize: 18,
        fontWeight: 500,
        lineHeight: "18px",
        flexShrink: 0,
      }}
    >
      <span style={{ transform: "translateY(-0.5px)" }}>+</span>
    </span>
    {children}
  </span>
);

const TrackerSection = () => (
  <Section panel id="tracker" style={{ paddingTop: 100, paddingBottom: 100 }}>
    <Reveal style={{ maxWidth: 700 }}>
      <SectionLabel>The device</SectionLabel>
      <h2
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontWeight: 700,
          fontSize: "clamp(32px, 5vw, 54px)",
          lineHeight: 1.04,
          letterSpacing: -1.6,
          color: T.ink,
        }}
      >
        Ritlum - a tracker that lives on your desk.
      </h2>
      <p
        style={{
          margin: "18px 0 0",
          maxWidth: 560,
          fontSize: 17,
          lineHeight: 1.55,
          color: T.muted,
        }}
      >
        A warm, frosted panel of soft LEDs. Every row is one habit; every light
        is real progress. Glanceable from across the room, quiet enough for a
        nightstand.
      </p>
    </Reveal>

    {/* showcase */}
    <Reveal delay={80} style={{ marginTop: 46 }}>
      <div
        className="rt-tracker-showcase"
        style={{
          position: "relative",
          minHeight: 500,
          background: "linear-gradient(180deg, #f8f5ee 0%, #ebe4d8 100%)",
          border: `1px solid ${T.border}`,
          borderRadius: 32,
          padding: "54px 58px",
          overflow: "hidden",
          boxShadow: "0 34px 80px -54px rgba(66,52,32,0.58)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: [
              "radial-gradient(60% 60% at 50% 36%, rgba(255,255,255,0.56), rgba(255,255,255,0) 70%)",
              "radial-gradient(58% 48% at 50% 66%, rgba(95,160,250,0.09), rgba(95,160,250,0) 72%)",
            ].join(", "),
          }}
        />
        <div
          className="rt-tracker-showcase-inner"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 42,
            minHeight: 392,
          }}
        >
          <div
            className="rt-tracker-callouts"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
              flex: "0 0 min(42%, 420px)",
              zIndex: 2,
            }}
          >
            <Callout>Up to 8 habits</Callout>
            <Callout>16 LEDs per row</Callout>
            <Callout>Frosted diffuser</Callout>
            <Callout>USB-C powered</Callout>
          </div>
          <img
            className="rt-tracker-product"
            src="device.png"
            alt="The Ritlum desk tracker - a frosted triangular panel of soft LEDs"
            style={{
              width: "min(560px, 58%)",
              height: "auto",
              display: "block",
              filter: "drop-shadow(0 42px 56px rgba(66,52,32,0.28))",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </div>
    </Reveal>

    {/* mirror moment - mark a habit in the app, it lights up on the desk */}
    <Reveal delay={100} style={{ marginTop: 64 }}>
      <div
        style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 10px" }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontWeight: 700,
            fontSize: "clamp(22px, 3vw, 30px)",
            letterSpacing: -0.8,
            color: T.ink,
          }}
        >
          Mirrors your app, instantly.
        </h3>
        <p
          style={{
            margin: "12px auto 0",
            fontSize: 16,
            lineHeight: 1.5,
            color: T.muted,
            letterSpacing: -0.1,
          }}
        >
          Complete a habit in the app and the matching row lights up on your
          desk - no sync button, no waiting.
        </p>
      </div>
      <MirrorAnimation />
    </Reveal>

    {/* feature trio */}
    <Reveal delay={120} style={{ marginTop: 24 }}>
      <div
        className="rt-trio"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        <TrackerFeature
          title="Gets better over the air"
          body="New animations, display modes and features arrive as free OTA firmware updates - straight from the app. The Ritlum on your desk keeps growing."
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "6px 0",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: T.green,
                background: T.greenSoft,
                padding: "7px 12px",
                borderRadius: 99,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: T.green,
                }}
              />{" "}
              Firmware v1.4 ready
            </span>
            <span style={{ fontSize: 13, color: T.faint, fontWeight: 600 }}>
              OTA
            </span>
          </div>
        </TrackerFeature>

        <TrackerFeature
          title="Clock mode"
          body="Not tracking right now? The same matrix becomes a soft pixel clock - so Ritlum earns its desk space all day long."
        >
          <div
            style={{
              background: T.bgAlt,
              borderRadius: 16,
              padding: "18px 12px",
              display: "flex",
              justifyContent: "center",
              border: `1px solid ${T.border}`,
            }}
          >
            <TrackerDevice
              width={210}
              mode="clock"
              clock="9:41"
              clockColor={T.habit.blue}
            />
          </div>
        </TrackerFeature>

        <TrackerFeature
          title="Tuned to your room"
          body="Set brightness, a nightly sleep schedule, LED color theme and the log animation - so it glows just right, day or night."
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "2px 0",
            }}
          >
            {[
              ["Brightness", "80%"],
              ["Sleep", "10PM – 7AM"],
              ["Animation", "Breathe"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  padding: "9px 13px",
                  background: T.bgAlt,
                  borderRadius: 12,
                }}
              >
                <span style={{ color: T.ink2, fontWeight: 500 }}>{k}</span>
                <span style={{ color: T.muted, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </TrackerFeature>
      </div>
    </Reveal>
  </Section>
);

// ── APP SHOWCASE CAROUSEL ─────────────────────────────────────
const APP_SCREENS = [
  {
    key: "today",
    label: "Today",
    desc: "A 16-day dot grid, a completion count, and your live streak - today’s habits at a single glance.",
  },
  {
    key: "history",
    label: "History",
    desc: "Filter by habit, scan a 14-day strip, dig into any day, and spot your best runs and comebacks.",
  },
  {
    key: "stats-habits",
    label: "Stats · Habits",
    desc: "Rank your habits by streak or completion rate, see who’s at risk, and spot your strongest routines.",
  },
  {
    key: "detail-once",
    label: "Detail · Once",
    desc: "Log a once-daily habit like Meditate - see a 12-week heatmap, streaks, and recent completions.",
  },
  {
    key: "detail-count",
    label: "Detail · Count",
    desc: "Track a count habit like Hydrate with a stepper, progress pips, bar chart history, and daily logs.",
  },
  {
    key: "detail-timer",
    label: "Detail · Timer",
    desc: "Run a timer habit like Read - set a duration, see ring progress, session history, and monthly minutes.",
  },
];

const renderAppScreen = (key) => {
  if (key === "today") return <TodayScreen />;
  if (key === "history") return <HistoryScreen />;
  if (key === "stats-habits") return <StatsHabitsScreen />;
  if (key === "detail-once") return <HabitDetailOnceScreen />;
  if (key === "detail-count") return <HabitDetailCountScreen />;
  return <HabitDetailTimerScreen />;
};

const CarouselArrow = ({ dir, onClick }) => (
  <button
    onClick={onClick}
    aria-label={dir < 0 ? "Previous screen" : "Next screen"}
    className="rt-carousel-arrow"
    style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      [dir < 0 ? "left" : "right"]: 0,
      width: 46,
      height: 46,
      borderRadius: 99,
      border: `1px solid ${T.borderStrong}`,
      background: T.card,
      boxShadow: T.shadow,
      cursor: "pointer",
      zIndex: 5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
    }}
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={T.ink2}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  </button>
);

const AppCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [vw, setVw] = useState(1200);
  const touchStartX = useRef(null);
  const n = APP_SCREENS.length;

  useEffect(() => {
    setReduced(
      window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    setVw(window.innerWidth);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, reduced, n]);

  useEffect(() => {
    const onKey = (e) => {
      const el = document.getElementById("app");
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === "ArrowLeft") {
        setPaused(true);
        setIndex((i) => (i - 1 + n) % n);
      }
      if (e.key === "ArrowRight") {
        setPaused(true);
        setIndex((i) => (i + 1) % n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  const go = (dir) => {
    setPaused(true);
    setIndex((i) => (i + dir + n) % n);
  };
  const wrapOffset = (i) => {
    let d = i - index;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const SCALE = vw < 420 ? 0.54 : vw < 640 ? 0.62 : 0.7;
  const NATIVE = 400;
  const phoneW = NATIVE * SCALE;
  const phoneH = NATIVE * 2.165 * SCALE;
  const stageW = phoneW + 130;
  const slideDist = 70;

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
      }}
    >
      {/* stage */}
      <div
        style={{
          position: "relative",
          width: stageW,
          height: phoneH + 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "100%",
        }}
      >
        {/* ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: phoneW * 2.4,
            height: phoneH,
            pointerEvents: "none",
            maxWidth: "140%",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(47,180,99,0.07), rgba(91,157,249,0.04) 55%, transparent 72%)",
          }}
        />

        {/* phone with transitioning screens */}
        <div
          style={{
            position: "relative",
            width: phoneW,
            height: phoneH,
            zIndex: 2,
          }}
        >
          <PhoneScaler width={NATIVE} scale={SCALE}>
            <PhoneFrame width={NATIVE}>
              {APP_SCREENS.map((s, i) => {
                const offset = wrapOffset(i);
                const isActive = i === index;
                if (Math.abs(offset) > 1) return null;
                return (
                  <div
                    key={s.key}
                    style={{
                      position: "absolute",
                      inset: 0,
                      transform: `translateX(${offset * slideDist}px) scale(${isActive ? 1 : 0.92})`,
                      opacity: isActive ? 1 : 0,
                      transition: reduced
                        ? "none"
                        : "transform 650ms cubic-bezier(.2,.8,.2,1), opacity 480ms ease",
                      pointerEvents: isActive ? "auto" : "none",
                      zIndex: isActive ? 3 : 1,
                      willChange: "transform, opacity",
                    }}
                  >
                    {renderAppScreen(s.key)}
                  </div>
                );
              })}
            </PhoneFrame>
          </PhoneScaler>
        </div>

        {/* arrows */}
        <CarouselArrow dir={-1} onClick={() => go(-1)} />
        <CarouselArrow dir={1} onClick={() => go(1)} />
      </div>

      {/* caption */}
      <div style={{ textAlign: "center", maxWidth: 440, minHeight: 58 }}>
        <div
          key={`l-${index}`}
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: T.fontDisplay,
            color: T.ink,
            letterSpacing: -0.6,
            animation: reduced ? "none" : "rt-fade-up-kf 500ms ease",
          }}
        >
          {APP_SCREENS[index].label}
        </div>
        <div
          key={`d-${index}`}
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: T.muted,
            letterSpacing: -0.1,
            marginTop: 6,
            animation: reduced ? "none" : "rt-fade-up-kf 500ms ease 80ms",
          }}
        >
          {APP_SCREENS[index].desc}
        </div>
      </div>

      {/* dots */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {APP_SCREENS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => {
              setPaused(true);
              setIndex(i);
            }}
            aria-label={`Go to ${s.label}`}
            className="rt-carousel-dot"
            style={{
              width: i === index ? 26 : 8,
              height: 8,
              borderRadius: 99,
              border: "none",
              background: i === index ? T.green : T.borderStrong,
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const AppSection = () => (
  <Section id="app" style={{ paddingTop: 100, paddingBottom: 100 }}>
    <Reveal style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
      <SectionLabel>The app</SectionLabel>
      <h2
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontWeight: 700,
          fontSize: "clamp(32px, 5vw, 54px)",
          lineHeight: 1.04,
          letterSpacing: -1.6,
          color: T.ink,
        }}
      >
        Beautiful enough to open every day.
      </h2>
      <p
        style={{
          margin: "18px auto 0",
          maxWidth: 560,
          fontSize: 17,
          lineHeight: 1.55,
          color: T.muted,
        }}
      >
        A calm, considered iOS app where your habits feel good to keep. It works
        perfectly on its own - and the tracker is the cherry on top.
      </p>
    </Reveal>
    <Reveal delay={80} style={{ marginTop: 52 }}>
      <AppCarousel />
    </Reveal>
  </Section>
);

// ── FEATURES GRID ─────────────────────────────────────────────
const GoalChip = ({ label, color, children }) => (
  <div
    style={{
      flex: 1,
      background: T.bgAlt,
      borderRadius: 14,
      padding: "14px 14px",
      minWidth: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 11,
      }}
    >
      <span
        style={{ width: 9, height: 9, borderRadius: 99, background: color }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: T.ink,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </span>
    </div>
    {children}
  </div>
);

const FeatureCard = ({ title, body, span = 1, dark, children }) => (
  <div
    style={{
      gridColumn: `span ${span}`,
      background: dark ? RT.darkCard : T.card,
      borderRadius: 24,
      padding: 26,
      border: `1px solid ${dark ? RT.darkLine : T.border}`,
      boxShadow: dark ? "none" : T.shadow,
      display: "flex",
      flexDirection: "column",
      gap: 18,
      minHeight: 220,
    }}
  >
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      {children}
    </div>
    <div>
      <h3
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: -0.4,
          color: dark ? RT.darkInk : T.ink,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "7px 0 0",
          fontSize: 14.5,
          lineHeight: 1.5,
          color: dark ? RT.darkMuted : T.muted,
          letterSpacing: -0.1,
        }}
      >
        {body}
      </p>
    </div>
  </div>
);

const WIDGET_TODAY_COLUMN = 13;
const WIDGET_TODAY_WEEKDAY = 5;
const WIDGET_DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const WIDGET_DAY_LABEL_ROW = Array.from({ length: 16 }, (_, c) => {
  const offset = c - WIDGET_TODAY_COLUMN;
  return WIDGET_DAY_LABELS[(WIDGET_TODAY_WEEKDAY + offset + 700) % 7];
});

const FlameIcon = () => (
  <svg
    width="11"
    height="13"
    viewBox="0 0 12 14"
    fill="none"
    aria-hidden="true"
    style={{ flexShrink: 0, marginTop: -1 }}
  >
    <path
      d="M6 0.5 C 5.6 2.8, 8.6 3.2, 8.8 7.2 C 9 10.4, 7 12.4, 6 12.4 C 5 12.4, 3 10.4, 3.2 7.2 C 3.4 5.4, 4.8 4.6, 4.6 2.6 C 5.2 3.6, 5.8 3.4, 6 0.5 Z"
      fill="#D9743E"
    />
  </svg>
);

const StreakBadge = ({ days }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      background: "#FDEFE0",
      padding: "4px 8px",
      borderRadius: 99,
    }}
  >
    <FlameIcon />
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#B26528",
      }}
    >
      {days}d streak
    </span>
  </span>
);

const FeaturesSection = () => (
  <Section style={{ paddingTop: 100, paddingBottom: 100 }}>
    <Reveal style={{ maxWidth: 700 }}>
      <SectionLabel>Everything else</SectionLabel>
      <h2
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontWeight: 700,
          fontSize: "clamp(30px, 4.6vw, 50px)",
          lineHeight: 1.05,
          letterSpacing: -1.5,
          color: T.ink,
        }}
      >
        Thoughtful where it counts.
      </h2>
    </Reveal>
    <Reveal delay={70} style={{ marginTop: 40 }}>
      <div
        className="rt-features"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        <FeatureCard
          span={2}
          title="Every kind of habit"
          body="Check it off once, count toward a target, or run a timer. Ritlum shapes itself to how you actually build the habit."
        >
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <GoalChip label="Once" color={T.habit.blue}>
              <CheckPill color={T.habit.blue} />
            </GoalChip>
            <GoalChip label="Count" color={T.habit.pink}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 22,
                    fontWeight: 700,
                    color: T.ink,
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
                  / 8
                </span>
              </div>
            </GoalChip>
            <GoalChip label="Timer" color={T.habit.green}>
              <span
                style={{
                  fontFamily: T.fontDisplay,
                  fontSize: 20,
                  fontWeight: 700,
                  color: T.ink,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                12:00
              </span>
            </GoalChip>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Detailed stats"
          body="Streaks, completion rates and trends that make your momentum obvious."
        >
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "flex-end",
              height: 78,
              width: "100%",
            }}
          >
            {[40, 65, 52, 80, 68, 92, 74].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: 5,
                  background: i === 5 ? T.green : T.habit.blue,
                  opacity: i === 5 ? 1 : 0.85,
                }}
              />
            ))}
          </div>
        </FeatureCard>

        <FeatureCard
          title="Home Screen widgets."
          body="Glance at your streak and today's progress."
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              padding: "4px 0 0",
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 22,
                padding: 14,
                width: 280,
                border: `1px solid ${T.border}`,
                boxShadow:
                  "0 14px 36px rgba(20,18,12,0.14), 0 2px 6px rgba(20,18,12,0.06)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(16, 1fr)",
                  gap: 3.5,
                  marginBottom: 4,
                }}
              >
                {WIDGET_DAY_LABEL_ROW.map((l, i) => {
                  const isToday = i === WIDGET_TODAY_COLUMN;
                  return (
                    <div
                      key={i}
                      style={{
                        textAlign: "center",
                        fontSize: 8,
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? T.ink : T.faint,
                        lineHeight: "10px",
                      }}
                    >
                      {l}
                    </div>
                  );
                })}
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(16, 1fr)",
                    gridTemplateRows: "repeat(5, 1fr)",
                    gap: 3.5,
                  }}
                >
                  {TRACKER_ROWS.slice(0, 5).map((row, ri) =>
                    row.days.split("").map((d, ci) => {
                      const isFuture = ci > WIDGET_TODAY_COLUMN;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          style={{
                            aspectRatio: "1",
                            borderRadius: 99,
                            background: d === "1"
                              ? row.color
                              : isFuture
                                ? "rgba(0,0,0,0.06)"
                                : "rgba(0,0,0,0.08)",
                          }}
                        />
                      );
                    }),
                  )}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: -3,
                    bottom: -3,
                    left: `calc(${(WIDGET_TODAY_COLUMN * 100) / 16}% + ${(WIDGET_TODAY_COLUMN * 3.5) / 16 - 2.5}px)`,
                    width: `calc(${100 / 16}% + ${5 - (15 * 3.5) / 16}px)`,
                    background: "rgba(0,0,0,0.045)",
                    borderRadius: 6,
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: T.ink,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: -0.4,
                    }}
                  >
                      5 / 6
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: T.muted,
                      fontWeight: 500,
                    }}
                  >
                    completed today
                  </span>
                </div>
                <StreakBadge days={7} />
              </div>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Cloud sync, offline-first"
          body="Log anywhere - subway, plane, airplane mode. It syncs the moment you're back online."
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: T.greenSoft,
                borderRadius: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: T.green,
                  boxShadow: `0 0 8px ${T.green}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.green,
                }}
              >
                Synced across devices
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: T.bgAlt,
                borderRadius: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: T.muted,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.ink2,
                }}
              >
                Works offline, syncs later
              </span>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Custom reminders"
          body="Gentle, per-habit nudges at the times that fit your day - never noisy."
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
            }}
          >
            {[
              ["Meditate", "7:00 AM", T.habit.blue],
              ["Hydrate", "Every 2h", T.habit.pink],
            ].map(([n, t2, c]) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: T.bgAlt,
                  padding: "9px 13px",
                  borderRadius: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: c,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    color: T.ink,
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {n}
                </span>
                <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
                  {t2}
                </span>
              </div>
            ))}
          </div>
        </FeatureCard>

        <FeatureCard
          title="Multi-device"
          body="iPhone, iPad, and the tracker - all in lockstep. Tap on one, lit on the rest."
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
            }}
          >
            <div
              style={{
                width: 46,
                height: 84,
                borderRadius: 9,
                border: `2px solid ${T.borderStrong}`,
                background: "#FFFFFF",
                padding: 4,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 10px rgba(20,18,12,0.06)",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 3,
                  borderRadius: 99,
                  background: T.ink,
                  alignSelf: "center",
                  marginBottom: 4,
                }}
              />
              <div
                style={{
                  fontSize: 5,
                  fontWeight: 700,
                  color: T.muted,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Today
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  flex: 1,
                }}
              >
                {[
                  { color: LED_COLORS[0], done: true },
                  { color: LED_COLORS[1], done: true },
                  { color: LED_COLORS[2], done: false },
                ].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 99,
                        background: h.color,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        borderRadius: 1,
                        background: T.border,
                      }}
                    />
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: h.done ? T.green : "transparent",
                        border: h.done ? "none" : `1px solid ${T.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {h.done && (
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 5,
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                color: T.faint,
                fontSize: 16,
                fontWeight: 300,
                flexShrink: 0,
              }}
            >
              ⇄
            </div>
            <div
              style={{
                width: 72,
                height: 54,
                borderRadius: 6,
                border: `2px solid ${T.borderStrong}`,
                background: "#FFFFFF",
                padding: 5,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 10px rgba(20,18,12,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 5,
                  fontWeight: 700,
                  color: T.muted,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Today
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  flex: 1,
                }}
              >
                {[
                  { color: LED_COLORS[0], done: true },
                  { color: LED_COLORS[1], done: true },
                  { color: LED_COLORS[2], done: false },
                ].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 99,
                        background: h.color,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        borderRadius: 1,
                        background: T.border,
                      }}
                    />
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 99,
                        background: h.done ? T.green : "transparent",
                        border: h.done ? "none" : `1px solid ${T.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {h.done && (
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 4,
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                color: T.faint,
                fontSize: 16,
                fontWeight: 300,
                flexShrink: 0,
              }}
            >
              ⇄
            </div>
            <div
              style={{
                width: 72,
                height: 46,
                borderRadius: 6,
                background: "#16151a",
                padding: 5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "0 4px 12px rgba(20,18,12,0.15)",
                overflow: "hidden",
              }}
            >
              {[
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 0, 0, 0],
                [1, 1, 1, 0, 0, 0, 0, 0],
              ].map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    display: "flex",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  {row.map((lit, ci) => (
                    <div
                      key={ci}
                      style={{
                        flex: 1,
                        aspectRatio: "1",
                        alignSelf: "center",
                        borderRadius: 99,
                        background: lit
                          ? LED_COLORS[ri]
                          : "rgba(255,255,255,0.08)",
                        boxShadow: lit
                          ? `0 0 2px ${LED_COLORS[ri]}`
                          : "none",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </FeatureCard>
      </div>
    </Reveal>
  </Section>
);

// ── TIMELINE ──────────────────────────────────────────────────
const TimelineSection = () => {
  const nodes = [
    {
      tag: "Available now",
      title: "The app is live",
      body: "Download the iOS app and start tracking today.",
      color: T.habit.blue,
      active: false,
    },
    {
      tag: "Summer 2026",
      title: "Kickstarter goes live",
      body: "Back Ritlum and lock in early-bird access to the tracker + tokens.",
      color: T.green,
      active: true,
    },
    {
      tag: "Q4 2026",
      title: "Ritlum ships",
      body: "The desk tracker arrives - pair it, and your habits light up.",
      color: T.habit.orange,
      active: false,
    },
  ];
  return (
    <Section id="timeline" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <Reveal style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <SectionLabel>The plan</SectionLabel>
        <h2
          style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontWeight: 700,
            fontSize: "clamp(30px, 4.6vw, 50px)",
            lineHeight: 1.05,
            letterSpacing: -1.5,
            color: T.ink,
          }}
        >
          App first. Tracker next.
        </h2>
      </Reveal>
      <Reveal delay={80} style={{ marginTop: 56 }}>
        <div
          className="rt-timeline"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            position: "relative",
          }}
        >
          <div
            className="rt-timeline-line"
            style={{
              position: "absolute",
              top: 9,
              left: "16%",
              right: "16%",
              height: 2,
              background: T.border,
            }}
          />
          {nodes.map((n, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                textAlign: "center",
                padding: "0 6px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  borderRadius: 99,
                  background: n.color,
                  boxShadow: n.active
                    ? `0 0 0 6px ${n.color}33, 0 0 22px ${n.color}`
                    : `0 0 0 5px ${T.bg}`,
                  position: "relative",
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  marginTop: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  color: n.color,
                  textTransform: "uppercase",
                }}
              >
                {n.tag}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: T.fontDisplay,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  color: T.ink,
                }}
              >
                {n.title}
              </div>
              <p
                style={{
                  margin: "8px auto 0",
                  maxWidth: 260,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: T.muted,
                }}
              >
                {n.body}
              </p>
              {n.active && (
                <div
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: T.green,
                    background: "rgba(47,180,99,0.14)",
                    padding: "6px 12px",
                    borderRadius: 99,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 99,
                      background: T.green,
                      boxShadow: `0 0 8px ${T.green}`,
                    }}
                  />{" "}
                  Sign up for early access
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
};

// ── PRICING + SPECS ───────────────────────────────────────────
const SpecRow = ({ k, v, last }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 16,
      padding: "13px 0",
      borderBottom: last ? "none" : `1px solid ${T.divider}`,
    }}
  >
    <span style={{ fontSize: 14.5, color: T.muted, fontWeight: 500 }}>{k}</span>
    <span
      style={{
        fontSize: 14.5,
        color: T.ink,
        fontWeight: 600,
        letterSpacing: -0.2,
        textAlign: "right",
      }}
    >
      {v}
    </span>
  </div>
);

const IncludedItem = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <CheckPill color={T.green} />
    <span style={{ fontSize: 15, color: T.ink2, fontWeight: 500 }}>
      {children}
    </span>
  </div>
);

const PricingSpecsSection = () => (
  <Section panel id="kit" style={{ paddingTop: 100, paddingBottom: 100 }}>
    <Reveal style={{ maxWidth: 700 }}>
      <SectionLabel>Specs &amp; DIY kit</SectionLabel>
      <h2
        style={{
          margin: 0,
          fontFamily: T.fontDisplay,
          fontWeight: 700,
          fontSize: "clamp(30px, 4.6vw, 50px)",
          lineHeight: 1.05,
          letterSpacing: -1.5,
          color: T.ink,
        }}
      >
        Buy it built. Or build it yourself.
      </h2>
      <p
        style={{
          margin: "16px 0 0",
          maxWidth: 540,
          fontSize: 17,
          lineHeight: 1.55,
          color: T.muted,
        }}
      >
        Download the app today, and the finished tracker ships via
        Kickstarter this summer. We're also weighing a DIY kit for makers
        who'd rather assemble one from parts — pricing across the board is
        still being worked out.
      </p>
    </Reveal>

    <Reveal delay={80} style={{ marginTop: 44 }}>
      <div
        className="rt-pricing"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {/* DIY kit card */}
        <div
          style={{
            background: T.card,
            borderRadius: 24,
            padding: "30px 28px",
            border: `1px solid ${T.borderStrong}`,
            boxShadow: T.shadow,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: T.faint,
              }}
            >
              DIY kit
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12.5,
                fontWeight: 700,
                color: T.blue,
                background: "rgba(61,123,247,0.12)",
                padding: "6px 12px",
                borderRadius: 99,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: T.blue,
                  boxShadow: `0 0 8px ${T.blue}`,
                }}
              />
              Coming soon
            </span>
          </div>
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: -1,
              color: T.ink,
              lineHeight: 1.15,
            }}
          >
            Build your own.
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: T.muted }}>
            A parts kit for makers: the 3D-printed enclosure, LED matrix
            panels, and an ESP32 pre-flashed with Ritlum firmware. No
            soldering required.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              padding: "4px 0 2px",
            }}
          >
            <IncludedItem>3D-printed enclosure</IncludedItem>
            <IncludedItem>LED matrix panels</IncludedItem>
            <IncludedItem>ESP32, firmware pre-flashed</IncludedItem>
            <IncludedItem>Wiring &amp; assembly guide</IncludedItem>
          </div>
          <a
            href="#notify"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              textDecoration: "none",
              padding: "14px 22px",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              background: T.green,
              marginTop: 2,
            }}
          >
            I'm interested →
          </a>
          <div style={{ fontSize: 12.5, color: T.faint, lineHeight: 1.5 }}>
            Concept stage · pricing not yet set · only happens if enough of
            you want it.
          </div>
        </div>

        {/* spec sheet */}
        <div
          style={{
            background: T.card,
            borderRadius: 24,
            padding: "30px 28px",
            border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              margin: "0 0 6px",
              fontFamily: T.fontDisplay,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: -0.4,
              color: T.ink,
            }}
          >
            Tech specs
          </h3>
          <SpecRow k="Display" v="128 soft LEDs · 8 × 16" />
          <SpecRow k="Habits" v="Up to 8, one per row" />
          <SpecRow k="Size" v="120 × 70 mm wedge" />
          <SpecRow k="Materials" v="Matte shell, frosted acrylic" />
          <SpecRow k="Power" v="USB-C, always-on" />
          <SpecRow k="Connectivity" v="NFC tokens · Bluetooth LE" />
          <SpecRow k="Software" v="Free OTA updates" />
          <SpecRow k="In the box" v="Tracker, 4 tokens, cable" last />
        </div>
      </div>
    </Reveal>
  </Section>
);

// ── FAQ ───────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Is the app available now?",
    a: "Yes - the Ritlum iOS app is live today, free to download. The physical desk tracker comes later, funded through the Kickstarter campaign launching this summer.",
  },
  {
    q: "Do I need the tracker to use the app?",
    a: "Not at all. The app is a complete habit tracker on its own. The desk tracker is an optional companion that mirrors your progress in glowing light - the cherry on top.",
  },
  {
    q: "When does the tracker ship?",
    a: "The Kickstarter goes live this summer, and trackers ship to backers in Q4 2026. Back early to lock in your spot in line.",
  },
  {
    q: "What do I need to use it?",
    a: "An iPhone running iOS 16 or later. The habit tokens use your phone’s built-in NFC reader, and the tracker pairs over Bluetooth - no hub or extra hardware required.",
  },
  {
    q: "How do the habit tokens work?",
    a: "Map any habit to an NFC token in the app, then keep it wherever the habit happens - by the door, the kettle, your gym bag. Tap your phone to it and the completion logs in under a second.",
  },
  {
    q: "What's the DIY kit?",
    a: "A parts kit for makers who'd rather build than buy: the 3D-printed enclosure, LED matrix panels, and an ESP32 pre-flashed with Ritlum firmware. It's still a concept - whether it happens depends on interest, so join the list if you'd want one.",
  },
  {
    q: "Is there a subscription?",
    a: "The app is free to download. A monthly or yearly plan unlocks unlimited habits and NFC tokens, plus the ability to connect to the Ritlum tracker. Firmware updates for the physical tracker are free, forever.",
  },
];

const FaqItem = ({ q, a, open, onClick }) => (
  <div style={{ borderBottom: `1px solid ${T.border}` }}>
    <button
      onClick={onClick}
      aria-expanded={open}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 18,
        padding: "22px 2px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: T.font,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: T.ink,
          letterSpacing: -0.3,
        }}
      >
        {q}
      </span>
      <span
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 300,
          color: T.muted,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 260ms cubic-bezier(.2,.8,.2,1)",
          lineHeight: 1,
        }}
      >
        +
      </span>
    </button>
    <div
      style={{
        overflow: "hidden",
        maxHeight: open ? 260 : 0,
        opacity: open ? 1 : 0,
        transition:
          "max-height 320ms cubic-bezier(.2,.8,.2,1), opacity 240ms ease",
      }}
    >
      <p
        style={{
          margin: 0,
          padding: "0 2px 24px",
          maxWidth: 660,
          fontSize: 15.5,
          lineHeight: 1.6,
          color: T.muted,
          letterSpacing: -0.1,
        }}
      >
        {a}
      </p>
    </div>
  </div>
);

const FaqSection = () => {
  const [open, setOpen] = useState(0);
  return (
    <Section panel id="faq" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <Reveal>
          <SectionLabel>FAQ</SectionLabel>
          <h2
            style={{
              margin: 0,
              fontFamily: T.fontDisplay,
              fontWeight: 700,
              fontSize: "clamp(30px, 4.6vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: T.ink,
            }}
          >
            Good questions.
          </h2>
        </Reveal>
        <Reveal delay={70} style={{ marginTop: 30 }}>
          <div>
            {FAQS.map((f, i) => (
              <FaqItem
                key={i}
                q={f.q}
                a={f.a}
                open={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

// ── CLOSING CTA ───────────────────────────────────────────────
const CtaSection = () => (
  <Section
    id="notify"
    style={{
      paddingTop: 104,
      paddingBottom: 104,
      borderTop: `1px solid ${T.border}`,
    }}
  >
    <div
      style={{
        position: "absolute",
        bottom: "-30%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 1000,
        height: 700,
        pointerEvents: "none",
        background:
          "radial-gradient(50% 50% at 50% 50%, rgba(231,138,174,0.08), rgba(91,157,249,0.05) 45%, rgba(250,248,244,0) 72%)",
      }}
    />
    <div
      style={{
        position: "relative",
        textAlign: "center",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <Reveal>
        <h2
          style={{
            margin: 0,
            fontFamily: T.fontDisplay,
            fontWeight: 700,
            fontSize: "clamp(34px, 5.4vw, 64px)",
            lineHeight: 1.03,
            letterSpacing: -2,
            color: T.ink,
          }}
        >
          Start the app today.
          <br />
          Light up your desk this winter.
        </h2>
      </Reveal>
      <Reveal delay={70}>
        <p
          style={{
            margin: "20px auto 0",
            maxWidth: 520,
            fontSize: 18,
            lineHeight: 1.55,
            color: T.muted,
          }}
        >
          Download the app to begin, and get notified the moment the Ritlum
          Kickstarter goes live.
        </p>
      </Reveal>
      <Reveal delay={130}>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 30 }}
        >
          <AppStoreButton />
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 18 }}
        >
          <NotifyForm />
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: T.faint }}>
          No spam. One email at launch.
        </div>
      </Reveal>
    </div>
  </Section>
);

// ── FOOTER ────────────────────────────────────────────────────
const Footer = () => (
  <footer
    style={{
      background: T.bgAlt,
      color: T.muted,
      borderTop: `1px solid ${T.border}`,
    }}
  >
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "40px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div>
        <Wordmark />
      </div>
      <div
        style={{ display: "flex", gap: 24, fontSize: 14, flexWrap: "wrap" }}
      >
        {[
          { l: "Tracker", href: "#tracker" },
          { l: "App", href: "#app" },
          { l: "Tokens", href: "#tokens" },
          { l: "DIY Kit", href: "#kit" },
          { l: "Timeline", href: "#timeline" },
          { l: "FAQ", href: "#faq" },
        ].map(({ l, href }) => (
          <a
            key={l}
            href={href}
            style={{ color: T.muted, textDecoration: "none" }}
          >
            {l}
          </a>
        ))}
        <a href="/blog/" style={{ color: T.muted, textDecoration: "none" }}>
          Blog
        </a>
        <a href="/privacy/" style={{ color: T.muted, textDecoration: "none" }}>
          Privacy
        </a>
      </div>
      <div style={{ fontSize: 13, color: T.faint }}>© 2026 Ritlum</div>
    </div>
  </footer>
);

// ── PAGE ──────────────────────────────────────────────────────
const RitlumPage = () => (
  <div style={{ fontFamily: T.font, background: T.bg }}>
    <Nav />
    <Hero />
    <TrackerSection />
    <AppSection />
    <TokensSection />
    <FeaturesSection />
    <PricingSpecsSection />
    <TimelineSection />
    <FaqSection />
    <CtaSection />
    <Footer />
  </div>
);

window.RitlumPage = RitlumPage;

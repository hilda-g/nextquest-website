import { useState, useEffect } from "react";

// ─── CONFIG — set these to your actual Supabase project ──────
// These must match your .env values on the backend.
// For a Vite/CRA project, put them in .env as:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const BOT_USERNAME  = import.meta.env.VITE_BOT_USERNAME  || "nextquest_bot";

// ─── Supabase REST helper (no SDK needed) ────────────────────
async function sbFetch(path, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// ─── Map Supabase row → component shape ──────────────────────
function mapEvent(row) {
  return {
    id:               row.id,
    title:            row.title,
    category:         row.category,
    dateStart:        new Date(row.date_start),
    dateEnd:          row.date_end ? new Date(row.date_end) : null,
    city:             row.location_city,
    address:          row.location_address,
    description:      row.description,
    organizer:        String(row.organizer_tg_id),
    maxParticipants:  row.max_participants,
    currentParticipants: 0,           // Supabase schema has no counter yet; subscriptions count used below
    cover: (row.cover_image_url && row.cover_image_url.startsWith("http"))
      ? row.cover_image_url
      : "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    externalUrl:      row.external_url || `https://t.me/${BOT_USERNAME}?start=event_${row.id}`,
    status:           row.status,
    multiDay:         !!(row.date_end && row.date_end !== row.date_start),
    isPast:           new Date(row.date_start) < new Date(),
  };
}

// ─── i18n ─────────────────────────────────────────────────────
const LANGS = {
  en: {
    title: "NextQuest",
    subtitle: "Cyprus Geek Events",
    all: "All", upcoming: "Upcoming", archive: "Archive",
    search: "Search events…",
    notify: "🔔 Notify me", notified: "✓ Subscribed",
    location: "Location", organizer: "Organizer", register: "Register →",
    noEvents: "No events found", multiDay: "Multi-day", cancelled: "Cancelled",
    participants: "participants", loading: "Loading events…", error: "Could not load events.",
    allCities: "All Cities",
  },
  ru: {
    title: "NextQuest",
    subtitle: "События гик-сообщества Кипра",
    all: "Все", upcoming: "Предстоящие", archive: "Архив",
    search: "Поиск событий…",
    notify: "🔔 Напомнить", notified: "✓ Подписан",
    location: "Место", organizer: "Организатор", register: "Регистрация →",
    noEvents: "Событий не найдено", multiDay: "Многодневное", cancelled: "Отменено",
    participants: "участников", loading: "Загрузка…", error: "Не удалось загрузить события.",
    allCities: "Все города",
  },
  el: {
    title: "NextQuest",
    subtitle: "Εκδηλώσεις Geek στην Κύπρο",
    all: "Όλα", upcoming: "Επερχόμενα", archive: "Αρχείο",
    search: "Αναζήτηση…",
    notify: "🔔 Υπενθύμιση", notified: "✓ Εγγεγραμμένος",
    location: "Τοποθεσία", organizer: "Διοργανωτής", register: "Εγγραφή →",
    noEvents: "Δεν βρέθηκαν εκδηλώσεις", multiDay: "Πολυήμερο", cancelled: "Ακυρώθηκε",
    participants: "συμμετέχοντες", loading: "Φόρτωση…", error: "Αδύνατη η φόρτωση.",
    allCities: "Όλες οι πόλεις",
  },
  uk: {
    title: "NextQuest",
    subtitle: "Гік-події на Кіпрі",
    all: "Всі", upcoming: "Майбутні", archive: "Архів",
    search: "Пошук подій…",
    notify: "🔔 Нагадати", notified: "✓ Підписано",
    location: "Місце", organizer: "Організатор", register: "Реєстрація →",
    noEvents: "Подій не знайдено", multiDay: "Багатоденна", cancelled: "Скасовано",
    participants: "учасників", loading: "Завантаження…", error: "Не вдалося завантажити.",
    allCities: "Всі міста",
  },
};

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games", color: "#f97316" },
  { id: "larp",       label: "⚔️ LARP",        color: "#8b5cf6" },
  { id: "festival",   label: "🎪 Festival",     color: "#ec4899" },
  { id: "rpg",        label: "🎭 RPG",          color: "#06b6d4" },
  { id: "cosplay",    label: "👗 Cosplay",      color: "#10b981" },
  { id: "other",      label: "🃏 Other",        color: "#6b7280" },
];

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos"];

function formatDate(date, lang) {
  if (!date || isNaN(date)) return "";
  const localeMap = { en: "en-GB", ru: "ru-RU", el: "el-GR", uk: "uk-UA" };
  return date.toLocaleDateString(localeMap[lang] || "en-GB", { day: "numeric", month: "short" });
}
function formatTime(date) {
  if (!date || isNaN(date)) return "";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function getCatColor(id) { return CATEGORIES.find(c => c.id === id)?.color || "#6b7280"; }
function getCatLabel(id) { return CATEGORIES.find(c => c.id === id)?.label || id; }

// ─── Deep-link: read ?event=ID or /events/ID from the URL ────
function getDeepLinkId() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("event")) return params.get("event");
  const m = window.location.pathname.match(/\/events\/([^/]+)/);
  return m ? m[1] : null;
}

// ─── Main component ───────────────────────────────────────────
export default function NextQuest() {
  const [lang, setLang]           = useState("en");
  const [tab, setTab]             = useState("upcoming");
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selected, setSelected]   = useState(null);
  const [subscribed, setSubscribed] = useState({});
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const t = LANGS[lang];

  // ── Load events from Supabase ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    sbFetch("events", {
      select: "*",
      status: "eq.published",
      order:  "date_start.asc",
    })
      .then(rows => {
        if (cancelled) return;
        setEvents(rows.map(mapEvent));
        setLoading(false);

        // Handle deep-link: open modal for specific event
        const deepId = getDeepLinkId();
        if (deepId) {
          const target = rows.find(r => String(r.id) === String(deepId));
          if (target) setSelected(mapEvent(target));
        }
      })
      .catch(err => {
        if (cancelled) return;
        console.error("Supabase fetch error:", err);
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Filter logic ──────────────────────────────────────────
  const now = new Date();
  const filtered = events.filter(e => {
    const isPast = e.isPast || e.dateStart < now;
    if (tab === "upcoming" && isPast) return false;
    if (tab === "archive"  && !isPast) return false;
    if (e.status === "cancelled" && tab !== "archive") return false;
    if (catFilter !== "all" && e.category !== catFilter) return false;
    if (cityFilter !== "all" && e.city !== cityFilter) return false;
    const q = search.toLowerCase();
    if (q && !e.title.toLowerCase().includes(q) && !e.city.toLowerCase().includes(q)) return false;
    return true;
  });

  const pct = e =>
    e.maxParticipants ? Math.round((e.currentParticipants / e.maxParticipants) * 100) : 0;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d14",
      fontFamily: "'Outfit', sans-serif",
      color: "#e8e6f0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #3d3a5c; border-radius: 2px; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .pill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; }
        .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #a09cbc; border-radius: 999px; padding: 6px 16px; font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { background: rgba(255,255,255,0.1); color: #e8e6f0; }
        .filter-btn.active { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); color: #fff; }
        .tab-btn { background: none; border: none; color: #6b6890; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; padding: 8px 4px; border-bottom: 2px solid transparent; transition: all 0.2s; letter-spacing: 0.03em; }
        .tab-btn.active { color: #e8e6f0; border-bottom-color: #a78bfa; }
        .lang-btn { background: none; border: none; color: #6b6890; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px 6px; border-radius: 4px; transition: all 0.2s; letter-spacing: 0.06em; text-transform: uppercase; }
        .lang-btn:hover { color: #e8e6f0; }
        .lang-btn.active { color: #a78bfa; }
        .notify-btn { border: 1px solid rgba(167,139,250,0.4); background: rgba(167,139,250,0.08); color: #a78bfa; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .notify-btn:hover { background: rgba(167,139,250,0.18); }
        .notify-btn.done { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.08); color: #10b981; }
        .register-btn { background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-family: inherit; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
        .register-btn:hover { opacity: 0.88; }
        .search-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #e8e6f0; border-radius: 12px; padding: 10px 16px 10px 40px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: rgba(167,139,250,0.4); }
        .search-input::placeholder { color: #4a4868; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .modal { background: #16162a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .progress-bar { height: 4px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
        .event-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        @media (max-width: 640px) { .event-grid { grid-template-columns: 1fr; } }
        .mesh-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(ellipse 80% 50% at 20% 20%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 60%); }
        .noise { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(167,139,250,0.2); border-top-color: #a78bfa; border-radius: 50%; animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="mesh-bg" />
      <div className="noise" />

      {/* Header */}
      <header style={{ position: "relative", zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧭</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "#fff" }}>NextQuest</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["en", "ru", "el", "uk"].map(l => (
              <button key={l} className={`lang-btn${lang === l ? " active" : ""}`} onClick={() => setLang(l)}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ position: "relative", zIndex: 1, padding: "48px 24px 32px", textAlign: "center" }}>
        <p style={{ color: "#6b6890", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{t.subtitle}</p>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 6vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 1, background: "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Find Your<br />Next Adventure
        </h1>
      </div>

      {/* Controls */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ position: "relative", marginBottom: 20, maxWidth: 480 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4a4868", fontSize: 16 }}>🔍</span>
          <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {["upcoming", "archive"].map(tb => (
            <button key={tb} className={`tab-btn${tab === tb ? " active" : ""}`} onClick={() => setTab(tb)}>
              {tb === "upcoming" ? t.upcoming : t.archive}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button className={`filter-btn${catFilter === "all" ? " active" : ""}`} onClick={() => setCatFilter("all")}>{t.all}</button>
          {CATEGORIES.map(c => (
            <button key={c.id}
              className={`filter-btn${catFilter === c.id ? " active" : ""}`}
              onClick={() => setCatFilter(catFilter === c.id ? "all" : c.id)}
              style={catFilter === c.id ? { borderColor: c.color + "66", color: c.color } : {}}>
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={`filter-btn${cityFilter === "all" ? " active" : ""}`} onClick={() => setCityFilter("all")}>🌍 {t.allCities}</button>
          {CITIES.map(city => (
            <button key={city}
              className={`filter-btn${cityFilter === city ? " active" : ""}`}
              onClick={() => setCityFilter(cityFilter === city ? "all" : city)}>
              📍 {city}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      <main style={{ position: "relative", zIndex: 1, padding: "0 24px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "80px 0", color: "#4a4868" }}>
            <div className="spinner" />
            <p>{t.loading}</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#ef4444" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p>{t.error}</p>
            <p style={{ fontSize: 12, marginTop: 8, color: "#6b6890" }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4a4868" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔭</div>
            <p style={{ fontSize: 16 }}>{t.noEvents}</p>
          </div>
        ) : (
          <div className="event-grid">
            {filtered.map((event, i) => {
              const color = getCatColor(event.category);
              const full  = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
              return (
                <div key={event.id} className="card-hover" onClick={() => setSelected(event)}
                  style={{ background: "#16162a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
                  <div style={{ position: "relative", height: 180, overflow: "hidden", background: "#1a1a2e" }}>
                    <img src={event.cover} alt="" loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      onError={e => { e.target.style.display = "none"; }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(22,22,42,0.9) 0%, transparent 60%)" }} />
                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="pill" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{getCatLabel(event.category)}</span>
                      {event.multiDay  && <span className="pill" style={{ background: "rgba(255,255,255,0.1)", color: "#e8e6f0" }}>{t.multiDay}</span>}
                      {event.status === "cancelled" && <span className="pill" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>{t.cancelled}</span>}
                    </div>
                    <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                        {formatDate(event.dateStart, lang)}
                        {event.multiDay && event.dateEnd
                          ? ` — ${formatDate(event.dateEnd, lang)}`
                          : ` · ${formatTime(event.dateStart)}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>{event.title}</h3>
                    <p style={{ fontSize: 12, color: "#6b6890", marginBottom: 12 }}>📍 {event.city} · {event.address}</p>
                    {event.maxParticipants ? (
                      <>
                        <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: "#4a4868" }}>{event.currentParticipants}/{event.maxParticipants} {t.participants}</span>
                          {full && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>FULL</span>}
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct(event)}%`, background: full ? "#ef4444" : color }} />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Event Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ position: "relative", height: 220, borderRadius: "20px 20px 0 0", overflow: "hidden", background: "#1a1a2e" }}>
              <img src={selected.cover} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(22,22,42,1) 0%, transparent 50%)" }} />
              <button onClick={() => setSelected(null)}
                style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ position: "absolute", bottom: 16, left: 20, display: "flex", gap: 8 }}>
                <span className="pill" style={{ background: getCatColor(selected.category) + "22", color: getCatColor(selected.category), border: `1px solid ${getCatColor(selected.category)}44` }}>{getCatLabel(selected.category)}</span>
                {selected.multiDay && <span className="pill" style={{ background: "rgba(255,255,255,0.1)", color: "#e8e6f0" }}>{t.multiDay}</span>}
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{selected.title}</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#a09cbc", fontSize: 14 }}>
                  <span>🗓</span>
                  <span>
                    {formatDate(selected.dateStart, lang)}
                    {selected.multiDay && selected.dateEnd ? ` — ${formatDate(selected.dateEnd, lang)}` : ""}
                    {!selected.multiDay ? `, ${formatTime(selected.dateStart)}` : ""}
                    {!selected.multiDay && selected.dateEnd ? ` – ${formatTime(selected.dateEnd)}` : ""}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#a09cbc", fontSize: 14 }}>
                  <span>📍</span><span>{selected.city} · {selected.address}</span>
                </div>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#a09cbc", marginBottom: 20 }}>{selected.description}</p>

              {selected.maxParticipants ? (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#6b6890" }}>{selected.currentParticipants}/{selected.maxParticipants} {t.participants}</span>
                    <span style={{ fontSize: 13, color: getCatColor(selected.category), fontWeight: 700 }}>{pct(selected)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct(selected)}%`, background: getCatColor(selected.category) }} />
                  </div>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10 }}>
                <a href={`https://t.me/${BOT_USERNAME}?start=event_${selected.id}`}
                  target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <button className={`notify-btn${subscribed[selected.id] ? " done" : ""}`}
                    onClick={() => setSubscribed(s => ({ ...s, [selected.id]: true }))}>
                    {subscribed[selected.id] ? t.notified : t.notify}
                  </button>
                </a>
                {selected.externalUrl && (
                  <a href={selected.externalUrl} target="_blank" rel="noreferrer"
                    style={{ textDecoration: "none", flex: 1 }}>
                    <button className="register-btn" style={{ width: "100%" }}>{t.register}</button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

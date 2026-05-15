import { useState, useEffect, useRef } from "react";
import { LANGS } from "./locales";
import { EventCardBody, EventCardModal } from "./EventCard";
import AboutPage from "./AboutPage";

// ─── CONFIG ──────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME  || "NextQuestbot";

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

// Parse a DB datetime string as LOCAL time, stripping any timezone suffix.
// Supabase may return "2025-05-03 06:00:00" or "2025-05-03T06:00:00+00:00".
// We always take only the date+time digits and feed them to Date constructor
// with a "T" separator and NO timezone — so JS treats it as local time.
function parseLocalDate(str) {
  if (!str) return null;
  // Take only the first 16 chars: "YYYY-MM-DDTHH:MM" or "YYYY-MM-DD HH:MM"
  const s = str.slice(0, 16).replace(" ", "T");
  return new Date(s);
}

function mapEvent(row) {
  return {
    id:               row.id,
    title:            row.title,
    category:         row.category,
    dateStart:        parseLocalDate(row.date_start),
    dateEnd:          row.date_end ? parseLocalDate(row.date_end) : null,
    city:             row.location_city,
    address:          row.location_address,
    description:      row.description,
    description_ru:   row.description_ru || null,
    description_el:   row.description_el || null,
    description_uk:   row.description_uk || null,
    title_ru:         row.title_ru || null,
    title_el:         row.title_el || null,
    title_uk:         row.title_uk || null,
    organizer:        String(row.organizer_tg_id),
    organizerUsername: row.organizer_username || null,
    organizerName:    row.organizer_name || row.organizer_username || null,
    maxParticipants:  row.max_participants,
    currentParticipants: 0,
    cover: (row.cover_image_url && row.cover_image_url.startsWith("http"))
      ? row.cover_image_url
      : "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    externalUrl:      row.external_url,
    organizerContacts: row.organizer_contacts || null,
    status:   row.status,
    multiDay: !!(row.date_end && row.date_start && row.date_end.slice(0, 10) !== row.date_start.slice(0, 10)),
    // isPast = true only if the event START day is strictly before today's calendar date
    // (an event happening today at 11:00 is still "upcoming" even if it's now 13:00)
    isPast:   (() => {
      const start = parseLocalDate(row.date_start);
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      return start < todayMidnight;
    })(),
    format: row.format || "official",
    registrationClosed: row.registration_closed || false,
    isPromo:            row.is_promo            || false,
    isHiddenFromUpcoming: row.hidden_from_upcoming || false,
    languages:          row.event_languages     || [],
  };
}

// ─── i18n ─────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games",  color: "#f97316" },
  { id: "rpg",        label: "🧙 Tabletop RPG", color: "#06b6d4" },
  { id: "larp",       label: "⚔️ LARP",         color: "#8b5cf6" },
  { id: "festival",   label: "🎪 Festival",      color: "#ec4899" },
  { id: "cosplay",    label: "👽 Cosplay",       color: "#10b981" },
  { id: "lectures",   label: "🔭 Lectures",      color: "#0ea5e9" },

  { id: "market",     label: "🛍️ Market",         color: "#f59e0b" },
  { id: "other",      label: "🃏 Other",         color: "#6b7280" },
];

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos"];

const FORMAT_TYPES = (t) => [
  { id: "private",   label: t.formatPrivate   },
  { id: "community", label: t.formatCommunity },
  { id: "official",  label: t.formatOfficial  },
];

function getFormatLabel(fmt, t) {
  return { private: t.formatPrivate, community: t.formatCommunity, official: t.formatOfficial }[fmt] || t.formatOfficial;
}
function getFormatDesc(fmt, t) {
  return { private: t.formatDescPrivate, community: t.formatDescCommunity, official: t.formatDescOfficial }[fmt] || "";
}

function formatDate(date, lang) {
  if (!date || isNaN(date)) return "";
  const localeMap = { en: "en-GB", ru: "ru-RU", el: "el-GR", uk: "uk-UA" };
  return date.toLocaleDateString(localeMap[lang] || "en-GB", { day: "numeric", month: "short" });
}
function formatTime(date) {
  if (!date || isNaN(date)) return "";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function getCatColor(id) { return CATEGORIES.find(c => c.id === id)?.color || "#6b7280"; }
function getCatLabel(id) { return CATEGORIES.find(c => c.id === id)?.label || id; }

// ─── Language badges ──────────────────────────────────────────
const LANG_BADGES = [
  { code: "el", label: "EL" },
  { code: "ru", label: "RU" },
  { code: "uk", label: "UKR" },
  { code: "en", label: "EN" },
];
function LangBadges({ languages }) {
  if (!languages || languages.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", marginLeft: "auto", flexShrink: 0 }}>
      {LANG_BADGES.filter(l => languages.includes(l.code)).map(l => (
        <span key={l.code} style={{
          fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
          background: "rgba(255,255,255,0.07)", color: "#6b6890",
          border: "1px solid rgba(255,255,255,0.1)", letterSpacing: "0.04em",
          lineHeight: "14px",
        }}>{l.label}</span>
      ))}
    </div>
  );
}

function getDeepLinkId() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("event")) return params.get("event");
  const m = window.location.pathname.match(/\/events\/([^/]+)/);
  return m ? m[1] : null;
}

// ─── Generate Google Calendar URL ─────────────────────────────
function makeGCalUrl(event) {
  const fmt = d => d.toISOString().replace(/[-:]/g, "").replace(".000", "");
  const end = event.dateEnd || new Date(event.dateStart.getTime() + 4 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text:   event.title,
    dates:  `${fmt(event.dateStart)}/${fmt(end)}`,
    details: event.description || "",
    location: `${event.city}, ${event.address || ""}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function makeGMapsUrl(city, address) {
  const q = encodeURIComponent(`${address || ""} ${city || ""}`.trim());
  return `https://maps.google.com/?q=${q}`;
}

// FORMAT_LABELS replaced by getFormatLabel(fmt, t)

// ─── Calendar helpers ─────────────────────────────────────────
function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) {
  // Monday-based: Mon=0 … Sun=6
  return (new Date(year, month, 1).getDay() + 6) % 7;
}
function eventsForDay(events, year, month, day) {
  return events.filter(e => {
    const s = e.dateStart;
    const startMatch = s.getFullYear() === year && s.getMonth() === month && s.getDate() === day;
    if (startMatch) return true;
    if (e.multiDay && e.dateEnd) {
      const dayDate = new Date(year, month, day);
      return dayDate >= new Date(e.dateStart.getFullYear(), e.dateStart.getMonth(), e.dateStart.getDate())
          && dayDate <= new Date(e.dateEnd.getFullYear(), e.dateEnd.getMonth(), e.dateEnd.getDate());
    }
    return false;
  });
}

// ─── CALENDAR TAB COMPONENT ──────────────────────────────────
function CalendarTab({ events, lang, t, onSelect, catFilters, toggleCat, cityFilters, toggleCity, formatFilter, setFormatFilter, popover, setPopover }) {
  const now  = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const daysInMonth  = getDaysInMonth(calYear, calMonth);
  const firstDaySlot = getFirstDayOfMonth(calYear, calMonth);

  // Events that fall within this month (for the agenda list), filtered by category + city
  const todayMidnightCal = new Date();
  todayMidnightCal.setHours(0, 0, 0, 0);
  const monthEvents = events.filter(e => {
    const s = e.dateStart;
    const end = e.dateEnd || e.dateStart;
    const monthStart = new Date(calYear, calMonth, 1);
    const monthEnd   = new Date(calYear, calMonth + 1, 0, 23, 59, 59);
    if (!(s <= monthEnd && end >= monthStart)) return false;
    if (catFilters.size > 0 && !catFilters.has(e.category)) return false;
    if (cityFilters.size > 0 && !cityFilters.has(e.city))   return false;
    if (formatFilter !== "all" && e.format !== formatFilter) return false;
    return true;
  }).sort((a, b) => {
    const aPast = a.dateStart < todayMidnightCal;
    const bPast = b.dateStart < todayMidnightCal;
    if (aPast !== bPast) return aPast ? 1 : -1; // past events sink to bottom
    return a.dateStart - b.dateStart;            // within each group, chronological
  });

  const isToday = (d) =>
    d === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();

  return (
    <div style={{ minWidth: 0, width: "100%" }}>
      {/* Category filters — same design as Upcoming */}
      <div className="nq-cal-legend nq-filters-cat" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <button className={`filter-btn${catFilters.size === 0 ? " active" : ""}`} onClick={() => toggleCat("all")}>{t.all}</button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`filter-btn${catFilters.has(c.id) ? " active" : ""}`}
            onClick={() => toggleCat(c.id)}
            style={catFilters.has(c.id) ? { borderColor: c.color + "66", color: c.color } : {}}
          >{c.label}</button>
        ))}
      </div>

      {/* City filters — same design as Upcoming */}
      <div className="nq-filters-city" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <button className={`filter-btn${cityFilters.size === 0 ? " active" : ""}`} onClick={() => toggleCity("all")}>{t.allCities}</button>
        {CITIES.map(city => (
          <button
            key={city}
            className={`filter-btn${cityFilters.has(city) ? " active" : ""}`}
            onClick={() => toggleCity(city)}
          >📍 {city}</button>
        ))}
      </div>

      {/* Format filters — same design as Upcoming */}
      <div className="nq-filters-format" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <button className={`filter-btn${formatFilter === "all" ? " active" : ""}`} onClick={() => setFormatFilter("all")}>{t.allFormats}</button>
        {FORMAT_TYPES(t).map(f => (
          <button
            key={f.id}
            className={`filter-btn${formatFilter === f.id ? " active" : ""}`}
            onClick={() => setFormatFilter(formatFilter === f.id ? "all" : f.id)}
          >{f.label}</button>
        ))}
      </div>

      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#e8e6f0", letterSpacing: "-0.01em" }}>
          {t.monthNames[calMonth]} {calYear}
        </span>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>

      {/* Day-of-week headers */}
      <div className="nq-cal-hdr" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
        {t.dayNames.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#4a4868", padding: "3px 0", letterSpacing: "0.07em", textTransform: "uppercase" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="nq-cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 24 }}>
        {/* Leading empty slots */}
        {Array.from({ length: firstDaySlot }).map((_, i) => (
          <div key={`e${i}`} className="nq-cal-cell" style={{ minHeight: 64, minWidth: 0, background: "rgba(5,5,12,0.6)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const allDayEvents = eventsForDay(events, calYear, calMonth, day);
          const dayEvents = allDayEvents.filter(e => {
            if (catFilters.size > 0 && !catFilters.has(e.category)) return false;
            if (cityFilters.size > 0 && !cityFilters.has(e.city))   return false;
            if (formatFilter !== "all" && e.format !== formatFilter) return false;
            return true;
          });
          const today     = isToday(day);
          return (
            <div
              key={day}
              className="nq-cal-cell"
              style={{
                minHeight: 64,
                minWidth: 0,
                background: today ? "rgba(124,58,237,0.15)" : "rgba(5,5,12,0.65)",
                border: today ? "1px solid rgba(167,139,250,0.45)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: "5px 4px 4px",
                cursor: dayEvents.length ? "pointer" : "default",
                overflow: "hidden",
                position: "relative",
              }}
              onClick={() => {
                if (dayEvents.length === 1) onSelect(dayEvents[0]);
              }}
            >
              <div className="nq-cal-day-num" style={{
                fontSize: 11, fontWeight: 700, marginBottom: 3, lineHeight: 1,
                color: today ? "#a78bfa" : "#5a5878",
                ...(today ? {
                  background: "rgba(167,139,250,0.18)", borderRadius: 4,
                  padding: "1px 4px", display: "inline-block",
                } : {}),
              }}>{day}</div>

              {dayEvents.slice(0, 2).map((ev, idx) => (
                <div
                  key={idx}
                  className="nq-cal-event-pill"
                  onClick={e => { e.stopPropagation(); onSelect(ev); }}
                  style={{
                    fontSize: 9, fontWeight: 700, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                    borderRadius: 3, padding: "1px 4px", marginBottom: 2,
                    background: getCatColor(ev.category) + "22",
                    color: getCatColor(ev.category),
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                  }}
>{ev.registrationClosed && ev.maxParticipants ? "🔴 " : "🟢 "}{ev.title}</div>
              ))}

              {dayEvents.length > 2 && (
                <button
                  className="nq-cal-overflow"
                  onClick={e => {
                    e.stopPropagation();
                    const rect = e.currentTarget.closest(".nq-cal-cell").getBoundingClientRect();
                    setPopover(p =>
                      p && p.day === day && p.month === calMonth && p.year === calYear
                        ? null
                        : { day, month: calMonth, year: calYear, events: dayEvents, rect }
                    );
                  }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: "rgba(167,139,250,0.18)",
                    border: "1px solid rgba(167,139,250,0.35)",
                    borderRadius: 3, padding: "2px 4px",
                    fontSize: 9, fontWeight: 700, color: "#a78bfa",
                    cursor: "pointer", fontFamily: "inherit",
                    letterSpacing: "0.02em",
                  }}
                >+{dayEvents.length - 2} more</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Agenda list */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4a4868", textTransform: "uppercase", letterSpacing: "0.10em" }}>
          {t.upcomingThisMonth}
        </span>
      </div>

      {monthEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#4a4868", fontSize: 14 }}>
          {t.noCalendarEvents}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {monthEvents.map((ev, idx) => {
            const isPast = ev.dateStart < todayMidnightCal;
            const prevIsPast = idx > 0 && monthEvents[idx - 1].dateStart < todayMidnightCal;
            const showDivider = isPast && !prevIsPast && idx > 0;
            return (
              <div key={ev.id}>
                {showDivider && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    margin: "4px 0 4px",
                  }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                    <span style={{ fontSize: 10, color: "#3a3858", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>Past</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  </div>
                )}
            <div
              className="nq-agenda-item"
              onClick={() => onSelect(ev)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.06)`,
                borderLeft: `3px solid ${getCatColor(ev.category)}`,
                borderRadius: 10, padding: "10px 14px",
                cursor: "pointer", transition: "background 0.15s",
                opacity: isPast ? 0.5 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
            >
              <div style={{ flexShrink: 0, textAlign: "center", minWidth: 48 }}>
                {ev.multiDay && ev.dateEnd && (
                  ev.dateStart.getMonth() === ev.dateEnd.getMonth()
                    ? (
                      // Same month: "29–30 / APR"
                      <>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#e8e6f0", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                          {ev.dateStart.getDate()}–{ev.dateEnd.getDate()}
                        </div>
                        <div style={{ fontSize: 10, color: "#5a5878", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                          {lang === "en" ? ev.dateStart.toLocaleString("en-GB", { month: "short" }) : t.monthNames[ev.dateStart.getMonth()].slice(0, 3)}
                        </div>
                      </>
                    ) : (
                      // Different months: "29 APR – 1 MAY"
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#e8e6f0", lineHeight: 1.35, whiteSpace: "nowrap" }}>
                        {ev.dateStart.getDate()} {lang === "en" ? ev.dateStart.toLocaleString("en-GB", { month: "short" }) : t.monthNames[ev.dateStart.getMonth()].slice(0, 3)}
                        <br />
                        – {ev.dateEnd.getDate()} {lang === "en" ? ev.dateEnd.toLocaleString("en-GB", { month: "short" }) : t.monthNames[ev.dateEnd.getMonth()].slice(0, 3)}
                      </div>
                    )
                )}
                {!(ev.multiDay && ev.dateEnd) && (
                  <>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#e8e6f0", lineHeight: 1 }}>
                      {ev.dateStart.getDate()}
                    </div>
                    <div style={{ fontSize: 10, color: "#5a5878", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {lang === "en" ? ev.dateStart.toLocaleString("en-GB", { month: "short" }) : t.monthNames[ev.dateStart.getMonth()].slice(0, 3)}
                    </div>
                  </>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e6f0", marginBottom: 4, lineHeight: 1.3, textAlign: "left" }}>
                  {ev.status === "cancelled" && <span style={{ color: "#ef4444", marginRight: 6 }}>✕</span>}
                  {ev.title}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", fontSize: 11, color: "#6b6890" }}>
                  {!ev.multiDay && (<span>⏰ {formatTime(ev.dateStart)}{ev.dateEnd ? ` - ${formatTime(ev.dateEnd)}` : ""}</span>)}
                  <span>📍 {ev.city}</span>
                  <span style={{ color: getCatColor(ev.category) }}>{getCatLabel(ev.category)}</span>
                  {ev.registrationClosed ? (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", flexShrink: 0 }}>{t.statusFull}</span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", flexShrink: 0 }}>{t.statusOpen}</span>
                  )}
                </div>
              </div>

              <a
                className="nq-agenda-gcal"
                href={makeGCalUrl(ev)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  flexShrink: 0, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 7, padding: "5px 8px", fontSize: 11, color: "#7a7898",
                  textDecoration: "none", whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#7a7898"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                title="Add to Google Calendar"
              >📅+</a>
            </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
      <div className="skeleton" style={{ height: 160 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 8, width: "70%" }} />
        <div className="skeleton" style={{ height: 12, borderRadius: 6, width: "45%" }} />
      </div>
    </div>
  );
}

// ─── SCROLL TO TOP BUTTON ─────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed", bottom: 28, right: 24, zIndex: 50,
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(124,58,237,0.85)", border: "1px solid rgba(167,139,250,0.5)",
        color: "#fff", fontSize: 18, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
        transition: "opacity 0.2s, transform 0.2s",
      }}
      title="Back to top"
    >↑</button>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function NextQuest() {
  const [lang, setLang]             = useState(() => {
    const bl = navigator.language?.slice(0, 2) || "en";
    return ["en","ru","el","uk"].includes(bl) ? bl : "en";
  });
  const [tab, setTab]               = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    return ["upcoming", "calendar", "archive"].includes(p) ? p : "upcoming";
  });
  const [search, setSearch]         = useState("");
  const [catFilters, setCatFilters]   = useState(new Set());
  const [cityFilters, setCityFilters] = useState(new Set());
  const [formatFilter, setFormatFilter] = useState("all");
  const [organizerPage, setOrganizerPage] = useState(() => {
    const m = window.location.pathname.match(/^\/organizers\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  });
  const [aboutOpen, setAboutOpen] = useState(() =>
    window.location.pathname === "/about"
  );

  const toggleCat = (id) => {
    if (id === "all") { setCatFilters(new Set()); return; }
    setCatFilters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleCity = (city) => {
    if (city === "all") { setCityFilters(new Set()); return; }
    setCityFilters(prev => {
      const next = new Set(prev);
      next.has(city) ? next.delete(city) : next.add(city);
      return next;
    });
  };
  const [selected, setSelected]     = useState(null);
  const [subscribed, setSubscribed] = useState({});
  const [notifyTooltip, setNotifyTooltip] = useState(null);
  const [calPopover, setCalPopover] = useState(null); // { day, month, year, events, rect }
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const headerRef = useRef(null);

  const t = LANGS[lang];

  // ── Sticky header shadow on scroll ──────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (headerRef.current) {
        headerRef.current.style.boxShadow =
          window.scrollY > 10 ? "0 4px 24px rgba(0,0,0,0.5)" : "none";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Load events ──────────────────────────────────────────────
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
        const mapped = rows.map(mapEvent);
        setEvents(mapped);
        setLoading(false);

        const deepId = getDeepLinkId();
        if (deepId) {
          const target = rows.find(r => String(r.id) === String(deepId));
          if (target) setSelected(mapEvent(target));
        }
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Filter logic ──────────────────────────────────────────────
  const now = new Date();
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const filtered = events.filter(e => {
    // Use day-based past check: today's events are always "upcoming"
    const isPast = e.dateStart < todayMidnight;
    // Promo events only appear in Upcoming — never in Calendar or Archive
    if (e.isPromo && tab !== "upcoming") return false;
    if (tab === "upcoming" && isPast)  return false;
    if (tab === "upcoming" && e.isHiddenFromUpcoming) return false;
    if (tab === "archive"  && !isPast) return false;
    if (tab === "calendar") {
      // Calendar shows all non-past events regardless of category/city filters in the grid
      // But we still respect search
    }
    if (e.status === "cancelled" && tab !== "archive") return false;
    if (catFilters.size > 0 && !catFilters.has(e.category)) return false;
    if (cityFilters.size > 0 && !cityFilters.has(e.city))   return false;
    if (formatFilter !== "all" && e.format !== formatFilter) return false;
    const q = search.toLowerCase();
    if (q && !e.title.toLowerCase().includes(q) && !e.city.toLowerCase().includes(q)) return false;
    return true;
  });

  // Count badges for tabs (day-based: today counts as upcoming)
  const upcomingCount = events.filter(e => e.dateStart >= todayMidnight && e.status !== "cancelled").length;
  const calendarCount = events.filter(e => e.dateStart >= todayMidnight && e.status !== "cancelled").length;
  const archiveCount  = events.filter(e => e.dateStart < todayMidnight).length;

  const pct = e => e.maxParticipants ? Math.round((e.currentParticipants / e.maxParticipants) * 100) : 0;

  // ── Shared EventCard component ────────────────────────────────
  function EventCard({ event }) {
    const color = getCatColor(event.category);
    return (
      <div className="card-hover"
        onClick={() => { setSelected(event); window.history.pushState({}, "", `/events/${event.id}`); }}
        style={{
          background: event.isPromo
            ? "linear-gradient(145deg, #1a1030 0%, #0f1f2e 100%)"
            : "#13131f",
          border: event.isPromo
            ? "1px solid rgba(124,58,237,0.55)"
            : "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, overflow: "hidden",
          opacity: event.status === "cancelled" ? 0.6 : 1,
          filter: event.isPast ? "grayscale(100%)" : "none",
          transition: "filter 0.3s ease",
          boxShadow: event.isPromo
            ? "0 0 0 1px rgba(6,182,212,0.18), 0 8px 32px rgba(124,58,237,0.18)"
            : "none",
        }}>

        {/* Cover image */}
        <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
          <img src={event.cover} alt={event.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.target.style.display = "none"; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,19,31,1) 0%, transparent 60%)" }} />

          {/* Category badge */}
          <div style={{
            position: "absolute", top: 10, left: 10,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 999,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            fontSize: 11, fontWeight: 700, color,
            border: `1px solid ${color}33`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
            {getCatLabel(event.category)}
          </div>

          {event.status === "cancelled" && (
            <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(239,68,68,0.85)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
              {t.cancelled}
            </div>
          )}
          {event.isPast && event.status !== "cancelled" && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
              color: "#a09cbc", borderRadius: 6, padding: "2px 10px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              {t.ended}
            </div>
          )}
          {event.multiDay && (
            <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.5)", color: "#a09cbc", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>
              {t.multiDay}
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#5a5878", fontWeight: 600 }}>
              {formatDate(event.dateStart, lang)}
              {event.multiDay && event.dateEnd
                ? ` — ${formatDate(event.dateEnd, lang)}`
                : event.dateEnd
                  ? ` · ${formatTime(event.dateStart)} - ${formatTime(event.dateEnd)}`
                  : ` · ${formatTime(event.dateStart)}`}
            </span>
            <span style={{ fontSize: 12, color: "#3a384e" }}>·</span>
            <span style={{ fontSize: 12, color: "#5a5878" }}>📍 {event.isPromo ? t.promoCity : event.city}</span>
            <LangBadges languages={event.languages} />
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.3, textAlign: "left", ...(event.isPromo ? { background: "linear-gradient(135deg, #c4b5fd, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : { color: "#fff" }) }}>{({ ru: event.title_ru, el: event.title_el, uk: event.title_uk })[lang] || event.title}</h3>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            {event.maxParticipants ? (
              <span style={{ fontSize: 11, color: "#6b6890" }}>👥 {event.maxParticipants} {t.participants}</span>
            ) : null}
            {event.registrationClosed ? (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>{t.statusFull}</span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>{t.statusOpen}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── About page ───────────────────────────────────────────────
  if (aboutOpen) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { background: #0d0d14; min-height: 100vh; font-family: 'Outfit', sans-serif; }
        `}</style>
        <div style={{
          background: "#0d0d14",
          minHeight: "100vh",
          color: "#e8e6f0",
          fontFamily: "'Outfit', sans-serif",
          position: "relative",
          overflowX: "hidden",
        }}>
          {/* subtle bg glows — same as main page */}
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 50% at 20% 20%, rgba(124,58,237,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.07) 0%, transparent 60%)" }} />
          <AboutPage onBack={() => {
            window.history.pushState({}, "", "/");
            setAboutOpen(false);
          }} />
        </div>
      </>
    );
  }

  // ── Organizer profile page ────────────────────────────────────
  if (organizerPage) {
    const orgEvents = events
      .filter(e => e.organizerUsername === organizerPage)
      .sort((a, b) => b.dateStart - a.dateStart);
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { background: #0d0d14; min-height: 100vh; font-family: 'Outfit', sans-serif; }
          .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
          .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); animation: fadeIn 0.2s ease; }
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          .modal { background: #16162a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; max-width: 560px; width: 100%; max-height: 90vh; overflow: visible; display: flex; flex-direction: column; animation: slideUp 0.3s ease; } .nq-modal-body { overflow-y: auto; flex: 1; }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
          .pill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; }
          .register-btn { background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; border: none; border-radius: 8px; padding: 0 20px; height: 42px; font-size: 14px; font-family: inherit; font-weight: 700; cursor: pointer; transition: opacity 0.2s; display: inline-flex; align-items: center; justify-content: center; }
          .notify-btn { border: 1px solid rgba(167,139,250,0.4); background: rgba(167,139,250,0.08); color: #a78bfa; border-radius: 8px; padding: 0 20px; height: 42px; font-size: 14px; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
          .notify-btn.done { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.08); color: #10b981; }
          .gcal-btn { background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.25); color: #06b6d4; border-radius: 8px; padding: 0 20px; height: 42px; font-size: 14px; font-family: inherit; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
          .nq-modal-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
          .event-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
          @media (max-width: 640px) { .event-grid { grid-template-columns: 1fr; } }
        `}</style>

        <div style={{ background: "#0d0d14", minHeight: "100vh", color: "#e8e6f0" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px 0" }}>

            {/* Back */}
            <button
              onClick={() => { window.history.pushState({}, "", "/"); setOrganizerPage(null); }}
              style={{ background: "none", border: "none", color: "#6b6890", cursor: "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 28 }}
            >← {t.upcoming}</button>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: "#4a4868", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{t.organizer}</div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#fff", lineHeight: 1.1 }}>{organizerPage}</h1>
              <div style={{ fontSize: 13, color: "#4a4868", marginTop: 8 }}>{orgEvents.length} {orgEvents.length === 1 ? "event" : "events"}</div>
            </div>
          </div>

          {/* Event grid — same component as main page */}
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>
            {orgEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#4a4868" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎲</div>
                <p>{t.noEvents}</p>
              </div>
            ) : (
              <div className="event-grid">
                {orgEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
              </div>
            )}
          </div>
        </div>

        {/* Full event modal — shared component */}
        <EventCardModal
          event={selected}
          onClose={() => { setSelected(null); setNotifyTooltip(null); window.history.pushState({}, "", `/?tab=${tab}`); }}
          lang={lang} t={t}
          onOrganizerClick={username => {
            setSelected(null);
            window.history.pushState({}, "", `/organizers/${username}`);
            setOrganizerPage(username);
          }}
          botUsername={BOT_USERNAME}
          subscribed={!!subscribed[selected?.id]}
          onNotify={() => setNotifyTooltip(selected?.id)}
          notifyTooltipOpen={notifyTooltip === selected?.id}
          onNotifyTooltipClose={() => {
            setSubscribed(s => ({ ...s, [selected?.id]: true }));
            setNotifyTooltip(null);
          }}
        />
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: #0d0d14; }
        body { background: #0d0d14; min-height: 100vh; }
        #root { background: #0d0d14; min-height: 100vh; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #3d3a5c; border-radius: 2px; }

        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }

        .pill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; }

        .filter-btn { background: rgba(10,10,18,0.75); border: 1px solid rgba(255,255,255,0.1); color: #a09cbc; border-radius: 999px; padding: 6px 16px; font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(8px); }
        .filter-btn:hover { background: rgba(20,20,35,0.9); color: #e8e6f0; }
        .filter-btn.active { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.28); color: #fff; }

        .tab-btn { background: none; border: none; color: #6b6890; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; padding: 10px 4px; border-bottom: 2px solid transparent; transition: all 0.2s; letter-spacing: 0.03em; display: flex; align-items: center; gap: 6px; }
        .tab-btn.active { color: #e8e6f0; border-bottom-color: #a78bfa; }
        .tab-btn:hover:not(.active) { color: #a09cbc; }

        .tab-count { background: rgba(255,255,255,0.08); border-radius: 999px; padding: 1px 7px; font-size: 11px; font-weight: 700; color: #6b6890; }
        .tab-btn.active .tab-count { background: rgba(167,139,250,0.18); color: #a78bfa; }

        .lang-btn { background: none; border: none; color: #6b6890; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px 6px; border-radius: 4px; transition: all 0.2s; letter-spacing: 0.06em; text-transform: uppercase; }
        .lang-btn:hover { color: #e8e6f0; }
        .lang-btn.active { color: #a78bfa; }

        .notify-btn { border: 1px solid rgba(167,139,250,0.4); background: rgba(167,139,250,0.08); color: #a78bfa; border-radius: 8px; padding: 0 20px; height: 42px; font-size: 14px; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .notify-btn:hover { background: rgba(167,139,250,0.18); }
        .notify-btn.done { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.08); color: #10b981; }

        .register-btn { background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; border: none; border-radius: 8px; padding: 0 20px; height: 42px; font-size: 14px; font-family: inherit; font-weight: 700; cursor: pointer; transition: opacity 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .register-btn:hover { opacity: 0.88; }

        .gcal-btn { background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.25); color: #06b6d4; border-radius: 8px; padding: 0 20px; height: 42px; font-size: 14px; font-family: inherit; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
        .gcal-btn:hover { background: rgba(6,182,212,0.16); }

        .search-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #e8e6f0; border-radius: 12px; padding: 10px 16px 10px 40px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: rgba(167,139,250,0.4); }
        .search-input::placeholder { color: #4a4868; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .modal { background: #16162a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; max-width: 560px; width: 100%; max-height: 90vh; overflow: visible; display: flex; flex-direction: column; animation: slideUp 0.3s ease; } .nq-modal-body { overflow-y: auto; flex: 1; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        .progress-bar { height: 4px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }

        .event-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        @media (max-width: 640px) { .event-grid { grid-template-columns: 1fr; } }

        .mesh-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(ellipse 80% 50% at 20% 20%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 60%); }
        .noise { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(167,139,250,0.2); border-top-color: #a78bfa; border-radius: 50%; animation: spin 0.8s linear infinite; }

        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite; }

        .cal-nav-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #a09cbc; border-radius: 8px; padding: 6px 14px; font-family: inherit; font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.15s; line-height: 1; }
        .cal-nav-btn:hover { background: rgba(255,255,255,0.1); color: #e8e6f0; }

        /* Prevent any horizontal overflow globally */
        .nq-cal-grid, .nq-cal-hdr { width: 100%; box-sizing: border-box; }
        .nq-cal-cell { min-width: 0; box-sizing: border-box; overflow: hidden; }
        .nq-controls, .nq-main { box-sizing: border-box; width: 100%; }

        /* ── MOBILE RESPONSIVE ─────────────────────────────────── */
        @media (max-width: 640px) {

          /* Header */
          .nq-header-inner { height: 52px !important; }
          .nq-logo-text { font-size: 17px !important; }
          .nq-logo-icon { width: 26px !important; height: 26px !important; font-size: 13px !important; }
          .lang-btn { font-size: 11px !important; padding: 3px 4px !important; }

          /* Hero */
          .nq-hero { padding: 24px 16px 20px !important; }

          /* Controls wrapper */
          .nq-controls { padding: 0 16px 20px !important; }

          /* Search full width */
          .nq-search-wrap { max-width: 100% !important; }

          /* Tabs: all 3 fit on one line */
          .tab-btn { font-size: 12px !important; padding: 8px 2px !important; gap: 4px !important; }
          .tab-count { font-size: 10px !important; padding: 1px 5px !important; }
          .nq-tabs { gap: 16px !important; }

          /* Filter rows: horizontal scroll, no wrap */
          .nq-filters-cat,
          .nq-filters-city,
          .nq-filters-format {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 6px !important;
            padding-bottom: 6px !important;
            scrollbar-width: none !important;
          }
          .nq-filters-cat::-webkit-scrollbar,
          .nq-filters-city::-webkit-scrollbar,
          .nq-filters-format::-webkit-scrollbar { display: none !important; }
          .filter-btn { flex-shrink: 0 !important; padding: 6px 12px !important; font-size: 12px !important; }

          /* Main content */
          .nq-main { padding: 0 16px 60px !important; }

          /* Calendar legend: horizontal scroll */
          .nq-cal-legend {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            gap: 6px 12px !important;
            padding-bottom: 6px !important;
            margin-bottom: 16px !important;
          }
          .nq-cal-legend::-webkit-scrollbar { display: none !important; }

          /* Calendar grid: tighter gap, smaller cells */
          .nq-cal-hdr { gap: 2px !important; }
          .nq-cal-grid { gap: 2px !important; margin-bottom: 16px !important; }
          .nq-cal-cell { min-height: 46px !important; padding: 3px 2px 2px !important; border-radius: 6px !important; }
          .nq-cal-day-num { font-size: 10px !important; }
          .nq-cal-event-pill { font-size: 8px !important; padding: 1px 3px !important; margin-bottom: 1px !important; }
          .nq-cal-overflow { font-size: 8px !important; }

          /* Agenda: hide gcal button to save space */
          .nq-agenda-gcal { display: none !important; }
          .nq-agenda-item { padding: 8px 10px !important; gap: 8px !important; }

          /* Modal: bottom sheet */
          .modal-overlay { align-items: flex-end !important; padding: 0 !important; }
          .modal { border-radius: 20px 20px 0 0 !important; max-height: 92vh !important; width: 100% !important; max-width: 100% !important; }
          .nq-modal-cover { height: 180px !important; border-radius: 20px 20px 0 0 !important; }
          .nq-modal-body { padding: 20px 16px !important; }
          .nq-modal-actions { flex-direction: column !important; }
          .nq-modal-actions > * { width: 100% !important; text-align: center !important; justify-content: center !important; }

          /* Footer */
          .nq-footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }

          /* CTA row: stack buttons above search on mobile */
          .nq-cta-row { flex-wrap: wrap !important; }
          .nq-cta-btn { order: 1; flex: 1 1 calc(50% - 6px) !important; min-width: 0; height: 52px; }
          .nq-cta-row .nq-search-wrap { order: 2; flex: 0 0 100% !important; max-width: 100% !important; }
        }

        @media (max-width: 900px) and (min-width: 641px) {
          .nq-controls { padding: 0 20px 20px !important; }
          .nq-main { padding: 0 20px 60px !important; }
        }
      `}</style>

      <div className="mesh-bg" />
      <div className="noise" />

      <div style={{
        minHeight: "100vh",
        background: "#0d0d14",
        backgroundImage: "url('/Background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
        fontFamily: "'Outfit', sans-serif",
        color: "#e8e6f0",
        position: "relative",
        overflowX: "hidden",
        width: "100%",
      }}>

        {/* ── STICKY HEADER ── */}
        <header
          ref={headerRef}
          style={{
            position: "sticky", top: 0, zIndex: 40,
            background: "rgba(13,13,20,0.9)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 24px",
            transition: "box-shadow 0.3s",
          }}
        >
          <div className="nq-header-inner" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/Avatar.png" alt="NextQuest" className="nq-logo-icon" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
              <span className="nq-logo-text" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "#fff" }}>NextQuest</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a
                href="/about"
                onClick={e => { e.preventDefault(); window.history.pushState({}, "", "/about"); setAboutOpen(true); }}
                style={{ background: "none", border: "none", color: "#6b6890", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "4px 8px", borderRadius: 6, transition: "color 0.2s", textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={e => e.currentTarget.style.color = "#6b6890"}
              >About</a>
              <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ display: "flex", gap: 4 }}>
                {["en","ru","el","uk"].map(l => (
                  <button key={l} className={`lang-btn${lang === l ? " active" : ""}`} onClick={() => setLang(l)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <div className="nq-hero" style={{ position: "relative", zIndex: 1, padding: "48px 24px 32px", textAlign: "center" }}>
          <p style={{ color: "#6b6890", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{t.subtitle}</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 6vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 1, background: "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Find Your<br />Next Adventure
          </h1>
        </div>

        {/* ── CONTROLS ── */}
        <div className="nq-controls" style={{ position: "relative", zIndex: 1, padding: "0 24px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div className="nq-cta-row" style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "stretch" }}>
            <div className="nq-search-wrap" style={{ position: "relative", maxWidth: 480, flex: "0 0 480px", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4a4868", fontSize: 16, lineHeight: 1, pointerEvents: "none" }}>🔍</span>
              <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <a href="https://t.me/nextquestcy" target="_blank" rel="noopener noreferrer" className="nq-cta-btn" style={{
              flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10,
              padding: "0 14px", borderRadius: 12, textDecoration: "none", cursor: "pointer",
              background: "linear-gradient(120deg, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.07) 100%)",
              border: "1px solid rgba(167,139,250,0.28)",
              boxShadow: "inset 0 1px 0 rgba(167,139,250,0.08)",
              transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(167,139,250,0.12), 0 4px 20px rgba(124,58,237,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(167,139,250,0.28)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(167,139,250,0.08)"; }}
            >
              <img src="/Telegram_icon.png" alt="Telegram" style={{ width: 20, height: 20, flexShrink: 0, borderRadius: "50%" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", lineHeight: 1.2, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.ctaSubscribeTitle}</span>
                <span style={{ fontSize: 11, color: "#7c6faa", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.ctaSubscribeSub}</span>
              </div>
              <span style={{ fontSize: 14, color: "rgba(167,139,250,0.4)", flexShrink: 0 }}>↗</span>
            </a>
            <a href="https://t.me/NextQuestbot" target="_blank" rel="noopener noreferrer" className="nq-cta-btn" style={{
              flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10,
              padding: "0 14px", borderRadius: 12, textDecoration: "none", cursor: "pointer",
              background: "linear-gradient(120deg, rgba(249,115,22,0.13) 0%, rgba(249,115,22,0.04) 100%)",
              border: "1px solid rgba(249,115,22,0.25)",
              boxShadow: "inset 0 1px 0 rgba(249,115,22,0.08)",
              transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(249,115,22,0.12), 0 4px 20px rgba(249,115,22,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(249,115,22,0.08)"; }}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>✨</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fb923c", lineHeight: 1.2, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.ctaAddTitle}</span>
                <span style={{ fontSize: 11, color: "#7a3a10", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.ctaAddSub}</span>
              </div>
              <span style={{ fontSize: 14, color: "rgba(249,115,22,0.4)", flexShrink: 0 }}>↗</span>
            </a>
          </div>

          {/* Tabs with count badges */}
          <div className="nq-tabs" style={{ display: "flex", gap: 24, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button className={`tab-btn${tab === "upcoming" ? " active" : ""}`} onClick={() => { setTab("upcoming"); window.history.pushState({}, "", "/?tab=upcoming"); }}>
              <h2 style={{ all: "unset" }}>{t.upcoming}</h2> <span className="tab-count">{upcomingCount}</span>
            </button>
            <button className={`tab-btn${tab === "calendar" ? " active" : ""}`} onClick={() => { setTab("calendar"); window.history.pushState({}, "", "/?tab=calendar"); }}>
              📅 <h2 style={{ all: "unset" }}>{t.calendar}</h2> <span className="tab-count">{calendarCount}</span>
            </button>
            <button className={`tab-btn${tab === "archive" ? " active" : ""}`} onClick={() => { setTab("archive"); window.history.pushState({}, "", "/?tab=archive"); }}>
              <h2 style={{ all: "unset" }}>{t.archive}</h2> <span className="tab-count">{archiveCount}</span>
            </button>
          </div>

          {/* Category + City filters — hidden on Calendar tab */}
          {tab !== "calendar" && (
            <>
              <div className="nq-filters-cat" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <button className={`filter-btn${catFilters.size === 0 ? " active" : ""}`} onClick={() => toggleCat("all")}>{t.all}</button>
                {CATEGORIES.map(c => (
                  <button key={c.id}
                    className={`filter-btn${catFilters.has(c.id) ? " active" : ""}`}
                    onClick={() => toggleCat(c.id)}
                    style={catFilters.has(c.id) ? { borderColor: c.color + "66", color: c.color } : {}}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="nq-filters-city" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={`filter-btn${cityFilters.size === 0 ? " active" : ""}`} onClick={() => toggleCity("all")}>{t.allCities}</button>
                {CITIES.map(city => (
                  <button key={city}
                    className={`filter-btn${cityFilters.has(city) ? " active" : ""}`}
                    onClick={() => toggleCity(city)}>
                    📍 {city}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <button className={`filter-btn${formatFilter === "all" ? " active" : ""}`} onClick={() => setFormatFilter("all")}>{t.allFormats}</button>
                {FORMAT_TYPES(t).map(f => (
                  <button key={f.id}
                    className={`filter-btn${formatFilter === f.id ? " active" : ""}`}
                    onClick={() => setFormatFilter(formatFilter === f.id ? "all" : f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <main className="nq-main" style={{ position: "relative", zIndex: 1, padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>

          {/* ── CALENDAR TAB ── */}
          {tab === "calendar" && !loading && (
            <CalendarTab
              events={events.filter(e => e.status !== "cancelled" && !e.isPromo)}
              lang={lang}
              t={t}
              onSelect={setSelected}
              catFilters={catFilters}
              toggleCat={toggleCat}
              cityFilters={cityFilters}
              toggleCity={toggleCity}
              formatFilter={formatFilter}
              setFormatFilter={setFormatFilter}
              popover={calPopover}
              setPopover={setCalPopover}
            />
          )}

          {/* ── LOADING SKELETONS ── */}
          {loading && tab !== "calendar" && (
            <div className="event-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── ERROR ── */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#ef4444" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <p>{t.error}</p>
              <p style={{ fontSize: 12, marginTop: 8, color: "#6b6890" }}>{error}</p>
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && !error && filtered.length === 0 && tab !== "calendar" && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.5 }}>🎲</div>
              <p style={{ color: "#4a4868", fontSize: 16 }}>{t.noEvents}</p>
            </div>
          )}

          {/* ── ORGANIZER FILTER BANNER ── */}
          {/* ── EVENT CARDS GRID ── */}
          {!loading && !error && tab !== "calendar" && filtered.length > 0 && (
            <div className="event-grid">
              {filtered.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          position: "relative", zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 24px",
          background: "rgba(13,13,20,0.8)",
        }}>
          <div className="nq-footer-inner" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/Avatar.png" alt="NextQuest" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>NextQuest</span>
              <span style={{ color: "#4a4868", fontSize: 12 }}>— Cyprus Geek Events</span>
              <span style={{ color: "#2e2b45", fontSize: 12 }}>© 2026</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href="/about"
                onClick={e => { e.preventDefault(); window.history.pushState({}, "", "/about"); setAboutOpen(true); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s, border-color 0.2s", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#6b6890"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >About us</a>
              <a href="https://t.me/nextquestcy" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)"}
              >
                <img src="/Telegram_icon.png" alt="Telegram" style={{ width: 16, height: 16, borderRadius: "50%" }} /> NextQuest Community
              </a>
              <a href="https://t.me/NextQuestbot" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#fb923c", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)"}
              >
                🤖 NextQuest Bot
              </a>
            </div>
          </div>
        </footer>

        {/* ── EVENT MODAL ── */}
        <EventCardModal
          event={selected}
          onClose={() => { setSelected(null); setNotifyTooltip(null); window.history.pushState({}, "", `/?tab=${tab}`); }}
          lang={lang} t={t}
          onOrganizerClick={username => {
            setSelected(null);
            window.history.pushState({}, "", `/organizers/${username}`);
            setOrganizerPage(username);
          }}
          botUsername={BOT_USERNAME}
          subscribed={!!subscribed[selected?.id]}
          onNotify={() => setNotifyTooltip(selected?.id)}
          notifyTooltipOpen={notifyTooltip === selected?.id}
          onNotifyTooltipClose={() => {
            setSubscribed(s => ({ ...s, [selected?.id]: true }));
            setNotifyTooltip(null);
          }}
        />

        {/* ── CALENDAR DAY POPOVER — rendered at top level to escape backdrop-filter ancestors ── */}
        {calPopover && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 200 }}
              onClick={() => setCalPopover(null)}
            />
            <div style={{
              position: "fixed",
              top: (() => {
                const spaceBelow = window.innerHeight - calPopover.rect.bottom - 6;
                const popoverHeight = 44 + calPopover.events.length * 46;
                return spaceBelow >= popoverHeight
                  ? calPopover.rect.bottom + 6
                  : Math.max(calPopover.rect.top - popoverHeight - 6, 8);
              })(),
              left: Math.min(Math.max(calPopover.rect.left, 8), window.innerWidth - 240),
              zIndex: 201,
              width: 228,
              background: "#1e1e32",
              border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: 12,
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              padding: "10px 0 6px",
              fontFamily: "'Outfit', sans-serif",
              animation: "popIn 0.15s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#6b6890",
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "0 12px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 6,
              }}>
                {calPopover.day} {t.monthNames[calPopover.month]} · {calPopover.events.length} events
              </div>
              {calPopover.events.map((ev, i) => (
                <div
                  key={i}
                  onClick={() => { setCalPopover(null); setSelected(ev); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 12px", cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: getCatColor(ev.category),
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: "#e8e6f0",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{ev.title}</div>
                    <div style={{ fontSize: 10, color: "#6b6890", marginTop: 1 }}>
                      {formatTime(ev.dateStart)}{ev.dateEnd ? ` - ${formatTime(ev.dateEnd)}` : ""} · {ev.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SOCIAL SIDEBAR ── */}
        <div style={{
          position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 10, zIndex: 150,
        }}>
          {[
            {
              href: "https://t.me/nextquestcy",
              label: "Telegram",
              color: "#229ED9",
              bg: "rgba(34,158,217,0.12)",
              border: "rgba(34,158,217,0.3)",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.367l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.192z"/>
                </svg>
              ),
            },
            {
              href: "https://www.facebook.com/NextQuestToday",
              label: "Facebook",
              color: "#1877F2",
              bg: "rgba(24,119,242,0.12)",
              border: "rgba(24,119,242,0.3)",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              ),
            },
            {
              href: "https://whatsapp.com/channel/0029VbDKpBc6WaKpbVWhKs3J",
              label: "WhatsApp",
              color: "#25D366",
              bg: "rgba(37,211,102,0.12)",
              border: "rgba(37,211,102,0.3)",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              ),
            },
          ].map(({ href, label, color, bg, border, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: bg, border: `1px solid ${border}`,
                color, display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", transition: "transform 0.18s, background 0.18s, box-shadow 0.18s",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.15)";
                e.currentTarget.style.boxShadow = `0 4px 20px ${border}`;
                e.currentTarget.style.background = border;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
                e.currentTarget.style.background = bg;
              }}
            >
              {icon}
            </a>
          ))}
        </div>

        {/* ── SCROLL TO TOP ── */}
        <ScrollToTop />
      </div>
    </>
  );
}

/**
 * EventCard.jsx — shared event modal card used by App.jsx, Modals.jsx, etc.
 *
 * Props:
 *   event          — camelCase mapped event object (see mapEvent in App.jsx)
 *   lang           — "en" | "ru" | "el" | "uk"
 *   t              — translation object from LANGS[lang]
 *   onClose        — called when the ✕ button is clicked
 *   onOrganizerClick(username) — optional; if provided, organizer name becomes clickable
 *   botUsername    — string, e.g. "NextQuestbot"
 *   subscribed     — bool; whether the user already subscribed to reminders
 *   onNotify()     — called when user taps the notify button
 *   notifyTooltipOpen — bool; whether the notify tooltip is open
 *   onNotifyTooltipClose() — called when notify tooltip is dismissed
 */

import { useState } from "react";

// ─── Shared helpers (duplicated from App.jsx so this file is self-contained) ──

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games",  color: "#f97316" },
  { id: "rpg",        label: "🧙 Tabletop RPG", color: "#06b6d4" },
  { id: "larp",       label: "⚔️ LARP",         color: "#8b5cf6" },
  { id: "festival",   label: "🎪 Festival",      color: "#ec4899" },
  { id: "cosplay",    label: "👽 Cosplay",       color: "#10b981" },
  { id: "lectures",   label: "🔭 Lectures",      color: "#0ea5e9" },
  { id: "workshops",  label: "🧵 Workshops",     color: "#a855f7" },
  { id: "gaming",     label: "🎮 Gaming",        color: "#22c55e" },
  { id: "market",     label: "🛍️ Market",        color: "#f59e0b" },
  { id: "other",      label: "🃏 Other",         color: "#6b7280" },
];

function getCatColor(id) { return CATEGORIES.find(c => c.id === id)?.color || "#6b7280"; }
function getCatLabel(id) { return CATEGORIES.find(c => c.id === id)?.label || id; }

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
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function makeGCalUrl(event) {
  const fmt = d => d.toISOString().replace(/[-:]/g, "").replace(".000", "");
  const end = event.dateEnd || new Date(event.dateStart.getTime() + 2 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     event.title,
    dates:    `${fmt(event.dateStart)}/${fmt(end)}`,
    details:  event.description || "",
    location: `${event.city}, ${event.address || ""}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
function makeGMapsUrl(city, address) {
  const q = encodeURIComponent(`${address || ""} ${city || ""}`.trim());
  return `https://maps.google.com/?q=${q}`;
}

// ─── Format pill colors ───────────────────────────────────────
const FMT_COLORS = {
  private:   { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa", border: "rgba(167,139,250,0.3)"  },
  community: { bg: "rgba(6,182,212,0.12)",   color: "#06b6d4", border: "rgba(6,182,212,0.3)"    },
  official:  { bg: "rgba(16,185,129,0.12)",  color: "#10b981", border: "rgba(16,185,129,0.3)"   },
};

// ─── Language badges (modal) ─────────────────────────────────
const LANG_BADGES_MODAL = [
  { code: "en", label: "EN" },
  { code: "el", label: "GR" },
  { code: "ru", label: "RU" },
  { code: "uk", label: "UKR" },
];
function LangBadgesModal({ languages }) {
  if (!languages || languages.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", marginLeft: "auto", flexShrink: 0 }}>
      {LANG_BADGES_MODAL.filter(l => languages.includes(l.code)).map(l => (
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

// ─── EventCardModal ───────────────────────────────────────────
// The full event detail card — rendered inside whatever modal wrapper the caller provides.
export function EventCardBody({
  event, lang = "en", t,
  onClose,
  onOrganizerClick,
  botUsername = "NextQuestbot",
  subscribed = false,
  onNotify,
  notifyTooltipOpen = false,
  onNotifyTooltipClose,
}) {
  const [showFmtInfo,  setShowFmtInfo]  = useState(false);
  const [fmtInfoPos,   setFmtInfoPos]   = useState({ top: 0, left: 0 });
  const [showContacts, setShowContacts] = useState(false);
  const [contactPos,   setContactPos]   = useState({ top: 0, left: 0 });

  const color    = getCatColor(event.category);
  const fmt      = event.format || "official";
  const fmtLabel = getFormatLabel(fmt, t);
  const fmtDesc  = getFormatDesc(fmt, t);
  const fc       = FMT_COLORS[fmt] || FMT_COLORS.official;

  const displayName = event.organizerName || event.organizerUsername || null;
  const isNavigable = !!event.organizerUsername && !!onOrganizerClick;

  return (
    <>
      {/* ── Cover ── */}
      <div style={{
        position: "relative", height: 220,
        borderRadius: "20px 20px 0 0", overflow: "hidden", background: "#1a1a2e",
      }}>
        <img
          src={event.cover} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(22,22,42,1) 0%, transparent 50%)" }} />

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(0,0,0,0.5)", border: "none", color: "#fff",
            borderRadius: 8, width: 36, height: 36, cursor: "pointer",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>

        <div style={{ position: "absolute", bottom: 16, left: 20, display: "flex", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", padding: "4px 12px",
            borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: color + "22", color, border: `1px solid ${color}44`,
          }}>{getCatLabel(event.category)}</span>
          {event.multiDay && (
            <span style={{
              display: "inline-flex", alignItems: "center", padding: "4px 12px",
              borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: "rgba(255,255,255,0.1)", color: "#e8e6f0",
            }}>{t.multiDay}</span>
          )}
          {event.status === "cancelled" && (
            <span style={{
              display: "inline-flex", alignItems: "center", padding: "4px 12px",
              borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: "rgba(239,68,68,0.15)", color: "#ef4444",
            }}>{t.cancelled}</span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: 24, overflowY: "auto" }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
          color: "#fff", marginBottom: 16, lineHeight: 1.2,
        }}>
          {({ ru: event.title_ru, el: event.title_el, uk: event.title_uk })[lang] || event.title}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 18 }}>

          {/* Format pill + organizer + lang badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

            {/* Format pill + ℹ tooltip */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", padding: "3px 10px",
                borderRadius: 999, fontWeight: 700, fontSize: 12, flexShrink: 0,
                background: fc.bg, color: fc.color, border: `1px solid ${fc.border}`,
              }}>{fmtLabel}</span>

              <button
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setFmtInfoPos({ top: rect.top - 8, left: rect.left });
                  setShowFmtInfo(v => !v);
                  setShowContacts(false);
                }}
                style={{
                  width: 15, height: 15, borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "#6b6890", fontSize: 9, fontWeight: 700, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "inherit", flexShrink: 0, lineHeight: 1, padding: 0,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#a09cbc"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#6b6890"; }}
              >i</button>

              {showFmtInfo && (
                <div style={{
                  position: "fixed",
                  bottom: `calc(100vh - ${fmtInfoPos.top}px)`,
                  left: fmtInfoPos.left,
                  background: "#1e1e36", border: "1px solid rgba(167,139,250,0.25)",
                  borderRadius: 10, padding: "10px 13px", width: 210,
                  boxShadow: "0 8px 28px rgba(0,0,0,0.5)", zIndex: 9999,
                  fontSize: 12, lineHeight: 1.5, color: "#a09cbc",
                  animation: "fadeIn 0.15s ease",
                }}>
                  <strong style={{ color: "#e8e6f0", fontSize: 12 }}>{fmtLabel}</strong><br />
                  {fmtDesc}
                </div>
              )}
            </div>

            {/* Organizer name */}
            {displayName && (isNavigable ? (
              <button
                onClick={() => onOrganizerClick(event.organizerUsername)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: 999, padding: "3px 10px 3px 8px",
                  cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#a78bfa",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.18)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; e.currentTarget.style.color = "#c4b5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.08)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)"; e.currentTarget.style.color = "#a78bfa"; }}
              >
                <span style={{ fontSize: 13 }}>👤</span>
                {displayName}
                <span style={{ fontSize: 11, color: "rgba(167,139,250,0.6)" }}>›</span>
              </button>
            ) : (
              <span style={{ fontSize: 13, color: "#a09cbc" }}>
                <span style={{ color: "#4a4868", fontWeight: 600, fontSize: 12 }}>{t.organizerLabel}</span>
                {displayName}
              </span>
            ))}
            <LangBadgesModal languages={event.languages} />
          </div>

          {/* Date */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#a09cbc", fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <rect x="1" y="2" width="14" height="13" rx="2" fill="#3d3a5c"/>
              <rect x="1" y="2" width="14" height="5" rx="2" fill="#ef4444"/>
              <rect x="9" y="0" width="2" height="4" rx="1" fill="#c0bcd8"/>
              <rect x="5" y="0" width="2" height="4" rx="1" fill="#c0bcd8"/>
              <rect x="3" y="9" width="2" height="2" rx="0.5" fill="#a09cbc"/>
              <rect x="7" y="9" width="2" height="2" rx="0.5" fill="#a09cbc"/>
              <rect x="11" y="9" width="2" height="2" rx="0.5" fill="#a09cbc"/>
              <rect x="3" y="12" width="2" height="2" rx="0.5" fill="#a09cbc"/>
              <rect x="7" y="12" width="2" height="2" rx="0.5" fill="#a09cbc"/>
            </svg>
            <span>
              {formatDate(event.dateStart, lang)}
              {event.multiDay && event.dateEnd
                ? ` — ${formatDate(event.dateEnd, lang)}`
                : ` · ${formatTime(event.dateStart)}`}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
            <span style={{ flexShrink: 0 }}>📍</span>
            <a
              href={makeGMapsUrl(event.city, event.address)}
              target="_blank" rel="noopener noreferrer"
              style={{ color: "#a09cbc", textDecoration: "underline", textDecorationColor: "rgba(160,156,188,0.3)", textUnderlineOffset: 3 }}
            >
              {event.city}{event.address ? `, ${event.address}` : ""}
            </a>
          </div>

          {/* Spots + status */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#a09cbc" }}>
              👥 {event.maxParticipants ? `${event.maxParticipants} ${t.participants}` : t.noLimit}
            </span>
            {event.maxParticipants && event.registrationClosed ? (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>{t.statusFull}</span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>{t.statusOpen}</span>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div style={{ color: "#9996b8", fontSize: 14, lineHeight: 1.7, marginBottom: 20, textAlign: "left" }}>
            {(() => {
              const descMap = { ru: event.description_ru, el: event.description_el, uk: event.description_uk };
              const text = descMap[lang] || event.description;
              return text.split("\n").map((line, i) => <span key={i}>{line}<br /></span>);
            })()}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "stretch", flexWrap: "wrap" }}>

          {/* 1. Register / Contact organizer — or bot CTA for promo events */}
          {event.isPromo ? (
            <a
              href="https://t.me/NextQuestbot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, textDecoration: "none", display: "inline-flex",
                alignItems: "center", justifyContent: "center", gap: 8,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                color: "#fff", border: "none", borderRadius: 8,
                padding: "0 20px", height: 42, fontSize: 14,
                fontFamily: "inherit", fontWeight: 700,
              }}
            >
              {t.promoAddEvent}
            </a>
          ) : event.status !== "cancelled" && (() => {
            if (event.externalUrl) {
              return (
                <a
                  href={event.externalUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, textDecoration: "none", display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    color: "#fff", border: "none", borderRadius: 8,
                    padding: "0 20px", height: 42, fontSize: 14,
                    fontFamily: "inherit", fontWeight: 700,
                  }}
                >
                  {t.register}
                </a>
              );
            }
            if (event.organizerContacts) {
              const raw  = event.organizerContacts;
              const href = raw.startsWith("http") ? raw
                : raw.startsWith("@") ? `https://t.me/${raw.slice(1)}`
                : `https://t.me/${raw}`;
              return (
                <div style={{ flex: 1, position: "relative" }}>
                  <button
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setContactPos({ top: rect.top, left: rect.left + rect.width / 2 });
                      setShowContacts(v => !v);
                      setShowFmtInfo(false);
                    }}
                    style={{
                      width: "100%", height: 42,
                      background: "rgba(249,115,22,0.12)",
                      border: "1px solid rgba(249,115,22,0.45)",
                      color: "#f97316", borderRadius: 8, cursor: "pointer",
                      fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    📋 {t.contactOrganizer.replace(/📋\s?/, "").split(" ")[0]}
                  </button>

                  {showContacts && (
                    <div style={{
                      position: "fixed",
                      bottom: `calc(100vh - ${contactPos.top}px + 10px)`,
                      left: contactPos.left,
                      transform: "translateX(-50%)",
                      background: "#1e1e36", border: "1px solid rgba(249,115,22,0.3)",
                      borderRadius: 12, padding: "13px 15px", width: 240,
                      boxShadow: "0 12px 40px rgba(0,0,0,0.6)", zIndex: 9999,
                      animation: "fadeIn 0.15s ease",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6890", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>
                        {t.organizerContacts}
                      </div>
                      <div style={{ fontSize: 14, color: "#f97316", fontWeight: 600, wordBreak: "break-all", marginBottom: 11 }}>
                        {raw}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <a
                          href={href} target="_blank" rel="noopener noreferrer"
                          onClick={() => setShowContacts(false)}
                          style={{
                            flex: 1, textAlign: "center", textDecoration: "none",
                            background: "linear-gradient(135deg, #ea580c, #f97316)",
                            color: "#fff", borderRadius: 8, padding: "8px 10px",
                            fontSize: 12, fontWeight: 700, display: "inline-flex",
                            alignItems: "center", justifyContent: "center", gap: 5,
                          }}
                        >✈️ Open</a>
                        <button
                          onClick={() => setShowContacts(false)}
                          style={{
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#6b6890", borderRadius: 8, padding: "8px 11px",
                            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                          }}
                        >✕</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return <div style={{ flex: 1 }} />;
          })()}

          {/* 2. Notify me — hidden for promo events */}
          {!event.isPromo && <div style={{ flex: 1, position: "relative" }}>
            <button
              onClick={() => {
                if (subscribed) return;
                setShowContacts(false);
                setShowFmtInfo(false);
                if (onNotify) onNotify();
              }}
              style={{
                width: "100%", height: 42,
                border: subscribed ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(167,139,250,0.4)",
                background: subscribed ? "rgba(16,185,129,0.08)" : "rgba(167,139,250,0.08)",
                color: subscribed ? "#10b981" : "#a78bfa",
                borderRadius: 8, fontSize: 14, fontFamily: "inherit",
                fontWeight: 600, cursor: subscribed ? "default" : "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {subscribed ? t.notified : t.notify}
            </button>

            {notifyTooltipOpen && !subscribed && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
                transform: "translateX(-50%)",
                background: "#1e1e36", border: "1px solid rgba(167,139,250,0.35)",
                borderRadius: 12, padding: "12px 14px", width: 230,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 200,
                animation: "fadeIn 0.15s ease",
              }}>
                <div style={{
                  position: "absolute", bottom: -6, left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 10, height: 10, background: "#1e1e36",
                  border: "1px solid rgba(167,139,250,0.35)",
                  borderTop: "none", borderLeft: "none",
                }} />
                <p style={{ fontSize: 12, color: "#a09cbc", marginBottom: 10, lineHeight: 1.5 }}>
                  🔔 You'll get reminders <strong style={{ color: "#e8e6f0" }}>7 days</strong> and <strong style={{ color: "#e8e6f0" }}>1 day</strong> before the event — via Telegram.
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    href={`https://t.me/${botUsername}?start=event_${event.id}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      flex: 1, textAlign: "center", textDecoration: "none",
                      background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                      color: "#fff", borderRadius: 8, padding: "7px 10px",
                      fontSize: 12, fontWeight: 700, display: "inline-flex",
                      alignItems: "center", justifyContent: "center", gap: 4,
                    }}
                    onClick={onNotifyTooltipClose}
                  >✈️ Open Telegram</a>
                  <button
                    onClick={onNotifyTooltipClose}
                    style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#6b6890", borderRadius: 8, padding: "7px 10px",
                      fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >✕</button>
                </div>
              </div>
            )}
          </div>}

          {/* 3. Add to Calendar — hidden for promo events */}
          {!event.isPromo && <a
            href={makeGCalUrl(event)} target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)",
              color: "#06b6d4", borderRadius: 8, padding: "0 20px", height: 42,
              fontSize: 14, fontFamily: "inherit", fontWeight: 600,
              textDecoration: "none", gap: 6, transition: "all 0.2s",
            }}
          >
            📅 {t.addToCalendar}
          </a>}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </>
  );
}

// ─── Convenience wrapper: full-screen modal with backdrop ─────
export function EventCardModal({
  event, onClose,
  lang, t, onOrganizerClick,
  botUsername, subscribed, onNotify,
  notifyTooltipOpen, onNotifyTooltipClose,
}) {
  if (!event) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.2s ease",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)", background: "#16162a",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
          maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
          animation: "slideUp 0.3s ease", boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <EventCardBody
          event={event} lang={lang} t={t}
          onClose={onClose}
          onOrganizerClick={onOrganizerClick}
          botUsername={botUsername}
          subscribed={subscribed}
          onNotify={onNotify}
          notifyTooltipOpen={notifyTooltipOpen}
          onNotifyTooltipClose={onNotifyTooltipClose}
        />
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

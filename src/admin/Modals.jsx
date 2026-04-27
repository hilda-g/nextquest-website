import { useState, useEffect } from "react";
import { EventCardModal } from "./EventCard";
import { LANGS } from "./locales";

// ─── Shared backdrop / container ─────────────────────────────
function ConfirmModal({ visible, onClose, children }) {
  useEffect(() => {
    function handler(e) { if (e.key === "Escape") onClose(); }
    if (visible) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(440px, 100%)", background: "#16162a",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
          padding: 32, fontFamily: "'Outfit', sans-serif",
          animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────
export function DeleteModal({ event, onConfirm, onClose }) {
  const [canDelete, setCanDelete] = useState(false);
  const [loading, setLoading]     = useState(false);
  const timerRef = useState(null);

  function onHoverStart() { timerRef[0] = setTimeout(() => setCanDelete(true), 1200); }
  function onHoverEnd()   { clearTimeout(timerRef[0]); setCanDelete(false); }
  useEffect(() => () => clearTimeout(timerRef[0]), []);

  async function handleDelete() {
    if (!canDelete) return;
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  }

  return (
    <ConfirmModal visible={!!event} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>🗑</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>Delete this event?</div>
        <div style={{ fontSize: 14, color: "#a09cbc", lineHeight: 1.6, marginBottom: 8 }}>"{event?.title}"</div>
        <div style={{ fontSize: 13, color: "#6b6890", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 24, lineHeight: 1.5 }}>
          The event will be hidden from the site and marked as deleted. You can restore it later from the <strong style={{ color: "#a09cbc" }}>Deleted</strong> tab.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}
            onClick={handleDelete} disabled={loading}
            style={{ flex: 1, padding: "11px 0", borderRadius: 11, cursor: loading ? "wait" : "pointer", background: canDelete ? "rgba(239,68,68,0.85)" : "rgba(239,68,68,0.12)", border: `1px solid ${canDelete ? "rgba(239,68,68,0.8)" : "rgba(239,68,68,0.25)"}`, color: canDelete ? "#fff" : "#ef4444", fontSize: 14, fontWeight: 700, fontFamily: "inherit", transition: "all 0.3s ease" }}
          >
            {loading ? "Deleting…" : canDelete ? "Delete Event" : "Hold to delete…"}
          </button>
          <button onClick={onClose} style={{ padding: "11px 20px", borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890", fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
        </div>
      </div>
    </ConfirmModal>
  );
}

// ─── Restore Modal ────────────────────────────────────────────
export function RestoreModal({ event, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  }

  return (
    <ConfirmModal visible={!!event} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>♻️</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>Restore this event?</div>
        <div style={{ fontSize: 14, color: "#a09cbc", marginBottom: 8 }}>"{event?.title}"</div>
        <div style={{ fontSize: 13, color: "#6b6890", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 24, lineHeight: 1.5 }}>
          The event will be restored to <strong style={{ color: "#fcd34d" }}>Pending</strong> status for review before publishing.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleRestore} disabled={loading} style={{ flex: 1, padding: "11px 0", borderRadius: 11, cursor: loading ? "wait" : "pointer", background: "rgba(16,185,129,0.8)", border: "1px solid rgba(16,185,129,0.6)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
            {loading ? "Restoring…" : "Restore Event"}
          </button>
          <button onClick={onClose} style={{ padding: "11px 20px", borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890", fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
        </div>
      </div>
    </ConfirmModal>
  );
}


// ─── End Registration Modal ───────────────────────────────────
export function EndRegistrationModal({ event, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  }

  return (
    <ConfirmModal visible={!!event} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>🔒</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>End Registration?</div>
        <div style={{ fontSize: 14, color: "#a09cbc", marginBottom: 8 }}>"{event?.title}"</div>
        <div style={{ fontSize: 13, color: "#6b6890", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 24, lineHeight: 1.5 }}>
          This will mark the event as <strong style={{ color: "#ef4444" }}>Full</strong> on the website and notify all subscribers that registration is closed.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleConfirm} disabled={loading}
            style={{ flex: 1, padding: "11px 0", borderRadius: 11, cursor: loading ? "wait" : "pointer", background: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.6)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}
          >
            {loading ? "Closing…" : "🔒 Close Registration"}
          </button>
          <button onClick={onClose} style={{ padding: "11px 20px", borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890", fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
        </div>
      </div>
    </ConfirmModal>
  );
}

// ─── Re-Open Registration Modal ──────────────────────────────
export function ReopenRegistrationModal({ event, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  }

  return (
    <ConfirmModal visible={!!event} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>♻️</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>Re-Open Registration?</div>
        <div style={{ fontSize: 14, color: "#a09cbc", marginBottom: 8 }}>"{event?.title}"</div>
        <div style={{ fontSize: 13, color: "#6b6890", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 24, lineHeight: 1.5 }}>
          This will mark the event as <strong style={{ color: "#10b981" }}>Open</strong> again on the website. Use this if spots have become available.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleConfirm} disabled={loading}
            style={{ flex: 1, padding: "11px 0", borderRadius: 11, cursor: loading ? "wait" : "pointer", background: "rgba(16,185,129,0.8)", border: "1px solid rgba(16,185,129,0.6)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}
          >
            {loading ? "Reopening…" : "♻️ Re-Open Registration"}
          </button>
          <button onClick={onClose} style={{ padding: "11px 20px", borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890", fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
        </div>
      </div>
    </ConfirmModal>
  );
}

// ─── Create Post Modal ────────────────────────────────────────
// Shows a preview of the channel post and lets the admin confirm.
// Props:
//   event      – the event object (or null to hide)
//   onConfirm  – async () => void  called when admin clicks "Send to channel"
//   onClose    – () => void

const CATEGORIES = {
  boardgames: "🎲 Board Games",
  rpg:        "🧙 Tabletop RPG",
  larp:       "⚔️ LARP",
  festival:   "🎪 Festival",
  cosplay:    "👽 Cosplay",
  lectures:   "🔭 Lectures",
  workshops:  "🧵 Workshops",
  gaming:     "🎮 Gaming",
  market:     "🛍️ Market",
  other:      "🃏 Other",
};

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "NextQuestbot";
const SITE_URL     = import.meta.env.VITE_SITE_URL     || "https://nextquest.today";

function buildPreviewText(ev) {
  if (!ev) return "";
  const dateStr  = ev.date_start?.slice(0, 16).replace("T", " ") ?? "";
  const endStr   = ev.date_end ? ` → ${ev.date_end.slice(0, 16).replace("T", " ")}` : "";
  const cat      = CATEGORIES[ev.category] ?? "🎪 Event";
  const urlLine  = ev.external_url ? `\n🔗 ${ev.external_url}` : "";
  const desc     = ev.description ?? "";
  const descStr  = desc.length > 400 ? desc.slice(0, 400) + "…" : desc;

  return [
    "✨ Событие в календаре",
    "",
    ev.title,
    cat,
    `🗓 ${dateStr}${endStr}`,
    `📍 ${ev.location_city ?? ""} · ${ev.location_address ?? ""}${urlLine}`,
    "",
    descStr,
    "",
    `🔔 Подписаться на напоминание: t.me/${BOT_USERNAME}?start=event_${ev.id}`,
    `🌐 ${SITE_URL}/events/${ev.id}`,
  ].join("\n");
}

export function CreatePostModal({ event, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  }

  const previewText = buildPreviewText(event);

  return (
    <ConfirmModal visible={!!event} onClose={onClose}>
      {/* Icon + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>📢</div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", lineHeight: 1.2 }}>
            Post to channel
          </div>
          <div style={{ fontSize: 12, color: "#6b6890", marginTop: 3 }}>
            Preview what will be sent
          </div>
        </div>
      </div>

      {/* Cover image (if present) */}
      {event?.cover_image_url && (
        <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden", maxHeight: 160, border: "1px solid rgba(255,255,255,0.06)" }}>
          <img
            src={event.cover_image_url}
            alt="cover"
            style={{ width: "100%", objectFit: "cover", maxHeight: 160, display: "block" }}
          />
        </div>
      )}

      {/* Post text preview */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, padding: "14px 16px", marginBottom: 20,
        fontFamily: "monospace", fontSize: 12, color: "#a09cbc",
        lineHeight: 1.65, whiteSpace: "pre-wrap", maxHeight: 220, overflowY: "auto",
      }}>
        {previewText}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            flex: 1, padding: "11px 0", borderRadius: 11,
            cursor: loading ? "wait" : "pointer",
            background: loading ? "rgba(6,182,212,0.4)" : "rgba(6,182,212,0.85)",
            border: "1px solid rgba(6,182,212,0.6)",
            color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => { if (!loading) e.target.style.background = "rgba(6,182,212,1)"; }}
          onMouseLeave={e => { if (!loading) e.target.style.background = "rgba(6,182,212,0.85)"; }}
        >
          {loading ? "Sending…" : "✅ Send to channel"}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            padding: "11px 20px", borderRadius: 11, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#6b6890", fontSize: 14, fontFamily: "inherit",
          }}
        >❌ Cancel</button>
      </div>
    </ConfirmModal>
  );
}

// ─── View Event Modal ─────────────────────────────────────────
// Renders the event exactly as it appears on the public site.
// Props:
//   event    – raw event object from Supabase (or null to hide)
//   onClose  – () => void

const SITE_BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "NextQuestbot";

const CAT_COLORS = {
  boardgames: "#f97316", rpg: "#06b6d4",   larp: "#8b5cf6",
  festival:   "#ec4899", cosplay: "#10b981", lectures: "#0ea5e9",
  workshops:  "#a855f7", gaming: "#22c55e", market: "#f59e0b", other: "#6b7280",
};
const CAT_LABELS = {
  boardgames: "🎲 Board Games",  rpg:      "🧙 Tabletop RPG", larp:     "⚔️ LARP",
  festival:   "🎪 Festival",     cosplay:  "👽 Cosplay",      lectures: "🔭 Lectures",
  workshops:  "🧵 Workshops",    gaming:   "🎮 Gaming",       market:   "🛍️ Market",   other: "🃏 Other",
};

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function makeGCalUrl(ev) {
  const fmt = d => new Date(d).toISOString().replace(/[-:]/g, "").replace(".000", "");
  const end = ev.date_end || ev.date_start;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${fmt(ev.date_start)}/${fmt(end)}&location=${encodeURIComponent(`${ev.location_city ?? ""}, ${ev.location_address ?? ""}`)}`;
}

// ─── ViewEventModal — Admin panel "View Event" ────────────────
// Maps raw Supabase snake_case event → camelCase and renders the
// shared EventCardBody so it looks identical to the public site.
export function ViewEventModal({ event, onClose }) {
  useEffect(() => {
    function handler(e) { if (e.key === "Escape") onClose(); }
    if (event) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [event, onClose]);

  if (!event) return null;

  // Map raw snake_case → camelCase so EventCardModal can consume it
  const mapped = {
    id:                  event.id,
    title:               event.title,
    title_ru:            event.title_ru || null,
    title_el:            event.title_el || null,
    title_uk:            event.title_uk || null,
    category:            event.category,
    format:              event.format || "official",
    status:              event.status,
    dateStart:           new Date(event.date_start),
    dateEnd:             event.date_end ? new Date(event.date_end) : null,
    multiDay:            !!(event.date_end && event.date_end !== event.date_start),
    city:                event.location_city,
    address:             event.location_address,
    description:         event.description || "",
    description_ru:      event.description_ru || null,
    description_el:      event.description_el || null,
    description_uk:      event.description_uk || null,
    cover:               event.cover_image_url || "",
    externalUrl:         event.external_url || null,
    organizerContacts:   event.organizer_contacts || null,
    organizerUsername:   event.organizer_username || null,
    organizerName:       event.organizer_name || event.organizer_username || null,
    maxParticipants:     event.max_participants || null,
    registrationClosed:  event.registration_closed || false,
  };

  // Admin panel is always in English
  const t = LANGS["en"];

  return (
    <EventCardModal
      event={mapped}
      onClose={onClose}
      lang="en"
      t={t}
      botUsername={SITE_BOT_USERNAME}
      subscribed={false}
      onNotify={null}
    />
  );
}

import { useState, useEffect, useRef } from "react";

const CATEGORIES = {
  boardgames: "🎲 Board Games",
  rpg:        "🧙 Tabletop RPG",
  larp:       "⚔️ LARP",
  festival:   "🎪 Festival",
  cosplay:    "👽 Cosplay",
  lectures:   "🔭 Lectures",
  market:     "🛍️ Market",
  other:      "🃏 Other",
};

const STATUS_STYLES = {
  published: { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
  pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
  deleted:   { color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      flexShrink: 0, textTransform: "capitalize", letterSpacing: "0.04em",
    }}>{status}</span>
  );
}

function menuItem(color) {
  return {
    display: "block", width: "100%", textAlign: "left",
    padding: "8px 16px", background: "none", border: "none",
    cursor: "pointer", fontSize: 13, color: color || "#a09cbc",
    fontFamily: "inherit", transition: "background 0.1s",
  };
}

// ─── ThreeDotMenu ─────────────────────────────────────────────
function ThreeDotMenu({ event, isDeleted, onEdit, onDelete, onRestore, onStatusChange, onCreatePost, onViewEvent, onEndRegistration, onReopenRegistration }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    // BUG 3 FIX: position: "relative" here + zIndex: 1000 on dropdown
    // so the menu always renders above the list container even when
    // the list has overflow: "hidden" on its rows.
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 32, height: 32, borderRadius: 8, cursor: "pointer",
          background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890",
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
      >⋮</button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: 36,
          // BUG 3 FIX: raised from zIndex 50 → 1000 so it renders above
          // the rounded list container that has overflow: "visible"
          zIndex: 1000,
          background: "#1e1e32", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "6px 0", minWidth: 180,
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          animation: "popIn 0.15s cubic-bezier(0.34,1.56,0.64,1)",
          fontFamily: "'Outfit', sans-serif",
        }}>
          {!isDeleted && (
            <>
              <button
                onClick={() => { onViewEvent(event); setOpen(false); }}
                style={menuItem()}
              >
                👁 View event
              </button>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />

              <button onClick={() => { onEdit(event); setOpen(false); }} style={menuItem()}>
                ✏️ Edit event
              </button>

              <div style={{ padding: "4px 12px 2px", fontSize: 10, color: "#4a4868", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Change status
              </div>

              {event.status !== "published" && (
                <button onClick={() => { onStatusChange(event, "published"); setOpen(false); }} style={menuItem()}>
                  ✅ Publish
                </button>
              )}
              {event.status !== "pending" && (
                <button onClick={() => { onStatusChange(event, "pending"); setOpen(false); }} style={menuItem()}>
                  ⏳ Set pending
                </button>
              )}
              {event.status !== "cancelled" && (
                <button onClick={() => { onStatusChange(event, "cancelled"); setOpen(false); }} style={menuItem()}>
                  ❌ Cancel
                </button>
              )}

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />

              <button
                onClick={() => { onCreatePost(event); setOpen(false); }}
                style={menuItem("#06b6d4")}
              >
                📢 Create Post
              </button>

              {event.max_participants && !event.registration_closed && (
                <>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
                  <button onClick={() => { onEndRegistration(event); setOpen(false); }} style={menuItem("#ef4444")}>
                    🔒 End Registration
                  </button>
                </>
              )}
              {event.max_participants && event.registration_closed && (
                <>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
                  <button onClick={() => { onReopenRegistration(event); setOpen(false); }} style={menuItem("#10b981")}>
                    ♻️ Re-Open Registration
                  </button>
                </>
              )}

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />

              <button onClick={() => { onDelete(event); setOpen(false); }} style={menuItem("#ef4444")}>
                🗑 Delete event
              </button>
            </>
          )}

          {isDeleted && (
            <button onClick={() => { onRestore(event); setOpen(false); }} style={menuItem("#10b981")}>
              ♻️ Restore event
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── EventRow ────────────────────────────────────────────────
export default function EventRow({ event, onEdit, onDelete, onRestore, onStatusChange, onCreatePost, onViewEvent, onEndRegistration, onReopenRegistration }) {
  const isDeleted = !!event.deleted_at;
  const date      = event.date_start ? event.date_start.slice(0, 10) : "—";
  const cover     = event.cover_image_url;
  const position  = event.cover_position || { x: 50, y: 50 };

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        opacity: isDeleted ? 0.5 : 1, transition: "background 0.15s, opacity 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Thumbnail */}
      <div style={{
        width: 52, height: 52, borderRadius: 10, background: "#1a1a2e",
        flexShrink: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {cover ? (
          <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${position.x}% ${position.y}%` }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#4a4868" }}>🖼</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e6f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span>
          {event.is_promo && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))",
              border: "1px solid rgba(167,139,250,0.4)", color: "#c4b5fd",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>⭐ Promo</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#4a4868" }}>
          {date} · {event.location_city} · {CATEGORIES[event.category] || event.category}
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={isDeleted ? "deleted" : event.status} />

      {/* Three-dot menu */}
      <ThreeDotMenu
        event={event}
        isDeleted={isDeleted}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        onStatusChange={onStatusChange}
        onCreatePost={onCreatePost}
        onViewEvent={onViewEvent}
        onEndRegistration={onEndRegistration}
        onReopenRegistration={onReopenRegistration}
      />
    </div>
  );
}

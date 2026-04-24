import { useState, useRef, useEffect } from "react";

const CATEGORIES = {
  boardgames: "🎲 Board Games",
  larp:       "⚔️ LARP",
  festival:   "🎪 Festival",
  rpg:        "🎭 RPG",
  cosplay:    "👗 Cosplay",
  other:      "🃏 Other",
};

const STATUS_CONFIG = {
  published: { label: "Published", color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)"  },
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"  },
  deleted:   { label: "Deleted",   color: "#6b7280", bg: "rgba(107,114,128,0.12)",border: "rgba(107,114,128,0.25)"},
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.deleted;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      letterSpacing: "0.04em", flexShrink: 0,
    }}>{cfg.label}</span>
  );
}

// ─── Three-dot menu ──────────────────────────────────────────
function ThreeDotMenu({ event, isDeleted, onEdit, onDelete, onRestore, onStatusChange, onCreatePost, onViewEvent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
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
          position: "absolute", right: 0, top: 36, zIndex: 1000,
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
                style={{ ...menuItem(), display: "block", width: "100%", textAlign: "left" }}
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

              {/* ── Create Post ─────────────────────────────── */}
              <button
                onClick={() => { onCreatePost(event); setOpen(false); }}
                style={menuItem("#06b6d4")}
              >
                📢 Create Post
              </button>

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

function menuItem(color) {
  return {
    display: "block", width: "100%", textAlign: "left",
    padding: "8px 16px", background: "none", border: "none",
    cursor: "pointer", fontSize: 13, color: color || "#a09cbc",
    fontFamily: "inherit", transition: "background 0.1s",
    onMouseEnter: e => e.target.style.background = "rgba(255,255,255,0.05)",
    onMouseLeave: e => e.target.style.background = "none",
  };
}

// ─── EventRow ────────────────────────────────────────────────
export default function EventRow({ event, onEdit, onDelete, onRestore, onStatusChange, onCreatePost, onViewEvent }) {
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
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e6f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
          {event.title}
        </div>
        <div style={{ fontSize: 12, color: "#4a4868" }}>
          {date} · {event.location_city} · {CATEGORIES[event.category] || event.category}
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={isDeleted ? "deleted" : event.status} />

      {/* Edit button */}
      {!isDeleted && (
        <button
          onClick={() => onEdit(event)}
          style={{
            padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
            color: "#a78bfa", fontSize: 12, fontFamily: "inherit", flexShrink: 0, transition: "background 0.15s",
          }}
          onMouseEnter={e => e.target.style.background = "rgba(167,139,250,0.15)"}
          onMouseLeave={e => e.target.style.background = "rgba(167,139,250,0.08)"}
        >Edit</button>
      )}

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
      />
    </div>
  );
}

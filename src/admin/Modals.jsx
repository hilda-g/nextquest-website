import { useState, useEffect } from "react";

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
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(440px, 100%)",
          background: "#16162a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 32,
          fontFamily: "'Outfit', sans-serif",
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

  // Require hover for 1.5s before delete activates
  function onHoverStart() {
    timerRef[0] = setTimeout(() => setCanDelete(true), 1200);
  }
  function onHoverEnd() {
    clearTimeout(timerRef[0]);
    setCanDelete(false);
  }

  useEffect(() => () => clearTimeout(timerRef[0]), []);

  async function handleDelete() {
    if (!canDelete) return;
    setLoading(true);
    try { await onConfirm(); }
    finally { setLoading(false); }
  }

  return (
    <ConfirmModal visible={!!event} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, margin: "0 auto 20px",
        }}>🗑</div>

        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 20, color: "#fff", marginBottom: 10,
        }}>Delete this event?</div>

        <div style={{
          fontSize: 14, color: "#a09cbc", lineHeight: 1.6, marginBottom: 8,
        }}>
          "{event?.title}"
        </div>

        <div style={{
          fontSize: 13, color: "#6b6890",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10, padding: "10px 14px",
          marginBottom: 24, lineHeight: 1.5,
        }}>
          The event will be hidden from the site and marked as deleted.
          You can restore it later from the <strong style={{ color: "#a09cbc" }}>Deleted</strong> tab.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onClick={handleDelete}
            disabled={loading}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 11, cursor: loading ? "wait" : "pointer",
              background: canDelete ? "rgba(239,68,68,0.85)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${canDelete ? "rgba(239,68,68,0.8)" : "rgba(239,68,68,0.25)"}`,
              color: canDelete ? "#fff" : "#ef4444",
              fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "Deleting…" : canDelete ? "Delete Event" : "Hold to delete…"}
          </button>
          <button onClick={onClose} style={{
            padding: "11px 20px", borderRadius: 11, cursor: "pointer",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#6b6890", fontSize: 14, fontFamily: "inherit",
          }}>Cancel</button>
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
    try { await onConfirm(); }
    finally { setLoading(false); }
  }

  return (
    <ConfirmModal visible={!!event} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, margin: "0 auto 20px",
        }}>♻️</div>

        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 20, color: "#fff", marginBottom: 10,
        }}>Restore this event?</div>

        <div style={{ fontSize: 14, color: "#a09cbc", marginBottom: 8 }}>
          "{event?.title}"
        </div>

        <div style={{
          fontSize: 13, color: "#6b6890",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10, padding: "10px 14px",
          marginBottom: 24, lineHeight: 1.5,
        }}>
          The event will be restored to <strong style={{ color: "#fcd34d" }}>Pending</strong> status
          for review before publishing.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleRestore} disabled={loading} style={{
            flex: 1, padding: "11px 0", borderRadius: 11, cursor: loading ? "wait" : "pointer",
            background: "rgba(16,185,129,0.8)",
            border: "1px solid rgba(16,185,129,0.6)",
            color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
          }}>
            {loading ? "Restoring…" : "Restore Event"}
          </button>
          <button onClick={onClose} style={{
            padding: "11px 20px", borderRadius: 11, cursor: "pointer",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#6b6890", fontSize: 14, fontFamily: "inherit",
          }}>Cancel</button>
        </div>
      </div>
    </ConfirmModal>
  );
}

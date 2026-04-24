import { useState, useMemo } from "react";
import { useAdminAuth } from "./useAdminAuth.js";
import { useEvents }    from "./useEvents.js";
import { useToasts, ToastContainer } from "./Toast.jsx";
import LoginScreen from "./LoginScreen.jsx";
import EventDrawer from "./EventDrawer.jsx";
import EventRow    from "./EventRow.jsx";
import { DeleteModal, RestoreModal, CreatePostModal, ViewEventModal } from "./Modals.jsx";

// channel_notifier URL + secret come from .env
// Add to your .env:
//   VITE_NOTIFIER_URL=https://notifier.nextquest.today
//   VITE_NOTIFIER_SECRET=changeme
const NOTIFIER_URL    = import.meta.env.VITE_NOTIFIER_URL    || "";
const NOTIFIER_SECRET = import.meta.env.VITE_NOTIFIER_SECRET || "";

const TABS = [
  { key: "all",       label: "All"       },
  { key: "published", label: "Published" },
  { key: "pending",   label: "Pending"   },
  { key: "cancelled", label: "Cancelled" },
  { key: "deleted",   label: "Deleted"   },
];

const EMPTY_STATES = {
  all:       { icon: "🗓", text: "No events yet"        },
  published: { icon: "✅", text: "No published events"  },
  pending:   { icon: "⏳", text: "No pending events"    },
  cancelled: { icon: "❌", text: "No cancelled events"  },
  deleted:   { icon: "🗑", text: "No deleted events"    },
};

export default function AdminPanel() {
  const auth   = useAdminAuth();
  const ev     = useEvents();
  const toasts = useToasts();

  const [tab,           setTab]           = useState("all");
  const [search,        setSearch]        = useState("");
  const [drawerEvent,   setDrawerEvent]   = useState(null);  // null=closed, {}=add, {...}=edit
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [postTarget,    setPostTarget]    = useState(null);  // event to preview/post
  const [viewTarget,    setViewTarget]    = useState(null);  // event to view

  // ── Filter events ────────────────────────────────────────
  const filtered = useMemo(() => {
    return ev.events.filter(e => {
      const isDeleted = !!e.deleted_at;
      if (tab === "deleted") return isDeleted;
      if (isDeleted) return false;
      if (tab !== "all" && e.status !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.title?.toLowerCase().includes(q) ||
          e.location_city?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ev.events, tab, search]);

  // ── Login gate ───────────────────────────────────────────
  if (!auth.isAuthenticated) {
    return (
      <LoginScreen
        onLogin={auth.login}
        loading={auth.loading}
        error={auth.error}
        lockInfo={auth.lockInfo}
      />
    );
  }

  // ── Actions ──────────────────────────────────────────────
  async function handleSave(payload) {
    if (drawerEvent?.id) {
      await ev.updateEvent(drawerEvent.id, payload);
      toasts.success("Changes saved");
    } else {
      await ev.createEvent({ ...payload, organizer_tg_id: 218915869 });
      toasts.success("Event created");
    }
  }

  async function handleDelete() {
    await ev.softDelete(deleteTarget.id);
    setDeleteTarget(null);
    toasts.success("Event moved to Deleted");
  }

  async function handleRestore() {
    await ev.restoreEvent(restoreTarget.id);
    setRestoreTarget(null);
    toasts.success("Event restored to Pending");
  }

  async function handleStatusChange(event, newStatus) {
    await ev.updateEvent(event.id, { status: newStatus });
    toasts.success(`Status updated to ${newStatus}`);
  }

  // ── Create Post ──────────────────────────────────────────
  async function handleCreatePost() {
    if (!postTarget) return;

    if (!NOTIFIER_URL) {
      toasts.error("VITE_NOTIFIER_URL is not configured");
      setPostTarget(null);
      return;
    }

    try {
      const res = await fetch(`${NOTIFIER_URL}/post/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": NOTIFIER_SECRET,
        },
        body: JSON.stringify({ event_id: String(postTarget.id) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }

      setPostTarget(null);
      toasts.success("Posted to channel ✓");
    } catch (err) {
      toasts.error(`Could not post: ${err.message}`);
    }
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Outfit', sans-serif", color: "#e8e6f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 2px; }
        input, textarea, select { outline: none; }
        select option { background: #1a1a2e; color: #e8e6f0; }
        button { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 28px", background: "rgba(8,8,16,0.92)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          {/* Left: logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #7c3aed, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>🧭</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.02em" }}>NextQuest</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 6, padding: "2px 8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</span>
          </div>

          {/* Center: stats */}
          {!ev.loading && (
            <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#4a4868" }}>
              <span><strong style={{ color: "#e8e6f0" }}>{ev.stats.total}</strong> total</span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
              <span><strong style={{ color: "#10b981" }}>{ev.stats.published}</strong> published</span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
              <span><strong style={{ color: "#f59e0b" }}>{ev.stats.pending}</strong> pending</span>
              {ev.stats.deleted > 0 && <>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                <span><strong style={{ color: "#6b7280" }}>{ev.stats.deleted}</strong> deleted</span>
              </>}
            </div>
          )}

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="/" style={{ fontSize: 12, color: "#4a4868", textDecoration: "none", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "#a09cbc"}
              onMouseLeave={e => e.target.style.color = "#4a4868"}
            >← Site</a>
            <button onClick={auth.logout} style={{ padding: "6px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890", fontSize: 12, transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(239,68,68,0.1)"; e.target.style.color = "#ef4444"; e.target.style.borderColor = "rgba(239,68,68,0.3)"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.color = "#6b6890"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >Log out</button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 28px" }}>
        {/* Action bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setDrawerEvent({})} style={{ padding: "10px 20px", borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 16px rgba(124,58,237,0.35)", flexShrink: 0 }}>
            <span style={{ fontSize: 16 }}>+</span> Add Event
          </button>

          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#4a4868", fontSize: 14, pointerEvents: "none" }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, city…"
              style={{ width: "100%", padding: "10px 14px 10px 38px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e8e6f0", fontFamily: "inherit", fontSize: 13, transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.4)"}
              onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#4a4868", cursor: "pointer", fontSize: 16 }}>×</button>
            )}
          </div>

          <button onClick={ev.loadEvents} disabled={ev.loading} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6890", fontSize: 14, transition: "all 0.15s", flexShrink: 0 }} title="Refresh">↻</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 0 }}>
          {TABS.map(t => {
            const count  = t.key === "all" ? ev.stats.total : t.key === "deleted" ? ev.stats.deleted : ev.stats[t.key] ?? 0;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ background: "none", border: "none", borderBottom: `2px solid ${active ? "#a78bfa" : "transparent"}`, color: active ? "#e8e6f0" : "#4a4868", fontSize: 13, fontWeight: active ? 600 : 400, padding: "8px 14px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6, marginBottom: -1 }}>
                {t.label}
                {count > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)", color: active ? "#a78bfa" : "#4a4868", borderRadius: 999, padding: "1px 6px" }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Event list */}
        <div style={{ background: "#10101c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "visible", position: "relative" }}>
          {ev.loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(255,255,255,0.05)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.06)", width: "50%", marginBottom: 8 }} />
                  <div style={{ height: 11, borderRadius: 6, background: "rgba(255,255,255,0.04)", width: "30%" }} />
                </div>
              </div>
            ))
          ) : ev.error ? (
            <div style={{ padding: 48, textAlign: "center", color: "#ef4444", fontSize: 14 }}>
              ⚠️ {ev.error}
              <button onClick={ev.loadEvents} style={{ display: "block", margin: "12px auto 0", background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center", color: "#4a4868" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{EMPTY_STATES[tab]?.icon}</div>
              <div style={{ fontSize: 14 }}>{EMPTY_STATES[tab]?.text}</div>
              {tab === "all" && (
                <button onClick={() => setDrawerEvent({})} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 10, cursor: "pointer", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", fontSize: 13, fontFamily: "inherit" }}>+ Create your first event</button>
              )}
            </div>
          ) : (
            filtered.map(event => (
              <EventRow
                key={event.id}
                event={event}
                onEdit={setDrawerEvent}
                onDelete={setDeleteTarget}
                onRestore={setRestoreTarget}
                onStatusChange={handleStatusChange}
                onCreatePost={setPostTarget}
                onViewEvent={setViewTarget}
              />
            ))
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: "#2a2a3e", textAlign: "center" }}>
          {filtered.length} event{filtered.length !== 1 ? "s" : ""} shown
        </div>
      </main>

      {/* ── Drawer ── */}
      {drawerEvent !== null && (
        <EventDrawer event={drawerEvent} onSave={handleSave} onClose={() => setDrawerEvent(null)} />
      )}

      {/* ── Modals ── */}
      <DeleteModal     event={deleteTarget}  onConfirm={handleDelete}     onClose={() => setDeleteTarget(null)}  />
      <RestoreModal    event={restoreTarget} onConfirm={handleRestore}    onClose={() => setRestoreTarget(null)} />
      <CreatePostModal event={postTarget}    onConfirm={handleCreatePost} onClose={() => setPostTarget(null)}    />
      <ViewEventModal  event={viewTarget}                                 onClose={() => setViewTarget(null)}    />

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts.toasts} onRemove={toasts.removeToast} />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

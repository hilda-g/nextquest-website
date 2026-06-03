import { useState, useMemo } from "react";
import { useAdminAuth } from "./useAdminAuth.js";
import { useEvents }    from "./useEvents.js";
import { useToasts, ToastContainer } from "./Toast.jsx";
import LoginScreen from "./LoginScreen.jsx";
import EventDrawer from "./EventDrawer.jsx";
import EventRow    from "./EventRow.jsx";
import { DeleteModal, RestoreModal, EndRegistrationModal, ReopenRegistrationModal, CreatePostModal, FBPostModal, WAPostModal, ViewEventModal } from "./Modals.jsx";

// channel_notifier URL + secret come from .env
// Add to your .env:
//   VITE_NOTIFIER_URL=https://notifier.nextquest.today
//   VITE_NOTIFIER_SECRET=changeme
const NOTIFIER_URL    = import.meta.env.VITE_NOTIFIER_URL    || "";
const NOTIFIER_SECRET = import.meta.env.VITE_NOTIFIER_SECRET || "";

const TABS = [
  { key: "all",       label: "All"       },
  { key: "published", label: "Published" },
  { key: "archive",   label: "Archive"   },
  { key: "pending",   label: "Pending"   },
  { key: "cancelled", label: "Cancelled" },
  { key: "deleted",   label: "Deleted"   },
];

const EMPTY_STATES = {
  all:       { icon: "🗓", text: "No events yet"        },
  published: { icon: "✅", text: "No published events"  },
  archive:   { icon: "📦", text: "No archived events"   },
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
  const [endRegTarget,  setEndRegTarget]  = useState(null);  // event to end registration
  const [reopenTarget,  setReopenTarget]  = useState(null);  // event to re-open registration
  const [viewTarget,    setViewTarget]    = useState(null);  // event to view
  const [fbPostTarget,  setFbPostTarget]  = useState(null);  // event for FB post generator
  const [waPostTarget,  setWaPostTarget]  = useState(null);  // event for WA post generator

  // ── Filter events ────────────────────────────────────────
  const filtered = useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    return ev.events.filter(e => {
      const isDeleted = !!e.deleted_at;
      if (tab === "deleted") return isDeleted;
      if (isDeleted) return false;
      const isPast = e.date_start && new Date(e.date_start.slice(0, 16).replace(" ", "T")) < todayMidnight;
      if (tab === "archive"   && !(e.status === "published" && isPast))  return false;
      if (tab === "published" && !(e.status === "published" && !isPast)) return false;
      if (tab !== "all" && tab !== "archive" && tab !== "published" && e.status !== tab) return false;
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

  // ── Tab counts (published split by past/future) ──────────
  const tabCounts = useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    let published = 0, archive = 0;
    ev.events.forEach(e => {
      if (e.deleted_at || e.status !== "published") return;
      const isPast = e.date_start && new Date(e.date_start.slice(0, 16).replace(" ", "T")) < todayMidnight;
      isPast ? archive++ : published++;
    });
    return { published, archive };
  }, [ev.events]);

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

  async function handleSilentPublish(event) {
    try {
      await ev.updateEvent(event.id, { status: "published", notify_channel: false });
      toasts.success("Published silently (no Telegram post)");
    } catch (err) {
      toasts.error(`Silent publish failed: ${err.message}`);
    }
  }

  // ── Duplicate Event ──────────────────────────────────────
  async function handleDuplicate(event) {
    try {
      const copy = {
        title:               `Copy — ${event.title}`,
        description:         event.description         || null,
        description_ru:      event.description_ru      || null,
        description_el:      event.description_el      || null,
        description_uk:      event.description_uk      || null,
        category:            event.category,
        location_city:       event.location_city,
        location_address:    event.location_address,
        date_start:          event.date_start,
        date_end:            event.date_end             || null,
        max_participants:    event.max_participants     || null,
        external_url:        event.external_url         || null,
        cover_image_url:     event.cover_image_url      || null,
        cover_position:      event.cover_position       || { x: 50, y: 50 },
        organizer_username:  event.organizer_username   || null,
        organizer_contacts:  event.organizer_contacts   || null,
        organizer_link:      event.organizer_link       || null,
        format:              event.format               || null,
        is_promo:            event.is_promo             || false,
        event_languages:     event.event_languages      || null,
        is_recurring:        event.is_recurring         || false,
        recurrence_interval: event.recurrence_interval  || null,
        hidden_from_upcoming: false,
        status:              "pending",
        organizer_tg_id:     218915869,
      };
      await ev.createEvent(copy);
      toasts.success("Duplicate created as Pending");
    } catch (err) {
      toasts.error(`Duplicate failed: ${err.message}`);
    }
  }

  // ── Create Next Occurrence ───────────────────────────────
  async function handleNextOccurrence(event) {
    try {
      if (!event.date_start) {
        toasts.error("Event has no start date");
        return;
      }
      const interval = event.recurrence_interval || "weekly";

      // Normalise DB string to "YYYY-MM-DDTHH:MM" (replace space separator)
      // so JS treats it as LOCAL time, not UTC — avoids time and date shift.
      function parseLocal(str) {
        if (!str) return null;
        const n = new Date(str.slice(0, 16).replace(" ", "T"));
        return isNaN(n.getTime()) ? null : n;
      }

      const base = parseLocal(event.date_start);
      if (!base) {
        toasts.error("Could not parse event date");
        return;
      }

      function shiftDate(d, iv) {
        const n = new Date(d);
        if (iv === "weekly")   n.setDate(n.getDate() + 7);
        if (iv === "biweekly") n.setDate(n.getDate() + 14);
        if (iv === "monthly")  n.setMonth(n.getMonth() + 1);
        return n;
      }

      function toLocalISO(d) {
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
      }

      const newStart = shiftDate(base, interval);
      const baseEnd  = parseLocal(event.date_end);
      const newEnd   = baseEnd ? toLocalISO(shiftDate(baseEnd, interval)) : null;

      const copy = {
        title:               event.title,
        description:         event.description         || null,
        description_ru:      event.description_ru      || null,
        description_el:      event.description_el      || null,
        description_uk:      event.description_uk      || null,
        category:            event.category,
        location_city:       event.location_city,
        location_address:    event.location_address,
        date_start:          toLocalISO(newStart),
        date_end:            newEnd,
        max_participants:    event.max_participants     || null,
        external_url:        event.external_url         || null,
        cover_image_url:     event.cover_image_url      || null,
        cover_position:      event.cover_position       || { x: 50, y: 50 },
        organizer_username:  event.organizer_username   || null,
        organizer_contacts:  event.organizer_contacts   || null,
        organizer_link:      event.organizer_link       || null,
        format:              event.format               || null,
        is_promo:            false,
        event_languages:     event.event_languages      || null,
        is_recurring:        true,
        recurrence_interval: interval,
        hidden_from_upcoming: false,
        notify_channel:      false,
        status:              "published",
        organizer_tg_id:     218915869,
      };
      await ev.createEvent(copy);
      toasts.success(`Next occurrence created (+${interval === "weekly" ? "7 days" : interval === "biweekly" ? "14 days" : "1 month"}) — published silently`);
    } catch (err) {
      toasts.error(`Could not create next occurrence: ${err.message}`);
    }
  }

  // ── End Registration ─────────────────────────────────────
  async function handleEndRegistration() {
    if (!endRegTarget) return;
    try {
      await ev.updateEvent(endRegTarget.id, { registration_closed: true });
      setEndRegTarget(null);
      toasts.success("Registration closed — event marked as Full");
    } catch (err) {
      toasts.error(`Could not close registration: ${err.message}`);
    }
  }

  // ── Re-Open Registration ──────────────────────────────────
  async function handleReopenRegistration() {
    if (!reopenTarget) return;
    try {
      await ev.updateEvent(reopenTarget.id, { registration_closed: false });
      setReopenTarget(null);
      toasts.success("Registration re-opened — event marked as Open");
    } catch (err) {
      toasts.error(`Could not re-open registration: ${err.message}`);
    }
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
        body: JSON.stringify({ record: postTarget }),
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

  // ── Create Test Post ─────────────────────────────────────
  async function handleCreateTestPost() {
    if (!postTarget) return;
    if (!NOTIFIER_URL) {
      toasts.error("VITE_NOTIFIER_URL is not configured");
      return;
    }
    try {
      const res = await fetch(`${NOTIFIER_URL}/post/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": NOTIFIER_SECRET,
        },
        body: JSON.stringify({ record: postTarget }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      toasts.success("Posted to TEST channel ✓");
    } catch (err) {
      toasts.error(`Could not post to test: ${err.message}`);
    }
  }

  async function handleDigestPost() {
    if (!NOTIFIER_URL) { toasts.error("VITE_NOTIFIER_URL is not configured"); return; }
    try {
      const res = await fetch(`${NOTIFIER_URL}/digest/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Webhook-Secret": NOTIFIER_SECRET },
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || `HTTP ${res.status}`); }
      toasts.success("Weekly digest posted to channel ✓");
    } catch (err) {
      toasts.error(`Digest post failed: ${err.message}`);
    }
  }

  async function handleDigestTest() {
    if (!NOTIFIER_URL) { toasts.error("VITE_NOTIFIER_URL is not configured"); return; }
    try {
      const res = await fetch(`${NOTIFIER_URL}/digest/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Webhook-Secret": NOTIFIER_SECRET },
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || `HTTP ${res.status}`); }
      toasts.success("Weekly digest posted to TEST channel ✓");
    } catch (err) {
      toasts.error(`Digest test failed: ${err.message}`);
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
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
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

        {/* Weekly Digest box */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "12px 16px", borderRadius: 12, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.18)" }}>
          <div style={{ fontSize: 20 }}>📅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 2 }}>Weekly Digest</div>
            <div style={{ fontSize: 11, color: "#6b6890" }}>Next 7 days · posts in Russian to Telegram channel</div>
          </div>
          <button onClick={handleDigestTest}
            style={{ padding: "7px 14px", borderRadius: 9, cursor: "pointer", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24", fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.18)"; e.currentTarget.style.borderColor = "rgba(251,191,36,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.08)"; e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)"; }}
          >🧪 Test</button>
          <button onClick={handleDigestPost}
            style={{ padding: "7px 14px", borderRadius: 9, cursor: "pointer", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.35)", color: "#a78bfa", fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.22)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.12)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.35)"; }}
          >📢 Post digest</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 0 }}>
          {TABS.map(t => {
            const count  = t.key === "all" ? ev.stats.total : t.key === "deleted" ? ev.stats.deleted : t.key === "published" ? tabCounts.published : t.key === "archive" ? tabCounts.archive : ev.stats[t.key] ?? 0;
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
                onEndRegistration={setEndRegTarget}
                onReopenRegistration={setReopenTarget}
                onDuplicate={handleDuplicate}
                onNextOccurrence={handleNextOccurrence}
                onSilentPublish={handleSilentPublish}
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
      <EndRegistrationModal  event={endRegTarget}  onConfirm={handleEndRegistration}  onClose={() => setEndRegTarget(null)} />
      <ReopenRegistrationModal event={reopenTarget} onConfirm={handleReopenRegistration} onClose={() => setReopenTarget(null)} />
      <CreatePostModal event={postTarget}    onConfirm={handleCreatePost} onTestConfirm={handleCreateTestPost} onFBPost={() => { setFbPostTarget(postTarget); setPostTarget(null); }} onWAPost={() => { setWaPostTarget(postTarget); setPostTarget(null); }} onClose={() => setPostTarget(null)}    />
      <FBPostModal     event={fbPostTarget}  onClose={() => setFbPostTarget(null)} />
      <WAPostModal     event={waPostTarget}  onClose={() => setWaPostTarget(null)} />
      <ViewEventModal  event={viewTarget}                                 onClose={() => setViewTarget(null)}    />

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts.toasts} onRemove={toasts.removeToast} />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

// ─── Supabase helpers ────────────────────────────────────────
async function sbFetch(path, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

async function sbPost(path, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase insert error: ${res.status}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

async function sbPatch(path, id, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}?id=eq.${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase patch error: ${res.status}`);
  return res.json();
}

async function sbDelete(path, id) {
  const url = `${SUPABASE_URL}/rest/v1/${path}?id=eq.${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Supabase delete error: ${res.status}`);
  return true;
}

async function uploadCover(file, userId) {
  const ext = file.name.split(".").pop();
  const filename = `covers/${userId}_${Date.now()}.${ext}`;
  const url = `${SUPABASE_URL}/storage/v1/object/event-covers/${filename}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": file.type,
    },
    body: file,
  });
  if (!res.ok) throw new Error("Upload failed");
  return `${SUPABASE_URL}/storage/v1/object/public/event-covers/${filename}`;
}

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games" },
  { id: "larp", label: "⚔️ LARP" },
  { id: "festival", label: "🎪 Festival" },
  { id: "rpg", label: "🎭 RPG" },
  { id: "cosplay", label: "👗 Cosplay" },
  { id: "other", label: "🃏 Other" },
];

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Other"];

const STATUSES = ["published", "pending", "cancelled"];

function fmt(iso) {
  if (!iso) return "";
  return iso.slice(0, 16).replace("T", " ");
}

// ─── Image Crop / Position Component ─────────────────────────
function ImagePositioner({ src, position, onChange }) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState(null);
  const [pos, setPos] = useState(position || { x: 50, y: 50 });

  useEffect(() => { setPos(position || { x: 50, y: 50 }); }, [position]);

  function onMouseDown(e) {
    e.preventDefault();
    setDragging(true);
    setStart({ mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y });
  }
  function onMouseMove(e) {
    if (!dragging || !start || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - start.mx) / rect.width) * 100;
    const dy = ((e.clientY - start.my) / rect.height) * 100;
    const nx = Math.max(0, Math.min(100, start.px - dx));
    const ny = Math.max(0, Math.min(100, start.py - dy));
    setPos({ x: Math.round(nx), y: Math.round(ny) });
  }
  function onMouseUp() {
    if (dragging) { setDragging(false); onChange(pos); }
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b6890", marginBottom: 8 }}>
        Drag image to reposition · Focus point: {pos.x}% {pos.y}%
      </div>
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          position: "relative", height: 200, borderRadius: 12,
          overflow: "hidden", cursor: dragging ? "grabbing" : "grab",
          border: "2px dashed rgba(167,139,250,0.4)", userSelect: "none",
        }}
      >
        <img
          src={src}
          alt=""
          style={{
            position: "absolute", width: "120%", height: "120%",
            top: `${pos.y - 10}%`, left: `${pos.x - 10}%`,
            transform: "translate(-50%, -50%) scale(1.2)",
            objectFit: "cover", pointerEvents: "none",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(13,13,20,0.6) 0%, transparent 50%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          top: `${pos.y}%`, left: `${pos.x}%`,
          transform: "translate(-50%, -50%)",
          width: 20, height: 20, borderRadius: "50%",
          border: "2px solid #fff",
          background: "rgba(167,139,250,0.6)",
          pointerEvents: "none",
          boxShadow: "0 0 0 4px rgba(167,139,250,0.2)",
        }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {[["Top", 50, 10], ["Center", 50, 50], ["Bottom", 50, 90]].map(([label, x, y]) => (
          <button key={label} onClick={() => { setPos({ x, y }); onChange({ x, y }); }} style={{
            flex: 1, padding: "6px 0", borderRadius: 8,
            background: pos.y === y ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${pos.y === y ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.08)"}`,
            color: pos.y === y ? "#a78bfa" : "#6b6890",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Event Edit / Create Form ────────────────────────────────
function EventEditor({ event, isNew, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: event.title || "",
    description: event.description || "",
    category: event.category || "boardgames",
    location_city: event.location_city || "Nicosia",
    location_address: event.location_address || "",
    date_start: fmt(event.date_start),
    date_end: fmt(event.date_end),
    max_participants: event.max_participants || "",
    external_url: event.external_url || "",
    cover_image_url: event.cover_image_url || "",
    cover_position: event.cover_position || { x: 50, y: 50 },
    status: event.status || "pending",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadCover(file, event.organizer_tg_id || "admin");
      set("cover_image_url", url);
    } catch (err) {
      setError("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        location_city: form.location_city,
        location_address: form.location_address,
        date_start: form.date_start ? new Date(form.date_start).toISOString() : null,
        date_end: form.date_end ? new Date(form.date_end).toISOString() : null,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        external_url: form.external_url || null,
        cover_image_url: form.cover_image_url || null,
        cover_position: form.cover_position,
        status: form.status,
        updated_at: new Date().toISOString(),
      };
      if (isNew) {
        payload.created_at = new Date().toISOString();
        const created = await sbPost("events", payload);
        onSave(created, true);
      } else {
        await sbPatch("events", event.id, payload);
        onSave({ ...event, ...payload }, false);
      }
    } catch (err) {
      setError((isNew ? "Create failed: " : "Save failed: ") + err.message);
    } finally {
      setSaving(false);
    }
  }

  const inp = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "8px 12px",
    color: "#e8e6f0", fontFamily: "inherit",
    fontSize: 14, width: "100%", outline: "none",
  };
  const label = { fontSize: 11, color: "#6b6890", fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Cover image */}
      <div>
        <span style={label}>Cover Image</span>
        {form.cover_image_url ? (
          <ImagePositioner
            src={form.cover_image_url}
            position={form.cover_position}
            onChange={p => set("cover_position", p)}
          />
        ) : (
          <div style={{
            height: 120, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#4a4868", fontSize: 13,
          }}>No image</div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => fileRef.current.click()} disabled={uploading} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
            background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
            color: "#a78bfa", fontSize: 13, fontFamily: "inherit",
          }}>
            {uploading ? "Uploading…" : "Upload new image"}
          </button>
          {form.cover_image_url && (
            <button onClick={() => set("cover_image_url", "")} style={{
              padding: "8px 12px", borderRadius: 8, cursor: "pointer",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444", fontSize: 13, fontFamily: "inherit",
            }}>Remove</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        <div style={{ marginTop: 8 }}>
          <span style={label}>Or paste image URL</span>
          <input style={inp} value={form.cover_image_url} onChange={e => set("cover_image_url", e.target.value)} placeholder="https://..." />
        </div>
      </div>

      {/* Title */}
      <div>
        <span style={label}>Title</span>
        <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} />
      </div>

      {/* Description */}
      <div>
        <span style={label}>Description</span>
        <textarea style={{ ...inp, minHeight: 100, resize: "vertical" }}
          value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      {/* Category + City */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <span style={label}>Category</span>
          <select style={inp} value={form.category} onChange={e => set("category", e.target.value)}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <span style={label}>City</span>
          <select style={inp} value={form.location_city} onChange={e => set("location_city", e.target.value)}>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <span style={label}>Address</span>
        <input style={inp} value={form.location_address} onChange={e => set("location_address", e.target.value)} />
      </div>

      {/* Dates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <span style={label}>Start date & time</span>
          <input style={inp} type="datetime-local" value={form.date_start} onChange={e => set("date_start", e.target.value)} />
        </div>
        <div>
          <span style={label}>End date & time (optional)</span>
          <input style={inp} type="datetime-local" value={form.date_end} onChange={e => set("date_end", e.target.value)} />
        </div>
      </div>

      {/* Limit + URL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <span style={label}>Max participants</span>
          <input style={inp} type="number" value={form.max_participants} onChange={e => set("max_participants", e.target.value)} placeholder="Leave empty = no limit" />
        </div>
        <div>
          <span style={label}>Registration URL</span>
          <input style={inp} value={form.external_url} onChange={e => set("external_url", e.target.value)} placeholder="https://..." />
        </div>
      </div>

      {/* Status */}
      <div>
        <span style={label}>Status</span>
        <select style={inp} value={form.status} onChange={e => set("status", e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button onClick={handleSave} disabled={saving} style={{
          flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
        }}>
          {saving ? (isNew ? "Creating…" : "Saving…") : (isNew ? "Create event" : "Save changes")}
        </button>
        <button onClick={onCancel} style={{
          padding: "10px 20px", borderRadius: 10, cursor: "pointer",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#6b6890", fontSize: 14, fontFamily: "inherit",
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────
function EventRow({ event, onEdit, onDelete }) {
  const statusColor = { published: "#10b981", pending: "#f59e0b", cancelled: "#ef4444" };
  const date = event.date_start ? event.date_start.slice(0, 10) : "—";
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(`Delete "${event.title}"?\n\nThis cannot be undone.`);
    if (!ok) return;
    setDeleting(true);
    try {
      await onDelete(event);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 10, overflow: "hidden",
        background: "#1a1a2e", flexShrink: 0,
      }}>
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: event.cover_position
              ? `${event.cover_position.x}% ${event.cover_position.y}%`
              : "50% 50%",
          }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🖼</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e6f0", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {event.title}
        </div>
        <div style={{ fontSize: 12, color: "#6b6890" }}>
          {date} · {event.location_city} · {CATEGORIES.find(c => c.id === event.category)?.label || event.category}
        </div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
        background: `${statusColor[event.status] || "#6b7280"}22`,
        color: statusColor[event.status] || "#6b7280",
        border: `1px solid ${statusColor[event.status] || "#6b7280"}44`,
        flexShrink: 0,
      }}>{event.status}</div>
      <button onClick={() => onEdit(event)} style={{
        padding: "6px 14px", borderRadius: 8, cursor: "pointer",
        background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
        color: "#a78bfa", fontSize: 12, fontFamily: "inherit", flexShrink: 0,
      }}>Edit</button>
      <button onClick={handleDelete} disabled={deleting} title="Delete event" style={{
        padding: "6px 10px", borderRadius: 8, cursor: deleting ? "wait" : "pointer",
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
        color: "#ef4444", fontSize: 12, fontFamily: "inherit", flexShrink: 0,
        opacity: deleting ? 0.6 : 1,
      }}>{deleting ? "…" : "🗑"}</button>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function attempt() {
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 1500); }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d14",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        width: 360, background: "#16162a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 40,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #7c3aed, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>🧭</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>NextQuest Admin</div>
          <div style={{ color: "#6b6890", fontSize: 13, marginTop: 4 }}>Enter password to continue</div>
        </div>
        <input
          type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && attempt()}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            background: err ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${err ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: "#e8e6f0", fontFamily: "inherit", fontSize: 14,
            outline: "none", marginBottom: 12,
            transition: "border-color 0.2s, background 0.2s",
          }}
        />
        <button onClick={attempt} style={{
          width: "100%", padding: "10px 0", borderRadius: 10, cursor: "pointer",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
        }}>Enter</button>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // existing event object
  const [creating, setCreating] = useState(false); // boolean
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    sbFetch("events", { select: "*", order: "date_start.desc" })
      .then(rows => { setEvents(rows); setLoading(false); })
      .catch(() => setLoading(false));
  }, [authed]);

  function flash(msg, color = "#10b981") {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  }

  function handleSaved(updated, wasNew) {
    if (wasNew) {
      setEvents(evs => [updated, ...evs]);
      flash("✓ Event created");
    } else {
      setEvents(evs => evs.map(e => e.id === updated.id ? updated : e));
      flash("✓ Saved");
    }
    setEditing(null);
    setCreating(false);
  }

  async function handleDelete(event) {
    try {
      await sbDelete("events", event.id);
      setEvents(evs => evs.filter(e => e.id !== event.id));
      flash("Event deleted", "#ef4444");
    } catch (err) {
      flash("Delete failed: " + err.message, "#ef4444");
    }
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const filtered = events.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search && !e.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inEditor = editing || creating;
  const editorEvent = editing || { cover_position: { x: 50, y: 50 } };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d14", fontFamily: "'Outfit', sans-serif", color: "#e8e6f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #3d3a5c; border-radius: 2px; }
        textarea, input, select { outline: none; }
        select option { background: #1a1a2e; color: #e8e6f0; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧭</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>NextQuest</span>
            <span style={{ fontSize: 12, color: "#4a4868", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999 }}>Admin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {toast && (
              <span style={{ fontSize: 13, color: toast.color }}>{toast.msg}</span>
            )}
            <a href="/" style={{ fontSize: 13, color: "#6b6890", textDecoration: "none" }}>← Back to site</a>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {inEditor ? (
          /* ── Edit / Create view ── */
          <div>
            <button onClick={() => { setEditing(null); setCreating(false); }} style={{
              background: "none", border: "none", color: "#6b6890",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              marginBottom: 20, display: "flex", alignItems: "center", gap: 6,
            }}>← Back to events</button>

            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 24 }}>
              {creating ? "New event" : `Editing: ${editing.title}`}
            </h2>

            <div style={{ background: "#16162a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28 }}>
              <EventEditor
                event={editorEvent}
                isNew={creating}
                onSave={handleSaved}
                onCancel={() => { setEditing(null); setCreating(false); }}
              />
            </div>
          </div>
        ) : (
          /* ── List view ── */
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: "#fff" }}>
                Events <span style={{ color: "#4a4868", fontSize: 16, fontFamily: "inherit" }}>{events.length}</span>
              </h1>
              <button onClick={() => setCreating(true)} style={{
                padding: "10px 18px", borderRadius: 10, cursor: "pointer",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                border: "none", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              }}>+ New event</button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4a4868" }}>🔍</span>
                <input
                  placeholder="Search events…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px 8px 36px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, color: "#e8e6f0", fontFamily: "inherit", fontSize: 13,
                  }}
                />
              </div>
              {["all", "published", "pending", "cancelled"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                  background: statusFilter === s ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${statusFilter === s ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: statusFilter === s ? "#a78bfa" : "#6b6890",
                  fontSize: 13, fontFamily: "inherit", textTransform: "capitalize",
                }}>{s}</button>
              ))}
            </div>

            {/* List */}
            <div style={{ background: "#16162a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "#4a4868" }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#4a4868" }}>No events found</div>
              ) : (
                filtered.map(ev => (
                  <EventRow
                    key={ev.id}
                    event={ev}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

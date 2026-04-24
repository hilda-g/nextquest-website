import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games" },
  { id: "larp",       label: "⚔️ LARP"        },
  { id: "festival",   label: "🎪 Festival"     },
  { id: "rpg",        label: "🎭 RPG"          },
  { id: "cosplay",    label: "👗 Cosplay"      },
  { id: "other",      label: "🃏 Other"        },
];

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Other"];

const EMPTY_FORM = {
  title:            "",
  description:      "",
  category:         "boardgames",
  location_city:    "Nicosia",
  location_address: "",
  date_start:       "",
  date_end:         "",
  max_participants: "",
  external_url:     "",
  cover_image_url:  "",
  cover_position:   { x: 50, y: 50 },
  status:           "pending",
};

function fmt(iso) {
  if (!iso) return "";
  return iso.slice(0, 16).replace("T", " ").replace(" ", "T");
}

// ─── Validation ───────────────────────────────────────────────
function validate(form) {
  const errs = {};
  if (!form.title?.trim())                        errs.title       = "Required";
  else if (form.title.trim().length < 3)          errs.title       = "At least 3 characters";
  else if (form.title.trim().length > 100)        errs.title       = "Max 100 characters";
  if (!form.description?.trim())                  errs.description = "Required";
  else if (form.description.trim().length < 20)   errs.description = "At least 20 characters";
  else if (form.description.trim().length > 1000) errs.description = "Max 1000 characters";
  if (!form.location_address?.trim())             errs.address     = "Required";
  if (!form.date_start)                           errs.date_start  = "Required";
  if (form.date_end && form.date_start && new Date(form.date_end) <= new Date(form.date_start))
    errs.date_end = "Must be after start date";
  if (form.external_url && !/^https?:\/\/.+/.test(form.external_url))
    errs.external_url = "Must be a valid URL (https://...)";
  return errs;
}

// ─── Input style helper ───────────────────────────────────────
function inputStyle(error) {
  return {
    width: "100%",
    padding: "10px 14px",
    background: error ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${error ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, color: "#e8e6f0",
    fontFamily: "'Outfit', sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };
}

// ─── Image Repositioner ───────────────────────────────────────
function ImagePositioner({ src, position, onChange }) {
  const ref      = useRef(null);
  const [pos, setPos] = useState(position || { x: 50, y: 50 });
  const dragging = useRef(false);
  const start    = useRef(null);

  useEffect(() => setPos(position || { x: 50, y: 50 }), [position]);

  function onDown(e) {
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = ((e.clientX - start.current.mx) / rect.width)  * 100;
    const dy = ((e.clientY - start.current.my) / rect.height) * 100;
    const nx = Math.max(0, Math.min(100, start.current.px - dx));
    const ny = Math.max(0, Math.min(100, start.current.py - dy));
    const p  = { x: Math.round(nx), y: Math.round(ny) };
    setPos(p);
  }

  function onUp() {
    if (dragging.current) { dragging.current = false; onChange(pos); }
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b6890", marginBottom: 6 }}>
        Drag to reposition · Focus: {pos.x}% {pos.y}%
      </div>
      <div
        ref={ref}
        onMouseDown={onDown} onMouseMove={onMove}
        onMouseUp={onUp} onMouseLeave={onUp}
        style={{
          position: "relative", height: 180, borderRadius: 12,
          overflow: "hidden", cursor: "grab",
          border: "2px dashed rgba(167,139,250,0.35)", userSelect: "none",
        }}
      >
        <img src={src} alt="" style={{
          position: "absolute", width: "130%", height: "130%",
          left: "50%", top: "50%",
          transform: `translate(calc(-50% + ${(pos.x - 50) * 0.3}px), calc(-50% + ${(pos.y - 50) * 0.3}px))`,
          objectFit: "cover", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(13,13,20,0.55) 0%, transparent 50%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          top: `${pos.y}%`, left: `${pos.x}%`,
          transform: "translate(-50%, -50%)",
          width: 16, height: 16, borderRadius: "50%",
          border: "2px solid #fff",
          background: "rgba(167,139,250,0.6)",
          pointerEvents: "none",
          boxShadow: "0 0 0 4px rgba(167,139,250,0.2)",
        }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {[["Top", 50, 10], ["Center", 50, 50], ["Bottom", 50, 90]].map(([label, x, y]) => (
          <button key={label} onClick={() => { const p = { x, y }; setPos(p); onChange(p); }} style={{
            flex: 1, padding: "5px 0", borderRadius: 8,
            background: pos.y === y ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${pos.y === y ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: pos.y === y ? "#a78bfa" : "#6b6890",
            fontSize: 11, cursor: "pointer", fontFamily: "inherit",
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────
export default function EventDrawer({ event, onSave, onClose }) {
  const isEdit = !!event?.id;

  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
  const [visible, setVisible]   = useState(false);
  const initialForm = useRef(null);

  useEffect(() => {
    const initial = event?.id
      ? {
          title:            event.title            || "",
          description:      event.description      || "",
          category:         event.category         || "boardgames",
          location_city:    event.location_city    || "Nicosia",
          location_address: event.location_address || "",
          date_start:       fmt(event.date_start),
          date_end:         fmt(event.date_end),
          max_participants: event.max_participants  || "",
          external_url:     event.external_url      || "",
          cover_image_url:  event.cover_image_url   || "",
          cover_position:   event.cover_position    || { x: 50, y: 50 },
          status:           event.status            || "pending",
        }
      : { ...EMPTY_FORM };
    setForm(initial);
    initialForm.current = JSON.stringify(initial);
    setMultiDay(!!event?.date_end);
    setErrors({});
    setDirty(false);
    requestAnimationFrame(() => setVisible(true));
  }, [event]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setDirty(true);
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  function handleClose() {
    if (dirty) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    setVisible(false);
    setTimeout(onClose, 250);
  }

  async function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title:            form.title.trim(),
        description:      form.description.trim(),
        category:         form.category,
        location_city:    form.location_city,
        location_address: form.location_address.trim(),
        date_start:       form.date_start ? new Date(form.date_start).toISOString() : null,
        date_end:         multiDay && form.date_end ? new Date(form.date_end).toISOString() : null,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        external_url:     form.external_url.trim() || null,
        // BUG 2 FIX: use null (allowed by some schemas) or empty string fallback
        // to avoid violating not-null constraint when no image is provided.
        // We pass the value as-is; if empty string is also not allowed, coerce to null
        // only when editing (new events without a cover are blocked by validation below).
        cover_image_url:  form.cover_image_url.trim() || null,
        cover_position:   form.cover_position,
        status:           form.status,
      };

      // BUG 2 FIX: block save if cover_image_url is empty (DB has NOT NULL constraint)
      if (!payload.cover_image_url) {
        setErrors(e => ({ ...e, cover_url: "Cover image URL is required" }));
        setSaving(false);
        return;
      }

      await onSave(payload);
      setVisible(false);
      setTimeout(onClose, 250);
    } catch (err) {
      setErrors(e => ({ ...e, _global: err.message }));
    } finally {
      setSaving(false);
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") handleClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const label = {
    fontSize: 11, color: "#6b6890", fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.08em",
    marginBottom: 6, display: "block",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(8,8,16,0.7)", backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0, transition: "opacity 0.25s",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201,
        width: "min(520px, 100vw)",
        background: "#13131f",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "-24px 0 80px rgba(0,0,0,0.5)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e8e6f0" }}>
              {isEdit ? "Edit Event" : "New Event"}
            </div>
            {dirty && (
              <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>Unsaved changes</div>
            )}
          </div>
          <button onClick={handleClose} style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#6b6890", cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 22 }}>

          {errors._global && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>
              ✗ {errors._global}
            </div>
          )}

          {/* ── Cover image ── */}
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
                height: 140, borderRadius: 12,
                border: "2px dashed rgba(255,255,255,0.08)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                color: "#4a4868", fontSize: 13, gap: 6,
              }}>
                <span style={{ fontSize: 28 }}>🖼</span>
                No cover image yet
              </div>
            )}

            {/* BUG 1 FIX: removed file upload button + hidden file input entirely */}
            {form.cover_image_url && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => set("cover_image_url", "")} style={{
                  padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444", fontSize: 12, fontFamily: "inherit",
                }}>Remove image</button>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <span style={{ ...label, marginBottom: 6 }}>Image URL</span>
              <input
                style={inputStyle(errors.cover_url)}
                value={form.cover_image_url}
                onChange={e => set("cover_image_url", e.target.value)}
                placeholder="Paste image URL (https://...)"
                onFocus={ev => ev.target.style.borderColor = "rgba(167,139,250,0.5)"}
                onBlur={ev  => ev.target.style.borderColor = errors.cover_url ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}
              />
              {errors.cover_url && (
                <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>{errors.cover_url}</div>
              )}
            </div>
          </div>

          {/* ── Title ── */}
          <div>
            <span style={label}>Title *</span>
            <input
              style={inputStyle(errors.title)}
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Event title"
              onFocus={ev => ev.target.style.borderColor = "rgba(167,139,250,0.5)"}
              onBlur={ev  => ev.target.style.borderColor = errors.title ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}
            />
            {errors.title && <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>{errors.title}</div>}
          </div>

          {/* ── Description ── */}
          <div>
            <span style={label}>Description *</span>
            <textarea
              style={{ ...inputStyle(errors.description), minHeight: 110, resize: "vertical" }}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="What's this event about?"
              onFocus={ev => ev.target.style.borderColor = "rgba(167,139,250,0.5)"}
              onBlur={ev  => ev.target.style.borderColor = errors.description ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}
            />
            <div style={{ fontSize: 11, color: errors.description ? "#fca5a5" : "#4a4868", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
              <span>{errors.description || ""}</span>
              <span>{form.description.length}/1000</span>
            </div>
          </div>

          {/* ── Category + City ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={label}>Category</span>
              <select style={inputStyle()} value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>City</span>
              <select style={inputStyle()} value={form.location_city} onChange={e => set("location_city", e.target.value)}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* ── Address ── */}
          <div>
            <span style={label}>Address *</span>
            <input
              style={inputStyle(errors.address)}
              value={form.location_address}
              onChange={e => set("location_address", e.target.value)}
              placeholder="Venue address"
              onFocus={ev => ev.target.style.borderColor = "rgba(167,139,250,0.5)"}
              onBlur={ev  => ev.target.style.borderColor = errors.address ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}
            />
            {errors.address && <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>{errors.address}</div>}
          </div>

          {/* ── Dates ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={label}>Date & Time *</span>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#6b6890" }}>
                <input type="checkbox" checked={multiDay} onChange={e => setMultiDay(e.target.checked)}
                  style={{ accentColor: "#a78bfa" }} />
                Multi-day
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: multiDay ? "1fr 1fr" : "1fr", gap: 12 }}>
              <div>
                <span style={{ ...label, marginBottom: 4 }}>{multiDay ? "Start" : "Date"}</span>
                <input type="datetime-local" style={inputStyle(errors.date_start)}
                  value={form.date_start} onChange={e => set("date_start", e.target.value)}
                  onFocus={ev => ev.target.style.borderColor = "rgba(167,139,250,0.5)"}
                  onBlur={ev  => ev.target.style.borderColor = errors.date_start ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}
                />
                {errors.date_start && <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>{errors.date_start}</div>}
              </div>
              {multiDay && (
                <div>
                  <span style={{ ...label, marginBottom: 4 }}>End</span>
                  <input type="datetime-local" style={inputStyle(errors.date_end)}
                    value={form.date_end} onChange={e => set("date_end", e.target.value)}
                    onFocus={ev => ev.target.style.borderColor = "rgba(167,139,250,0.5)"}
                    onBlur={ev  => ev.target.style.borderColor = errors.date_end ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}
                  />
                  {errors.date_end && <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>{errors.date_end}</div>}
                </div>
              )}
            </div>
          </div>

          {/* ── Max participants ── */}
          <div>
            <span style={label}>Max Participants</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["", "10", "20", "30", "50", "100"].map(v => (
                <button key={v} onClick={() => set("max_participants", v)} style={{
                  padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                  background: form.max_participants === v ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${form.max_participants === v ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: form.max_participants === v ? "#a78bfa" : "#6b6890",
                  fontSize: 12, fontFamily: "inherit",
                }}>{v === "" ? "No limit" : v}</button>
              ))}
              <input
                style={{ ...inputStyle(), width: 90, padding: "7px 10px" }}
                value={["", "10", "20", "30", "50", "100"].includes(String(form.max_participants)) ? "" : form.max_participants}
                onChange={e => set("max_participants", e.target.value)}
                placeholder="Custom"
                type="number" min="1"
              />
            </div>
          </div>

          {/* ── External URL ── */}
          <div>
            <span style={label}>Registration URL</span>
            <input
              style={inputStyle(errors.external_url)}
              value={form.external_url}
              onChange={e => set("external_url", e.target.value)}
              placeholder="https://... (optional)"
              onFocus={ev => ev.target.style.borderColor = "rgba(167,139,250,0.5)"}
              onBlur={ev  => ev.target.style.borderColor = errors.external_url ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}
            />
            {errors.external_url && <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>{errors.external_url}</div>}
          </div>

          {/* ── Status (edit only) ── */}
          {isEdit && (
            <div>
              <span style={label}>Status</span>
              <div style={{ display: "flex", gap: 8 }}>
                {["pending", "published", "cancelled"].map(s => {
                  const colors = {
                    pending:   ["#f59e0b", "rgba(245,158,11,0.15)", "rgba(245,158,11,0.35)"],
                    published: ["#10b981", "rgba(16,185,129,0.15)", "rgba(16,185,129,0.35)"],
                    cancelled: ["#ef4444", "rgba(239,68,68,0.15)", "rgba(239,68,68,0.35)"],
                  };
                  const [c, bg, border] = colors[s];
                  const active = form.status === s;
                  return (
                    <button key={s} onClick={() => set("status", s)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 9, cursor: "pointer",
                      background: active ? bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? border : "rgba(255,255,255,0.08)"}`,
                      color: active ? c : "#4a4868",
                      fontSize: 12, fontFamily: "inherit", textTransform: "capitalize",
                    }}>{s}</button>
                  );
                })}
              </div>
            </div>
          )}

        </div>{/* end scrollable body */}

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 10, flexShrink: 0,
          background: "#13131f",
        }}>
          <button onClick={handleClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, cursor: "pointer",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#6b6890", fontSize: 14, fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: "11px 0", borderRadius: 10, cursor: saving ? "default" : "pointer",
            background: saving ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
            border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
            fontFamily: "inherit", opacity: saving ? 0.7 : 1,
            boxShadow: saving ? "none" : "0 4px 16px rgba(124,58,237,0.35)",
          }}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
          </button>
        </div>

      </div>
    </>
  );
}

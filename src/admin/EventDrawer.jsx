import { useState, useEffect, useRef, useCallback } from "react";

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games" },
  { id: "larp",       label: "⚔️ LARP" },
  { id: "festival",   label: "🎪 Festival" },
  { id: "rpg",        label: "🎭 RPG" },
  { id: "cosplay",    label: "👗 Cosplay" },
  { id: "other",      label: "🃏 Other" },
];

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Other"];

const EMPTY_FORM = {
  title: "", description: "", category: "boardgames",
  location_city: "Nicosia", location_address: "",
  date_start: "", date_end: "",
  max_participants: "", external_url: "",
  cover_image_url: "", cover_position: { x: 50, y: 50 },
  status: "pending",
};

function fmt(iso) {
  if (!iso) return "";
  return iso.slice(0, 16).replace("T", " ").replace(" ", "T");
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
          transition: dragging.current ? "none" : "transform 0.1s",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(8,8,16,0.5) 0%, transparent 50%)",
        }} />
        <div style={{
          position: "absolute", top: `${pos.y}%`, left: `${pos.x}%`,
          transform: "translate(-50%,-50%)",
          width: 18, height: 18, borderRadius: "50%",
          border: "2px solid #fff",
          background: "rgba(167,139,250,0.7)",
          boxShadow: "0 0 0 4px rgba(167,139,250,0.25)",
          pointerEvents: "none",
        }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {[["Top", 50, 15], ["Center", 50, 50], ["Bottom", 50, 85]].map(([l, x, y]) => (
          <button key={l} onClick={() => { setPos({ x, y }); onChange({ x, y }); }} style={{
            flex: 1, padding: "5px 0", borderRadius: 8, cursor: "pointer",
            background: Math.abs(pos.y - y) < 10 ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${Math.abs(pos.y - y) < 10 ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: Math.abs(pos.y - y) < 10 ? "#a78bfa" : "#6b6890",
            fontSize: 11, fontFamily: "inherit",
          }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Field wrappers ───────────────────────────────────────────
function Field({ label, error, children, hint }) {
  return (
    <div>
      <div style={{
        fontSize: 11, color: error ? "#fca5a5" : "#6b6890",
        fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", marginBottom: 6,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{label}</span>
        {hint && <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, textTransform: "none" }}>{hint}</span>}
      </div>
      {children}
      {error && <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function inp(error) {
  return {
    width: "100%", padding: "10px 14px",
    background: error ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${error ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, color: "#e8e6f0",
    fontFamily: "'Outfit', sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };
}

// ─── Validation ───────────────────────────────────────────────
function validate(form, isEdit) {
  const errs = {};
  if (!form.title?.trim())                       errs.title       = "Required";
  else if (form.title.trim().length < 3)         errs.title       = "At least 3 characters";
  else if (form.title.trim().length > 100)       errs.title       = "Max 100 characters";
  if (!form.description?.trim())                 errs.description = "Required";
  else if (form.description.trim().length < 20)  errs.description = "At least 20 characters";
  else if (form.description.trim().length > 1000)errs.description = "Max 1000 characters";
  if (!form.location_address?.trim())            errs.address     = "Required";
  if (!form.date_start)                          errs.date_start  = "Required";
  if (form.date_end && form.date_start && new Date(form.date_end) <= new Date(form.date_start))
    errs.date_end = "Must be after start date";
  if (form.external_url && !/^https?:\/\/.+/.test(form.external_url))
    errs.external_url = "Must be a valid URL (https://...)";
  return errs;
}

// ─── Main Drawer ──────────────────────────────────────────────
export default function EventDrawer({ event, onSave, onClose, uploadCover }) {
  const isEdit = !!event?.id;

  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [dirty, setDirty]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [multiDay, setMultiDay] = useState(false);
  const [visible, setVisible]   = useState(false);
  const fileRef  = useRef(null);
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
    setMultiDay(!!(event?.date_end && event?.date_end !== event?.date_start));
    setDirty(false);
    setErrors({});
    // Animate in
    requestAnimationFrame(() => setVisible(true));
  }, [event]);

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") handleClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form]);

  function set(field, value) {
    setForm(f => {
      const next = { ...f, [field]: value };
      setDirty(JSON.stringify(next) !== initialForm.current);
      return next;
    });
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function handleClose() {
    if (dirty) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    setVisible(false);
    setTimeout(onClose, 300);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(err => ({ ...err, cover: "Image must be under 5MB" }));
      return;
    }
    setUploading(true);
    setUploadPct(0);
    const fakeProgress = setInterval(() => setUploadPct(p => Math.min(p + 15, 85)), 200);
    try {
      const url = await uploadCover(file, event?.id || "new");
      clearInterval(fakeProgress);
      setUploadPct(100);
      setTimeout(() => { setUploadPct(0); setUploading(false); }, 500);
      set("cover_image_url", url);
    } catch (err) {
      clearInterval(fakeProgress);
      setErrors(e => ({ ...e, cover: "Upload failed: " + err.message }));
      setUploading(false);
    }
  }

  async function handleSave() {
    const errs = validate(form, isEdit);
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
        date_end:         (multiDay && form.date_end) ? new Date(form.date_end).toISOString() : null,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        external_url:     form.external_url || null,
        cover_image_url:  form.cover_image_url || null,
        cover_position:   form.cover_position,
        status:           isEdit ? form.status : "pending",
        timezone:         "Asia/Nicosia",
      };
      await onSave(payload);
      setVisible(false);
      setTimeout(onClose, 300);
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  }

  const titleLen = form.title?.length || 0;
  const descLen  = form.description?.length || 0;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          zIndex: 200, backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0, transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(520px, 100vw)",
        background: "#13131f",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 201, display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.34,1.2,0.64,1)",
        boxShadow: "-24px 0 80px rgba(0,0,0,0.5)",
        fontFamily: "'Outfit', sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 28px", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 18, color: "#fff",
            }}>
              {isEdit ? "Edit Event" : "Add Event"}
            </span>
            {dirty && (
              <span title="Unsaved changes" style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#f59e0b", flexShrink: 0,
                boxShadow: "0 0 6px rgba(245,158,11,0.5)",
              }} />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#4a4868" }}>Esc to close · ⌘S to save</span>
            <button onClick={handleClose} style={{
              width: 32, height: 32, borderRadius: 8, cursor: "pointer",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#6b6890", fontSize: 18, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "24px 28px",
          display: "flex", flexDirection: "column", gap: 24,
        }}>

          {/* Cover */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: 16,
          }}>
            <div style={{ fontSize: 11, color: "#6b6890", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Cover Image</div>

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

            {/* Upload progress */}
            {uploading && (
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                    width: `${uploadPct}%`, transition: "width 0.3s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#6b6890", marginTop: 4 }}>Uploading… {uploadPct}%</div>
              </div>
            )}

            {errors.cover && (
              <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 6 }}>{errors.cover}</div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
                flex: 1, padding: "8px 0", borderRadius: 9, cursor: "pointer",
                background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
                color: "#a78bfa", fontSize: 12, fontFamily: "inherit",
              }}>
                {uploading ? "Uploading…" : "📁 Upload image"}
              </button>
              {form.cover_image_url && (
                <button onClick={() => set("cover_image_url", "")} style={{
                  padding: "8px 12px", borderRadius: 9, cursor: "pointer",
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444", fontSize: 12, fontFamily: "inherit",
                }}>Remove</button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

            <div style={{ marginTop: 10 }}>
              <input
                style={{ ...inp(false), fontSize: 12 }}
                value={form.cover_image_url}
                onChange={e => set("cover_image_url", e.target.value)}
                placeholder="Or paste image URL (https://...)"
              />
            </div>
          </div>

          {/* Basic Info */}
          <Field label="Title" error={errors.title} hint={`${titleLen}/100`}>
            <input
              style={inp(errors.title)}
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Event title"
              maxLength={100}
            />
          </Field>

          <Field label="Description" error={errors.description} hint={`${descLen}/1000`}>
            <textarea
              style={{ ...inp(errors.description), minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Describe the event…"
              maxLength={1000}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Category">
              <select style={inp(false)} value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            {isEdit && (
              <Field label="Status">
                <select style={inp(false)} value={form.status} onChange={e => set("status", e.target.value)}>
                  <option value="published">✅ Published</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </Field>
            )}
          </div>

          {/* Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="City">
              <select style={inp(false)} value={form.location_city} onChange={e => set("location_city", e.target.value)}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Address" error={errors.address}>
              <input
                style={inp(errors.address)}
                value={form.location_address}
                onChange={e => set("location_address", e.target.value)}
                placeholder="Street, venue name…"
              />
            </Field>
          </div>

          {/* Dates */}
          <Field label="Start date & time" error={errors.date_start}
            hint="Cyprus time (UTC+2/+3)">
            <input
              type="datetime-local" style={inp(errors.date_start)}
              value={form.date_start}
              onChange={e => set("date_start", e.target.value)}
            />
          </Field>

          {/* Multi-day toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setMultiDay(m => !m)}
              style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                background: multiDay ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.1)",
                border: "none", position: "relative",
                transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3,
                left: multiDay ? 23 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }} />
            </button>
            <span style={{ fontSize: 13, color: "#a09cbc" }}>Multi-day event</span>
          </div>

          {multiDay && (
            <Field label="End date & time" error={errors.date_end}>
              <input
                type="datetime-local" style={inp(errors.date_end)}
                value={form.date_end}
                onChange={e => set("date_end", e.target.value)}
              />
            </Field>
          )}

          {/* Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Max participants" hint="optional">
              <input
                type="number" min="1" style={inp(false)}
                value={form.max_participants}
                onChange={e => set("max_participants", e.target.value)}
                placeholder="No limit"
              />
            </Field>
            <Field label="Registration URL" error={errors.external_url} hint="optional">
              <input
                style={inp(errors.external_url)}
                value={form.external_url}
                onChange={e => set("external_url", e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>

          {/* No cover warning */}
          {!form.cover_image_url && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              fontSize: 12, color: "#fcd34d",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠️ No cover image — events with covers get more attention
            </div>
          )}

          {/* Global error */}
          {errors._global && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              fontSize: 12, color: "#fca5a5",
            }}>✗ {errors._global}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 10, flexShrink: 0,
          background: "rgba(8,8,16,0.5)",
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12, cursor: saving ? "wait" : "pointer",
              background: saving ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
              border: "none", color: "#fff",
              fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "opacity 0.2s",
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Saving…
              </>
            ) : (isEdit ? "Save Changes" : "Create Event")}
          </button>
          <button onClick={handleClose} style={{
            padding: "12px 20px", borderRadius: 12, cursor: "pointer",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#6b6890", fontSize: 14, fontFamily: "inherit",
          }}>Cancel</button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

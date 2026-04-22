import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

async function sbRequest(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DB error ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

export function useEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await sbRequest("events?select=*&order=date_start.desc");
      setEvents(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const updateEvent = useCallback(async (id, payload) => {
    const updated = await sbRequest(
      `events?id=eq.${id}`,
      { method: "PATCH", body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }) }
    );
    setEvents(evs => evs.map(e => e.id === id ? { ...e, ...updated[0] } : e));
    return updated[0];
  }, []);

  const createEvent = useCallback(async (payload) => {
    const created = await sbRequest(
      "events",
      { method: "POST", body: JSON.stringify(payload) }
    );
    setEvents(evs => [created[0], ...evs]);
    return created[0];
  }, []);

  const softDelete = useCallback(async (id) => {
    await updateEvent(id, { deleted_at: new Date().toISOString(), status: "cancelled" });
  }, [updateEvent]);

  const restoreEvent = useCallback(async (id) => {
    await updateEvent(id, { deleted_at: null, status: "pending" });
  }, [updateEvent]);

  const uploadCover = useCallback(async (file, eventId) => {
    const ext      = file.name.split(".").pop();
    const filename = `covers/${eventId}_${Date.now()}.${ext}`;
    const url      = `${SUPABASE_URL}/storage/v1/object/event-covers/${filename}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": file.type,
      },
      body: file,
    });
    if (!res.ok) throw new Error("Image upload failed");
    return `${SUPABASE_URL}/storage/v1/object/public/event-covers/${filename}`;
  }, []);

  // Derived stats
  const stats = {
    total:     events.filter(e => !e.deleted_at).length,
    published: events.filter(e => e.status === "published" && !e.deleted_at).length,
    pending:   events.filter(e => e.status === "pending"   && !e.deleted_at).length,
    cancelled: events.filter(e => e.status === "cancelled" && !e.deleted_at).length,
    deleted:   events.filter(e =>  e.deleted_at).length,
  };

  return {
    events,
    loading,
    error,
    stats,
    loadEvents,
    updateEvent,
    createEvent,
    softDelete,
    restoreEvent,
    uploadCover,
  };
}

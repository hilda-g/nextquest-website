import { useState, useCallback, useEffect, useRef } from "react";

let toastId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    if (type !== "error") {
      setTimeout(() => removeToast(id), 3000);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const error   = useCallback((msg) => addToast(msg, "error"),   [addToast]);

  return { toasts, success, error, removeToast };
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      display: "flex", flexDirection: "column", gap: 8,
      zIndex: 9999, pointerEvents: "none",
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const isError   = toast.type === "error";
  const isSuccess = toast.type === "success";

  return (
    <div
      ref={ref}
      onClick={() => onRemove(toast.id)}
      style={{
        pointerEvents: "all",
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px",
        background: isError
          ? "rgba(239,68,68,0.15)"
          : "rgba(16,185,129,0.12)",
        border: `1px solid ${isError ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.3)"}`,
        borderRadius: 12,
        backdropFilter: "blur(16px)",
        color: isError ? "#fca5a5" : "#6ee7b7",
        fontSize: 13, fontWeight: 500,
        fontFamily: "'Outfit', sans-serif",
        cursor: "pointer",
        minWidth: 240, maxWidth: 360,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>
        {isError ? "✗" : "✓"}
      </span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <span style={{ fontSize: 16, opacity: 0.5, flexShrink: 0 }}>×</span>
    </div>
  );
}

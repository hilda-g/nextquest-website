import { useState, useEffect, useCallback } from "react";

const AUTH_URL = import.meta.env.VITE_ADMIN_AUTH_URL || "";
const SESSION_KEY = "nq_admin_token";

export function useAdminAuth() {
  const [token, setToken]       = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [lockInfo, setLockInfo] = useState(null); // { secondsLeft }

  // Verify token on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", token: stored }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.valid) {
          sessionStorage.removeItem(SESSION_KEY);
          setToken(null);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setToken(null);
      });
  }, []);

  const login = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    setLockInfo(null);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      const data = await res.json();
      if (res.status === 429) {
        const match = data.error?.match(/(\d+) minutes/);
        setLockInfo({ minutesLeft: match ? parseInt(match[1]) : 15 });
        setError(data.error);
        return false;
      }
      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return false;
      }
      sessionStorage.setItem(SESSION_KEY, data.token);
      setToken(data.token);
      return true;
    } catch {
      setError("Connection error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
  }, []);

  return {
    isAuthenticated: !!token,
    token,
    loading,
    error,
    lockInfo,
    login,
    logout,
  };
}

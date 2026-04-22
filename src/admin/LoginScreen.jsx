import { useState, useEffect, useRef } from "react";

export default function LoginScreen({ onLogin, loading, error, lockInfo }) {
  const [password, setPassword] = useState("");
  const [shake, setShake]       = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (error) {
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 600);
    }
  }, [error]);

  function handleSubmit(e) {
    e?.preventDefault();
    if (!password.trim() || loading || lockInfo) return;
    onLogin(password);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 12px rgba(124,58,237,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0  rgba(124,58,237,0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .logo-icon  { animation: float 4s ease-in-out infinite; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Background atmosphere */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(124,58,237,0.15) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div className="login-card" style={{
        width: 380, padding: 48,
        background: "rgba(22,22,42,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        backdropFilter: "blur(24px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="logo-icon" style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 20px",
            boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
            animation: "pulse-ring 2.5s ease-out infinite, float 4s ease-in-out infinite",
          }}>🧭</div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 26, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6,
          }}>NextQuest</div>
          <div style={{
            fontSize: 12, color: "#4a4868", fontWeight: 600,
            letterSpacing: "0.15em", textTransform: "uppercase",
          }}>Admin Panel</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{
              fontSize: 11, color: "#6b6890", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: 8,
            }}>Password</div>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!!lockInfo || loading}
              placeholder="Enter admin password"
              style={{
                width: "100%", padding: "12px 16px",
                background: error ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, color: "#e8e6f0",
                fontFamily: "inherit", fontSize: 15,
                outline: "none", transition: "all 0.2s",
                animation: shake ? "shake 0.5s ease" : "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Error / lockout message */}
          {error && (
            <div style={{
              fontSize: 13, color: "#fca5a5",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8, padding: "10px 14px",
              textAlign: "center",
            }}>
              {lockInfo
                ? `🔒 Too many attempts. Try again in ${lockInfo.minutesLeft} min.`
                : error
              }
            </div>
          )}

          <button
            type="submit"
            disabled={!password || loading || !!lockInfo}
            style={{
              padding: "13px 0", borderRadius: 12, cursor: loading || lockInfo ? "not-allowed" : "pointer",
              background: loading || lockInfo
                ? "rgba(124,58,237,0.3)"
                : "linear-gradient(135deg, #7c3aed, #a78bfa)",
              border: "none", color: "#fff",
              fontSize: 15, fontWeight: 700, fontFamily: "inherit",
              opacity: !password || lockInfo ? 0.5 : 1,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <div className="spin" style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                }} />
                Verifying…
              </>
            ) : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

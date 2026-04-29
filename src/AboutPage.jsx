// src/AboutPage.jsx
// Self-contained About page for NextQuest.
// Usage: <AboutPage onBack={() => setAboutOpen(false)} />

export default function AboutPage({ onBack }) {
  return (
    <>
      <style>{`
        .nq-about-wrap {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 44px 24px 80px;
        }

        /* ── nav ── */
        .nq-about-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 52px;
        }
        .nq-about-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid rgba(255,255,255,0.08);
          color: #6b6890;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .nq-about-back:hover { color: #c8c4dc; border-color: rgba(255,255,255,0.18); }

        /* ── tag + heading ── */
        .nq-about-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7c3aed;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.25);
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 16px;
        }
        .nq-about-tag-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #a78bfa;
          flex-shrink: 0;
        }
        .nq-about-h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 4vw, 40px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #f0eeff;
          margin: 0 0 6px;
        }
        .nq-about-h1 .nq-accent {
          background: linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nq-about-sub {
          font-size: 14px;
          color: #5a5678;
          margin: 0 0 40px;
        }

        /* ── 2-col grid ── */
        .nq-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: start;
        }

        /* ── story ── */
        .nq-about-story p {
          font-size: 14px;
          line-height: 1.85;
          color: #9993b8;
          margin: 0 0 14px;
          font-weight: 300;
        }
        .nq-about-story p strong { color: #d4cfee; font-weight: 500; }
        .nq-about-story p:last-child { margin-bottom: 0; }

        .nq-about-divider {
          margin: 28px 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.15), transparent);
        }

        /* ── CTA buttons ── */
        .nq-about-cta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .nq-about-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 14px;
          border-radius: 12px;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid transparent;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
        }
        .nq-about-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .nq-about-btn-channel {
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          color: #fff;
          box-shadow: 0 6px 20px rgba(124,58,237,0.22);
        }
        .nq-about-btn-bot {
          background: rgba(6,182,212,0.08);
          color: #67e8f9;
          border-color: rgba(6,182,212,0.22);
        }
        .nq-about-btn-bot:hover { background: rgba(6,182,212,0.15); }
        .nq-about-btn-title { display: block; font-weight: 600; font-size: 13px; }
        .nq-about-btn-sub   { display: block; font-size: 10px; opacity: 0.65; margin-top: 1px; }

        /* ── photos ── */
        .nq-about-photos { display: flex; flex-direction: column; }
        .nq-about-photo {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          aspect-ratio: 3/4;
          border: 1px solid rgba(255,255,255,0.06);
          background: #1a1a2e;
        }
        .nq-about-photo img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          filter: grayscale(20%);
          transition: filter 0.3s;
        }
        .nq-about-photo:hover img { filter: grayscale(0%); }
        .nq-about-photo-cap {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 32px 16px 14px;
          background: linear-gradient(to top, rgba(15,15,26,0.92) 0%, transparent 100%);
          font-size: 12px; color: rgba(200,196,220,0.65); font-style: italic;
        }

        /* ── beliefs ── */
        .nq-about-beliefs {
          margin-top: 44px;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          overflow: hidden;
        }
        .nq-about-belief {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .nq-about-belief:last-child { border-bottom: none; }
        .nq-about-belief-emoji { font-size: 18px; flex-shrink: 0; margin-top: 1px; line-height: 1; }
        .nq-about-belief-title { font-size: 13px; font-weight: 600; color: #d4cfee; margin: 0 0 3px; }
        .nq-about-belief-desc  { font-size: 12px; color: #4a4868; line-height: 1.6; margin: 0; }

        /* ── organiser hint ── */
        .nq-about-hint {
          margin-top: 28px;
          background: rgba(6,182,212,0.05);
          border: 1px solid rgba(6,182,212,0.12);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .nq-about-hint-icon { font-size: 20px; flex-shrink: 0; line-height: 1; margin-top: 1px; }
        .nq-about-hint-text { font-size: 13px; color: #6b8fa8; line-height: 1.7; }
        .nq-about-hint-text strong { color: #67e8f9; font-weight: 500; }
        .nq-about-hint-text a {
          color: #67e8f9; text-decoration: none;
          border-bottom: 1px solid rgba(103,232,249,0.25);
        }
        .nq-about-hint-text a:hover { border-bottom-color: rgba(103,232,249,0.6); }

        /* ── support ── */
        .nq-about-support {
          margin-top: 28px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 22px 22px 18px;
        }
        .nq-about-support-head {
          display: flex; align-items: center;
          gap: 10px; margin-bottom: 8px;
        }
        .nq-about-support-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700; color: #d4cfee;
        }
        .nq-about-support-note {
          font-size: 13px; color: #4a4868;
          line-height: 1.7; margin: 0 0 16px;
        }
        .nq-about-support-note em { color: #6b6890; font-style: normal; }
        .nq-about-btn-donate {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.2);
          color: #fbbf24; font-size: 13px; font-weight: 600;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          transition: background 0.15s, transform 0.15s;
          cursor: pointer;
        }
        .nq-about-btn-donate:hover { background: rgba(251,191,36,0.15); transform: translateY(-1px); }

        /* ── contact ── */
        .nq-about-contact {
          margin-top: 18px;
          text-align: center;
          font-size: 12px;
          color: #3d3a5c;
        }
        .nq-about-contact a {
          color: #5a5678; text-decoration: none;
          border-bottom: 1px solid rgba(90,86,120,0.3);
        }
        .nq-about-contact a:hover { color: #9993b8; }

        /* ── mobile ── */
        @media (max-width: 640px) {
          .nq-about-grid { grid-template-columns: 1fr; }
          .nq-about-cta    { grid-template-columns: 1fr; }
          .nq-about-wrap   { padding: 28px 16px 60px; }
          .nq-about-nav    { margin-bottom: 32px; }
          .nq-about-photo  { aspect-ratio: 4/3; }
        }
      `}</style>

      <div className="nq-about-wrap">

        {/* Nav */}
        <nav className="nq-about-nav">
          <button className="nq-about-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 3L5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to events
          </button>
        </nav>

        {/* Heading */}
        <div className="nq-about-tag">
          <div className="nq-about-tag-dot" />
          About
        </div>
        <h1 className="nq-about-h1">
          Two geeks mapping<br />
          <span className="nq-accent">Cyprus' nerd scene.</span>
        </h1>
        <p className="nq-about-sub">Because someone had to.</p>

        {/* Main grid */}
        <div className="nq-about-grid">

          {/* Story + buttons */}
          <div className="nq-about-story">
            <p>
              Hi! I'm <strong>Hilda</strong>, a board-game addict who moved to Cyprus and
              immediately lost track of every cool event happening around me.
            </p>
            <p>
              After missing one too many RPG nights and cosplay meetups, I decided to build
              the thing I actually needed — one place for{" "}
              <strong>every geek event on the island</strong>, from tabletop nights in
              Limassol to conventions in Nicosia.
            </p>
            <p>
              My partner in crime <strong>[Friend's name]</strong> jumped in and we turned
              a very messy spreadsheet into NextQuest. We keep it running on passion,
              caffeine, and the occasional dungeon crawl. 🎲
            </p>

            <div className="nq-about-divider" />

            <div className="nq-about-cta">
              <a
                className="nq-about-btn nq-about-btn-channel"
                href="https://t.me/nextquestcy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Telegram icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.04 9.607c-.152.67-.55.833-1.112.518l-3.073-2.264-1.483 1.428c-.163.163-.3.3-.617.3l.22-3.123 5.692-5.143c.247-.22-.054-.341-.383-.122L8.09 14.6l-3.02-.944c-.657-.205-.67-.657.137-.973l11.241-4.334c.547-.199 1.026.122.847.983z"/>
                </svg>
                <span>
                  <span className="nq-about-btn-title">Telegram Channel</span>
                  <span className="nq-about-btn-sub">New events & updates</span>
                </span>
              </a>

              <a
                className="nq-about-btn nq-about-btn-bot"
                href="https://t.me/NextQuestbot"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
                <span>
                  <span className="nq-about-btn-title">Telegram Bot</span>
                  <span className="nq-about-btn-sub">Add your event · 2 min</span>
                </span>
              </a>
            </div>
          </div>

          {/* Photos */}
          <div className="nq-about-photos">
            <div className="nq-about-photo">
              <img src="/photo.png" alt="Hilda and friend in Team Rocket cosplay" />
            </div>
          </div>
        </div>

        {/* Beliefs */}
        <div className="nq-about-beliefs">
          <div className="nq-about-belief">
            <span className="nq-about-belief-emoji">🐉</span>
            <div>
              <p className="nq-about-belief-title">Cyprus has more dragons than you think</p>
              <p className="nq-about-belief-desc">The geek community here is real, warm, and growing — it just needed a map.</p>
            </div>
          </div>
          <div className="nq-about-belief">
            <span className="nq-about-belief-emoji">✨</span>
            <div>
              <p className="nq-about-belief-title">Small events matter just as much</p>
              <p className="nq-about-belief-desc">A 6-person RPG night in someone's living room is as worthy as a big convention.</p>
            </div>
          </div>
        </div>

        {/* Organiser hint */}
        <div className="nq-about-hint">
          <span className="nq-about-hint-icon">📋</span>
          <div className="nq-about-hint-text">
            <strong>Organising something?</strong> Adding your event to NextQuest takes about
            2 minutes via our Telegram bot — it's free, and your event goes live as soon as
            we review it.{" "}
            <a href="https://t.me/NextQuestbot" target="_blank" rel="noopener noreferrer">
              Start here →
            </a>
          </div>
        </div>

        {/* Support */}
        <div className="nq-about-support">
          <div className="nq-about-support-head">
            <span style={{ fontSize: 20 }}>☕</span>
            <span className="nq-about-support-title">Support the project</span>
          </div>
          <p className="nq-about-support-note">
            NextQuest is free and has no ads. We run it in our spare time because we
            genuinely love this community.{" "}
            <em>If you'd like to help keep the server lights on — even a coffee makes a difference.</em>
          </p>
          {/* Replace href with your real Ko-fi / Buy Me a Coffee link */}
          <a
            className="nq-about-btn-donate"
            href="https://ko-fi.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ Buy us a coffee
          </a>
        </div>

        {/* Contact */}
        <p className="nq-about-contact">
          Questions or ideas?{" "}
          <a href="mailto:hello@nextquest.today">hello@nextquest.today</a>
          {" "}or{" "}
          <a href="https://t.me/nextquestcy" target="_blank" rel="noopener noreferrer">
            drop a message on Telegram
          </a>
        </p>

      </div>
    </>
  );
}

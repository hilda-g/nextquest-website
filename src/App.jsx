import { useState } from "react";

const LANGS = {
  en: {
    title: "NextQuest",
    subtitle: "Cyprus Geek Events",
    all: "All",
    upcoming: "Upcoming",
    archive: "Archive",
    search: "Search events…",
    notify: "🔔 Notify me",
    notified: "✓ Subscribed",
    location: "Location",
    organizer: "Organizer",
    register: "Register →",
    noEvents: "No events found",
    multiDay: "Multi-day",
    cancelled: "Cancelled",
    filterDate: "Date",
    filterCat: "Category",
    today: "Today",
    week: "This week",
    month: "This month",
    any: "Any time",
    addToCalendar: "Add to calendar",
    close: "Close",
    participants: "participants",
  },
  ru: {
    title: "NextQuest",
    subtitle: "События гик-сообщества Кипра",
    all: "Все",
    upcoming: "Предстоящие",
    archive: "Архив",
    search: "Поиск событий…",
    notify: "🔔 Напомнить",
    notified: "✓ Подписан",
    location: "Место",
    organizer: "Организатор",
    register: "Регистрация →",
    noEvents: "Событий не найдено",
    multiDay: "Многодневное",
    cancelled: "Отменено",
    filterDate: "Дата",
    filterCat: "Категория",
    today: "Сегодня",
    week: "Эта неделя",
    month: "Этот месяц",
    any: "Любое время",
    addToCalendar: "В календарь",
    close: "Закрыть",
    participants: "участников",
  },
  el: {
    title: "NextQuest",
    subtitle: "Εκδηλώσεις Geek στην Κύπρο",
    all: "Όλα",
    upcoming: "Επερχόμενα",
    archive: "Αρχείο",
    search: "Αναζήτηση…",
    notify: "🔔 Υπενθύμιση",
    notified: "✓ Εγγεγραμμένος",
    location: "Τοποθεσία",
    organizer: "Διοργανωτής",
    register: "Εγγραφή →",
    noEvents: "Δεν βρέθηκαν εκδηλώσεις",
    multiDay: "Πολυήμερο",
    cancelled: "Ακυρώθηκε",
    filterDate: "Ημερομηνία",
    filterCat: "Κατηγορία",
    today: "Σήμερα",
    week: "Αυτή την εβδομάδα",
    month: "Αυτό τον μήνα",
    any: "Οποιαδήποτε",
    addToCalendar: "Στο ημερολόγιο",
    close: "Κλείσιμο",
    participants: "συμμετέχοντες",
  },
  uk: {
    title: "NextQuest",
    subtitle: "Гік-події на Кіпрі",
    all: "Всі",
    upcoming: "Майбутні",
    archive: "Архів",
    search: "Пошук подій…",
    notify: "🔔 Нагадати",
    notified: "✓ Підписано",
    location: "Місце",
    organizer: "Організатор",
    register: "Реєстрація →",
    noEvents: "Подій не знайдено",
    multiDay: "Багатоденна",
    cancelled: "Скасовано",
    filterDate: "Дата",
    filterCat: "Категорія",
    today: "Сьогодні",
    week: "Цей тиждень",
    month: "Цей місяць",
    any: "Будь-який час",
    addToCalendar: "До календаря",
    close: "Закрити",
    participants: "учасників",
  },
};

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games", color: "#f97316" },
  { id: "larp", label: "⚔️ LARP", color: "#8b5cf6" },
  { id: "festival", label: "🎪 Festival", color: "#ec4899" },
  { id: "rpg", label: "🎭 RPG", color: "#06b6d4" },
  { id: "cosplay", label: "👗 Cosplay", color: "#10b981" },
  { id: "other", label: "🃏 Other", color: "#6b7280" },
];

const EVENTS = [
  {
    id: 1,
    title: "Board Game Marathon",
    titleRu: "Марафон настольных игр",
    titleEl: "Μαραθώνιος Επιτραπέζιων",
    titleUk: "Марафон настільних ігор",
    category: "boardgames",
    dateStart: new Date(2026, 4, 3, 18, 0),
    dateEnd: new Date(2026, 4, 3, 23, 0),
    city: "Nicosia",
    address: "The Brew, Stasinos Ave 10",
    description: "A full evening of board games — from gateway games to heavy euros. All skill levels welcome. Games provided, just bring yourself!",
    descRu: "Вечер настольных игр — от простых до тяжёлых евро-игр. Приглашаем всех, независимо от уровня. Игры предоставляются!",
    organizer: "@boardgames_cy",
    maxParticipants: 30,
    currentParticipants: 18,
    cover: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80",
    externalUrl: "https://t.me/boardgames_cy",
    status: "published",
  },
  {
    id: 2,
    title: "Cyprus LARP Festival",
    titleRu: "Фестиваль ларпа на Кипре",
    titleEl: "Φεστιβάλ LARP Κύπρου",
    titleUk: "Фестиваль ларпу на Кіпрі",
    category: "larp",
    dateStart: new Date(2026, 4, 9, 10, 0),
    dateEnd: new Date(2026, 4, 11, 18, 0),
    city: "Limassol",
    address: "Fasouri Forest Area",
    description: "Three days of live-action roleplay in the beautiful Limassol forest. Multiple scenarios, workshops, and evening feasts. Costumes encouraged!",
    descRu: "Три дня живых ролевых игр в лесу под Лимасолом. Несколько сценариев, мастер-классы и вечерние пиры. Костюмы приветствуются!",
    organizer: "@larp_cyprus",
    maxParticipants: 80,
    currentParticipants: 63,
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    externalUrl: "https://t.me/larp_cyprus",
    status: "published",
    multiDay: true,
  },
  {
    id: 3,
    title: "GeekFest Cyprus 2026",
    titleRu: "ГикФест Кипр 2026",
    titleEl: "GeekFest Κύπρος 2026",
    titleUk: "ГікФест Кіпр 2026",
    category: "festival",
    dateStart: new Date(2026, 4, 17, 11, 0),
    dateEnd: new Date(2026, 4, 18, 20, 0),
    city: "Nicosia",
    address: "Eleftheria Square",
    description: "The biggest geek festival on the island! Cosplay contest, tabletop gaming zone, anime screenings, merch market, and much more.",
    descRu: "Крупнейший гик-фестиваль острова! Конкурс косплея, зона настолок, аниме-показы, маркет мерча и многое другое.",
    organizer: "@geekfest_cy",
    maxParticipants: 500,
    currentParticipants: 312,
    cover: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    externalUrl: "https://t.me/geekfest_cy",
    status: "published",
    multiDay: true,
  },
  {
    id: 4,
    title: "D&D One-Shot: The Lost Temple",
    titleRu: "D&D Ваншот: Затерянный храм",
    titleEl: "D&D One-Shot: Ο Χαμένος Ναός",
    titleUk: "D&D Ваншот: Загублений храм",
    category: "rpg",
    dateStart: new Date(2026, 4, 24, 17, 0),
    dateEnd: new Date(2026, 4, 24, 22, 0),
    city: "Larnaca",
    address: "Café Nero, Finikoudes Promenade",
    description: "A beginner-friendly D&D 5e one-shot adventure. Pre-made characters provided. DM: experienced, English-speaking. 5 players max.",
    descRu: "Дружелюбный ваншот по D&D 5e для начинающих. Готовые персонажи предоставляются. Мастер: опытный, игра на английском. Макс. 5 игроков.",
    organizer: "@dnd_larnaca",
    maxParticipants: 5,
    currentParticipants: 3,
    cover: "https://images.unsplash.com/photo-1559732277-7453b141e3a1?w=800&q=80",
    externalUrl: "https://t.me/dnd_larnaca",
    status: "published",
  },
  {
    id: 5,
    title: "Cosplay Workshop: Armor Crafting",
    titleRu: "Мастер-класс косплея: броня",
    titleEl: "Workshop Cosplay: Κατασκευή Πανοπλίας",
    titleUk: "Майстер-клас косплею: броня",
    category: "cosplay",
    dateStart: new Date(2026, 4, 30, 14, 0),
    dateEnd: new Date(2026, 4, 30, 18, 0),
    city: "Paphos",
    address: "Maker Space Paphos, Kennedy Ave",
    description: "Learn EVA foam armor crafting from scratch. Materials included in the ticket price. Bring your design ideas!",
    descRu: "Научитесь делать броню из EVA-пены с нуля. Материалы включены в стоимость. Приходите с идеями для дизайна!",
    organizer: "@cosplay_paphos",
    maxParticipants: 12,
    currentParticipants: 9,
    cover: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=800&q=80",
    externalUrl: "https://t.me/cosplay_paphos",
    status: "published",
  },
  {
    id: 6,
    title: "Warhammer 40K Tournament",
    titleRu: "Турнир Warhammer 40K",
    titleEl: "Τουρνουά Warhammer 40K",
    titleUk: "Турнір Warhammer 40K",
    category: "boardgames",
    dateStart: new Date(2026, 2, 15, 10, 0),
    dateEnd: new Date(2026, 2, 15, 20, 0),
    city: "Limassol",
    address: "Hobby Zone, Arch. Makariou III",
    description: "Monthly Warhammer 40K tournament. 1500pts lists, matched play rules. Prizes for top 3!",
    descRu: "Ежемесячный турнир по Warhammer 40K. Списки на 1500 очков, matched play. Призы для топ-3!",
    organizer: "@warhammer_cy",
    maxParticipants: 16,
    currentParticipants: 16,
    cover: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&q=80",
    externalUrl: "https://t.me/warhammer_cy",
    status: "published",
    isPast: true,
  },
];

const CITIES = ["All Cities", "Nicosia", "Limassol", "Larnaca", "Paphos"];

function formatDate(date, lang) {
  const opts = { day: "numeric", month: "short" };
  const localeMap = { en: "en-GB", ru: "ru-RU", el: "el-GR", uk: "uk-UA" };
  return date.toLocaleDateString(localeMap[lang] || "en-GB", opts);
}

function formatTime(date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getCatColor(catId) {
  return CATEGORIES.find((c) => c.id === catId)?.color || "#6b7280";
}

function getCatLabel(catId) {
  return CATEGORIES.find((c) => c.id === catId)?.label || catId;
}

function getTitle(event, lang) {
  if (lang === "ru") return event.titleRu;
  if (lang === "el") return event.titleEl;
  if (lang === "uk") return event.titleUk;
  return event.title;
}

function getDesc(event, lang) {
  if (lang === "ru" && event.descRu) return event.descRu;
  return event.description;
}

export default function NextQuest() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [selected, setSelected] = useState(null);
  const [subscribed, setSubscribed] = useState({});
  const t = LANGS[lang];

  const now = new Date();

  const filtered = EVENTS.filter((e) => {
    const isPast = e.isPast || e.dateStart < now;
    if (tab === "upcoming" && isPast) return false;
    if (tab === "archive" && !isPast) return false;
    if (catFilter !== "all" && e.category !== catFilter) return false;
    if (cityFilter !== "All Cities" && e.city !== cityFilter) return false;
    const q = search.toLowerCase();
    if (q && !getTitle(e, lang).toLowerCase().includes(q) && !e.city.toLowerCase().includes(q)) return false;
    return true;
  });

  const pct = (e) => Math.round((e.currentParticipants / e.maxParticipants) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d14",
      fontFamily: "'Outfit', sans-serif",
      color: "#e8e6f0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #3d3a5c; border-radius: 2px; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .pill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; }
        .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #a09cbc; border-radius: 999px; padding: 6px 16px; font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { background: rgba(255,255,255,0.1); color: #e8e6f0; }
        .filter-btn.active { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); color: #fff; }
        .tab-btn { background: none; border: none; color: #6b6890; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; padding: 8px 4px; border-bottom: 2px solid transparent; transition: all 0.2s; letter-spacing: 0.03em; }
        .tab-btn.active { color: #e8e6f0; border-bottom-color: #a78bfa; }
        .lang-btn { background: none; border: none; color: #6b6890; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px 6px; border-radius: 4px; transition: all 0.2s; letter-spacing: 0.06em; text-transform: uppercase; }
        .lang-btn:hover { color: #e8e6f0; }
        .lang-btn.active { color: #a78bfa; }
        .notify-btn { border: 1px solid rgba(167,139,250,0.4); background: rgba(167,139,250,0.08); color: #a78bfa; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .notify-btn:hover { background: rgba(167,139,250,0.18); }
        .notify-btn.done { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.08); color: #10b981; }
        .register-btn { background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-family: inherit; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
        .register-btn:hover { opacity: 0.88; }
        .search-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #e8e6f0; border-radius: 12px; padding: 10px 16px 10px 40px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: rgba(167,139,250,0.4); }
        .search-input::placeholder { color: #4a4868; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .modal { background: #16162a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .progress-bar { height: 4px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
        .event-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        @media (max-width: 640px) { .event-grid { grid-template-columns: 1fr; } }
        .mesh-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(ellipse 80% 50% at 20% 20%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 60%); }
        .noise { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
      `}</style>

      <div className="mesh-bg" />
      <div className="noise" />

      {/* Header */}
      <header style={{ position: "relative", zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📡</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "#fff" }}>NextQuest</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["en", "ru", "el", "uk"].map(l => (
              <button key={l} className={`lang-btn${lang === l ? " active" : ""}`} onClick={() => setLang(l)}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ position: "relative", zIndex: 1, padding: "48px 24px 32px", textAlign: "center" }}>
        <p style={{ color: "#6b6890", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{t.subtitle}</p>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 6vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 1, background: "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Find Your<br />Next Adventure
        </h1>
      </div>

      {/* Controls */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20, maxWidth: 480 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4a4868", fontSize: 16 }}>🔍</span>
          <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 24, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {["upcoming", "archive"].map(t2 => (
            <button key={t2} className={`tab-btn${tab === t2 ? " active" : ""}`} onClick={() => setTab(t2)}>
              {t2 === "upcoming" ? t.upcoming : t.archive}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button className={`filter-btn${catFilter === "all" ? " active" : ""}`} onClick={() => setCatFilter("all")}>{t.all}</button>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`filter-btn${catFilter === c.id ? " active" : ""}`} onClick={() => setCatFilter(catFilter === c.id ? "all" : c.id)} style={catFilter === c.id ? { borderColor: c.color + "66", color: c.color } : {}}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CITIES.map(city => (
            <button key={city} className={`filter-btn${cityFilter === city ? " active" : ""}`} onClick={() => setCityFilter(city)}>
              {city === "All Cities" ? "🌍 " + city : "📍 " + city}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      <main style={{ position: "relative", zIndex: 1, padding: "0 24px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4a4868" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔭</div>
            <p style={{ fontSize: 16 }}>{t.noEvents}</p>
          </div>
        ) : (
          <div className="event-grid">
            {filtered.map((event, i) => {
              const color = getCatColor(event.category);
              const full = event.currentParticipants >= event.maxParticipants;
              return (
                <div key={event.id} className="card-hover" onClick={() => setSelected(event)}
                  style={{ background: "#16162a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", animationDelay: `${i * 0.05}s` }}>
                  {/* Cover */}
                  <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                    <img src={event.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(22,22,42,0.9) 0%, transparent 60%)" }} />
                    {/* Badges */}
                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                      <span className="pill" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{getCatLabel(event.category)}</span>
                      {event.multiDay && <span className="pill" style={{ background: "rgba(255,255,255,0.1)", color: "#e8e6f0" }}>{t.multiDay}</span>}
                      {event.status === "cancelled" && <span className="pill" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>{t.cancelled}</span>}
                    </div>
                    {/* Date on cover */}
                    <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                        {formatDate(event.dateStart, lang)}
                        {event.multiDay ? ` — ${formatDate(event.dateEnd, lang)}` : ` · ${formatTime(event.dateStart)}`}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>{getTitle(event, lang)}</h3>
                    <p style={{ fontSize: 12, color: "#6b6890", marginBottom: 12 }}>📍 {event.city} · {event.address}</p>

                    {/* Participants bar */}
                    <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#4a4868" }}>{event.currentParticipants}/{event.maxParticipants} {t.participants}</span>
                      {full && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>FULL</span>}
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct(event)}%`, background: full ? "#ef4444" : color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* Cover */}
            <div style={{ position: "relative", height: 220, borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
              <img src={selected.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(22,22,42,1) 0%, transparent 50%)" }} />
              <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ position: "absolute", bottom: 16, left: 20, display: "flex", gap: 8 }}>
                <span className="pill" style={{ background: getCatColor(selected.category) + "22", color: getCatColor(selected.category), border: `1px solid ${getCatColor(selected.category)}44` }}>{getCatLabel(selected.category)}</span>
                {selected.multiDay && <span className="pill" style={{ background: "rgba(255,255,255,0.1)", color: "#e8e6f0" }}>{t.multiDay}</span>}
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{getTitle(selected, lang)}</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#a09cbc", fontSize: 14 }}>
                  <span>🗓</span>
                  <span>{formatDate(selected.dateStart, lang)}{selected.multiDay ? ` — ${formatDate(selected.dateEnd, lang)}` : ""}, {formatTime(selected.dateStart)}{!selected.multiDay ? ` – ${formatTime(selected.dateEnd)}` : ""}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#a09cbc", fontSize: 14 }}>
                  <span>📍</span>
                  <span>{selected.city} · {selected.address}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#a09cbc", fontSize: 14 }}>
                  <span>👤</span>
                  <span>{t.organizer}: {selected.organizer}</span>
                </div>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#a09cbc", marginBottom: 20 }}>{getDesc(selected, lang)}</p>

              {/* Participants */}
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#6b6890" }}>{selected.currentParticipants}/{selected.maxParticipants} {t.participants}</span>
                  <span style={{ fontSize: 13, color: getCatColor(selected.category), fontWeight: 700 }}>{pct(selected)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct(selected)}%`, background: getCatColor(selected.category) }} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className={`notify-btn${subscribed[selected.id] ? " done" : ""}`}
                  onClick={() => setSubscribed(s => ({ ...s, [selected.id]: !s[selected.id] }))}>
                  {subscribed[selected.id] ? t.notified : t.notify}
                </button>
                <a href={selected.externalUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", flex: 1 }}>
                  <button className="register-btn" style={{ width: "100%" }}>{t.register}</button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

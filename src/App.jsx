import { useState, useEffect } from "react";

const LANGS = {
  en: {
    title: "NextQuest",
    subtitle: "Cyprus Geek Events",
    all: "All",
    upcoming: "Upcoming",
    archive: "Archive",
    calendar: "Calendar",
    search: "Search events…",
    notify: "🔔 Notify me",
    notified: "✓ Subscribed",
    location: "Location",
    organizer: "Organizer",
    register: "Register →",
    noEvents: "No events found",
    multiDay: "Multi-day",
    cancelled: "Cancelled",
    addToCalendar: "Add to calendar",
    close: "Close",
    participants: "participants",
    spotsLeft: "spots left",
    allCities: "All Cities",
    noEventsDay: "No events this day",
    addEvent: "Add Event",
  },
  ru: {
    title: "NextQuest",
    subtitle: "События гик-сообщества Кипра",
    all: "Все",
    upcoming: "Предстоящие",
    archive: "Архив",
    calendar: "Календарь",
    search: "Поиск событий…",
    notify: "🔔 Напомнить",
    notified: "✓ Подписан",
    location: "Место",
    organizer: "Организатор",
    register: "Регистрация →",
    noEvents: "Событий не найдено",
    multiDay: "Многодневное",
    cancelled: "Отменено",
    addToCalendar: "В календарь",
    close: "Закрыть",
    participants: "участников",
    spotsLeft: "мест осталось",
    allCities: "Все города",
    noEventsDay: "Нет событий",
    addEvent: "Добавить",
  },
  el: {
    title: "NextQuest",
    subtitle: "Εκδηλώσεις Geek στην Κύπρο",
    all: "Όλα",
    upcoming: "Επερχόμενα",
    archive: "Αρχείο",
    calendar: "Ημερολόγιο",
    search: "Αναζήτηση…",
    notify: "🔔 Υπενθύμιση",
    notified: "✓ Εγγεγραμμένος",
    location: "Τοποθεσία",
    organizer: "Διοργανωτής",
    register: "Εγγραφή →",
    noEvents: "Δεν βρέθηκαν εκδηλώσεις",
    multiDay: "Πολυήμερο",
    cancelled: "Ακυρώθηκε",
    addToCalendar: "Στο ημερολόγιο",
    close: "Κλείσιμο",
    participants: "συμμετέχοντες",
    spotsLeft: "θέσεις",
    allCities: "Όλες οι πόλεις",
    noEventsDay: "Δεν υπάρχουν εκδηλώσεις",
    addEvent: "Προσθήκη",
  },
  uk: {
    title: "NextQuest",
    subtitle: "Гік-події на Кіпрі",
    all: "Всі",
    upcoming: "Майбутні",
    archive: "Архів",
    calendar: "Календар",
    search: "Пошук подій…",
    notify: "🔔 Нагадати",
    notified: "✓ Підписано",
    location: "Місце",
    organizer: "Організатор",
    register: "Реєстрація →",
    noEvents: "Подій не знайдено",
    multiDay: "Багатоденна",
    cancelled: "Скасовано",
    addToCalendar: "До календаря",
    close: "Закрити",
    participants: "учасників",
    spotsLeft: "місць",
    allCities: "Всі міста",
    noEventsDay: "Подій немає",
    addEvent: "Додати подію",
  },
};

const CATEGORIES = [
  { id: "boardgames", label: "🎲 Board Games", color: "#f97316" },
  { id: "larp",       label: "⚔️ LARP",        color: "#8b5cf6" },
  { id: "festival",  label: "🎪 Festival",     color: "#ec4899" },
  { id: "rpg",       label: "🎭 RPG",          color: "#06b6d4" },
  { id: "cosplay",   label: "👗 Cosplay",      color: "#10b981" },
  { id: "other",     label: "🃏 Other",        color: "#6b7280" },
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
    dateEnd:   new Date(2026, 4, 3, 23, 0),
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
    dateEnd:   new Date(2026, 4, 11, 18, 0),
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
    dateEnd:   new Date(2026, 4, 18, 20, 0),
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
    dateEnd:   new Date(2026, 4, 24, 22, 0),
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
    dateEnd:   new Date(2026, 4, 30, 18, 0),
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
    dateEnd:   new Date(2026, 2, 15, 20, 0),
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

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos"];

function formatDate(date, lang) {
  const opts = { day: "numeric", month: "short" };
  const localeMap = { en: "en-GB", ru: "ru-RU", el: "el-GR", uk: "uk-UA" };
  return date.toLocaleDateString(localeMap[lang] || "en-GB", opts);
}
function formatTime(date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function getCatColor(catId) {
  return CATEGORIES.find(c => c.id === catId)?.color || "#6b7280";
}
function getCatLabel(catId) {
  return CATEGORIES.find(c => c.id === catId)?.label || catId;
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

// ── Calendar helpers ────────────────────────────────────────────────────────

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDay(year, month) { return (new Date(year, month, 1).getDay() + 6) % 7; } // Mon=0

function eventOnDay(ev, year, month, day) {
  const t = new Date(year, month, day);
  const s = new Date(ev.dateStart.getFullYear(), ev.dateStart.getMonth(), ev.dateStart.getDate());
  const e = ev.dateEnd
    ? new Date(ev.dateEnd.getFullYear(), ev.dateEnd.getMonth(), ev.dateEnd.getDate())
    : s;
  return t >= s && t <= e;
}

// ── CalendarView ────────────────────────────────────────────────────────────

function CalendarView({ events, lang, onSelectEvent, t }) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const localeMap = { en: "en-GB", ru: "ru-RU", el: "el-GR", uk: "uk-UA" };
  const monthName = new Date(calYear, calMonth, 1)
    .toLocaleDateString(localeMap[lang], { month: "long", year: "numeric" });
  const weekDays =
    lang === "ru" ? ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"]
    : lang === "el" ? ["Δε","Τρ","Τε","Πε","Πα","Σά","Κυ"]
    : lang === "uk" ? ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"]
    : ["Mo","Tu","We","Th","Fr","Sa","Su"];

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null);
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDay(calYear, calMonth);
  const eventsForDay = (day) => events.filter(e => eventOnDay(e, calYear, calMonth, day));
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const isToday = (day) => day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prevMonth} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e6f0", borderRadius: 10, width: 38, height: 38, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}>‹</button>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", textTransform: "capitalize", letterSpacing: "-0.01em" }}>{monthName}</span>
        <button onClick={nextMonth} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e6f0", borderRadius: 10, width: 38, height: 38, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.07)"}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
        {weekDays.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#3e3a5a", letterSpacing: "0.06em", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} style={{ minHeight: 56 }} />;
          const dayEvs = eventsForDay(day);
          const hasEvs = dayEvs.length > 0;
          const isSel = selectedDay === day;
          const tod = isToday(day);
          return (
            <div key={day} onClick={() => hasEvs && setSelectedDay(isSel ? null : day)}
              style={{
                borderRadius: 10, minHeight: 56, padding: "7px 5px",
                cursor: hasEvs ? "pointer" : "default",
                background: isSel ? "rgba(167,139,250,0.2)" : hasEvs ? "rgba(255,255,255,0.04)" : "transparent",
                border: isSel ? "1px solid rgba(167,139,250,0.55)"
                  : tod ? "1px solid rgba(167,139,250,0.35)"
                  : "1px solid rgba(255,255,255,0.04)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (hasEvs) e.currentTarget.style.background = isSel ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSel ? "rgba(167,139,250,0.2)" : hasEvs ? "rgba(255,255,255,0.04)" : "transparent"; }}
            >
              <div style={{ fontSize: 12, fontWeight: tod ? 800 : 500, color: tod ? "#a78bfa" : isSel ? "#fff" : hasEvs ? "#c4c0e0" : "#3e3a5a", textAlign: "center", marginBottom: 4 }}>{day}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                {dayEvs.slice(0, 3).map(ev => (
                  <div key={ev.id} style={{ width: 5, height: 5, borderRadius: "50%", background: getCatColor(ev.category) }} />
                ))}
                {dayEvs.length > 3 && <div style={{ fontSize: 8, color: "#6b6890" }}>+{dayEvs.length-3}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category legend */}
      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CATEGORIES.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#5a567a" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />
            {c.label.split(" ").slice(1).join(" ")}
          </div>
        ))}
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <p style={{ fontSize: 12, color: "#5a567a", marginBottom: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {selectedDay} {new Date(calYear, calMonth, selectedDay).toLocaleDateString(localeMap[lang], { month: "long" })}
          </p>
          {selectedEvents.length === 0
            ? <p style={{ color: "#4a4868", fontSize: 14 }}>{t.noEventsDay}</p>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {selectedEvents.map(ev => (
                  <div key={ev.id} onClick={() => onSelectEvent(ev)}
                    style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px", cursor: "pointer", border: `1px solid ${getCatColor(ev.category)}20`, transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
                    <div style={{ width: 3, height: 36, borderRadius: 2, background: getCatColor(ev.category), flexShrink: 0 }} />
                    <img src={ev.cover} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getTitle(ev, lang)}</div>
                      <div style={{ fontSize: 11, color: "#5a567a", marginTop: 2 }}>
                        {ev.multiDay ? `${formatDate(ev.dateStart, lang)} – ${formatDate(ev.dateEnd, lang)}` : formatTime(ev.dateStart)} · {ev.city}
                      </div>
                    </div>
                    <span style={{ color: "#4a4868", fontSize: 14 }}>›</span>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────

export default function NextQuest() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [subscribed, setSubscribed] = useState({});
  const t = LANGS[lang];
  const now = new Date();

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const filtered = EVENTS.filter(e => {
    const isPast = e.isPast || e.dateStart < now;
    if (tab === "upcoming" && isPast) return false;
    if (tab === "archive" && !isPast) return false;
    if (catFilter !== "all" && e.category !== catFilter) return false;
    if (cityFilter !== "all" && e.city !== cityFilter) return false;
    const q = search.toLowerCase();
    if (q && !getTitle(e, lang).toLowerCase().includes(q) && !e.city.toLowerCase().includes(q)) return false;
    return true;
  });

  const pct = e => Math.round((e.currentParticipants / e.maxParticipants) * 100);
  const spotsLeft = e => e.maxParticipants - e.currentParticipants;
  const upcomingCount = EVENTS.filter(e => !e.isPast && e.dateStart >= now).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d14", fontFamily: "'Outfit', sans-serif", color: "#e8e6f0", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#1a1a2e}
        ::-webkit-scrollbar-thumb{background:#3d3a5c;border-radius:2px}
        .card-hover{transition:transform 0.25s ease,box-shadow 0.25s ease;cursor:pointer}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.5)}
        .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:0.04em}
        .filter-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#a09cbc;border-radius:999px;padding:6px 14px;font-size:12px;font-family:inherit;cursor:pointer;transition:all 0.2s;white-space:nowrap}
        .filter-btn:hover{background:rgba(255,255,255,0.1);color:#e8e6f0}
        .filter-btn.active{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.25);color:#fff}
        .tab-btn{background:none;border:none;color:#6b6890;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;padding:10px 4px;border-bottom:2px solid transparent;transition:all 0.2s;letter-spacing:0.03em;white-space:nowrap}
        .tab-btn.active{color:#e8e6f0;border-bottom-color:#a78bfa}
        .tab-btn:hover:not(.active){color:#c4c0e0}
        .lang-btn{background:none;border:none;color:#6b6890;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;padding:4px 6px;border-radius:4px;transition:all 0.2s;letter-spacing:0.06em;text-transform:uppercase}
        .lang-btn:hover{color:#e8e6f0}
        .lang-btn.active{color:#a78bfa}
        .notify-btn{border:1px solid rgba(167,139,250,0.4);background:rgba(167,139,250,0.08);color:#a78bfa;border-radius:10px;padding:10px 18px;font-size:13px;font-family:inherit;font-weight:600;cursor:pointer;transition:all 0.2s}
        .notify-btn:hover{background:rgba(167,139,250,0.2)}
        .notify-btn.done{border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.08);color:#10b981}
        .register-btn{background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border:none;border-radius:10px;padding:11px 20px;font-size:14px;font-family:inherit;font-weight:700;cursor:pointer;transition:opacity 0.2s,transform 0.15s}
        .register-btn:hover{opacity:0.9;transform:translateY(-1px)}
        .search-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#e8e6f0;border-radius:12px;padding:10px 16px 10px 40px;font-size:14px;font-family:inherit;width:100%;outline:none;transition:border-color 0.2s,background 0.2s}
        .search-input:focus{border-color:rgba(167,139,250,0.5);background:rgba(255,255,255,0.07)}
        .search-input::placeholder{color:#4a4868}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(12px);animation:fadeIn 0.2s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .modal{background:#13132a;border:1px solid rgba(255,255,255,0.1);border-radius:22px;max-width:580px;width:100%;max-height:92vh;overflow-y:auto;animation:slideUp 0.28s ease}
        @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
        .progress-bar{height:5px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden}
        .progress-fill{height:100%;border-radius:999px;transition:width 0.6s ease}
        .event-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
        @media(max-width:640px){.event-grid{grid-template-columns:1fr}}
        .mesh-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 10%,rgba(124,58,237,0.15) 0%,transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 85%,rgba(6,182,212,0.09) 0%,transparent 60%),
            radial-gradient(ellipse 50% 30% at 50% 50%,rgba(236,72,153,0.04) 0%,transparent 70%)}
        .noise{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.025;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        .stat-chip{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:999px;padding:5px 14px;font-size:12px;font-weight:600;color:#a09cbc;display:inline-flex;align-items:center;gap:6px}
        .city-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:#a09cbc;border-radius:10px;padding:7px 14px;font-size:12px;font-family:inherit;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px;white-space:nowrap}
        .city-btn:hover{background:rgba(255,255,255,0.09);color:#e8e6f0}
        .city-btn.active{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:#fff}
        .add-event-btn{background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-family:inherit;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity 0.2s,transform 0.15s}
        .add-event-btn:hover{opacity:0.88;transform:translateY(-1px)}
        .spot-full{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(239,68,68,0.2);color:#ef4444}
        .spot-low{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(249,115,22,0.15);color:#f97316}
        .cal-wrap{background:#111126;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:28px}
        @media(max-width:520px){
          .hero-stats{flex-direction:column;align-items:center;gap:8px}
          .filter-scroll{overflow-x:auto;padding-bottom:4px}
          .filter-scroll::-webkit-scrollbar{display:none}
          .add-event-btn span.btn-label{display:none}
        }
      `}</style>

      <div className="mesh-bg" />
      <div className="noise" />

      {/* HEADER */}
      <header style={{ position:"relative", zIndex:10, borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 24px", backdropFilter:"blur(16px)", background:"rgba(13,13,20,0.85)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 0 18px rgba(124,58,237,0.45)" }}>🧭</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-0.02em", color:"#fff" }}>NextQuest</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ display:"flex", gap:2 }}>
              {["en","ru","el","uk"].map(l => (
                <button key={l} className={`lang-btn${lang===l?" active":""}`} onClick={() => setLang(l)}>{l}</button>
              ))}
            </div>
            <button className="add-event-btn">
              <span>＋</span><span className="btn-label">{t.addEvent}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ position:"relative", zIndex:1, padding:"52px 24px 36px", textAlign:"center" }}>
        <p style={{ color:"#6b6890", fontSize:12, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>{t.subtitle}</p>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(2rem,6vw,3.8rem)", letterSpacing:"-0.03em", lineHeight:1.05, background:"linear-gradient(135deg,#fff 0%,#c4b5fd 45%,#67e8f9 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:22 }}>
          Find Your<br />Next Adventure
        </h1>
        <div className="hero-stats" style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
          <span className="stat-chip">🎉 {upcomingCount} upcoming</span>
          <span className="stat-chip">🌍 4 cities</span>
          <span className="stat-chip">🎲 6 categories</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ position:"relative", zIndex:1, padding:"0 24px 28px", maxWidth:1100, margin:"0 auto" }}>
        {/* Search */}
        <div style={{ position:"relative", marginBottom:22, maxWidth:520 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#4a4868", fontSize:15, pointerEvents:"none" }}>🔍</span>
          <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:24, marginBottom:20, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {[{k:"upcoming",label:t.upcoming},{k:"archive",label:t.archive},{k:"calendar",label:"📅 "+t.calendar}].map(({k,label}) => (
            <button key={k} className={`tab-btn${tab===k?" active":""}`} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {/* Filters (hidden on calendar) */}
        {tab !== "calendar" && (
          <>
            <div className="filter-scroll" style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
              <button className={`filter-btn${catFilter==="all"?" active":""}`} onClick={() => setCatFilter("all")}>{t.all}</button>
              {CATEGORIES.map(c => (
                <button key={c.id}
                  className={`filter-btn${catFilter===c.id?" active":""}`}
                  onClick={() => setCatFilter(catFilter===c.id?"all":c.id)}
                  style={catFilter===c.id ? {borderColor:c.color+"55",color:c.color,background:c.color+"15"} : {}}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="filter-scroll" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button className={`city-btn${cityFilter==="all"?" active":""}`} onClick={() => setCityFilter("all")}>🌍 {t.allCities}</button>
              {CITIES.map(city => (
                <button key={city} className={`city-btn${cityFilter===city?" active":""}`} onClick={() => setCityFilter(cityFilter===city?"all":city)}>📍 {city}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MAIN */}
      <main style={{ position:"relative", zIndex:1, padding:"0 24px 80px", maxWidth:1100, margin:"0 auto" }}>

        {/* CALENDAR */}
        {tab === "calendar" && (
          <div className="cal-wrap">
            <CalendarView events={EVENTS} lang={lang} onSelectEvent={setSelected} t={t} />
          </div>
        )}

        {/* LIST */}
        {tab !== "calendar" && (
          filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"70px 0", color:"#4a4868" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>🔭</div>
              <p style={{ fontSize:16, marginBottom:6 }}>{t.noEvents}</p>
              <p style={{ fontSize:13, color:"#3a3858" }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="event-grid">
              {filtered.map((event) => {
                const color = getCatColor(event.category);
                const full = event.currentParticipants >= event.maxParticipants;
                const low = !full && spotsLeft(event) <= 3;
                return (
                  <div key={event.id} className="card-hover" onClick={() => setSelected(event)}
                    style={{ background:"#111126", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, overflow:"hidden" }}>
                    {/* Cover */}
                    <div style={{ position:"relative", height:188, overflow:"hidden" }}>
                      <img src={event.cover} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.45s ease" }}
                        onMouseEnter={e => e.target.style.transform="scale(1.05)"}
                        onMouseLeave={e => e.target.style.transform="scale(1)"} />
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(17,17,38,0.95) 0%,transparent 55%)" }} />
                      {/* Category + multi-day badges */}
                      <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:5 }}>
                        <span className="pill" style={{ background:color+"20", color, border:`1px solid ${color}40` }}>{getCatLabel(event.category)}</span>
                        {event.multiDay && <span className="pill" style={{ background:"rgba(255,255,255,0.1)", color:"#d4d0ec" }}>{t.multiDay}</span>}
                        {event.status==="cancelled" && <span className="pill" style={{ background:"rgba(239,68,68,0.2)", color:"#ef4444" }}>{t.cancelled}</span>}
                      </div>
                      {/* Spot badge */}
                      {!event.isPast && (full || low) && (
                        <div style={{ position:"absolute", top:12, right:12 }}>
                          {full ? <span className="spot-full">FULL</span> : <span className="spot-low">{spotsLeft(event)} left</span>}
                        </div>
                      )}
                      {/* Date */}
                      <div style={{ position:"absolute", bottom:12, left:12 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>
                          {formatDate(event.dateStart, lang)}{event.multiDay ? ` — ${formatDate(event.dateEnd, lang)}` : ` · ${formatTime(event.dateStart)}`}
                        </span>
                      </div>
                    </div>
                    {/* Body */}
                    <div style={{ padding:16 }}>
                      <h3 style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:5, lineHeight:1.35 }}>{getTitle(event, lang)}</h3>
                      <p style={{ fontSize:12, color:"#5a567a", marginBottom:14 }}>📍 {event.city} · {event.address}</p>
                      <div style={{ marginBottom:5, display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:11, color:"#4a4868" }}>{event.currentParticipants}/{event.maxParticipants} {t.participants}</span>
                        <span style={{ fontSize:11, color:full?"#ef4444":color, fontWeight:700 }}>{pct(event)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width:`${pct(event)}%`, background:full?"#ef4444":`linear-gradient(90deg,${color}88,${color})` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>

      {/* MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* Cover */}
            <div style={{ position:"relative", height:230, borderRadius:"22px 22px 0 0", overflow:"hidden" }}>
              <img src={selected.cover} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(19,19,42,1) 0%,transparent 55%)" }} />
              <button onClick={() => setSelected(null)} style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              <div style={{ position:"absolute", bottom:14, left:20, display:"flex", gap:7 }}>
                <span className="pill" style={{ background:getCatColor(selected.category)+"22", color:getCatColor(selected.category), border:`1px solid ${getCatColor(selected.category)}44` }}>{getCatLabel(selected.category)}</span>
                {selected.multiDay && <span className="pill" style={{ background:"rgba(255,255,255,0.1)", color:"#d4d0ec" }}>{t.multiDay}</span>}
              </div>
            </div>

            <div style={{ padding:"24px 28px 30px" }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#fff", marginBottom:18, lineHeight:1.2 }}>{getTitle(selected, lang)}</h2>

              <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
                {[
                  { icon:"🗓", text:`${formatDate(selected.dateStart,lang)}${selected.multiDay?` — ${formatDate(selected.dateEnd,lang)}`:""}${!selected.multiDay?`, ${formatTime(selected.dateStart)} – ${formatTime(selected.dateEnd)}`:""}` },
                  { icon:"📍", text:`${selected.city} · ${selected.address}` },
                  { icon:"👤", text:`${t.organizer}: ${selected.organizer}` },
                ].map(({icon,text},i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", color:"#a09cbc", fontSize:13, marginBottom:i<2?9:0 }}>
                    <span style={{ fontSize:15, flexShrink:0 }}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize:14, lineHeight:1.75, color:"#8e8aac", marginBottom:22 }}>{getDesc(selected, lang)}</p>

              {/* Participants bar */}
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"14px 16px", marginBottom:22 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:13, color:"#6b6890" }}>{selected.currentParticipants}/{selected.maxParticipants} {t.participants}</span>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {spotsLeft(selected) > 0 && spotsLeft(selected) <= 3 && (
                      <span style={{ fontSize:11, color:"#f97316", fontWeight:700 }}>{spotsLeft(selected)} {t.spotsLeft}!</span>
                    )}
                    <span style={{ fontSize:13, color:getCatColor(selected.category), fontWeight:700 }}>{pct(selected)}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${pct(selected)}%`, background:pct(selected)>=100?"#ef4444":`linear-gradient(90deg,${getCatColor(selected.category)}88,${getCatColor(selected.category)})` }} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:10 }}>
                <button className={`notify-btn${subscribed[selected.id]?" done":""}`} onClick={() => setSubscribed(s => ({...s,[selected.id]:!s[selected.id]}))}>
                  {subscribed[selected.id] ? t.notified : t.notify}
                </button>
                <a href={selected.externalUrl} target="_blank" rel="noreferrer" style={{ textDecoration:"none", flex:1 }}>
                  <button className="register-btn" style={{ width:"100%" }}>{t.register}</button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

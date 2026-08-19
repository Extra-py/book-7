import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Crown,
  Feather,
  LockKeyhole,
  LogOut,
  Medal,
  Menu,
  Moon,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Sun,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
const Collector = lazy(() => import("./Collector"));
const ReaderTrail = lazy(() => import("./ReaderTrail"));
const GuildHall = lazy(() => import("./GuildHall"));
const Bestiary = lazy(() => import("./Bestiary"));
const Tavern = lazy(() => import("./Tavern"));
const Alchemy = lazy(() => import("./Alchemy"));
const HomePage = lazy(() => import("./HomePage"));
const ContractsHall = lazy(() => import("./ContractsHall"));
const AccountAccess = lazy(() => import("./AccountAccess"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const SupportCenter = lazy(() => import("./SupportCenter"));
const PortalHome = lazy(() => import("./PortalHome"));
const LearningHome = lazy(() => import("./LearningHome"));
const LearningDashboard = lazy(() => import("./LearningDashboard"));
const DigitalChamber = lazy(() => import("./DigitalChamber"));
import { AuthSession, loadSession, saveSession, updateUserProgress } from "./auth";
import SiteFooter from "./SiteFooter";

type OnboardingStep = "welcome" | "xi" | "class" | "reaction" | "guild" | "guide" | "done";
type SitePage = "portal" | "learning" | "learning-dashboard" | "calculator" | "home" | "map" | "trail" | "guild" | "collector" | "bestiary" | "tavern" | "alchemy" | "contracts";
type LocationStatus = "done" | "active" | "locked";

type StoryTask = {
  id: string;
  title: string;
  prompt: string;
  kind: "short" | "long";
};

type ChatMessage = { role: "xi" | "reader"; text: string };
type XiRegionMoment = { locationId: number; phase: "arrival" | "completion" };

type HeroClass = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bonus: string;
  icon: typeof Shield;
};

type MapLocation = {
  id: number;
  chapter: string;
  title: string;
  book: string;
  x: number;
  y: number;
  darkX: number;
  darkY: number;
  xp: number;
  cooperative?: boolean;
  description: string;
};

const heroClasses: HeroClass[] = [
  {
    id: "researcher",
    title: "Исследователь",
    subtitle: "Видит скрытые тропы",
    description: "Для тех, кто любит искать детали, сопоставлять факты и находить неожиданные смыслы.",
    bonus: "+15% опыта за исследования",
    icon: Compass,
  },
  {
    id: "chronicler",
    title: "Летописец",
    subtitle: "Хранит силу историй",
    description: "Для внимательных читателей, которым нравится анализировать героев и вести заметки.",
    bonus: "+15% опыта за чтение",
    icon: Feather,
  },
  {
    id: "diplomat",
    title: "Дипломат",
    subtitle: "Объединяет отряды",
    description: "Для командных игроков, готовых обсуждать книги, делиться идеями и помогать союзникам.",
    bonus: "+20% опыта в группе",
    icon: Users,
  },
  {
    id: "creator",
    title: "Творец",
    subtitle: "Превращает мысли в чудеса",
    description: "Для тех, кто выражает прочитанное через рисунок, текст, сцену или новый проект.",
    bonus: "+15% опыта за творчество",
    icon: WandSparkles,
  },
];

const locations: MapLocation[] = [
  {
    id: 1,
    chapter: "Глава I",
    title: "ДОЛИНА ПЕРВЫХ СТРОК",
    book: "Маленький принц",
    x: 13.123,
    y: 85.287,
    darkX: 12.566,
    darkY: 84.106,
    xp: 80,
    description: "Прочитайте первую главу и составьте карту планет, которые посетил герой.",
  },
  {
    id: 2,
    chapter: "Глава II",
    title: "ЗАМОК СПЯЩЕГО ДРАКОНА",
    book: "Хоббит",
    x: 27.064,
    y: 48.078,
    darkX: 26.149,
    darkY: 47.153,
    xp: 120,
    cooperative: true,
    description: "Вместе с напарником разберите загадки Голлума и придумайте свою.",
  },
  {
    id: 3,
    chapter: "Глава III",
    title: "ЛЕС ШЁПОТА И ТЕНЕЙ",
    book: "Чучело",
    x: 45.071,
    y: 78.396,
    darkX: 44.246,
    darkY: 77.222,
    xp: 140,
    description: "Проследите решения главной героини и объясните, какое из них было самым трудным.",
  },
  {
    id: 4,
    chapter: "Глава IV",
    title: "ОКЕАН НЕСКОНЧАЕМЫХ ИСТОРИЙ",
    book: "Два капитана",
    x: 56.177,
    y: 46.974,
    darkX: 54.993,
    darkY: 45.917,
    xp: 180,
    cooperative: true,
    description: "Соберите команду и создайте общий дневник экспедиции по мотивам книги.",
  },
  {
    id: 5,
    chapter: "Глава V",
    title: "ГОРОД ЖИВЫХ ЗЕРКАЛ",
    book: "451° по Фаренгейту",
    x: 66.789,
    y: 79.6,
    darkX: 65.577,
    darkY: 77.819,
    xp: 210,
    description: "Выберите цитату, которую важно сохранить, и защитите свой выбор.",
  },
  {
    id: 6,
    chapter: "Финал",
    title: "БИБЛИОТЕКА ВЕЧНОСТИ",
    book: "Книга на выбор",
    x: 86.173,
    y: 52.842,
    darkX: 85.611,
    darkY: 50.473,
    xp: 300,
    cooperative: true,
    description: "Представьте любимую книгу классу в любом творческом формате.",
  },
];

const ranking = [
  { place: 1, name: "София В.", xp: 1280 },
  { place: 2, name: "Марк Л.", xp: 1160 },
  { place: 3, name: "Арина К.", xp: 940 },
];

const locationTasks: Record<number, StoryTask[]> = {
  1: [
    { id: "1-observe", title: "След наблюдателя", prompt: "Какая встреча Маленького принца показалась тебе самой важной и почему?", kind: "long" },
    { id: "1-symbol", title: "Символ главы", prompt: "Выбери один предмет-символ этой части истории.", kind: "short" },
  ],
  2: [
    { id: "2-riddle", title: "Загадка Голлума", prompt: "Придумай собственную загадку в стиле Голлума и запиши ответ.", kind: "long" },
    { id: "2-courage", title: "Шаг за порог", prompt: "В какой момент Бильбо впервые проявил настоящую смелость?", kind: "long" },
  ],
  3: [
    { id: "3-choice", title: "Цена выбора", prompt: "Какое решение Лены было самым трудным? Подтверди ответ эпизодом.", kind: "long" },
    { id: "3-letter", title: "Письмо герою", prompt: "Напиши героине короткое письмо поддержки.", kind: "long" },
  ],
  4: [
    { id: "4-route", title: "Маршрут экспедиции", prompt: "Назови три качества, без которых герои не достигли бы цели.", kind: "long" },
    { id: "4-motto", title: "Девиз команды", prompt: "Придумай девиз вашей читательской экспедиции.", kind: "short" },
  ],
  5: [
    { id: "5-save", title: "Сохранить строку", prompt: "Какую мысль из книги ты сохранил бы для будущего? Объясни выбор.", kind: "long" },
    { id: "5-world", title: "Мир без книг", prompt: "Что первым потеряет общество, в котором перестали читать?", kind: "long" },
  ],
  6: [
    { id: "6-review", title: "Голос Книгочея", prompt: "Представь любимую книгу в пяти предложениях без пересказа сюжета.", kind: "long" },
    { id: "6-gift", title: "Книга в подарок", prompt: "Кому ты подарил бы эту книгу и почему?", kind: "long" },
  ],
};

const xiLocationMessages: Record<number, string> = {
  1: "Начнём с простого. Открой книгу и сделай первый шаг. Не важно, какую именно выберешь. Важно, что путь начнётся.",
  2: "Первый зал замка проверяет не скорость чтения, а внимательность. Дракон хитёр — даже во сне.",
  3: "Лес не отдаёт свои тайны просто так. Читай не только глазами, но и между строк.",
  4: "В одиночку здесь не выплыть. Доверься попутчикам: истории, рассказанные вместе, становятся сильнее.",
  5: "Здесь ты будешь не просто читателем чужих историй. Настал момент рассказать свою.",
  6: "Остался последний осколок. Это не просто ещё одно задание, а кульминация всего пути.",
};

const xiRegionDialogues: Record<number, { arrival: string[]; completion: string[] }> = {
  1: {
    arrival: [
      "Ты здесь. Наконец-то. Прости, что не встретила сразу — я не всегда чувствую, когда кто-то новый переступает границу Книжных Земель.",
      "Меня зовут Кси. Я — то немногое, что осталось от голоса Библиотеки Вечности после того, как она замолчала.",
      "Когда-то Библиотека хранила Первую Страницу — источник всех рассказанных и ещё не рассказанных историй. Потом она раскололась на шесть осколков.",
      "Я не могу собрать осколки сама. Но ты можешь. Не потому, что ты герой из пророчества, а потому, что ты здесь и готов попробовать. Это уже немало.",
    ],
    completion: [
      "Обернись на секунду. Видишь, как далеко уже эта тропинка? Ты прошёл больше, чем думаешь — не в милях, а в чём-то более важном.",
      "Первая Страница ещё далека от завершения. Но путь начался. И это уже победа.",
      "Впереди будет сложнее. Замок Спящего Дракона не так приветлив, как эта долина. Но я буду рядом.",
    ],
  },
  2: {
    arrival: [
      "Чувствуешь, как изменился воздух? Долина Первых Строк была мягкой и прощающей. Здесь всё иначе.",
      "Дракон засыпал каждый раз, когда истории вокруг него становились скучными. Твоё присутствие может его разбудить — азартом, вызовом и немного дерзостью.",
      "Не бойся ошибиться. Замок уважает тех, кто пробует, даже если не побеждает с первого раза. Готов войти?",
    ],
    completion: [
      "Ты сделал это. Не всегда гладко — я видела, как ты спотыкался. Но ты не остановился.",
      "Кажется, глубоко в подземельях Дракон завозился во сне. Может быть, ему впервые за долгое время снится что-то интересное.",
      "Впереди Лес Шёпота и Теней. Там не нужна сила или скорость — там нужно слушать и замечать скрытое.",
    ],
  },
  3: {
    arrival: [
      "Тише… Лес Шёпота и Теней не любит громких появлений. Здесь всё будто затаило дыхание.",
      "Истории здесь не лежат на поверхности. Их нужно искать между строк, в тенях и в недосказанном.",
      "Некоторые проходят лес быстро и ничего не находят. Другие идут медленно и уходят другими людьми. Иди осторожно: лес слушает.",
    ],
    completion: [
      "Ты слышал это, правда? Не только слова на странице, а то, что скрывается между строк и в паузах.",
      "Лес не каждому открывается, но тебе он что-то прошептал.",
      "Впереди Океан Нескончаемых Историй. Возьми с собой то, что нашёл здесь, в тишине. Оно ещё пригодится.",
    ],
  },
  4: {
    arrival: [
      "Чувствуешь солёный ветер? Здесь истории бушуют, сталкиваются и переплетаются, как волны во время шторма.",
      "В одиночку здесь не выплыть. Тебе понадобятся гильдия, попутчики и те, кого ты встретил по пути.",
      "Океан учит важному правилу: истории, рассказанные вместе, становятся сильнее. Отправляемся?",
    ],
    completion: [
      "Шторм утих. Ты не пытался выплыть в одиночку: слушал других и помогал.",
      "Океан Нескончаемых Историй запомнит это. Он редко бывает добр к тем, кто приходит только за собой.",
      "Впереди Город Живых Зеркал — место, где ты сможешь остановиться и посмотреть, кем стал за это путешествие.",
    ],
  },
  5: {
    arrival: [
      "Осторожно. Здесь зеркала — не просто украшение.",
      "Каждое зеркало показывает не только лицо, но и то, что ты создаёшь, чувствуешь и хочешь сказать миру.",
      "Здесь ты будешь не просто читателем чужих историй. Настал момент рассказать свою. Готов посмотреть в зеркало?",
    ],
    completion: [
      "Посмотри вокруг. Каждое зеркало теперь хранит частичку твоих слов, мыслей и искренности.",
      "Не каждый решается по-настоящему показать себя. А ты решился — и не один раз.",
      "Осталась Библиотека Вечности. Там, где всё началось и где сейчас должно завершиться. Ты почти у цели.",
    ],
  },
  6: {
    arrival: [
      "Вот мы и здесь. Я не была здесь по-настоящему долгое время — только голосом, эхом и тенью.",
      "Ты прошёл весь путь и собрал пять осколков Первой Страницы. Последний ждёт внутри этих стен.",
      "Это кульминация всего, через что ты прошёл. Я немного волнуюсь: впервые за долгое время у меня есть надежда.",
    ],
    completion: [
      "Она собрана. Все шесть осколков вместе. Впервые за долгое время Библиотека Вечности дышит по-настоящему.",
      "Теперь я знаю, кем ты стал. Ты прошёл через Замок, Лес, Океан и нашёл себя в Городе Зеркал.",
      "Истории никогда по-настоящему не заканчиваются. Первая Страница снова цела — значит, за горизонтом уже начинается следующая.",
      "Спасибо, что был частью этой истории.",
    ],
  },
};

function App() {
  const [authSession] = useState<AuthSession | null>(() => loadSession());
  const [authView, setAuthView] = useState<"login" | "register" | null>(null);
  const userStoragePrefix = authSession?.role === "user" ? `edustories_${authSession.username}_` : "edustories_";
  const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("edustories_theme") === "light" ? "light" : "dark"));
  const [page, setPage] = useState<SitePage>(() => {
    const destination = sessionStorage.getItem("edustories_after_auth") as SitePage | null;
    if (destination && loadSession()) {
      sessionStorage.removeItem("edustories_after_auth");
      return destination;
    }
    return "portal";
  });
  const [readerMenuOpen, setReaderMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [step, setStep] = useState<OnboardingStep>(() => localStorage.getItem(`${userStoragePrefix}onboarding_complete`) === "true" ? "done" : "welcome");
  const [selectedClass, setSelectedClass] = useState<HeroClass | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(() => authSession ? locations[0] : null);
  const [guestMapNotice, setGuestMapNotice] = useState(false);
  const [completed, setCompleted] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(`${userStoragePrefix}completed`) || "[]"); } catch { return []; }
  });
  const [xp, setXp] = useState(() => Number(localStorage.getItem(`${userStoragePrefix}xp`)) || 240);
  const [guideOpen, setGuideOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(`${userStoragePrefix}answers`) || "{}"); } catch { return {}; }
  });
  const [chats, setChats] = useState<Record<number, ChatMessage[]>>(() => {
    try { return JSON.parse(localStorage.getItem(`${userStoragePrefix}xi_chats`) || "{}"); } catch { return {}; }
  });
  const [chatDraft, setChatDraft] = useState("");
  const [xiRegionMoment, setXiRegionMoment] = useState<XiRegionMoment | null>(null);

  const activeIndex = completed.length;
  const level = Math.floor(xp / 300) + 1;
  const levelProgress = ((xp % 300) / 300) * 100;

  useEffect(() => { localStorage.setItem(`${userStoragePrefix}answers`, JSON.stringify(answers)); }, [answers, userStoragePrefix]);
  useEffect(() => { localStorage.setItem(`${userStoragePrefix}xi_chats`, JSON.stringify(chats)); }, [chats, userStoragePrefix]);
  useEffect(() => { localStorage.setItem(`${userStoragePrefix}completed`, JSON.stringify(completed)); }, [completed, userStoragePrefix]);
  useEffect(() => { localStorage.setItem(`${userStoragePrefix}xp`, String(xp)); }, [userStoragePrefix, xp]);
  useEffect(() => {
    if (authSession?.role !== "user") return;
    updateUserProgress(authSession.username, {
      xp,
      level,
      completedMaps: completed.length,
      answersCount: Object.values(answers).filter((answer) => answer.trim()).length,
    });
  }, [answers, authSession, completed.length, level, xp]);
  useEffect(() => {
    localStorage.setItem("edustories_theme", theme);
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#030b18" : "#f6f1e8");
  }, [theme]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const locationStatuses = useMemo<LocationStatus[]>(
    () => locations.map((_, index) => (index < activeIndex ? "done" : index === activeIndex ? "active" : "locked")),
    [activeIndex],
  );

  const completeTask = (location: MapLocation) => {
    if (location.id !== activeIndex + 1 || completed.includes(location.id)) return;
    setCompleted((items) => [...items, location.id]);
    setXp((value) => value + location.xp);
    setXiRegionMoment({ locationId: location.id, phase: "completion" });
  };

  const sendChat = () => {
    const text = chatDraft.trim();
    if (!text || !selectedLocation) return;
    const reply = text.includes("?")
      ? "Хороший вопрос. Вернись к поступкам героя: что изменилось до и после этого эпизода? Там спрятана подсказка."
      : "Я услышала твою мысль. Сохрани её в ответе к заданию — такие наблюдения возвращают Библиотеке память.";
    setChats((current) => ({
      ...current,
      [selectedLocation.id]: [...(current[selectedLocation.id] || []), { role: "reader", text }, { role: "xi", text: reply }],
    }));
    setChatDraft("");
  };

  const navigate = (nextPage: SitePage, anchor?: string) => {
    if ((nextPage === "trail" || nextPage === "collector") && !authSession) {
      setAuthView("login");
      setReaderMenuOpen(false);
      setMobileMenuOpen(false);
      return;
    }
    setPage(nextPage);
    setReaderMenuOpen(false);
    setMobileMenuOpen(false);
    requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const openJourney = () => {
    setStep("welcome");
    setGuestMapNotice(false);
    setSelectedLocation(authSession ? locations[0] : null);
    setPage("map");
    setReaderMenuOpen(false);
    setMobileMenuOpen(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const chooseMapLocation = (location: MapLocation) => {
    if (!authSession) {
      setSelectedLocation(null);
      setGuestMapNotice(true);
      requestAnimationFrame(() => document.getElementById("guest-map-gate")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setGuestMapNotice(false);
    setSelectedLocation(location);
    setXiRegionMoment({ locationId: location.id, phase: "arrival" });
  };

  const closeXiRegionMoment = () => {
    if (xiRegionMoment?.phase === "completion") {
      const next = locations[xiRegionMoment.locationId];
      if (next) setSelectedLocation(next);
    }
    setXiRegionMoment(null);
  };

  const advanceOnboarding = () => {
    const next: Record<Exclude<OnboardingStep, "done">, OnboardingStep> = {
      welcome: "xi",
      xi: "class",
      class: "reaction",
      reaction: "guild",
      guild: "guide",
      guide: "done",
    };
    if (step !== "done") {
      const nextStep = next[step];
      setStep(nextStep);
      if (nextStep === "done") localStorage.setItem(`${userStoragePrefix}onboarding_complete`, "true");
    }
  };

  const openGuildFromOnboarding = () => {
    localStorage.setItem(`${userStoragePrefix}onboarding_complete`, "true");
    setStep("done");
    setPage("guild");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const logout = () => {
    saveSession(null);
    window.location.reload();
  };

  const openLearningDashboard = () => {
    if (!authSession) {
      sessionStorage.setItem("edustories_after_auth", "learning-dashboard");
      setAuthView("login");
      return;
    }
    navigate("learning-dashboard");
  };

  const requireLearningAuth = () => {
    sessionStorage.setItem("edustories_after_auth", "learning");
    setAuthView("login");
  };

  if (authSession?.role === "admin") {
    return (
      <main className="app-shell" data-theme={theme}>
        <Suspense fallback={<PageLoader />}><AdminDashboard session={authSession} onLogout={logout} /></Suspense>
        <SiteFooter tone="admin" admin />
        <button className="standalone-theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label="Переключить тему">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>
        </button>
      </main>
    );
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {!(["portal", "learning", "learning-dashboard", "calculator"] as SitePage[]).includes(page) && <>
      <header className="topbar">
        <button className="brand brand-button" onClick={() => navigate("portal")} aria-label="EduStories — единая главная">
          <span className="brand-mark brand-logo-mark"><img src={`${import.meta.env.BASE_URL}brand/edustories-logo.webp`} alt="" width="44" height="48" /></span>
          <span><b>EduStories</b><small>Знание — это оружие</small></span>
        </button>
        <nav className="main-nav" aria-label="Главная навигация">
          <button className={`nav-link ${page === "home" ? "active" : ""}`} onClick={() => navigate("home")}>Главная</button>
          <button className="nav-link" onClick={() => navigate("learning")}>Обучение</button>
          <button className={`nav-link ${page === "contracts" ? "active" : ""}`} onClick={() => navigate("contracts")}>Контракты</button>
          <button className={`nav-link ${page === "bestiary" ? "active" : ""}`} onClick={() => navigate("bestiary")}>Бестиарий</button>
          <button className={`nav-link ${page === "alchemy" ? "active" : ""}`} onClick={() => navigate("alchemy")}>Алхимия</button>
          <button className={`nav-link ${page === "tavern" ? "active" : ""}`} onClick={() => navigate("tavern")}>Таверна</button>
          <div
            className={`reader-menu ${readerMenuOpen ? "open" : ""}`}
            onMouseEnter={() => setReaderMenuOpen(true)}
            onMouseLeave={() => setReaderMenuOpen(false)}
          >
            <button
              className={`nav-link reader-trigger ${(["trail", "guild", "collector"] as SitePage[]).includes(page) ? "active" : ""}`}
              onClick={() => setReaderMenuOpen((open) => !open)}
              aria-expanded={readerMenuOpen}
            >
              Книгочей <ChevronDown size={13} />
            </button>
            <div className="reader-dropdown">
              <button onClick={openJourney}>
                <Compass size={16} /><span><b>Путь героя</b><small>Вернуться к карте историй</small></span>
              </button>
              <button onClick={() => navigate("guild")}>
                <Users size={16} /><span><b>Гильдии</b><small>Найти свой Круг Историй</small></span>
              </button>
              <button onClick={() => navigate("collector")}>
                {authSession ? <Medal size={16} /> : <LockKeyhole size={16} />}
                <span><b>Коллекционер</b><small>{authSession ? "Карточки из пройденных историй" : "Доступно после входа"}</small></span>
              </button>
            </div>
          </div>
        </nav>
        <button
          className="theme-toggle"
          onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
        >
          <span className={theme === "light" ? "active" : ""}><Sun size={16} /></span>
          <span className={theme === "dark" ? "active" : ""}><Moon size={16} /></span>
          <small>{theme === "dark" ? "Тёмная тема" : "Светлая тема"}</small>
        </button>
        {authSession ? (
          <>
            <button className="profile-chip" onClick={() => navigate("trail")} aria-label="Открыть профиль читателя">
              <div className="level-badge">{level}</div>
              <div><b>{authSession.displayName}</b><span>{xp} XP · Уровень {level}</span></div>
            </button>
            <button className="logout-button" onClick={logout} aria-label="Выйти из личного кабинета"><LogOut size={17} /></button>
          </>
        ) : (
          <div className="guest-auth-actions">
            <button onClick={() => setAuthView("login")}>Войти</button>
            <button onClick={() => setAuthView("register")}>Регистрация</button>
          </div>
        )}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.nav
              id="mobile-navigation"
              className="mobile-navigation"
              aria-label="Мобильная навигация"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(event) => event.stopPropagation()}
            >
              <header>
                <span><BookOpen size={18} /> Меню EduStories</span>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Закрыть меню"><X size={20} /></button>
              </header>
              <div className="mobile-nav-list">
                <button onClick={() => navigate("portal")}><span>Единая главная</span><ChevronRight size={17} /></button>
                <button className={page === "home" ? "active" : ""} onClick={() => navigate("home")}><span>Главная</span><ChevronRight size={17} /></button>
                <button onClick={() => navigate("learning")}><span>Обучение</span><ChevronRight size={17} /></button>
                <button className={page === "contracts" ? "active" : ""} onClick={() => navigate("contracts")}><span>Контракты</span><ChevronRight size={17} /></button>
                <button className={page === "bestiary" ? "active" : ""} onClick={() => navigate("bestiary")}><span>Бестиарий</span><ChevronRight size={17} /></button>
                <button className={page === "alchemy" ? "active" : ""} onClick={() => navigate("alchemy")}><span>Алхимия</span><ChevronRight size={17} /></button>
                <button className={page === "tavern" ? "active" : ""} onClick={() => navigate("tavern")}><span>Таверна</span><ChevronRight size={17} /></button>
              </div>
              <div className="mobile-reader-links">
                <p><Sparkles size={13} /> Книгочей</p>
                <button className={page === "map" ? "active" : ""} onClick={openJourney}><Compass size={18} /><span><b>Путь героя</b><small>Карта историй и задания</small></span></button>
                <button className={page === "guild" ? "active" : ""} onClick={() => navigate("guild")}><Users size={18} /><span><b>Гильдии</b><small>Круги читателей</small></span></button>
                <button className={page === "collector" ? "active" : ""} onClick={() => navigate("collector")}>{authSession ? <Medal size={18} /> : <LockKeyhole size={18} />}<span><b>Коллекционер</b><small>{authSession ? "Полученные карточки" : "Требуется вход"}</small></span></button>
              </div>
              <div className="mobile-menu-footer">
                <button className="mobile-theme-switch" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                  <span>{theme === "dark" ? "Тёмная тема" : "Светлая тема"}</span>
                </button>
                {authSession ? (
                  <>
                    <button onClick={() => navigate("trail")}><Crown size={18} /><span>Личный кабинет</span></button>
                    <button onClick={logout}><LogOut size={18} /><span>Выйти</span></button>
                  </>
                ) : (
                  <div className="mobile-auth-actions">
                    <button onClick={() => { setMobileMenuOpen(false); setAuthView("login"); }}>Войти</button>
                    <button onClick={() => { setMobileMenuOpen(false); setAuthView("register"); }}>Регистрация</button>
                  </div>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
      </>}

      {page === "portal" ? (
        <Suspense fallback={<PageLoader />}>
          <PortalHome
            isAuthenticated={Boolean(authSession)}
            displayName={authSession?.displayName}
            onOpenLibrary={() => navigate("home")}
            onOpenLearning={() => navigate("learning")}
            onLogin={() => setAuthView("login")}
            onRegister={() => setAuthView("register")}
            onOpenProfile={() => navigate("trail")}
            theme={theme}
            onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          />
        </Suspense>
      ) : page === "learning" ? (
        <Suspense fallback={<PageLoader />}>
          <LearningHome
            isAuthenticated={Boolean(authSession)}
            username={authSession?.username}
            displayName={authSession?.displayName}
            onOpenPortal={() => navigate("portal")}
            onOpenLibrary={() => navigate("home")}
            onOpenDashboard={openLearningDashboard}
            onOpenCalculator={() => navigate("calculator")}
            onRequireAuth={requireLearningAuth}
          />
        </Suspense>
      ) : page === "calculator" ? (
        <Suspense fallback={<PageLoader />}>
          <DigitalChamber
            isAuthenticated={Boolean(authSession)}
            username={authSession?.username}
            onBack={() => navigate("learning")}
            onRequireAuth={requireLearningAuth}
            onOpenDashboard={openLearningDashboard}
          />
        </Suspense>
      ) : page === "learning-dashboard" && authSession ? (
        <Suspense fallback={<PageLoader />}>
          <LearningDashboard
            username={authSession.username}
            displayName={authSession.displayName}
            onOpenHome={() => navigate("learning")}
            onOpenPortal={() => navigate("portal")}
            onOpenLibrary={() => navigate("home")}
            onLogout={logout}
          />
        </Suspense>
      ) : page === "home" ? (
        <Suspense fallback={<PageLoader />}>
          <HomePage
            isAuthenticated={Boolean(authSession)}
            onOpenJourney={openJourney}
            onOpenGuild={() => navigate("guild")}
            onOpenTavern={() => navigate("tavern")}
            onOpenAlchemy={() => navigate("alchemy")}
            onOpenContracts={() => navigate("contracts")}
            onOpenBestiary={() => navigate("bestiary")}
            onOpenProfile={() => navigate("trail")}
            onLogin={() => setAuthView("login")}
            onRegister={() => setAuthView("register")}
          />
        </Suspense>
      ) : page === "map" ? (
      <>
      <section className="map-layout" id="map">
        <div className="map-heading">
          <div>
            <span className="eyebrow"><Sparkles size={13} /> Атлас читающего мира</span>
            <h1>Карта историй</h1>
            <p>Каждая книга открывает новую часть пути.</p>
          </div>
          <button className="guide-button" onClick={() => setGuideOpen(true)}><ScrollText size={17} /> Как играть</button>
        </div>

        <div className="map-viewport">
        <div className="map-stage art-map">
          <img
            className="map-art-image"
            src={`${import.meta.env.BASE_URL}${theme === "light" ? "map-light.webp" : "map-dark.webp"}`}
            alt="Иллюстрированная карта путешествия по шести книжным регионам"
            width="1700"
            height="530"
            loading="eager"
            draggable="false"
          />
          {locations.map((location, index) => {
            const status = locationStatuses[index];
            const pointX = theme === "dark" ? location.darkX : location.x;
            const pointY = theme === "dark" ? location.darkY : location.y;
            return (
              <button
                key={location.id}
                className={`map-node ${status} ${selectedLocation?.id === location.id ? "selected" : ""}`}
                style={{ left: `${pointX}%`, top: `${pointY}%` }}
                onClick={() => chooseMapLocation(location)}
                aria-label={`${location.title}, ${!authSession ? "нужно войти" : status === "locked" ? "закрыто" : "доступно"}`}
              >
                <span className="node-ring">
                  {status === "done" ? <Check size={19} /> : status === "locked" ? <LockKeyhole size={17} /> : <BookOpen size={20} />}
                </span>
                <span className="node-copy"><b>{location.title}</b><small>{location.book}</small></span>
              </button>
            );
          })}
        </div>
        </div>
        <p className="map-swipe-hint"><Compass size={13} /> На телефоне проведи по карте влево или вправо</p>

        {guestMapNotice && !authSession && (
          <section className="guest-map-gate" id="guest-map-gate">
            <img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси напоминает о входе" loading="lazy" decoding="async" />
            <div>
              <span><Sparkles size={14} /> Кси говорит</span>
              <h2>Эта точка хранит твоё задание</h2>
              <p>Я покажу дорогу каждому, но сохранять ответы, получать опыт и открывать новые точки Библиотека может только для вошедшего Книгочея.</p>
              <div>
                <button className="primary-button" onClick={() => setAuthView("login")}><LockKeyhole size={16} /> Войти и продолжить</button>
                <button onClick={() => setAuthView("register")}>Создать аккаунт</button>
              </div>
            </div>
          </section>
        )}

        {selectedLocation && (
          <div className="journey-workspace">
            <section className="assignment-panel">
              <div className="assignment-heading">
                <div>
                  <span className="quest-chapter">{selectedLocation.chapter} · {selectedLocation.cooperative ? "Вместе" : "Самостоятельно"}</span>
                  <h2>{selectedLocation.title}</h2>
                  <p><BookOpen size={15} /> {selectedLocation.book}</p>
                </div>
                <strong>+{selectedLocation.xp} XP</strong>
              </div>
              <p className="location-brief">{selectedLocation.description}</p>
              <div className="task-answer-list">
                {locationTasks[selectedLocation.id].map((task, index) => (
                  <label className="task-answer-card" key={task.id}>
                    <span><i>{String(index + 1).padStart(2, "0")}</i><b>{task.title}</b></span>
                    <p>{task.prompt}</p>
                    {task.kind === "long" ? (
                      <textarea
                        rows={4}
                        value={answers[task.id] || ""}
                        onChange={(event) => setAnswers((current) => ({ ...current, [task.id]: event.target.value }))}
                        placeholder="Запиши свой ответ здесь…"
                      />
                    ) : (
                      <input
                        value={answers[task.id] || ""}
                        onChange={(event) => setAnswers((current) => ({ ...current, [task.id]: event.target.value }))}
                        placeholder="Короткий ответ…"
                      />
                    )}
                    <small>{answers[task.id]?.trim() ? <><Check size={12} /> Ответ сохранён</> : "Сохраняется автоматически"}</small>
                  </label>
                ))}
              </div>
              <button
                className="primary-button finish-location"
                disabled={selectedLocation.id !== activeIndex + 1 || locationTasks[selectedLocation.id].some((task) => !answers[task.id]?.trim())}
                onClick={() => completeTask(selectedLocation)}
              >
                {completed.includes(selectedLocation.id) ? "Точка пройдена" : selectedLocation.id !== activeIndex + 1 ? "Сначала пройди предыдущую точку" : "Завершить точку и получить карточку"}
              </button>
            </section>

            <aside className="xi-chat">
              <div className="xi-chat-head">
                <img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси — Голос Библиотеки" loading="lazy" decoding="async" />
                <div><span>Твой проводник</span><h3>Кси</h3><small><i /> На связи</small></div>
              </div>
              <div className="xi-chat-messages">
                <div className="chat-message xi">{xiLocationMessages[selectedLocation.id]}</div>
                {(chats[selectedLocation.id] || []).map((message, index) => (
                  <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>
                ))}
              </div>
              <div className="xi-chat-compose">
                <textarea
                  rows={2}
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendChat(); } }}
                  placeholder="Спроси Кси или поделись мыслью…"
                />
                <button onClick={sendChat} disabled={!chatDraft.trim()}>Отправить</button>
              </div>
            </aside>
          </div>
        )}
      </section>

      <AnimatePresence>
        {xiRegionMoment && (
          <XiRegionDialogue
            key={`${xiRegionMoment.locationId}-${xiRegionMoment.phase}`}
            location={locations[xiRegionMoment.locationId - 1]}
            phase={xiRegionMoment.phase}
            lines={xiRegionDialogues[xiRegionMoment.locationId][xiRegionMoment.phase]}
            onComplete={closeXiRegionMoment}
          />
        )}
      </AnimatePresence>

      <footer className="statusbar" id="rating">
        <div className="progress-block">
          <span>Путь до уровня {level + 1}</span>
          <div className="progress-track"><i style={{ width: `${levelProgress}%` }} /></div>
          <b>{xp % 300} / 300 XP</b>
        </div>
        <div className="rank-mini">
          <Medal size={18} />
          <span>Ваше место</span>
          <b>12</b>
        </div>
        <div className="leaders">
          {ranking.map((item) => <span key={item.place}><i>{item.place}</i>{item.name}<b>{item.xp}</b></span>)}
        </div>
      </footer>

      </>
      ) : (
        <Suspense fallback={<PageLoader />}>
          {page === "bestiary" ? (
            <Bestiary onOpenMap={() => navigate("map")} />
          ) : page === "contracts" ? (
            <ContractsHall
              theme={theme}
              storageKey={`${userStoragePrefix}contracts`}
              isAuthenticated={Boolean(authSession)}
              onRequireAuth={() => setAuthView("login")}
              onOpenJourney={() => navigate("map")}
            />
          ) : page === "alchemy" ? (
            <Alchemy theme={theme} storageKey={`${userStoragePrefix}alchemy`} onOpenTavern={() => navigate("tavern")} />
          ) : page === "tavern" ? (
            <Tavern
              theme={theme}
              level={level}
              isAuthenticated={Boolean(authSession)}
              onRequireAuth={() => setAuthView("login")}
              onOpenGuild={() => navigate("guild")}
              onOpenTrail={() => navigate("trail")}
            />
          ) : page === "trail" ? (
            <ReaderTrail
              xp={xp}
              level={level}
              completedMaps={completed.length}
              displayName={authSession?.displayName || "Гость Книгочей"}
              session={authSession!}
              onOpenMap={() => navigate("map")}
              theme={theme}
            />
          ) : page === "guild" ? (
            <GuildHall level={level} xp={xp} onOpenMap={() => navigate("map")} />
          ) : (
            <Collector completedLocations={completed} answers={answers} onOpenMap={() => navigate("map")} />
          )}
        </Suspense>
      )}

      <AnimatePresence>
        {page === "map" && step !== "done" && (
          <Onboarding
            step={step}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            onNext={advanceOnboarding}
            onOpenGuild={openGuildFromOnboarding}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}
      </AnimatePresence>
      {(["learning", "learning-dashboard", "calculator"] as SitePage[]).includes(page) && (
        <button className="standalone-theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label="Переключить тему">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>
        </button>
      )}
      <SiteFooter
        tone={
          page === "portal" ? "portal" :
          (["learning", "learning-dashboard", "calculator"] as SitePage[]).includes(page) ? "academy" :
          page === "tavern" ? "tavern" :
          page === "alchemy" ? "alchemy" :
          (["trail", "guild", "collector", "bestiary", "contracts"] as SitePage[]).includes(page) ? "library" :
          "theme"
        }
        onPortal={() => navigate("portal")}
        onLibrary={() => navigate("home")}
        onLearning={() => navigate("learning")}
        onMap={openJourney}
        onGuilds={() => navigate("guild")}
        onTavern={() => navigate("tavern")}
        onBestiary={() => navigate("bestiary")}
        onCollector={() => navigate("collector")}
      />
      <Suspense fallback={null}>
        <SupportCenter
          session={authSession}
          accent={(["learning", "learning-dashboard", "calculator"] as SitePage[]).includes(page) ? "learning" : "default"}
        />
      </Suspense>
      <AnimatePresence>
        {authView && (
          <Suspense fallback={<PageLoader />}>
            <AccountAccess
              key={authView}
              initialMode={authView}
              theme={theme}
              onClose={() => setAuthView(null)}
              onAuthenticated={() => window.location.reload()}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </main>
  );
}

function PageLoader() {
  return (
    <section className="page-loader" aria-live="polite">
      <span><BookOpen size={24} /></span>
      <p>Открываем новую страницу…</p>
    </section>
  );
}

function Onboarding({
  step,
  selectedClass,
  setSelectedClass,
  onNext,
  onOpenGuild,
}: {
  step: Exclude<OnboardingStep, "done">;
  selectedClass: HeroClass | null;
  setSelectedClass: (item: HeroClass) => void;
  onNext: () => void;
  onOpenGuild: () => void;
}) {
  return (
    <motion.div className="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="onboarding-stars" />
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.section className="scroll scroll-welcome" key="welcome" initial={{ scaleY: 0.18, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
            <div className="scroll-rod top" />
            <div className="scroll-content">
              <span className="scroll-emblem"><BookOpen size={31} /></span>
              <span className="eyebrow dark">Добро пожаловать, читатель</span>
              <h2>Твоя история<br />начинается здесь</h2>
              <div className="ornament">✦</div>
              <p>Перед тобой мир, созданный из книг. Проходи по точкам карты, читай, выполняй задания и поднимайся в рейтинге EduStories.</p>
              <p className="signature">«Каждая прочитанная страница — новый шаг на карте»</p>
              <button className="primary-button" onClick={onNext}>Войти в мир историй <ArrowRight size={17} /></button>
            </div>
            <div className="scroll-rod bottom" />
          </motion.section>
        )}

        {step === "xi" && (
          <XiDialogue
            key="xi-intro"
            lines={[
              "…Кто здесь? Кто-то открыл дверь?",
              "О! Настоящий читатель! Я не чувствовала такого присутствия целую вечность.",
              "Меня зовут Кси. Когда-то я была Голосом Библиотеки Вечности — места, где хранятся души всех историй, которые когда-либо были рассказаны.",
              "Но случилась Тишина. Первая Страница — источник всех историй — исчезла. И без неё Библиотека медленно забывает сама себя.",
              "Книжные Земли раскинулись вокруг неё: восемь регионов, каждый — отражение одного из жанров человеческой души. Все они гаснут.",
              "Мне нужен не просто читатель. Мне нужен Книгочей — тот, кто пройдёт через каждый регион и вернёт Первую Страницу. Но прежде скажи — кем ты хочешь идти по этому пути?",
            ]}
            onComplete={onNext}
          />
        )}

        {step === "class" && (
          <motion.section className="class-panel" key="class" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
            <span className="eyebrow"><Crown size={13} /> Первый выбор</span>
            <h2>Выбери свой класс</h2>
            <p className="panel-lead">Класс определит твою сильную сторону. Изменить его можно позже в профиле.</p>
            <div className="class-grid">
              {heroClasses.map((item) => {
                const Icon = item.icon;
                const active = selectedClass?.id === item.id;
                return (
                  <button className={`class-card ${active ? "active" : ""}`} key={item.id} onClick={() => setSelectedClass(item)}>
                    <span className="class-icon"><Icon size={27} /></span>
                    <h3>{item.title}</h3>
                    <small>{item.subtitle}</small>
                    <p>{item.description}</p>
                    <b><Sparkles size={12} /> {item.bonus}</b>
                    <i>{active && <Check size={14} />}</i>
                  </button>
                );
              })}
            </div>
            <button className="primary-button" disabled={!selectedClass} onClick={onNext}>Подтвердить выбор <ChevronRight size={17} /></button>
          </motion.section>
        )}

        {step === "reaction" && selectedClass && (
          <XiDialogue
            key="xi-reaction"
            lines={[
              ({
                researcher: "Исследователь… Твои глаза заметят тропы, скрытые между строк. Не бойся задавать истории неудобные вопросы.",
                chronicler: "Летописец… Ты услышишь то, что другие пропустят, и сохранишь голоса исчезающих миров.",
                diplomat: "Дипломат… Рядом с тобой отдельные голоса станут хором. Библиотеке давно не хватало такого дара.",
                creator: "Творец… Ты не только найдёшь истории, но и продолжишь их. Возможно, однажды Библиотека сохранит и твою.",
              } as Record<string, string>)[selectedClass.id],
              "Выбор сделан. Теперь — самое важное решение.",
            ]}
            onComplete={onNext}
          />
        )}

        {step === "guild" && (
          <motion.section className="xi-story-panel guild-choice" key="guild" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
            <div className="xi-story-image"><img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси" decoding="async" /></div>
            <div className="xi-story-copy">
              <span className="eyebrow"><Users size={13} /> Круг Историй</span>
              <h2>Пойдём вместе?</h2>
              <p>Ты можешь идти один. Многие Книгочеи пытались. Но Библиотека Вечности помнит: сильнее всего звучат истории, рассказанные вместе.</p>
              <p>Хочешь найти свой Круг Историй — Гильдию?</p>
              <div className="guild-actions">
                <button className="primary-button" onClick={onOpenGuild}><Users size={16} /> Да, найти Гильдию</button>
                <button className="secondary-story-button" onClick={onNext}>Пока я пойду один</button>
              </div>
              <small>Кси: «Как скажешь. Дверь Гильдий всегда открыта, если передумаешь».</small>
            </div>
          </motion.section>
        )}

        {step === "guide" && (
          <motion.section className="scroll guide-scroll" key="guide" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
            <div className="scroll-rod top" />
            <div className="scroll-content">
              <span className="eyebrow dark">Путевой свиток</span>
              <h2>Как пользоваться картой</h2>
              <div className="guide-list">
                <GuideItem number="01" icon={BookOpen} title="Открывай точки" text="Начни с подсвеченной точки и прочитай указанную книгу или главу." />
                <GuideItem number="02" icon={Swords} title="Записывай ответы" text="Ответы сохраняются автоматически. Кси поможет вопросом, если мысль ускользает." />
                <GuideItem number="03" icon={Medal} title="Собирай карточки" text="Заверши задания точки, получи XP и открой новую карточку в Коллекционере." />
              </div>
              <div className="chosen-class"><span>Твой класс</span><b>{selectedClass?.title}</b><small>{selectedClass?.bonus}</small></div>
              <button className="primary-button" onClick={onNext}>Начать путешествие <Compass size={17} /></button>
            </div>
            <div className="scroll-rod bottom" />
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function XiDialogue({ lines, onComplete }: { lines: string[]; onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const isLast = index === lines.length - 1;
  return (
    <motion.section className="xi-story-panel" initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
      <div className="xi-story-image">
        <img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси — Голос Библиотеки Вечности" decoding="async" />
        <span>Кси</span>
      </div>
      <div className="xi-story-copy">
        <span className="eyebrow"><Sparkles size={13} /> Голос Библиотеки</span>
        <h2>{index === 0 ? "Кто открыл дверь?" : "Кси говорит"}</h2>
        <AnimatePresence mode="wait">
          <motion.p key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>«{lines[index]}»</motion.p>
        </AnimatePresence>
        <div className="dialogue-progress">{lines.map((_, dot) => <i className={dot <= index ? "active" : ""} key={dot} />)}</div>
        <button className="primary-button" onClick={() => isLast ? onComplete() : setIndex((value) => value + 1)}>
          {isLast ? (lines.length > 2 ? "Выбрать героя" : "Продолжить") : "Слушать дальше"} <ChevronRight size={16} />
        </button>
      </div>
    </motion.section>
  );
}

function XiRegionDialogue({
  location,
  phase,
  lines,
  onComplete,
}: {
  location: MapLocation;
  phase: "arrival" | "completion";
  lines: string[];
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const isLast = index === lines.length - 1;

  return (
    <motion.div
      className="xi-region-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Кси: ${phase === "arrival" ? "начало" : "завершение"} региона ${location.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="xi-region-dialogue"
        initial={{ y: 26, scale: .96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: .97, opacity: 0 }}
      >
        <div className="xi-region-visual">
          <img
            src={`${import.meta.env.BASE_URL}regions/xi-region-${location.id}.webp`}
            alt={`Кси в регионе «${location.title}»`}
            width="760"
            height="1140"
            decoding="async"
          />
          <div><span>Кси</span><small>Голос Библиотеки Вечности</small></div>
        </div>
        <div className="xi-region-copy">
          <span className="eyebrow"><Sparkles size={13} /> {phase === "arrival" ? "Начало региона" : "Регион завершён"}</span>
          <p className="xi-region-chapter">{location.chapter}</p>
          <h2>{location.title}</h2>
          <AnimatePresence mode="wait">
            <motion.blockquote key={index} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              «{lines[index]}»
            </motion.blockquote>
          </AnimatePresence>
          <div className="dialogue-progress">{lines.map((_, dot) => <i className={dot <= index ? "active" : ""} key={dot} />)}</div>
          <button className="primary-button" onClick={() => isLast ? onComplete() : setIndex((value) => value + 1)}>
            {isLast ? (phase === "arrival" ? "Открыть задания" : location.id === locations.length ? "Сохранить историю" : "Идти дальше") : "Слушать дальше"}
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

function GuideItem({ number, icon: Icon, title, text }: { number: string; icon: typeof BookOpen; title: string; text: string }) {
  return <div className="guide-item"><span>{number}</span><i><Icon size={20} /></i><div><b>{title}</b><p>{text}</p></div></div>;
}

function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="quick-guide" initial={{ y: 20, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <span className="eyebrow"><ScrollText size={13} /> Памятка</span>
        <h2>Как устроен путь</h2>
        <GuideItem number="01" icon={BookOpen} title="Читайте" text="В каждой точке указана книга и цель чтения." />
        <GuideItem number="02" icon={Users} title="Действуйте" text="Задания бывают одиночными и командными." />
        <GuideItem number="03" icon={Medal} title="Растите" text="Получайте XP, открывайте главы и поднимайтесь в рейтинге." />
      </motion.div>
    </motion.div>
  );
}

export default App;

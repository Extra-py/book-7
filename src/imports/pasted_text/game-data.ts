import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Lock, Swords, Scroll, Check, Sparkles } from "lucide-react";

/* ────────────────────────── ТИПЫ И ДАННЫЕ ────────────────────────── */

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  artifact?: string;
}

interface Location {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  chapter: string;
  symbol: string;
  description: string;
  lore: string;
  danger: string;
  quests: Quest[];
}

type Status = "completed" | "current" | "locked";

interface HeroClass {
  id: string;
  icon: string;
  name: string;
  title: string;
  bonusLocations: string[]; // локации, где класс получает бонус
  bonusText: string;
}

const BONUS_MULTIPLIER = 1.5; // +50% опыта

const heroClasses: HeroClass[] = [
  {
    id: "warrior", icon: "🛡️", name: "ВОИН", title: "Щит и меч",
    bonusLocations: ["krepost"],
    bonusText: "+50% опыта в Крепости Мары — воин не страшится смерти",
  },
  {
    id: "sage", icon: "📖", name: "КНИЖНИК", title: "Мудрость летописей",
    bonusLocations: ["gora", "vyraj"],
    bonusText: "+50% опыта на Горе Мокоши и в Вырии — загадки и предания подвластны мудрецу",
  },
  {
    id: "volhv", icon: "🪄", name: "ВОЛХВ", title: "Посох и чары",
    bonusLocations: ["domovina", "more"],
    bonusText: "+50% опыта в Домовине и у Святого Моря — обряды и духи слушают волхва",
  },
  {
    id: "hunter", icon: "🏹", name: "ОХОТНИК", title: "Лук и стрелы",
    bonusLocations: ["les", "brod"],
    bonusText: "+50% опыта в Чёрном Лесу и на Броде — следопыт знает тропы и воды",
  },
];

const locations: Location[] = [
  {
    id: "domovina",
    name: "Домовина",
    subtitle: "Родная деревня",
    x: 9, y: 72,
    chapter: "I",
    symbol: "⌂",
    description: "Тихая славянская деревня среди вековых дубов. Здесь начинается путь героя.",
    lore: "Старый волхв прочёл в углях, что героя ждут великие дела. Испей воды из колодца — и дорога запомнит твои шаги.",
    danger: "Мирно. Единственная угроза — тоска по дому.",
    quests: [
      { id: "d1", title: "Испить из родового колодца", description: "Вода помнит всех, кто уходил. Сделай глоток на дорогу.", xp: 10 },
      { id: "d2", title: "Получить благословение волхва", description: "Старец ждёт у капища Рода на краю деревни.", xp: 15, artifact: "Оберег Рода" },
      { id: "d3", title: "Попрощаться с родными", description: "Ушедший без прощания не найдёт дороги назад.", xp: 10 },
    ],
  },
  {
    id: "les",
    name: "Чёрный Лес",
    subtitle: "Владения Лешего",
    x: 24, y: 57,
    chapter: "II",
    symbol: "☽",
    description: "Первозданный лес, где в полдень темно как в полночь, а деревья шепчутся с блуждающими душами.",
    lore: "Леший ревниво стережёт эти чащи. Выжившие уходят с обувью, надетой не на ту ногу.",
    danger: "Высокая. Леший, блудни огни и волки, что ходят на двух ногах.",
    quests: [
      { id: "l1", title: "Задобрить Лешего", description: "Оставь на пне краюху хлеба и поклонись трижды.", xp: 20 },
      { id: "l2", title: "Не поддаться блудням огням", description: "Пройди сквозь восточные поляны, не сворачивая с тропы.", xp: 25 },
      { id: "l3", title: "Найти путеводный клубок", description: "Бабий Яр хранит клубок, что сам катится к цели.", xp: 20, artifact: "Путеводный клубок" },
    ],
  },
  {
    id: "gora",
    name: "Гора Мокоши",
    subtitle: "Вершина Судьбы",
    x: 39, y: 38,
    chapter: "III",
    symbol: "△",
    description: "Священный пик в вечной буре, где богиня Мокошь прядёт нити судеб.",
    lore: "Мокошь загадывает три загадки: о судьбе, о рождении и о смерти. Не ответивший вплетается в гранит горы.",
    danger: "Крайняя. Божественные испытания и вороны бури.",
    quests: [
      { id: "g1", title: "Разгадать загадку Судьбы", description: "«Что дано каждому, но никем не выбрано?»", xp: 30 },
      { id: "g2", title: "Разгадать загадку Рождения", description: "«Что приходит с криком, а уходит с молчанием?»", xp: 30 },
      { id: "g3", title: "Разгадать загадку Смерти", description: "«Кого все встретят, но никто не узнает в лицо?»", xp: 30, artifact: "Нить Мокоши" },
    ],
  },
  {
    id: "brod",
    name: "Брод Стрибога",
    subtitle: "Переправа Ветров",
    x: 54, y: 62,
    chapter: "IV",
    symbol: "〰",
    description: "Коварная переправа, где течение реки идёт в обе стороны одновременно.",
    lore: "Восемь внуков Стрибога — восемь ветров — сходятся здесь. Чтобы перейти, отдай нечто дорогое, но незримое.",
    danger: "Очень высокая. Русалки утягивают гордецов на дно.",
    quests: [
      { id: "b1", title: "Принести жертву ветрам", description: "Отпусти по ветру самое дорогое воспоминание.", xp: 35 },
      { id: "b2", title: "Уговорить русалку", description: "Спой ей песню родной деревни — русалки тоскуют по берегу.", xp: 30 },
      { id: "b3", title: "Перейти реку вброд", description: "Ступай только по камням, что не отбрасывают тени.", xp: 35, artifact: "Перо Ветра" },
    ],
  },
  {
    id: "krepost",
    name: "Крепость Мары",
    subtitle: "Твердыня Зимней Смерти",
    x: 67, y: 42,
    chapter: "V",
    symbol: "❄",
    description: "Обсидиановая крепость богини зимы и смерти на равнине чёрного льда. Ни огня, ни птиц.",
    lore: "Мара не ненавидит живых — она лишь считает их временными. Герой должен выкрасть душу из её коллекции.",
    danger: "Смертельная. Сама Мара, жнецы стужи и голодные мертвецы.",
    quests: [
      { id: "k1", title: "Пройти врата незамеченным", description: "Натрись пеплом погребального костра — мёртвые примут за своего.", xp: 40 },
      { id: "k2", title: "Найти хранилище душ", description: "Иди туда, где холод гуще всего и не слышно даже тишины.", xp: 40 },
      { id: "k3", title: "Выкрасть похищенную душу", description: "Не разбуди вечный холод, что спит в каждом коридоре.", xp: 50, artifact: "Спасённая душа" },
    ],
  },
  {
    id: "more",
    name: "Святое Море",
    subtitle: "Гнездовье Жар-птицы",
    x: 79, y: 25,
    chapter: "VI",
    symbol: "◈",
    description: "Мерцающее море, отражающее звёзды неба, которого больше не видно. В центре — блуждающий остров.",
    lore: "Жар-птица гнездится на острове. Её перо нельзя взять силой — лишь получить в дар за пройденные испытания.",
    danger: "Обманчивая. Море испытывает достоинство, а не силу.",
    quests: [
      { id: "m1", title: "Найти блуждающий остров", description: "Остров является лишь тому, кто перестал его искать.", xp: 45 },
      { id: "m2", title: "Предстать перед Жар-птицей", description: "Покажи ей всё, что нёс через семь земель.", xp: 45 },
      { id: "m3", title: "Принять перо в дар", description: "Перо осветит последнюю дорогу — в Вырий.", xp: 60, artifact: "Перо Жар-птицы" },
    ],
  },
  {
    id: "vyraj",
    name: "Вырий",
    subtitle: "Рай Предков",
    x: 91, y: 15,
    chapter: "VII",
    symbol: "✦",
    description: "Земля за горизонтом, где живут души великих воинов. Деревья с золотыми яблоками, реки живой воды.",
    lore: "Вырий — не смерть, а завершение. Достигший его несёт с собой истории всех павших в пути. Войти в Вырий — стать легендой.",
    danger: "Нет. Это место, к которому ведут все истинные пути.",
    quests: [
      { id: "v1", title: "Отдать спасённую душу", description: "Верни её предкам — пусть обретёт покой.", xp: 50 },
      { id: "v2", title: "Рассказать истории павших", description: "Каждый спутник, потерянный в пути, заслужил быть услышанным.", xp: 50 },
      { id: "v3", title: "Вкусить золотое яблоко", description: "И путь завершится… чтобы начаться вновь.", xp: 100, artifact: "Золотое яблоко" },
    ],
  },
];

const statusStyle: Record<Status, { border: string; bg: string; text: string }> = {
  completed: { border: "#c4922a", bg: "rgba(196,146,42,0.15)", text: "#7a5010" },
  current:   { border: "#8b1a1a", bg: "rgba(139,26,26,0.12)", text: "#8b1a1a" },
  locked:    { border: "rgba(92,61,30,0.22)", bg: "rgba(180,140,90,0.07)", text: "rgba(44,24,16,0.28)" },
};

/* ────────────────────────── КОМПАС ────────────────────────── */

function CompassRose() {
  return (
    <div className="absolute" style={{ bottom: "9%", right: "5.5%", width: 76, height: 76, zIndex: 15, pointerEvents: "none" }}>
      <svg viewBox="0 0 100 100" width="76" height="76">
        <circle cx="50" cy="50" r="46" fill="#d4b896" stroke="#c4922a" strokeWidth="2" opacity="0.88" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="#5c3d1e" strokeWidth="0.6" opacity="0.2" />
        <polygon points="50,8 44,42 50,34 56,42" fill="#2c1810" />
        <polygon points="50,92 44,58 50,66 56,58" fill="#8a7060" />
        <polygon points="92,50 58,44 66,50 58,56" fill="#8a7060" />
        <polygon points="8,50 42,44 34,50 42,56" fill="#8a7060" />
        <circle cx="50" cy="50" r="5" fill="#c4922a" />
        <circle cx="50" cy="50" r="2.5" fill="#f5e6d0" />
        <text x="50" y="7" textAnchor="middle" fontSize="13" fill="#2c1810" fontFamily="serif" fontWeight="bold">С</text>
      </svg>
    </div>
  );
}

/* ────────────────────────── ГЕРОЙ ────────────────────────── */

function HeroMarker({ x, y, heroClass, hasBonus }: { x: number; y: number; heroClass: HeroClass; hasBonus: boolean }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      animate={{ left: `${x}%`, top: `${y - 7}%` }}
      transition={{ type: "spring", stiffness: 45, damping: 14, mass: 1.2 }}
      style={{ zIndex: 18, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        {/* Сияние, если класс на бонусной земле */}
        {hasBonus && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 44, height: 44, top: -6,
              background: "radial-gradient(circle, rgba(196,146,42,0.55) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.35, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span style={{ fontSize: 26, filter: "drop-shadow(0 3px 5px rgba(55,25,8,0.5))", position: "relative" }}>
          {heroClass.icon}
        </span>
        <span
          className="px-1.5 rounded-sm text-[8px] mt-0.5"
          style={{
            background: hasBonus ? "rgba(122,80,16,0.9)" : "rgba(139,26,26,0.85)",
            color: "#f5e6d0",
            fontFamily: "'Uncial Antiqua', cursive",
            letterSpacing: "0.08em",
          }}
        >
          {heroClass.name}{hasBonus ? " ✦" : ""}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────── ПРИЛОЖЕНИЕ ────────────────────────── */

export default function App() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [doneQuests, setDoneQuests] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [heroClass, setHeroClass] = useState<HeroClass>(heroClasses[0]);
  /* Опыт копится с учётом бонуса, действовавшего в момент выполнения */
  const [xp, setXp] = useState(0);
  const [bonusXpTotal, setBonusXpTotal] = useState(0);

  const getStatus = (idx: number): Status =>
    idx < currentIdx ? "completed" : idx === currentIdx ? "current" : "locked";

  const selected = locations.find(l => l.id === selectedId) ?? null;
  const selectedIdx = selected ? locations.findIndex(l => l.id === selected.id) : -1;

  const currentLoc = locations[currentIdx];
  const currentDone = currentLoc.quests.every(q => doneQuests.has(q.id));
  const journeyFinished = currentIdx === locations.length - 1 && currentDone;

  /* Есть ли у класса бонус в данной локации */
  const classHasBonusAt = (locId: string) => heroClass.bonusLocations.includes(locId);
  const heroOnBonusLand = classHasBonusAt(currentLoc.id);

  /* Опыт за квест с учётом бонуса класса */
  const questXp = (q: Quest, locId: string) =>
    classHasBonusAt(locId) ? Math.round(q.xp * BONUS_MULTIPLIER) : q.xp;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const completeQuest = (q: Quest, locId: string) => {
    if (doneQuests.has(q.id)) return;
    setDoneQuests(prev => new Set(prev).add(q.id));

    const earned = questXp(q, locId);
    const bonus = earned - q.xp;
    setXp(prev => prev + earned);
    if (bonus > 0) setBonusXpTotal(prev => prev + bonus);

    const bonusNote = bonus > 0 ? ` ✦ бонус класса +${bonus}!` : "";
    if (q.artifact) {
      setArtifacts(prev => [...prev, q.artifact!]);
      showToast(`✦ Получен артефакт: ${q.artifact} (+${earned} опыта)${bonusNote}`);
    } else {
      showToast(`✓ Задание выполнено (+${earned} опыта)${bonusNote}`);
    }
  };

  const advance = () => {
    if (!currentDone || currentIdx >= locations.length - 1) return;
    const next = currentIdx + 1;
    setCurrentIdx(next);
    setSelectedId(locations[next].id);
    const bonusHere = heroClass.bonusLocations.includes(locations[next].id);
    showToast(
      bonusHere
        ? `⚑ Герой прибыл: ${locations[next].name} — родная земля класса, +50% опыта!`
        : `⚑ Герой прибыл: ${locations[next].name}`
    );
  };

  const navigate = (dir: number) => {
    const next = locations[selectedIdx + dir];
    if (next) setSelectedId(next.id);
  };

  const pathPoints = (upTo: number) =>
    locations.slice(0, upTo + 1).map(l => `${l.x},${l.y}`).join(" ");

  return (
    <div
      className="size-full min-h-screen overflow-hidden relative select-none"
      style={{
        background:
          "radial-gradient(ellipse at 18% 28%, rgba(190,130,65,0.22) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 82% 72%, rgba(130,85,40,0.18) 0%, transparent 50%)," +
          "linear-gradient(148deg, #d4b896 0%, #c9a87a 28%, #d2b48c 55%, #c0966a 80%, #cba880 100%)",
        fontFamily: "'IM Fell English', serif",
      }}
    >
      {/* Виньетка и рамки */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px rgba(55,25,8,0.45)", zIndex: 2 }} />
      <div className="absolute inset-3 pointer-events-none" style={{ border: "2.5px solid rgba(92,61,30,0.48)", zIndex: 3 }} />
      <div className="absolute inset-[22px] pointer-events-none" style={{ border: "1px solid rgba(92,61,30,0.22)", zIndex: 3 }} />

      {/* Заголовок */}
      <div className="absolute top-7 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1 className="text-3xl md:text-4xl tracking-[0.18em]" style={{ fontFamily: "'Cinzel Decorative', serif", color: "#2c1810" }}>
          ПУТЬ ГЕРОЯ
        </h1>
        <p className="text-[11px] tracking-[0.34em] mt-1" style={{ fontFamily: "'Uncial Antiqua', cursive", color: "#5c3d1e" }}>
          Странствие по семи славянским землям
        </p>
      </div>

      {/* ── ПАНЕЛЬ ГЕРОЯ ── */}
      <div
        className="absolute top-7 left-8 z-20"
        style={{
          background: "linear-gradient(140deg, rgba(220,195,155,0.92), rgba(200,168,120,0.88))",
          border: "1px solid rgba(92,61,30,0.38)",
          padding: "10px 14px",
          minWidth: 200,
          maxWidth: 240,
        }}
      >
        <div className="text-[9px] tracking-[0.28em] mb-1.5" style={{ fontFamily: "'Cinzel Decorative', serif", color: "#5c3d1e" }}>
          ЛЕТОПИСЬ ГЕРОЯ
        </div>

        {/* Выбор класса */}
        <div className="flex gap-1 mb-1.5">
          {heroClasses.map(hc => (
            <motion.button
              key={hc.id}
              onClick={() => {
                setHeroClass(hc);
                showToast(`${hc.icon} Герой избрал путь: ${hc.name}. ${hc.bonusText}`);
              }}
              title={`${hc.name} — ${hc.title}\n${hc.bonusText}`}
              className="flex items-center justify-center rounded-sm"
              style={{
                width: 34, height:
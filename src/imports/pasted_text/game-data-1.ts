import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Lock, Swords, Scroll, Check, Trophy, Users } from "lucide-react";

/* ────────────────────────── ТИПЫ И ДАННЫЕ ────────────────────────── */

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  artifact?: string;
  coop?: boolean; // совместное задание
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
  bonusLocations: string[];
  bonusText: string;
}

interface Rival {
  id: string;
  name: string;
  icon: string;
  xp: number;
  artifacts: number;
}

const BONUS_MULTIPLIER = 1.5; // +50% опыта на родной земле класса
const COOP_BONUS = 20;        // премия за слаженность в совместном задании

const heroClasses: HeroClass[] = [
  {
    id: "warrior", icon: "🛡️", name: "ВОИН", title: "Щит и меч",
    bonusLocations: ["krepost"],
    bonusText: "+50% опыта в Крепости Мары — воин не страшится смерти",
  },
  {
    id: "sage", icon: "📖", name: "КНИЖНИК", title: "Мудрость летописей",
    bonusLocations: ["gora", "vyraj"],
    bonusText: "+50% опыта на Горе Мокоши и в Вырии — загадки подвластны мудрецу",
  },
  {
    id: "volhv", icon: "🪄", name: "ВОЛХВ", title: "Посох и чары",
    bonusLocations: ["domovina", "more"],
    bonusText: "+50% опыта в Домовине и у Святого Моря — духи слушают волхва",
  },
  {
    id: "hunter", icon: "🏹", name: "ОХОТНИК", title: "Лук и стрелы",
    bonusLocations: ["les", "brod"],
    bonusText: "+50% опыта в Чёрном Лесу и на Броде — следопыт знает тропы",
  },
];

const initialRivals: Rival[] = [
  { id: "r1", name: "Добрыня",   icon: "🛡️", xp: 145, artifacts: 2 },
  { id: "r2", name: "Василиса",  icon: "📖", xp: 210, artifacts: 3 },
  { id: "r3", name: "Всеслав",   icon: "🪄", xp: 95,  artifacts: 1 },
  { id: "r4", name: "Марья",     icon: "🏹", xp: 170, artifacts: 2 },
  { id: "r5", name: "Ратибор",   icon: "🛡️", xp: 60,  artifacts: 1 },
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
      { id: "d4", title: "Собрать дружину", description: "Вместе с побратимом дай клятву верности у общего костра.", xp: 20, coop: true },
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
      { id: "l4", title: "Охота на волколака", description: "Волколака не одолеть в одиночку: один держит серебряную сеть, другой читает заговор.", xp: 35, coop: true },
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
      { id: "g4", title: "Связка на подъёме", description: "Отвесную стену пройти можно только в связке — страхуйте друг друга.", xp: 40, coop: true },
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
      { id: "b4", title: "Натянуть канат через реку", description: "Один держит канат на этом берегу, второй плывёт на тот. Поодиночке — гибель.", xp: 45, coop: true },
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
      { id: "k4", title: "Отвлечь жнецов стужи", description: "Пока союзник шумит у северной башни, проберись в южную. Дело для двоих.", xp: 55, coop: true },
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
      { id: "m4", title: "Построить плот вдвоём", description: "Море несёт лишь тот плот, что связан руками двух друзей.", xp: 55, coop: true },
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
      { id: "v4", title: "Пир побратимов", description: "Раздели золотое яблоко с тем, кто шёл рядом. Легенда пишется вдвоём.", xp: 70, coop: true },
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
        {hasBonus && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: 44, height: 44, top: -6, background: "radial-gradient(circle, rgba(196,146,42,0.55) 0%, transparent 70%)" }}
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
            color: "#f5e6d0", fontFamily: "'Uncial Antiqua', cursive", letterSpacing: "0.08em",
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
  const [xp, setXp] = useState(0);
  const [bonusXpTotal, setBonusXpTotal] = useState(0);

  /* Соперники и рейтинг */
  const [rivals, setRivals] = useState<Rival[]>(initialRivals);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  /* Совместные задания: выбор союзника и запись, с кем пройдено */
  const [allyPickFor, setAllyPickFor] = useState<string | null>(null); // id квеста, для которого выбираем союзника
  const [coopPartners, setCoopPartners] = useState<Record<string, string>>({}); // questId → имя союзника

  /* Соперники медленно набирают опыт сами — живая таблица */
  useEffect(() => {
    const timer = setInterval(() => {
      setRivals(prev =>
        prev.map(r =>
          Math.random() < 0.4 ? { ...r, xp: r.xp + Math.floor(Math.random() * 12) + 3 } : r
        )
      );
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const getStatus = (idx: number): Status =>
    idx < currentIdx ? "completed" : idx === currentIdx ? "current" : "locked";

  const selected = locations.find(l => l.id === selectedId) ?? null;
  const selectedIdx = selected ? locations.findIndex(l => l.id === selected.id) : -1;

  const currentLoc = locations[currentIdx];
  const currentDone = currentLoc.quests.every(q => doneQuests.has(q.id));
  const journeyFinished = currentIdx === locations.length - 1 && currentDone;

  const classHasBonusAt = (locId: string) => heroClass.bonusLocations.includes(locId);
  const heroOnBonusLand =
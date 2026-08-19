import { FormEvent, type CSSProperties, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Coffee,
  Flame,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";

type TavernProps = {
  theme: "light" | "dark";
  level: number;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onOpenGuild: () => void;
  onOpenTrail: () => void;
};

type TavernMessage = {
  role: "glossa" | "reader";
  text: string;
  tone?: "success" | "hint";
};

type Riddle = {
  id: number;
  level: number;
  title: string;
  question: string;
  answers: string[];
  hint: string;
  success: string;
  joke: string;
};

const introLines = [
  "Ох, ещё один странник ищет свою историю? Присаживайся, дитя. У меня как раз чайник закипел, а истории сами себя не расскажут.",
  "Это «Последняя глава». Здесь начинаются все истории и заканчиваются странствия. А ещё здесь не принято торопиться — чай и хорошие мысли этого не любят.",
  "В старом сундуке у меня лежат загадки. За верный ответ получишь чайную искру, за неверный — подсказку. Ну и шутку, если мне повезёт вспомнить приличную.",
];

const riddles: Riddle[] = [
  {
    id: 1,
    level: 1,
    title: "Сотня голосов",
    question: "Не имею я лица, но говорю на сотни голосов. Не имею ног, но путешествую по векам. Открой меня — и я оживу. Закрой меня — и я усну. Что я?",
    answers: ["книга", "книжка"],
    hint: "Она умеет говорить, хотя у неё нет голоса. Обычно живёт на полке.",
    success: "Верно! Ну а как иначе — мы же среди книг, в конце-то концов.",
    joke: "Не угадал? Ничего. Даже закладки иногда теряются между двумя правильными страницами.",
  },
  {
    id: 2,
    level: 1,
    title: "Чем больше потрачено",
    question: "Чем больше меня потрачено, тем я больше. Что это?",
    answers: ["время"],
    hint: "Его нельзя вернуть, зато им очень любят оправдывать опоздания.",
    success: "Время! Простая загадка, но многие спотыкаются. Особенно те, кто слишком торопится жить.",
    joke: "Чай уже успел настояться, а ответ пока нет. Кажется, подсказка становится необходимостью.",
  },
  {
    id: 3,
    level: 1,
    title: "Тысяча концов",
    question: "Начало у меня всегда одно, а концов — тысячи. Я меняюсь от взгляда каждого, но остаюсь собой. Что я?",
    answers: ["история", "сюжет", "рассказ", "сказка"],
    hint: "Её можно рассказать сотней способов, и каждый рассказчик оставит в ней себя.",
    success: "История. Одна и та же сказка звучит по-разному в устах разных рассказчиков.",
    joke: "Хм-м… Это было красиво, но загадка делает вид, что не расслышала. Попробуй ещё.",
  },
  {
    id: 4,
    level: 2,
    title: "Рождённое из молчания",
    question: "Я рождаюсь из молчания, живу в шёпоте и крике. Меня можно украсть, но нельзя удержать; забыть, но нельзя уничтожить. Что я?",
    answers: ["слово", "слова"],
    hint: "В EduStories это не только способ говорить, но и настоящее оружие.",
    success: "Слово, дитя. Самое опасное и самое прекрасное оружие во всех известных мирах.",
    joke: "Почти! Но «горячий чай» — ответ примерно на половину вопросов, а на этот всё-таки нет.",
  },
  {
    id: 5,
    level: 2,
    title: "Страницы без книги",
    question: "У меня есть страницы, но я не книга. Есть история, но я не летопись. Я расту вместе с тобой, а переписать меня можешь только ты. Что я?",
    answers: ["жизнь", "судьба", "моя жизнь", "моя судьба"],
    hint: "Её главного героя ты видишь в зеркале каждый день.",
    success: "Жизнь. Многие ищут этот ответ среди книг, а он всегда был внутри спрашивающего.",
    joke: "Ответ смелый. Глоссе нравится. Загадке — пока нет, но у неё скверный характер.",
  },
  {
    id: 6,
    level: 2,
    title: "Чем короче, тем длиннее",
    question: "Чем больше от меня отрезаешь, тем я становлюсь длиннее. Что я?",
    answers: ["дорога", "путь"],
    hint: "Каждый пройденный шаг не уменьшает её, а добавляет новую часть твоей истории.",
    success: "Дорога. Каждый шаг по ней — уже часть истории, даже если конец ещё не виден.",
    joke: "Телескоп? Хорошая вещь, но отрезать от него кусочки я бы не советовала.",
  },
  {
    id: 7,
    level: 3,
    title: "Единая и многоликая",
    question: "Я была единой, а стала многоликой. Говорила одним голосом, а теперь шепчу разными. Ищи меня в шести местах, но помни — я всегда была одной. Кто я?",
    answers: ["библиотека вечности", "библиотека"],
    hint: "Её осколки ищет Кси, а все дороги Книгочеев однажды приводят к ней.",
    success: "Библиотека Вечности… Не ожидала, что ты справишься так быстро. Ты понимаешь больше, чем показываешь.",
    joke: "Не бойся тишины. Иногда старые стены подсказывают громче людей.",
  },
  {
    id: 8,
    level: 3,
    title: "Семь дорог",
    question: "Семь дорог ведут в одно место, но каждая рассказывает свою историю. Все вместе они ведут к одному сердцу. Что это?",
    answers: ["гильдии", "семь гильдий", "гильдия"],
    hint: "У каждой свой герб и свой путь, но цель у них общая.",
    success: "Гильдии. Умно, дитя. Ты явно уже не новичок в этих залах.",
    joke: "Семь чашек чая тоже ведут примерно в одно место, но ответ всё же о другом.",
  },
];

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("ru")
    .replace(/[ё]/g, "е")
    .replace(/[«»"'.,!?—–:;()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const readStoredNumbers = (key: string) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "number") : [];
  } catch {
    return [];
  }
};

const readStoredHintUsage = () => {
  try {
    const value = JSON.parse(localStorage.getItem("edustories_tavern_hints") || "{}");
    return value && typeof value === "object" ? value as Record<number, number> : {};
  } catch {
    return {};
  }
};

export default function Tavern({ theme, level, isAuthenticated, onRequireAuth, onOpenGuild, onOpenTrail }: TavernProps) {
  const [introStep, setIntroStep] = useState(() => localStorage.getItem("edustories_tavern_welcome") === "true" ? introLines.length : 0);
  const [riddleIndex, setRiddleIndex] = useState(() => Number(localStorage.getItem("edustories_tavern_riddle")) || 0);
  const [solved, setSolved] = useState<number[]>(() => readStoredNumbers("edustories_tavern_solved"));
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hintUsage, setHintUsage] = useState<Record<number, number>>(readStoredHintUsage);
  const [isCorrect, setIsCorrect] = useState(false);
  const [messages, setMessages] = useState<TavernMessage[]>([
    { role: "glossa", text: "Ну что, Книгочей, размять мысли или сначала подуть на чай?" },
  ]);

  const current = riddles[riddleIndex % riddles.length];
  const hintsUsed = Math.min(3, hintUsage[current.id] || 0);
  const availableLevel = Math.min(3, Math.max(level, solved.length >= 5 ? 3 : solved.length >= 2 ? 2 : 1));
  const availableRiddles = useMemo(() => riddles.filter((riddle) => riddle.level <= availableLevel), [availableLevel]);

  const finishIntro = () => {
    localStorage.setItem("edustories_tavern_welcome", "true");
    setIntroStep(introLines.length);
    if (!isAuthenticated) {
      setMessages([{ role: "glossa", text: "Загадки я берегу для вошедших Книгочеев, дитя. Войди в свою историю — и старый сундук откроется." }]);
    }
  };

  const moveToRiddle = (index: number) => {
    setRiddleIndex(index);
    localStorage.setItem("edustories_tavern_riddle", String(index));
    setAnswer("");
    setAttempts(0);
    setIsCorrect(false);
    setMessages([{ role: "glossa", text: `Загадка №${riddles[index].id}. Слушай внимательно, тут каждое слово на своём месте.` }]);
  };

  const nextRiddle = () => {
    if (!isAuthenticated) {
      remindGuest();
      return;
    }
    if (!isCorrect) {
      setMessages((value) => [...value, { role: "glossa", text: "Эту загадку нельзя перелистнуть, как скучную страницу. Сначала найди ответ — или попроси одну из трёх подсказок." }]);
      return;
    }
    const availableIds = new Set(availableRiddles.map((riddle) => riddle.id));
    let next = (riddleIndex + 1) % riddles.length;
    for (let count = 0; count < riddles.length && !availableIds.has(riddles[next].id); count += 1) {
      next = (next + 1) % riddles.length;
    }
    moveToRiddle(next);
  };

  const askForHint = () => {
    if (!isAuthenticated) {
      remindGuest();
      return;
    }
    if (hintsUsed >= 3) {
      setMessages((value) => [...value, { role: "glossa", text: "Три подсказки уже на столе. Четвёртая была бы не подсказкой, а ответом — а я всё-таки хозяйка таверны, не шпаргалка." }]);
      return;
    }
    const hintJokes = [
      "Подсказка — это не жульничество. Это маленький фонарь для большой тёмной лестницы.",
      "Я бы сказала ответ сразу, но тогда загадка обидится и опять спрячется в сахарнице.",
      "Слушай не только слова, дитя. Иногда ответ сидит между ними и греет руки о чашку.",
    ];
    const progressiveHints = [
      "Отбрось буквальное значение и подумай, что в загадке умеет хранить или переносить историю.",
      current.hint,
      `Последняя ниточка: ответ начинается с буквы «${current.answers[0][0].toLocaleUpperCase("ru")}».`,
    ];
    const joke = hintJokes[(current.id + hintsUsed) % hintJokes.length];
    setMessages((value) => [...value, { role: "reader", text: `Можно подсказку ${hintsUsed + 1} из 3?` }, { role: "glossa", text: `${joke} ${progressiveHints[hintsUsed]}`, tone: "hint" }]);
    const nextUsage = { ...hintUsage, [current.id]: hintsUsed + 1 };
    setHintUsage(nextUsage);
    localStorage.setItem("edustories_tavern_hints", JSON.stringify(nextUsage));
  };

  const remindGuest = () => {
    setMessages((value) => [...value, { role: "glossa", text: "Поговорить мы можем и без формальностей, а вот ответы и награды Библиотека сохраняет только вошедшим Книгочеям. Сначала войди или зарегистрируйся, дитя." }]);
  };

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      remindGuest();
      return;
    }
    const cleaned = normalize(answer);
    if (!cleaned) {
      setMessages((value) => [...value, { role: "glossa", text: "Молчание — достойный ответ для философа, но этой загадке нужны слова." }]);
      return;
    }

    const correct = current.answers.some((candidate) => {
      const expected = normalize(candidate);
      return cleaned === expected || cleaned.includes(expected);
    });

    if (correct) {
      const nextSolved = solved.includes(current.id) ? solved : [...solved, current.id];
      setSolved(nextSolved);
      localStorage.setItem("edustories_tavern_solved", JSON.stringify(nextSolved));
      setMessages((value) => [...value, { role: "reader", text: answer }, { role: "glossa", text: `${current.success} Получай чайную искру — заслужил!`, tone: "success" }]);
      setAnswer("");
      setIsCorrect(true);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setMessages((value) => [...value, { role: "reader", text: answer }, { role: "glossa", text: `${current.joke} Попробуй ещё — или возьми подсказку. Загадка дождётся правильного ответа.` }]);
    setAnswer("");
  };

  return (
    <motion.section className="tavern-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tavern-hero">
        <img
          className="tavern-bg"
          src={`${import.meta.env.BASE_URL}tavern/${theme === "light" ? "tavern-bg-light-v2.webp" : "tavern-bg.webp"}`}
          alt="Зал таверны «Последняя глава» с камином, книжными столами и Бабушкой Глоссой"
          width="1672"
          height="941"
          decoding="async"
        />
        <div className="tavern-shade" />
        <div className="tavern-embers" aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => <i key={index} style={{ "--ember": index } as CSSProperties} />)}
        </div>
        <div className="tavern-title">
          <span><Coffee size={14} /> Перекрёсток всех историй</span>
          <h1>Последняя глава</h1>
          <p>Здесь начинаются все истории и заканчиваются странствия.</p>
          <button onClick={() => { document.getElementById("glossa-dialogue")?.scrollIntoView({ behavior: "smooth" }); if (!isAuthenticated) remindGuest(); }}>
            <MessageCircle size={17} /> Поговорить с Глоссой
          </button>
        </div>
        <div className="tavern-room-actions" aria-label="Места таверны">
          <h2>Куда отправимся?</h2>
          <button><ScrollText size={16} /><span>Доска объявлений<small>Новые задания</small></span></button>
          <button onClick={onOpenGuild}><Users size={16} /><span>Столы гильдий<small>Встретить союзников</small></span></button>
          <button onClick={onOpenTrail}><BookOpen size={16} /><span>Книга слухов<small>Вернуться в дневник</small></span></button>
          <button onClick={() => document.getElementById("glossa-dialogue")?.scrollIntoView({ behavior: "smooth" })}><Flame size={16} /><span>Камин историй<small>Разгадать загадку</small></span></button>
        </div>
      </div>

      <section className="tavern-workspace" id="glossa-dialogue">
        <aside className="glossa-card">
          <div className="glossa-portrait">
            <img src={`${import.meta.env.BASE_URL}tavern/glossa.webp`} alt="Бабушка Глосса с чашкой чая" width="937" height="1679" loading="lazy" decoding="async" />
            <span><i /> Хозяйка на месте</span>
          </div>
          <div className="glossa-copy">
            <small>Хранительница старого сундука</small>
            <h2>Бабушка Глосса</h2>
            <p>Помнит Библиотеку ещё до раскола, любит крепкий чай, хорошие рассуждения и шутки с неожиданным концом.</p>
            <div className="glossa-stats">
              <span><Sparkles size={15} /><b>{solved.length}</b> разгадано</span>
              <span><Flame size={15} /><b>{solved.length * 15}</b> искр</span>
            </div>
          </div>
        </aside>

        <div className="riddle-dialogue">
          {!isAuthenticated && (
            <div className="tavern-auth-reminder">
              <LockKeyhole size={20} />
              <div><b>Сундук загадок ждёт твоего имени</b><span>Войди или зарегистрируйся, чтобы отвечать, получать подсказки и сохранять чайные искры.</span></div>
              <button onClick={onRequireAuth}>Войти</button>
            </div>
          )}
          <header className="riddle-head">
            <div>
              <span><CircleHelp size={14} /> Загадки из старого сундука</span>
              <h2>{current.title}</h2>
            </div>
            <b>Уровень {current.level}</b>
          </header>

          <div className="riddle-question">
            <i>№{String(current.id).padStart(2, "0")}</i>
            <p>«{current.question}»</p>
          </div>

          <div className="tavern-chat" aria-live="polite">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  className={`tavern-message ${message.role} ${message.tone || ""}`}
                  key={`${index}-${message.text}`}
                  initial={{ opacity: 0, y: 10, scale: .98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                >
                  {message.role === "glossa" && <span>Глосса</span>}
                  <p>{message.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form className="riddle-form" onSubmit={submitAnswer}>
            <label htmlFor="tavern-answer">Твой ответ</label>
            <div>
              <input
                id="tavern-answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Напиши, что пришло в голову…"
                autoComplete="off"
                disabled={isCorrect || !isAuthenticated}
              />
              <button type="submit" disabled={isCorrect || !isAuthenticated}>Ответить <ChevronRight size={16} /></button>
            </div>
          </form>

          <div className="riddle-actions">
            <button onClick={askForHint} disabled={isCorrect || !isAuthenticated || hintsUsed >= 3}><Lightbulb size={15} /> Подсказка {hintsUsed}/3</button>
            <button onClick={nextRiddle} disabled={!isCorrect || !isAuthenticated}><RefreshCw size={15} /> Следующая загадка</button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {introStep < introLines.length && (
          <motion.div className="tavern-welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="tavern-welcome-card" initial={{ y: 30, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }}>
              <div className="welcome-glossa">
                <img src={`${import.meta.env.BASE_URL}tavern/glossa.webp`} alt="" width="937" height="1679" decoding="async" />
              </div>
              <div className="welcome-copy">
                <span><Coffee size={14} /> Хозяйка «Последней главы»</span>
                <h2>{introStep === 0 ? "Глосса встречает тебя" : "Бабушка Глосса"}</h2>
                <AnimatePresence mode="wait">
                  <motion.p key={introStep} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                    «{introLines[introStep]}»
                  </motion.p>
                </AnimatePresence>
                <div className="welcome-dots">{introLines.map((_, index) => <i className={index <= introStep ? "active" : ""} key={index} />)}</div>
                <button onClick={() => introStep === introLines.length - 1 ? finishIntro() : setIntroStep((value) => value + 1)}>
                  {introStep === introLines.length - 1 ? "Открыть старый сундук" : "Слушать дальше"} <ChevronRight size={17} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

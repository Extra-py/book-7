import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Crown,
  DoorOpen,
  Info,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type GuildHallProps = {
  level: number;
  xp: number;
  onOpenMap: () => void;
};

type Guild = {
  id: string;
  name: string;
  genres: string;
  motto: string;
  members: number;
  accent: string;
  image: string;
  description: string;
  traits: string;
  lore: string;
  xi: string[];
  special?: boolean;
};

const guilds: Guild[] = [
  {
    id: "chronicle",
    name: "Летопись Вечности",
    genres: "История · Документалистика · Биографии",
    motto: "То, что записано — не исчезнет никогда",
    members: 24,
    accent: "#b76a3e",
    image: "chronicle.webp",
    description: "Хранители фактов и памяти. Здесь собирают хроники, биографии и документальные свидетельства — всё, что помогает не забыть прошлое.",
    traits: "Внимательность к деталям, терпение, уважение к фактам и любовь к исследованиям.",
    lore: "Эта гильдия первой начала восстанавливать карту раскола Библиотеки, записывая свидетельства очевидцев из разных регионов.",
    xi: [
      "Чувствуешь этот запах? Старая бумага, чернила, пыль веков…",
      "Здесь живут те, кто верит: правда важнее выдумки. Они не сочиняют героев — они находят их в реальной жизни.",
      "Если тебе нравится докапываться до истины больше, чем выдумывать её — тебе сюда.",
    ],
  },
  {
    id: "story-circle",
    name: "Сказительский Круг",
    genres: "Фэнтези · Мифология · Сказки",
    motto: "Невозможное — лишь то, что ещё не придумано",
    members: 27,
    accent: "#865bc0",
    image: "story-circle.webp",
    description: "Мечтатели и творцы миров. Они знают, что вымысел — не ложь, а другая форма правды, и любят магию, легенды и ещё не написанные истории.",
    traits: "Богатое воображение, любовь к деталям выдуманных миров и желание создавать собственные истории.",
    lore: "Гильдия ищет осколок Библиотеки, в котором хранятся истории, никогда не написанные людьми — только представленные ими.",
    xi: [
      "О, а вот и мои любимые выдумщики!",
      "Драконы существуют. Может, не в этом мире — но существуют точно.",
      "Если твоё сердце бьётся чаще при словах «однажды, в далёком королевстве» — добро пожаловать домой.",
    ],
  },
  {
    id: "silent-lines",
    name: "Совет Молчаливых Строк",
    genres: "Детектив · Триллер · Мистика",
    motto: "В каждой строке спрятана улика",
    members: 22,
    accent: "#4a8f8f",
    image: "silent-lines.webp",
    description: "Разгадыватели тайн и любители напряжения. Каждая книга для них — головоломка, которую хочется разгадать раньше автора.",
    traits: "Логическое мышление, наблюдательность, любовь к загадкам и скрытым смыслам.",
    lore: "Члены Совета первыми заметили странные несостыковки в картах регионов — возможно, это ключ к следующему осколку.",
    xi: [
      "Тс-с… Здесь любят тишину. И внимательность.",
      "Эти читатели видят то, что другие пропускают. Каждая страница может скрывать улику.",
      "Если ты читаешь между строк в прямом смысле слова — тебе здесь понравится.",
    ],
  },
  {
    id: "infinity-compass",
    name: "Компас Бесконечности",
    genres: "Научная фантастика · Антиутопии · Футурология",
    motto: "Будущее начинается на этой странице",
    members: 25,
    accent: "#596ed1",
    image: "infinity-compass.webp",
    description: "Исследователи будущего и альтернативных реальностей. Их привлекают технологии, космос и вопрос о том, каким может стать мир.",
    traits: "Любопытство, аналитический склад ума, интерес к новым идеям и возможностям.",
    lore: "Гильдия первой предположила, что раскол Библиотеки — часть большого цикла, который уже происходил раньше.",
    xi: [
      "Смотри выше. Дальше. Вперёд.",
      "Их не пугают вопросы «а что, если…» — они их обожают.",
      "Если тебя больше волнует «что будет завтра», чем «что было вчера» — этот путь для тебя.",
    ],
  },
  {
    id: "distant-paths",
    name: "Братство Дальних Троп",
    genres: "Приключения · Путешествия · Экшн",
    motto: "Каждая страница — новый горизонт",
    members: 23,
    accent: "#3f9dad",
    image: "distant-paths.webp",
    description: "Искатели приключений и энергичные исследователи. Чтение для них — способ прожить тысячу жизней и побывать в тысяче мест.",
    traits: "Энергичность, любовь к динамике сюжета и готовность к риску — хотя бы книжному.",
    lore: "Братство чаще других отправляется в самые труднодоступные уголки регионов за потерянными страницами Библиотеки.",
    xi: [
      "Ну наконец-то! Люблю энергию этой гильдии.",
      "Читать для них — значит бежать, карабкаться и нырять в приключение с головой.",
      "Если тебе больше по душе действие, чем размышления — вперёд, тропа уже ждёт.",
    ],
  },
  {
    id: "reflected-lines",
    name: "Хор Отражённых Строк",
    genres: "Поэзия · Лирическая проза · Драма",
    motto: "Слово может звучать, даже если молчит",
    members: 20,
    accent: "#9f70bd",
    image: "reflected-lines.webp",
    description: "Ценители красоты слова и глубоких эмоций. Здесь важны ритм фразы, звучание метафоры и чувства, спрятанные между строк.",
    traits: "Чувствительность, эмоциональный интеллект, любовь к языку и стилю.",
    lore: "Говорят, голос самой Кси когда-то звучал так же, как стихи этой гильдии — легко и тепло, будто свет между строк.",
    xi: [
      "Тише… Послушай, как звучит тишина между словами.",
      "Мне кажется, когда-то мой собственный голос звучал именно так — легко, тепло, будто свет между строк.",
      "Если слова для тебя — не просто буквы, а музыка — эта гильдия услышит тебя.",
    ],
  },
  {
    id: "threshold-keepers",
    name: "Хранители Порога",
    genres: "Все жанры · Новички · Универсалы",
    motto: "Каждый путь начинается с порога",
    members: 26,
    accent: "#e2b969",
    image: "threshold-keepers.webp",
    description: "Особая гильдия для тех, кто ещё ищет свой литературный дом, и для читателей, которые одинаково любят самые разные жанры.",
    traits: "Открытость новому, разносторонность и готовность пробовать разные направления.",
    lore: "По легенде, здесь хранится седьмой невидимый осколок — не история, а сама способность создавать истории.",
    xi: [
      "А вот и мой дом. Наш общий дом, если быть точнее.",
      "Здесь ты можешь просто быть — без ярлыков и без выбора, который нужно сделать прямо сейчас.",
      "Не торопись с выбором. Дверь открыта. Заходи, когда будешь готов.",
    ],
    special: true,
  },
];

export default function GuildHall({ level, xp, onOpenMap }: GuildHallProps) {
  const [joinedGuildId, setJoinedGuildId] = useState<string | null>(() => localStorage.getItem("edustories_guild"));
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const joinedGuild = useMemo(() => guilds.find((guild) => guild.id === joinedGuildId) ?? null, [joinedGuildId]);

  const closeDialog = () => {
    setSelectedGuild(null);
    setGuideOpen(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const joinGuild = (guild: Guild) => {
    setJoinedGuildId(guild.id);
    localStorage.setItem("edustories_guild", guild.id);
    setSelectedGuild(guild);
  };

  return (
    <section className="guild-page">
      <div className="guild-stars" aria-hidden="true" />

      <header className="guild-hero">
        <div className="guild-title-copy">
          <span className="eyebrow"><Compass size={14} /> Союзы читателей</span>
          <h1>Гильдии Книгочеев</h1>
          <p>Выбери литературный дом, раздели путь с единомышленниками и помоги восстановить Библиотеку Вечности.</p>
        </div>

        <div className="guild-hero-actions">
          <div className="guild-facts" aria-label="Сведения о гильдиях">
            <span><Users size={19} /><b>7 гильдий</b></span>
            <i>◆</i>
            <span><Crown size={19} /><b>до 30 участников</b></span>
            <i>◆</i>
            <span><Shield size={19} /><b>единая цель</b></span>
          </div>
          <button className="guild-guide-button" onClick={() => setGuideOpen(true)}><Info size={19} /> Как выбрать гильдию</button>
        </div>

        <div className="guild-reader-state">
          <span><Crown size={15} /> Уровень {level}</span>
          <span><Sparkles size={15} /> {xp} XP</span>
          <span><Shield size={15} /> {joinedGuild ? joinedGuild.name : "Гильдия не выбрана"}</span>
          <button onClick={onOpenMap}><Compass size={15} /> Вернуться к карте</button>
        </div>
      </header>

      <div className="guild-grid" id="guild-list">
        {guilds.map((guild) => {
          const joined = guild.id === joinedGuildId;
          const style = { "--guild-accent": guild.accent } as CSSProperties;
          return (
            <article className={`guild-card ${joined ? "joined" : ""} ${guild.special ? "special" : ""}`} style={style} key={guild.id}>
              {guild.special && <span className="special-ribbon">Особая гильдия</span>}
              <div className="guild-crest-wrap">
                <img
                  src={`${import.meta.env.BASE_URL}guilds/${guild.image}`}
                  alt={`Герб гильдии «${guild.name}»`}
                  width="300"
                  height="285"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="guild-card-content">
                <h2>{guild.name}</h2>
                <p className="guild-genres">{guild.genres}</p>
                <blockquote>{guild.motto}</blockquote>
                <div className="guild-capacity">
                  <span><Users size={14} /> {guild.members} / 30</span>
                  <i><b style={{ width: `${guild.members / 30 * 100}%` }} /></i>
                </div>
                <button onClick={() => setSelectedGuild(guild)}>
                  {joined ? <><Check size={16} /> Твоя гильдия</> : <>Подробнее <ChevronRight size={16} /></>}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {(selectedGuild || guideOpen) && (
        <div className="guild-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section className="guild-dialog" role="dialog" aria-modal="true" aria-labelledby="guild-dialog-title">
            <button className="guild-dialog-close" onClick={closeDialog} aria-label="Закрыть"><X size={19} /></button>

            {guideOpen ? (
              <>
                <div className="guild-dialog-head guide-head">
                  <img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси — проводник по миру историй" width="210" height="210" />
                  <div>
                    <span>Кси объясняет</span>
                    <h2 id="guild-dialog-title">Как устроены гильдии</h2>
                    <p>«Не торопись с выбором. Ищи место, где тебе захочется обсуждать прочитанное и создавать новые истории вместе».</p>
                  </div>
                </div>
                <div className="guild-guide-grid">
                  <article><b>01</b><h3>Выбери направление</h3><p>Жанр помогает найти единомышленников, но не ограничивает книги, которые ты можешь читать.</p></article>
                  <article><b>02</b><h3>Выполняй общие квесты</h3><p>Совместные ответы, обсуждения и экспедиции возвращают Библиотеке утраченные страницы.</p></article>
                  <article><b>03</b><h3>Расти внутри гильдии</h3><p>Новичок → Подмастерье → Мастер Строк → Старший Летописец → Хранитель.</p></article>
                </div>
                <div className="guild-structure">
                  <span><Crown size={18} /><b>1</b> Хранитель</span>
                  <span><BookOpen size={18} /><b>4</b> Старших Летописца</span>
                  <span><Users size={18} /><b>25</b> действующих членов</span>
                </div>
                <button className="guild-dialog-primary" onClick={closeDialog}><DoorOpen size={17} /> Посмотреть гильдии</button>
              </>
            ) : selectedGuild && (
              <>
                <div className="guild-dialog-head" style={{ "--guild-accent": selectedGuild.accent } as CSSProperties}>
                  <img src={`${import.meta.env.BASE_URL}guilds/${selectedGuild.image}`} alt="" width="300" height="285" />
                  <div>
                    <span>{selectedGuild.special ? "Особая гильдия" : selectedGuild.genres}</span>
                    <h2 id="guild-dialog-title">{selectedGuild.name}</h2>
                    <p>«{selectedGuild.motto}»</p>
                  </div>
                </div>
                <div className="guild-dialog-body">
                  <div className="guild-description">
                    <p>{selectedGuild.description}</p>
                    <article><b>Кому подойдёт</b><span>{selectedGuild.traits}</span></article>
                    <article><b>Связь с историей</b><span>{selectedGuild.lore}</span></article>
                  </div>
                  <aside className="xi-guild-words">
                    <div><img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси" width="64" height="64" /><span><b>Кси</b><small>проводник Книгочея</small></span></div>
                    {selectedGuild.xi.map((line) => <p key={line}>{line}</p>)}
                  </aside>
                </div>
                <div className="guild-dialog-footer">
                  <span><Users size={15} /> {selectedGuild.members} из 30 мест занято</span>
                  <button className="guild-dialog-primary" onClick={() => joinGuild(selectedGuild)} disabled={joinedGuildId === selectedGuild.id}>
                    {joinedGuildId === selectedGuild.id ? <><Check size={17} /> Ты в этой гильдии</> : <><Shield size={17} /> Вступить в гильдию</>}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

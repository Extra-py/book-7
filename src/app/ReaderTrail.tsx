import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Bell,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Compass,
  Flame,
  Gem,
  Library,
  Lock,
  Map as MapIcon,
  Mail,
  Package,
  Search,
  Settings,
  Star,
  Trophy,
  X,
} from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import { AuthSession, getUser } from "./auth";

type ReaderTrailProps = {
  xp: number;
  level: number;
  completedMaps: number;
  displayName: string;
  session: AuthSession;
  onOpenMap: () => void;
  theme: "light" | "dark";
};

type Book = {
  id: number;
  title: string;
  author: string;
  rating: number;
  date: string;
  tag: string;
  note: string;
  favorite: boolean;
  image: string;
  colors: [string, string];
  mark: string;
};

const books: Book[] = [
  {
    id: 1,
    title: "Маленький принц",
    author: "Антуан де Сент-Экзюпери",
    rating: 5,
    date: "14 февраля 2026",
    tag: "Долина Первых Строк",
    note: "Эта история напомнила мне, что главное действительно можно увидеть только сердцем.",
    favorite: true,
    image: "cover-1.webp",
    colors: ["#183d55", "#d7963d"],
    mark: "✦",
  },
  {
    id: 2,
    title: "Хоббит",
    author: "Дж. Р. Р. Толкин",
    rating: 5,
    date: "3 марта 2026",
    tag: "Замок Спящего Дракона",
    note: "Большое путешествие начинается с решения выйти за порог собственного дома.",
    favorite: true,
    image: "cover-2.webp",
    colors: ["#173d2d", "#a46d2c"],
    mark: "ᚱ",
  },
  {
    id: 3,
    title: "Чучело",
    author: "Владимир Железников",
    rating: 4,
    date: "18 марта 2026",
    tag: "Лес Шёпота и Теней",
    note: "Сложная книга о смелости оставаться собой, даже когда весь класс против тебя.",
    favorite: false,
    image: "cover-3.webp",
    colors: ["#493028", "#b67241"],
    mark: "◈",
  },
  {
    id: 4,
    title: "Два капитана",
    author: "Вениамин Каверин",
    rating: 5,
    date: "11 апреля 2026",
    tag: "Океан Нескончаемых Историй",
    note: "Бороться и искать, найти и не сдаваться — лучший девиз для любой экспедиции.",
    favorite: true,
    image: "cover-4.webp",
    colors: ["#21485a", "#d6b46d"],
    mark: "⌁",
  },
  {
    id: 5,
    title: "451° по Фаренгейту",
    author: "Рэй Брэдбери",
    rating: 4,
    date: "27 апреля 2026",
    tag: "Город Живых Зеркал",
    note: "Книги хранят не бумагу, а человеческий опыт, сомнения и право думать самостоятельно.",
    favorite: false,
    image: "cover-5.webp",
    colors: ["#5d201c", "#e08b33"],
    mark: "火",
  },
  {
    id: 6,
    title: "Капитанская дочка",
    author: "Александр Пушкин",
    rating: 5,
    date: "9 мая 2026",
    tag: "Библиотека Вечности",
    note: "Беречь честь смолоду — значит принимать ответственность за выбор даже в трудные времена.",
    favorite: false,
    image: "cover-6.webp",
    colors: ["#2e354c", "#9e3c32"],
    mark: "⚔",
  },
];

const achievements = [
  { icon: BookOpen, title: "Первый том", text: "Прочитана первая книга", earned: true },
  { icon: Flame, title: "Огонь чтения", text: "14 дней без перерыва", earned: true },
  { icon: Compass, title: "Следопыт", text: "Открыты три точки карты", earned: true },
  { icon: Star, title: "Внимательный критик", text: "Поставлены пять оценок", earned: true },
  { icon: Trophy, title: "Мастер пути", text: "Пройдите всю карту", earned: false },
  { icon: Award, title: "Голос гильдии", text: "Завершите три задания вместе", earned: false },
];

const mapHistory = [
  { name: "Карта историй", progress: 68, chapters: "4 из 6 точек", status: "В пути", image: "journey-1.webp" },
  { name: "Тёмный компендиум зимы", progress: 100, chapters: "12 из 12 книг", status: "Завершено", image: "journey-2.webp" },
  { name: "Испытания лесного мудреца", progress: 100, chapters: "8 из 8 книг", status: "Завершено", image: "journey-3.webp" },
  { name: "Алые свитки осени", progress: 60, chapters: "6 из 10 книг", status: "В пути", image: "journey-4.webp" },
];

export default function ReaderTrail({ xp, level, completedMaps, displayName, session, onOpenMap, theme }: ReaderTrailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "library" | "inventory" | "achievements" | "collector">("overview");
  const [bookFilter, setBookFilter] = useState<"all" | "reading" | "read" | "planned">("all");
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const account = getUser(session.username);
  const shownName = account?.displayName || displayName;
  const visibleBooks = useMemo(
    () => books.filter((book) => {
      const progress = book.id === 1 ? 78 : book.id === 2 || book.id === 4 ? 100 : book.id === 3 ? 45 : 0;
      const statusMatch = bookFilter === "all" || (bookFilter === "reading" && progress > 0 && progress < 100) || (bookFilter === "read" && progress === 100) || (bookFilter === "planned" && progress === 0);
      return statusMatch && `${book.title} ${book.author}`.toLowerCase().includes(search.toLowerCase());
    }),
    [bookFilter, search],
  );

  const tabs = [
    ["overview", "Обзор"], ["library", "Библиотека"], ["inventory", "Инвентарь"],
    ["achievements", "Достижения"], ["collector", "Коллекционер"],
  ] as const;

  return (
    <motion.section className="reader-trail reader-cabinet" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="cabinet-profile-banner" style={{ backgroundImage: `${theme === "light" ? "linear-gradient(90deg,rgba(255,252,243,.95),rgba(249,242,223,.68) 56%,rgba(255,255,255,.05))" : "linear-gradient(90deg,rgba(3,14,28,.93),rgba(5,20,38,.62) 58%,rgba(2,13,27,.08))"},url(${import.meta.env.BASE_URL}decor/${theme === "light" ? "reader-profile-banner-light-v2.webp" : "reader-profile-banner-v2.webp"})` }}>
        <div className="cabinet-avatar"><img src={account?.avatar || `${import.meta.env.BASE_URL}decor/reader-default-avatar-v2.webp`} alt={`Аватар ${shownName}`} /><i>✦</i></div>
        <div className="cabinet-identity">
          <h1>{shownName}</h1>
          <p>Искатель Первых Строк</p>
          <div className="cabinet-level"><b>{level}</b><span>Уровень {level}<i><em style={{ width: `${Math.max(12, Math.min(100, (xp % 500) / 5))}%` }} /></i></span><small>{xp.toLocaleString("ru-RU")} / 5 000 XP</small></div>
        </div>
        <div className="cabinet-banner-actions"><button aria-label="Уведомления"><Bell size={18} /></button><button aria-label="Сообщения"><Mail size={18} /></button><button onClick={() => setSettingsOpen(true)}><Settings size={17} /> Настройки</button></div>
      </div>

      <nav className="cabinet-tabs" aria-label="Разделы личного кабинета">
        {tabs.map(([id, label]) => <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>{label}</button>)}
      </nav>

      <div className="cabinet-content">
        {activeTab === "overview" && <OverviewTab xp={xp} completedMaps={completedMaps} onOpenMap={onOpenMap} onSelectBook={setSelectedBook} onOpenInventory={() => setActiveTab("inventory")} />}
        {activeTab === "library" && <LibraryTab books={visibleBooks} filter={bookFilter} search={search} setFilter={setBookFilter} setSearch={setSearch} onSelectBook={setSelectedBook} />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "achievements" && <AchievementsTab />}
        {activeTab === "collector" && <CollectorTab />}
      </div>

      <AnimatePresence>
        {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
        {settingsOpen && <ProfileSettings session={session} onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>
    </motion.section>
  );
}

function OverviewTab({ xp, completedMaps, onOpenMap, onSelectBook, onOpenInventory }: { xp: number; completedMaps: number; onOpenMap: () => void; onSelectBook: (book: Book) => void; onOpenInventory: () => void }) {
  return (
    <div className="cabinet-overview">
      <aside className="cabinet-side-stack">
        <section className="cabinet-panel"><h2><BookOpen size={18} /> Сейчас читаю</h2>{books.slice(0,2).map((book,index)=><button className="now-reading" key={book.id} onClick={()=>onSelectBook(book)}><img src={`${import.meta.env.BASE_URL}books/${book.image}`} alt="" /><span><b>{book.title}</b><small>{book.author}</small><i><em style={{width:index ? "100%":"78%"}} /></i></span><strong>{index ? 100 : 78}%</strong></button>)}</section>
        <section className="cabinet-panel cabinet-goal"><h2><Compass size={18} /> Ближайшая цель</h2><div className="paper-fragment">✦</div><p>Соберите ещё 1 осколок, чтобы восстановить страницу Великой Книги.</p><b>5 / 6</b><i><em style={{width:"83%"}} /></i></section>
      </aside>
      <section className="cabinet-panel great-book"><h2><span>✦</span> Восстановление Великой Книги <span>✦</span></h2><div className="fragment-map">{["Древо","Замок","Сова","Океан","Город","Башня"].map((item,index)=><div className={`fragment-piece ${index>=4?"locked":""}`} key={index}>{index>=4?<Lock size={23}/>:<><span>{index+1}</span><small>{item}</small></>}</div>)}</div><b>4 из 6 осколков</b><button onClick={onOpenMap}>Продолжить путь <ChevronRight size={17}/></button></section>
      <aside className="cabinet-panel cabinet-inventory-mini"><h2><Package size={18}/> Инвентарь</h2><ul><li><Coins/>Золотые чернила <b>1 240</b></li><li><Gem/>Кристаллы памяти <b>86</b></li><li><Medallion/>Жетоны гильдии <b>315</b></li><li><Library/>Осколки книг <b>{completedMaps + 4} / 7</b></li></ul><div className="mini-artifacts">{[1,2,3].map(n=><img key={n} src={`${import.meta.env.BASE_URL}collector-cards/card-${n}.webp`} alt="Артефакт" />)}</div><button onClick={onOpenInventory}>Открыть инвентарь <ChevronRight size={16}/></button></aside>
      <section className="cabinet-panel overview-achievements"><h2><Trophy size={18}/> Достижения</h2>{achievements.slice(0,4).map(({icon:Icon,title,text,earned})=><article className={earned?"":"locked"} key={title}><i><Icon size={22}/></i><span><b>{title}</b><small>{text}</small></span>{earned?<Check size={14}/>:<Lock size={14}/>}</article>)}<div className="overview-score"><b>{xp}</b><small>общий опыт</small></div></section>
    </div>
  );
}

function LibraryTab({books,filter,search,setFilter,setSearch,onSelectBook}:{books:Book[];filter:"all"|"reading"|"read"|"planned";search:string;setFilter:(v:"all"|"reading"|"read"|"planned")=>void;setSearch:(v:string)=>void;onSelectBook:(b:Book)=>void}) {
  return <section className="cabinet-library"><div className="cabinet-section-head"><div><h2>Моя библиотека</h2><p>24 книги · 8 прочитано · 3 читаю</p></div><label><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Найти книгу"/></label></div><div className="cabinet-filters">{[["all","Все"],["reading","Читаю"],["read","Прочитано"],["planned","Хочу прочитать"]].map(([id,label])=><button key={id} className={filter===id?"active":""} onClick={()=>setFilter(id as typeof filter)}>{label}</button>)}</div><div className="cabinet-book-grid">{books.map(book=><BookCard book={book} key={book.id} onOpen={()=>onSelectBook(book)}/>)}</div></section>;
}

function InventoryTab(){
  const artifacts=[{name:"Перо Первой Страницы",rarity:"Легендарный",text:"Увеличивает получение опыта на 15%."},{name:"Фонарь Шёпота",rarity:"Редкий",text:"Освещает скрытые подсказки на карте мира."},{name:"Печать Пергамента",rarity:"Эпический",text:"Снижает стоимость открытия страниц на 10%."},{name:"Закладка Вечности",rarity:"Редкий",text:"Увеличивает запас энергии на 1."},{name:"Песочные часы Анналии",rarity:"Легендарный",text:"Сокращает время ожидания чтения на 20%."}];
  return <section className="cabinet-inventory"><div className="cabinet-section-head"><div><h2>Инвентарь</h2><p>Собранные ресурсы и артефакты путешествия</p></div></div><div className="currency-row"><article><Coins/><span>Золотые чернила<b>1 240</b></span></article><article><Gem/><span>Кристаллы памяти<b>86</b></span></article><article><Medallion/><span>Жетоны гильдии<b>315</b></span></article></div><div className="fragment-strip"><h3>Осколки Великой Книги — 4 из 7</h3>{[0,1,2,3,4,5,6].map(n=><i className={n>3?"locked":""} key={n}>{n>3?<Lock size={18}/>:"✦"}</i>)}</div><h3 className="cabinet-subtitle">✦ Артефакты</h3><div className="artifact-grid">{artifacts.map((item,index)=><article key={item.name}><img src={`${import.meta.env.BASE_URL}collector-cards/card-${index+1}.webp`} alt=""/><h4>{item.name}</h4><b>{item.rarity}</b><p>{item.text}</p>{index<2&&<button>{index===0?<><Check size={14}/> Экипировано</>:"Экипировать"}</button>}</article>)}</div></section>;
}

function AchievementsTab(){return <section className="cabinet-achievements"><div className="cabinet-section-head"><div><h2>Достижения</h2><p>12 получено · 24 всего</p></div></div><article className="next-achievement"><i><Trophy size={40}/></i><div><small>Ближайшая цель</small><h3>Мастер пути</h3><p>Пройдите все карты</p><span><em style={{width:"34%"}}/></span></div><b>2 из 6</b><aside>Награда<strong>Особый титул<br/>и знак пути</strong></aside></article><div className="achievement-columns"><div><h3>Полученные</h3><div className="cabinet-achievement-grid">{achievements.slice(0,4).map(({icon:Icon,title,text})=><article key={title}><Check size={13}/><i><Icon size={37}/></i><h4>{title}</h4><p>{text}</p></article>)}</div></div><div><h3>Закрытые</h3><div className="cabinet-achievement-grid">{[...achievements.slice(4),{icon:Gem,title:"Хранитель осколков",text:"Соберите все осколки"},{icon:Library,title:"Легенда библиотеки",text:"Соберите все книги"}].map(({icon:Icon,title,text})=><article className="locked" key={title}><Lock size={13}/><i><Icon size={37}/></i><h4>{title}</h4><p>{text}</p></article>)}</div></div></div></section>}

function CollectorTab(){const names=["Анналия","Люминар","Инкогнита","Нова","Кси","Великая Библиотека"];return <section className="cabinet-collector"><div className="cabinet-section-head"><div><h2>Коллекционер</h2><p>18 из 42 карточек</p></div><label><Search size={18}/><input placeholder="Найти карточку"/></label></div><div className="cabinet-filters"><button className="active">Все</button><button>Персонажи</button><button>Места</button><button>Артефакты</button><button>Редкие</button></div><div className="collection-progress">До новой карточки — <b>2 истории</b><i><em style={{width:"56%"}}/></i></div><div className="collection-grid">{names.map((name,index)=><article key={name}><img src={`${import.meta.env.BASE_URL}collector-cards/card-${index}.webp`} alt={name}/><h3>{name}</h3><p>{index>3?"Легендарная":index===1||index===2?"Редкая":"Обычная"}</p></article>)}{[1,2].map(n=><article className="locked" key={n}><Lock size={42}/><h3>Не открыто</h3></article>)}</div></section>}

function Medallion(){return <Star size={20}/>}

function BookCard({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const progress = book.id === 1 ? 78 : book.id === 2 || book.id === 4 ? 100 : book.id === 3 ? 45 : 0;
  return (
    <motion.article className="cabinet-book-card" whileHover={{ y: -5 }}>
      <button className="book-cover" onClick={onOpen}>
        <img src={`${import.meta.env.BASE_URL}books/${book.image}`} alt={`Обложка книги «${book.title}»`} width="190" height="311" loading="lazy" decoding="async" />
      </button>
      <h3>{book.title}</h3><p>{book.author}</p><span>{progress===100?<><Check size={13}/> Прочитано</>:progress>0?<><BookOpen size={13}/> Читаю</>:<><Bookmark size={13}/> Хочу прочитать</>}</span><div><i><em style={{width:`${progress}%`}}/></i><b>{progress}%</b></div>{progress>0&&progress<100&&<button onClick={onOpen}>Продолжить чтение</button>}
    </motion.article>
  );
}

function BookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const [note, setNote] = useState(book.note);
  const [saved, setSaved] = useState(false);
  return (
    <motion.div className="book-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="book-modal" initial={{ scale: .95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .95, y: 20 }} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <span className="eyebrow"><BookOpen size={13} /> Запись в дневнике</span>
        <h2>{book.title}</h2>
        <p className="book-modal-author">{book.author}</p>
        <div className="book-modal-meta"><span><BookOpen size={14} /> {book.date}</span><span><Star size={14} /> {book.rating} из 5</span></div>
        <label><BookOpen size={15} /> Мысли после чтения</label>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} />
        <button className="primary-button" onClick={() => setSaved(true)}>{saved ? "Запись сохранена" : "Сохранить запись"}</button>
      </motion.div>
    </motion.div>
  );
}

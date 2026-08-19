import { useMemo, useState } from "react";
import {
  BookOpen,
  Flame,
  Check,
  Compass,
  Eye,
  Feather,
  Ghost,
  Link2,
  LockKeyhole,
  MessageSquareText,
  Search,
  Shield,
  Sparkles,
  Star,
  X,
} from "lucide-react";

type BestiaryProps = {
  onOpenMap: () => void;
};

type Filter = "all" | "spirits" | "guardians" | "shadows" | "unknown";

const lockedCreatures = [
  { id: 2, category: "guardians" as Filter, shape: "wing" },
  { id: 3, category: "spirits" as Filter, shape: "horn" },
  { id: 4, category: "shadows" as Filter, shape: "tail" },
  { id: 5, category: "guardians" as Filter, shape: "crown" },
  { id: 6, category: "spirits" as Filter, shape: "wing" },
  { id: 7, category: "shadows" as Filter, shape: "horn" },
  { id: 8, category: "unknown" as Filter, shape: "tail" },
  { id: 9, category: "guardians" as Filter, shape: "crown" },
  { id: 10, category: "spirits" as Filter, shape: "wing" },
  { id: 11, category: "shadows" as Filter, shape: "tail" },
  { id: 12, category: "unknown" as Filter, shape: "horn" },
];

const abilities = [
  { icon: BookOpen, title: "Память страниц", text: "Помнит содержание каждой истории, когда-либо хранившейся в Библиотеке." },
  { icon: Flame, title: "Тёплое свечение", text: "Освещает путь в самых тёмных уголках забытых историй." },
  { icon: Link2, title: "Связь осколков", text: "Чувствует другие части расколотой Библиотеки даже издалека." },
  { icon: MessageSquareText, title: "Голос историй", text: "Говорит языком любого жанра — от поэзии до документального отчёта." },
];

const traits = [
  ["Теплота", 85],
  ["Любопытство", 95],
  ["Терпение", 78],
  ["Ностальгия", 90],
  ["Ирония", 60],
] as const;

export default function Bestiary({ onOpenMap }: BestiaryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [entryOpen, setEntryOpen] = useState(false);

  const visibleLocked = useMemo(() => {
    const text = query.trim().toLowerCase();
    return lockedCreatures.filter((creature) => (filter === "all" || creature.category === filter) && (!text || "неизвестное существо".includes(text)));
  }, [filter, query]);
  const showXi = (filter === "all" || filter === "spirits" || filter === "guardians") && (!query.trim() || "кси голос библиотеки вечности".includes(query.trim().toLowerCase()));

  return (
    <section className="bestiary-page">
      <div className="bestiary-stars" aria-hidden="true" />
      <header className="bestiary-hero">
        <div>
          <span className="eyebrow"><Sparkles size={14} /> Архив существ</span>
          <h1>Бестиарий</h1>
          <p>Открывай существ, собирай знания и восстанавливай утраченные страницы Библиотеки Вечности.</p>
        </div>
        <div className="bestiary-progress-card">
          <div><span>Открыто</span><b>1 из 12</b><BookOpen size={30} /></div>
          <i><b /></i>
        </div>
      </header>

      <div className="bestiary-tools">
        <label><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти существо…" /></label>
        <div className="bestiary-filters">
          {([['all','Все'],['spirits','Духи'],['guardians','Хранители'],['shadows','Тени'],['unknown','Неизвестные']] as [Filter,string][]).map(([id,label]) => (
            <button className={filter === id ? "active" : ""} onClick={() => setFilter(id)} key={id}>{label}</button>
          ))}
        </div>
        <button className="bestiary-sort"><Star size={16} /> По редкости</button>
      </div>

      <div className="bestiary-grid">
        {showXi && (
          <article className="creature-card creature-featured">
            <div className="creature-portrait"><img src={`${import.meta.env.BASE_URL}bestiary/xi-portrait.webp`} alt="Кси — Голос Библиотеки Вечности" width="500" height="701" /></div>
            <div className="creature-copy">
              <span>Запись №001</span>
              <div className="creature-name-line"><h2>КСИ</h2><em><i /> На связи</em></div>
              <div className="creature-tags"><b>Дух-хранитель</b><b>Свет и Слово</b></div>
              <div className="creature-rarity"><span>★★★★★</span> Уникальная</div>
              <p>Искра сознания Библиотеки Вечности. Помнит утраченные истории и помогает каждому Книгочею найти свой путь.</p>
              <div className="creature-familiarity"><span>Знакомство <b>83%</b></span><small>12 из 15 записей</small><i><b /></i></div>
              <button onClick={() => setEntryOpen(true)}>Открыть запись <Feather size={17} /></button>
            </div>
          </article>
        )}

        {visibleLocked.map((creature) => (
          <article className="creature-card creature-locked" key={creature.id}>
            <div className={`creature-silhouette ${creature.shape}`}><Ghost size={92} /><span>✦</span><span>✧</span><span>✦</span></div>
            <i><LockKeyhole size={23} /></i>
            <h2>Неизвестное<br />существо</h2>
            <p>Найдите следы<br />в мире историй.</p>
          </article>
        ))}
      </div>

      {!showXi && visibleLocked.length === 0 && <div className="bestiary-empty"><Eye size={30} /><p>В архиве пока нет существа с таким именем.</p></div>}
      <p className="bestiary-footnote">✦ Новые существа откроются по мере прохождения карты историй ✦</p>

      {entryOpen && (
        <div className="bestiary-entry-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setEntryOpen(false)}>
          <section className="bestiary-entry" role="dialog" aria-modal="true" aria-labelledby="xi-entry-title">
            <button className="bestiary-entry-close" onClick={() => setEntryOpen(false)} aria-label="Закрыть запись"><X size={20} /></button>
            <aside className="bestiary-entry-portrait"><img src={`${import.meta.env.BASE_URL}bestiary/xi-portrait.webp`} alt="Кси в Библиотеке Вечности" width="500" height="701" /></aside>
            <div className="bestiary-entry-content">
              <span>Бестиарий · Запись №001</span>
              <div className="entry-title-line"><div><h2 id="xi-entry-title">КСИ</h2><p>Голос Библиотеки Вечности</p></div><em><i /> На связи</em></div>
              <div className="entry-classification"><b>Дух-хранитель</b><b>Свет и Слово</b><b>★★★★★ Уникальна</b></div>
              <p className="entry-lead">Кси родилась вместе с Библиотекой Вечности — она была её сердцем, сознанием и связующей нитью. После раскола осталась искрой прежней силы, но даже эхо помнит мелодию целиком.</p>

              <section><h3>Особые способности</h3><div className="entry-abilities">{abilities.map(({icon:Icon,title,text}) => <article key={title}><Icon size={28} /><b>{title}</b><p>{text}</p></article>)}</div></section>
              <blockquote>«Даже эхо может быть полезным».</blockquote>

              <div className="entry-columns">
                <section><h3>Характер</h3>{traits.map(([name,value]) => <div className="entry-trait" key={name}><span>{name}<b>{value}%</b></span><i><b style={{width:`${value}%`}} /></i></div>)}</section>
                <section><h3>Известные факты</h3><ul><li>Имя «Кси» — лишь то, что осталось от полного имени после раскола.</li><li>Она привязана к регионам, где хранятся части Библиотеки.</li><li>Искренне радуется встрече с каждым новым читателем.</li></ul></section>
              </div>

              <div className="entry-footer"><div><span>Прогресс знакомства</span><b>83%</b><i><b /></i><small>Открыто записей: 12 из 15</small></div><button onClick={onOpenMap}><Compass size={18} /> Продолжить общение</button></div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

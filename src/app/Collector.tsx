import { useMemo, useState } from "react";
import { BookOpen, Check, Compass, LockKeyhole, Sparkles } from "lucide-react";

type CollectorProps = {
  completedLocations: number[];
  answers: Record<string, string>;
  onOpenMap: () => void;
};

const cards = [
  { id: 0, title: "Голос Библиотеки", subtitle: "Знакомство с Кси", lore: "Кси помнит каждую историю, которую кто-то полюбил. Поэтому она спрашивает не сколько страниц ты прочёл, а что осталось с тобой после них." },
  { id: 1, title: "Хранитель Розы", subtitle: "Долина Первых Строк", lore: "Роза становится единственной потому, что ей подарили время. Внимание создаёт ценность — в книгах и за их пределами." },
  { id: 2, title: "Искра Смелости", subtitle: "Замок Спящего Дракона", lore: "Смелость Бильбо началась не с битвы, а в тот миг, когда он шагнул за порог, не зная, кем вернётся домой." },
  { id: 3, title: "Честное Зеркало", subtitle: "Лес Шёпота и Теней", lore: "Иногда зеркало показывает не лицо, а выбор. После честного взгляда чужое мнение уже не может украсть твоё имя." },
  { id: 4, title: "Компас Искателя", subtitle: "Океан Нескончаемых Историй", lore: "Настоящий компас указывает не на север, а на обещание, которое человек отказывается забыть." },
  { id: 5, title: "Живая Строка", subtitle: "Город Живых Зеркал", lore: "Огонь может уничтожить бумагу, но не мысль, которую читатель успел сделать своей." },
  { id: 6, title: "Первая Страница", subtitle: "Библиотека Вечности", lore: "Первая Страница пуста не потому, что история исчезла. Она ждёт того, кто решится написать начало собственным голосом." },
  { id: 7, title: "Неизвестная карта", subtitle: "За верным заданием региона", lore: "Эта история ещё спит. Её оборот станет виден, когда откроется следующий регион Книжных Земель." },
];

export default function Collector({ completedLocations, answers, onOpenMap }: CollectorProps) {
  const [flipped, setFlipped] = useState<number | null>(null);
  const answeredCount = useMemo(() => Object.values(answers).filter((answer) => answer.trim()).length, [answers]);
  const isUnlocked = (id: number) => id === 0 || completedLocations.includes(id);
  const received = cards.filter((card) => isUnlocked(card.id)).length;

  return (
    <section className="collector-page">
      <div className="collector-shelf collector-shelf-left" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}decor/collector-left.webp)` }} aria-hidden="true" />
      <div className="collector-shelf collector-shelf-right" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}decor/collector-right.webp)` }} aria-hidden="true" />
      <header className="collector-hero">
        <span className="eyebrow"><Sparkles size={13} /> Архив редкостей</span>
        <h1>Коллекционер</h1>
        <p>Завершай задания на карте, получай карточки и открывай скрытую историю.</p>
        <div className="collector-summary">
          <i className="collector-compass"><Compass size={31} /></i>
          <span><b>{received}</b>получено</span>
          <span><b>{cards.length - received}</b>скрыто</span>
          <span><b>{answeredCount}</b>ответов сохранено</span>
          <button onClick={onOpenMap}><Compass size={15} /> К карте</button>
        </div>
      </header>

      <div className="collector-grid">
        {cards.map((card) => {
          const unlocked = isUnlocked(card.id);
          const isFlipped = flipped === card.id && unlocked;
          return (
            <button
              className={`story-collectible ${isFlipped ? "flipped" : ""} ${unlocked ? "unlocked" : "locked"}`}
              key={card.id}
              onClick={() => unlocked && setFlipped(isFlipped ? null : card.id)}
              aria-label={unlocked ? `${card.title}: перевернуть карточку` : `${card.title}: закрыто`}
            >
              <span className="collectible-inner">
                <span className="collectible-face collectible-front">
                  <img src={`${import.meta.env.BASE_URL}collector-cards/card-${unlocked ? card.id : 7}.webp`} alt="" width="320" height="260" loading="lazy" decoding="async" />
                  {!unlocked && <i className="collector-lock"><LockKeyhole size={25} /></i>}
                  {unlocked && <em><Check size={11} /> Получено</em>}
                </span>
                <span className="collectible-face collectible-back">
                  <BookOpen size={25} />
                  <strong>{card.title}</strong>
                  <p>{card.lore}</p>
                  <small>Нажми, чтобы вернуть карточку</small>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

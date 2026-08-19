import {
  Beaker,
  BookOpen,
  Compass,
  FileSignature,
  LibraryBig,
  PawPrint,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

type HomePageProps = {
  isAuthenticated: boolean;
  onOpenJourney: () => void;
  onOpenGuild: () => void;
  onOpenTavern: () => void;
  onOpenAlchemy: () => void;
  onOpenContracts: () => void;
  onOpenBestiary: () => void;
  onOpenProfile: () => void;
  onLogin: () => void;
  onRegister: () => void;
};

const worldCards = [
  { title: "Путь героя", text: "Исследуй карту и возвращай историям утраченные страницы.", icon: Compass, action: "journey" },
  { title: "Семь гильдий", text: "Найди читательский дом и единомышленников.", icon: Users, action: "guild" },
  { title: "Зал контрактов", text: "Бери осознанные задания и держи слово.", icon: FileSignature, action: "contracts" },
  { title: "Алхимия", text: "Смешивай эссенции прочитанных историй.", icon: Beaker, action: "alchemy" },
  { title: "Таверна", text: "Разгадывай загадки Бабушки Глоссы.", icon: LibraryBig, action: "tavern" },
  { title: "Бестиарий", text: "Открывай загадочных хранителей Библиотеки.", icon: PawPrint, action: "bestiary" },
] as const;

const steps = [
  ["01", "Выбери путь", "Познакомься с миром и найди близкую тебе гильдию."],
  ["02", "Читай и исследуй", "Проходи книги, отвечай на вопросы и сохраняй мысли."],
  ["03", "Бери контракты", "Ставь понятные цели и получай награды за выполненное слово."],
  ["04", "Собирай осколки", "Открывай карточки, эссенции и страницы Библиотеки."],
];

export default function HomePage({
  isAuthenticated,
  onOpenJourney,
  onOpenGuild,
  onOpenTavern,
  onOpenAlchemy,
  onOpenContracts,
  onOpenBestiary,
  onOpenProfile,
  onLogin,
  onRegister,
}: HomePageProps) {
  const actions = {
    journey: onOpenJourney,
    guild: onOpenGuild,
    contracts: onOpenContracts,
    alchemy: onOpenAlchemy,
    tavern: onOpenTavern,
    bestiary: onOpenBestiary,
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker"><Sparkles size={15} /> Библиотека Вечности открыта</span>
          <h1>Чтение становится <em>приключением</em></h1>
          <p>Библиотека расколота. Читай, исследуй миры и собирай осколки знаний, чтобы вернуть историям единый голос.</p>
          <div className="home-hero-actions">
            <button className="home-primary" onClick={onOpenJourney}>Начать свою историю <span>→</span></button>
            <a href="#home-prologue">Узнать больше <span>↓</span></a>
          </div>
          <div className="home-trust">
            <span><b>3 204</b> читателя уже вошли в Библиотеку</span>
            <span><b>12 847</b> книг прочитано</span>
          </div>
        </div>
        <div className="home-hero-art">
          <div className="home-ksi-arch">
            <img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси — проводник Библиотеки Вечности" width="960" height="1920" loading="eager" />
          </div>
          <div className="home-ksi-note">
            <small>Твой проводник</small>
            <b>Кси ждёт тебя</b>
            <p>«Каждая страница помнит путь домой»</p>
          </div>
        </div>
      </section>

      <section className="home-prologue" id="home-prologue">
        <Sparkles size={22} />
        <span className="home-kicker">Пролог</span>
        <h2>Когда знание было единым</h2>
        <blockquote>
          «Давным-давно существовала Библиотека Вечности — место, где хранились все рассказанные и ещё не написанные истории. Но однажды она раскололась, а её осколки разлетелись по семи гильдиям…»
        </blockquote>
        <p>Лишь истинные Книгочеи способны найти утраченные фрагменты и снова соединить голоса историй.</p>
      </section>

      <section className="home-section home-world">
        <div className="home-section-heading">
          <span className="home-kicker"><Compass size={15} /> Карта возможностей</span>
          <h2>Твоё путешествие начинается здесь</h2>
          <p>Каждая область Библиотеки предлагает свой способ читать, учиться и находить единомышленников.</p>
        </div>
        <div className="home-world-layout">
          <div className="home-world-art">
            <img src={`${import.meta.env.BASE_URL}home/library-region.webp`} alt="Один из регионов Библиотеки Вечности" width="900" height="1350" loading="lazy" decoding="async" />
            <span>Архив тайн</span><span>Врата историй</span><span>Забытые земли</span>
          </div>
          <div className="home-world-grid">
            {worldCards.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.title} onClick={actions[item.action]}>
                  <Icon size={25} />
                  <span><b>{item.title}</b><small>{item.text}</small></span>
                  <i>↗</i>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section home-path">
        <div className="home-section-heading">
          <span className="home-kicker"><BookOpen size={15} /> Как это работает</span>
          <h2>Твой путь Книгочея</h2>
        </div>
        <div className="home-steps">
          {steps.map(([number, title, text]) => (
            <article key={number}><i>{number}</i><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
        <button className="home-secondary" onClick={onOpenGuild}><Shield size={17} /> Познакомиться с гильдиями</button>
      </section>

      <section className="home-residents">
        <div className="home-section-heading">
          <span className="home-kicker"><Sparkles size={15} /> Жители Библиотеки</span>
          <h2>В этом мире ты не один</h2>
        </div>
        <div className="home-resident-grid">
          <article>
            <img src={`${import.meta.env.BASE_URL}tavern/glossa.webp`} alt="Бабушка Глосса" loading="lazy" decoding="async" />
            <div><small>Хранительница таверны</small><h3>Бабушка Глосса</h3><p>Знает больше, чем говорит, и всегда держит наготове загадку.</p><button onClick={onOpenTavern}>Зайти в таверну →</button></div>
          </article>
          <article>
            <img src={`${import.meta.env.BASE_URL}alchemy/master-flyagius.webp`} alt="Мастер Флягиус" loading="lazy" decoding="async" />
            <div><small>Алхимик историй</small><h3>Мастер Флягиус</h3><p>Превращает жанры, впечатления и знания в редкие артефакты.</p><button onClick={onOpenAlchemy}>Открыть лабораторию →</button></div>
          </article>
          <article>
            <img src={`${import.meta.env.BASE_URL}xi-guide.webp`} alt="Кси" loading="lazy" decoding="async" />
            <div><small>Голос Библиотеки</small><h3>Кси</h3><p>Сопровождает читателя между страницами и помогает услышать смысл.</p><button onClick={onOpenBestiary}>Открыть запись Кси →</button></div>
          </article>
        </div>
      </section>

      <section className="home-numbers">
        <div><b>12 847</b><span>прочитанных книг</span></div>
        <div><b>3 204</b><span>Книгочея</span></div>
        <div><b>28 193</b><span>контракта выполнено</span></div>
        <div><b>847</b><span>осколков найдено</span></div>
      </section>

      <section className="home-final">
        <img src={`${import.meta.env.BASE_URL}home/library-gates.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div>
          <span className="home-kicker">Твоя первая страница</span>
          <h2>Библиотека ждёт своего читателя</h2>
          <p>Каждая история начинается с первого шага. Сделай его сейчас.</p>
          {isAuthenticated ? (
            <button className="home-primary" onClick={onOpenProfile}>Продолжить сохранённый путь →</button>
          ) : (
            <div className="home-final-actions">
              <button className="home-primary" onClick={onRegister}>Создать аккаунт Книгочея →</button>
              <button onClick={onLogin}>Уже есть аккаунт? Войти</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

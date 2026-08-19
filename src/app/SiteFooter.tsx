import { BookOpen, GraduationCap, Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

type FooterProps = {
  tone?: "theme" | "portal" | "academy" | "library" | "tavern" | "alchemy" | "admin" | "auth";
  admin?: boolean;
  onPortal?: () => void;
  onLibrary?: () => void;
  onLearning?: () => void;
  onMap?: () => void;
  onGuilds?: () => void;
  onTavern?: () => void;
  onBestiary?: () => void;
  onCollector?: () => void;
};

export default function SiteFooter(props: FooterProps) {
  const navigate = (action?: () => void) => action?.();
  const tone = props.tone || "theme";

  return (
    <footer className={`site-footer site-footer-${tone}`}>
      <div className="site-footer-main">
        <section className="footer-about">
          <button className="footer-brand" onClick={() => navigate(props.onPortal)} disabled={!props.onPortal}>
            <img src={`${BASE}brand/edustories-logo.webp`} alt="" width="58" height="64" />
            <span><b>EduStories</b><small>Знания оживают</small></span>
          </button>
          <p>Образовательное пространство, в котором чтение, творчество и обучение превращаются в настоящее путешествие.</p>
          <span className="footer-project-status"><i /> Проект развивается</span>
        </section>

        {!props.admin && <>
          <nav className="footer-column" aria-label="Разделы платформы">
            <h2>Платформа</h2>
            <button onClick={() => navigate(props.onPortal)}>Единая главная</button>
            <button onClick={() => navigate(props.onLibrary)}><BookOpen size={14} /> Библиотека</button>
            <button onClick={() => navigate(props.onLearning)}><GraduationCap size={14} /> Обучение</button>
            <button onClick={() => navigate(props.onMap)}>Карта историй</button>
          </nav>
          <nav className="footer-column" aria-label="Сообщество EduStories">
            <h2>Сообщество</h2>
            <button onClick={() => navigate(props.onGuilds)}>Гильдии Книгочеев</button>
            <button onClick={() => navigate(props.onTavern)}>Таверна</button>
            <button onClick={() => navigate(props.onBestiary)}>Бестиарий</button>
            <button onClick={() => navigate(props.onCollector)}>Коллекционер</button>
          </nav>
        </>}

        <section className="footer-column footer-info">
          <h2>{props.admin ? "Администрирование" : "Информация"}</h2>
          {props.admin ? <>
            <span>Панель управления</span>
            <span>Статистика пользователей</span>
            <span>Обращения поддержки</span>
            <span>Экспорт данных</span>
          </> : <>
            <button>О проекте</button>
            <button>Для школ и педагогов</button>
            <button>Частые вопросы</button>
            <button>Правила сообщества</button>
          </>}
        </section>

        <address className="footer-column footer-contacts">
          <h2>Связаться с нами</h2>
          <a href="mailto:support@edustories.ru"><Mail size={15} /> support@edustories.ru</a>
          <span><MessageCircle size={15} /> Поддержка на каждой странице</span>
          <span><MapPin size={15} /> Россия</span>
          <small>Ответим в рабочее время<br />с понедельника по пятницу.</small>
        </address>
      </div>

      <div className="site-footer-bottom">
        <p>© {new Date().getFullYear()} EduStories. Все права защищены.</p>
        <nav aria-label="Правовая информация">
          <button>Политика конфиденциальности</button>
          <button>Пользовательское соглашение</button>
          <button>Использование файлов cookie</button>
        </nav>
        <span><ShieldCheck size={14} /> Безопасное образовательное пространство</span>
      </div>
    </footer>
  );
}

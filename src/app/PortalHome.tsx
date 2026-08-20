import { ArrowRight, Moon, Sun } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

type Props = {
  isAuthenticated: boolean;
  displayName?: string;
  onOpenLibrary: () => void;
  onOpenLearning: () => void;
  onLogin: () => void;
  onOpenProfile: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function PortalHome(props: Props) {
  return (
    <section className={`portal-home portal-${props.theme}`} aria-label="Главная страница EduStories">
      <img className="portal-art" src={`${BASE}brand/${props.theme === "light" ? "portal-worlds-light-v2.webp" : "portal-worlds-v2.png"}`} alt="" width="1728" height="941" fetchPriority="high" decoding="async" />

      <header className="portal-header">
        <div className="portal-brand" aria-label="EduStories">
          <img src={`${BASE}brand/edustories-logo.webp`} alt="" width="74" height="80" />
          <span><b>EduStories</b><small>Знания оживают</small></span>
        </div>
        <div className="portal-header-actions">
          <button className="portal-theme-toggle" onClick={props.onToggleTheme} aria-label={props.theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}>
            <span className={props.theme === "light" ? "active" : ""}><Sun size={17} /></span>
            <span className={props.theme === "dark" ? "active" : ""}><Moon size={17} /></span>
          </button>
          {props.isAuthenticated ? (
            <button className="portal-account-button" onClick={props.onOpenProfile}>{props.displayName || "Личный кабинет"}</button>
          ) : (
            <button className="portal-egid-button" onClick={props.onLogin}>Войти по EG ID</button>
          )}
        </div>
      </header>

      <main className="portal-content">
        <article className="portal-column portal-education">
          <span className="portal-kicker">Образование</span>
          <h1>Учись.<br /><em>Решай.</em><br />Расти.</h1>
          <p>Помощь с заданиями и обучение<br />с проверенными мастерами</p>
          <button className="portal-action" onClick={props.onOpenLearning}>Перейти к обучению <ArrowRight size={18} /></button>
        </article>

        <article className="portal-column portal-reading">
          <span className="portal-kicker">Интерактивные книги</span>
          <h1>Читай.<br /><em>Выбирай.</em><br />Проживай.</h1>
          <p>Истории, где каждое<br />решение меняет путь</p>
          <button className="portal-action" onClick={props.onOpenLibrary}>Открыть библиотеку <ArrowRight size={18} /></button>
        </article>
      </main>

      <footer className="portal-footer"><span />Два мира — одна любовь к знаниям<span /></footer>
    </section>
  );
}

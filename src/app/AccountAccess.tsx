import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Eye, EyeOff, GraduationCap, KeyRound, ShieldCheck, UserPlus, X } from "lucide-react";
import { AuthSession, demoAdmins, loadUsers, passwordHash, saveSession, saveUsers } from "./auth";
import SiteFooter from "./SiteFooter";

type AccountAccessProps = {
  onAuthenticated: (session: AuthSession) => void;
  initialMode?: "login" | "register";
  onClose?: () => void;
  theme?: "light" | "dark";
};

export default function AccountAccess({ onAuthenticated, initialMode = "login", onClose, theme = "dark" }: AccountAccessProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const login = username.trim().toLowerCase();
    setError("");

    if (!/^[a-zа-яё0-9_.-]{3,24}$/i.test(login)) {
      setError("Логин должен содержать от 3 до 24 букв, цифр, точек или дефисов.");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен содержать не меньше 6 символов.");
      return;
    }

    if (mode === "login") {
      const admin = demoAdmins.find((item) => item.username === login && item.password === password);
      if (admin) {
        const session: AuthSession = { username: admin.username, displayName: admin.displayName, role: "admin" };
        saveSession(session);
        onAuthenticated(session);
        return;
      }

      const users = loadUsers();
      const userIndex = users.findIndex((item) => item.username === login && item.passwordHash === passwordHash(password));
      if (userIndex < 0) {
        setError("Неверный логин или пароль.");
        return;
      }
      users[userIndex].lastLoginAt = new Date().toISOString();
      saveUsers(users);
      const session: AuthSession = { username: users[userIndex].username, displayName: users[userIndex].displayName, role: "user" };
      saveSession(session);
      onAuthenticated(session);
      return;
    }

    const name = displayName.trim();
    if (name.length < 2) {
      setError("Укажите имя, которое будет отображаться в дневнике.");
      return;
    }
    if (demoAdmins.some((item) => item.username === login) || loadUsers().some((item) => item.username === login)) {
      setError("Этот логин уже занят.");
      return;
    }

    const now = new Date().toISOString();
    saveUsers([
      ...loadUsers(),
      {
        username: login,
        displayName: name,
        passwordHash: passwordHash(password),
        registeredAt: now,
        lastLoginAt: now,
        xp: 240,
        level: 1,
        completedMaps: 0,
        answersCount: 0,
      },
    ]);
    const session: AuthSession = { username: login, displayName: name, role: "user" };
    saveSession(session);
    onAuthenticated(session);
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError("");
    setPassword("");
  };

  return (
    <div className={`auth-page auth-worlds ${onClose ? "auth-overlay" : ""}`}>
      {onClose && <button className="auth-close" onClick={onClose} aria-label="Закрыть форму входа"><X size={21} /></button>}
      <img className="auth-worlds-art" src={`${import.meta.env.BASE_URL}auth/${theme === "light" ? "two-worlds-auth-light-v2.webp" : "two-worlds-auth-v2.webp"}`} alt="" aria-hidden="true" />
      <div className="auth-worlds-shade" aria-hidden="true" />

      <header className="auth-worlds-header">
        <img src={`${import.meta.env.BASE_URL}brand/edustories-logo.webp`} alt="Логотип EduStories" />
        <span><strong>EduStories</strong><small>Знания оживают</small></span>
      </header>

      <motion.aside className="auth-world-copy auth-world-learning" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <span><GraduationCap size={16} /> Образование</span>
        <h1>Учись.<br /><em>Решай.</em><br />Расти.</h1>
        <p>Задания, обучение и помощь проверенных мастеров.</p>
      </motion.aside>

      <motion.aside className="auth-world-copy auth-world-library" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <span><BookOpen size={16} /> Интерактивные книги</span>
        <h1>Читай.<br /><em>Выбирай.</em><br />Проживай.</h1>
        <p>Истории, в которых каждое решение меняет путь.</p>
      </motion.aside>

      <motion.section className="auth-card auth-unified-card" initial={{ opacity: 0, y: 25, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
        <span className="auth-seal"><KeyRound size={24} /></span>
        <p className="auth-kicker">{mode === "login" ? "Единый кабинет EduStories" : "Единый профиль EduStories"}</p>
        <h2>{mode === "login" ? "С возвращением" : "Создать аккаунт"}</h2>
        <p>{mode === "login" ? "Один вход открывает обучение и мир историй." : "Создай один аккаунт для обоих миров EduStories."}</p>

        <div className="auth-tabs" role="tablist" aria-label="Выбор формы">
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">Вход</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")} type="button">Регистрация</button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              <span>Имя читателя</span>
              <input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Например, Алексей Книгочей" />
            </label>
          )}
          <label>
            <span>Логин</span>
            <input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Введите логин" />
          </label>
          <label>
            <span>Пароль</span>
            <span className="password-field">
              <input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Не меньше 6 символов"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit">
            {mode === "login" ? <><ShieldCheck size={18} /> Войти в кабинет</> : <><UserPlus size={18} /> Зарегистрироваться</>}
            <ArrowRight size={17} />
          </button>
        </form>
        <small className="auth-note">Единый аккаунт для обучения и библиотеки. Данные демоверсии сохраняются только в этом браузере.</small>
      </motion.section>

      <p className="auth-worlds-footer"><span /> Два мира — одна любовь к знаниям <span /></p>
      <SiteFooter tone="auth" onPortal={onClose} />
    </div>
  );
}

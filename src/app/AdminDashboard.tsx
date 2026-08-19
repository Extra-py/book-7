import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, CheckCircle2, Download, FileText, LogOut, MessageCircle, Search, Send, ShieldCheck, Sparkles, UserRound, Users } from "lucide-react";
import { AuthSession, loadUsers, UserRecord } from "./auth";
import { addSupportMessage, loadSupportChats } from "./support";

type AdminDashboardProps = {
  session: AuthSession;
  onLogout: () => void;
};

const formatDate = (value: string) => new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(value));

export default function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const [query, setQuery] = useState("");
  const users = loadUsers();
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? users.filter((user) => `${user.username} ${user.displayName}`.toLowerCase().includes(needle)) : users;
  }, [query, users.length]);
  const totalXp = users.reduce((sum, user) => sum + user.xp, 0);
  const completedMaps = users.reduce((sum, user) => sum + user.completedMaps, 0);
  const activeUsers = users.filter((user) => Date.now() - new Date(user.lastLoginAt).getTime() < 30 * 24 * 60 * 60 * 1000).length;

  const downloadStatistics = () => {
    const heading = ["Логин", "Имя", "Дата регистрации", "Последний вход", "XP", "Уровень", "Пройдено точек", "Сохранено ответов"];
    const rows = users.map((user) => [
      user.username,
      user.displayName,
      formatDate(user.registeredAt),
      formatDate(user.lastLoginAt),
      user.xp,
      user.level,
      user.completedMaps,
      user.answersCount,
    ]);
    const csv = [heading, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `edustories-statistics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand"><span><BookOpen size={25} /></span><div><b>EduStories</b><small>Панель управления</small></div></div>
        <div className="admin-account"><span><ShieldCheck size={17} /> {session.displayName}</span><button onClick={onLogout}><LogOut size={16} /> Выйти</button></div>
      </header>
      <section className="admin-content">
        <div className="admin-title">
          <div><span><Sparkles size={14} /> Архив наблюдателя</span><h1>Кабинет администратора</h1><p>Сводная статистика зарегистрированных читателей EduStories.</p></div>
          <button className="admin-download" onClick={downloadStatistics} disabled={!users.length}><Download size={18} /> Скачать статистику</button>
        </div>

        <div className="admin-stat-grid">
          <Stat icon={Users} value={users.length} label="зарегистрировано" />
          <Stat icon={CheckCircle2} value={activeUsers} label="активны за 30 дней" />
          <Stat icon={Sparkles} value={totalXp} label="опыта получено" />
          <Stat icon={FileText} value={completedMaps} label="точек пройдено" />
        </div>

        <section className="admin-users">
          <div className="admin-users-head">
            <div><h2>Список пользователей</h2><p>{filtered.length} из {users.length} записей</p></div>
            <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти по имени или логину" /></label>
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Пользователь</th><th>Регистрация</th><th>Последний вход</th><th>XP</th><th>Уровень</th><th>Точки</th><th>Ответы</th></tr></thead>
              <tbody>
                {filtered.map((user) => <UserRow key={user.username} user={user} />)}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="admin-empty"><UserRound size={30} /><b>{users.length ? "Ничего не найдено" : "Пользователей пока нет"}</b><p>{users.length ? "Попробуйте изменить запрос." : "Новые читатели появятся после регистрации."}</p></div>
            )}
          </div>
        </section>
        <AdminSupportInbox />
      </section>
      <button className="admin-support-shortcut" onClick={() => document.getElementById("admin-support")?.scrollIntoView({ behavior: "smooth" })} aria-label="Перейти к обращениям поддержки">
        <img src={`${import.meta.env.BASE_URL}support/support-icon.webp`} alt="" />
      </button>
    </main>
  );
}

function AdminSupportInbox() {
  const [version, setVersion] = useState(0);
  const chats = useMemo(() => loadSupportChats().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [version]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const selected = chats.find((chat) => chat.id === selectedId) || null;
  const openCount = chats.filter((chat) => chat.status === "open").length;

  const answer = () => {
    if (!selected || !reply.trim()) return;
    addSupportMessage(selected.id, "admin", reply.trim());
    setReply("");
    setVersion((value) => value + 1);
  };

  return (
    <section className="admin-support-section" id="admin-support">
      <div className="admin-support-head">
        <h2><MessageCircle size={20} /> Обращения в поддержку</h2>
        <span>{openCount} ожидают ответа</span>
      </div>
      <div className="admin-support-layout">
        <div className="admin-support-list">
          {chats.map((chat) => (
            <button className={chat.id === selectedId ? "active" : ""} key={chat.id} onClick={() => { setSelectedId(chat.id); setReply(""); }}>
              <b>{chat.subject}</b>
              <span>{chat.displayName} · @{chat.username}</span>
              <small>{chat.messages.at(-1)?.text}</small>
            </button>
          ))}
          {!chats.length && <div className="admin-empty"><MessageCircle size={28} /><b>Обращений пока нет</b><p>Новые чаты пользователей появятся здесь.</p></div>}
        </div>
        {selected ? (
          <div className="admin-support-dialog">
            <header><h3>{selected.subject}</h3><p>{selected.displayName} · {formatDate(selected.createdAt)}</p></header>
            <div className="support-messages">
              {selected.messages.map((message) => (
                <div className={`support-message ${message.sender}`} key={message.id}>
                  <b>{message.sender === "admin" ? "Администратор" : selected.displayName}</b>
                  <p>{message.text}</p>
                  <time>{formatDate(message.createdAt)}</time>
                </div>
              ))}
            </div>
            <form className="support-reply" onSubmit={(event) => { event.preventDefault(); answer(); }}>
              <textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Написать ответ пользователю…" rows={2} maxLength={1200} />
              <button disabled={!reply.trim()} aria-label="Отправить ответ"><Send size={17} /></button>
            </form>
          </div>
        ) : (
          <div className="admin-support-placeholder">
            <img src={`${import.meta.env.BASE_URL}support/support-icon.webp`} alt="" />
            <b>Выберите обращение</b>
            <p>Переписка и форма ответа появятся здесь.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return <motion.article whileHover={{ y: -3 }}><span><Icon size={20} /></span><div><b>{value}</b><small>{label}</small></div></motion.article>;
}

function UserRow({ user }: { user: UserRecord }) {
  return (
    <tr>
      <td><span className="admin-avatar">{user.displayName.slice(0, 1).toUpperCase()}</span><span><b>{user.displayName}</b><small>@{user.username}</small></span></td>
      <td>{formatDate(user.registeredAt)}</td>
      <td>{formatDate(user.lastLoginAt)}</td>
      <td><b className="admin-xp">{user.xp}</b></td>
      <td>{user.level}</td>
      <td>{user.completedMaps}</td>
      <td>{user.answersCount}</td>
    </tr>
  );
}

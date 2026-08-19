import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Coins, Home, LogOut, Menu, MessageCircle, Plus, ScrollText, Settings, Star, X } from "lucide-react";
import LearningOrderModal from "./LearningOrderModal";
import { LearningOrder, loadLearningOrders, saveLearningOrders } from "./learning";

const BASE = import.meta.env.BASE_URL;
type Filter = "active" | "review" | "done";

export default function LearningDashboard({ username, displayName, onOpenHome, onOpenPortal, onOpenLibrary, onLogout }: { username: string; displayName: string; onOpenHome: () => void; onOpenPortal: () => void; onOpenLibrary: () => void; onLogout: () => void }) {
  const [orders, setOrders] = useState(() => loadLearningOrders(username));
  const [filter, setFilter] = useState<Filter>("active");
  const [orderOpen, setOrderOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = useMemo(() => orders.filter((order) => order.status === filter), [orders, filter]);
  const createOrder = (order: LearningOrder) => { const next = [order, ...orders]; setOrders(next); saveLearningOrders(username, next); setOrderOpen(false); };
  const firstName = displayName.split(" ")[0] || displayName;

  return (
    <section className="learning-dashboard">
      <aside className={menuOpen ? "open" : ""}>
        <button className="dashboard-brand" onClick={onOpenPortal}><img src={`${BASE}brand/edustories-logo.webp`} alt="" /><span><b>Палаты Искателя</b><small>Училище-на-Перекрёстке миров</small></span></button>
        <button className="dashboard-close" onClick={() => setMenuOpen(false)}><X /></button>
        <nav>
          <button className="active"><Home /> Обзор</button>
          <button onClick={onOpenHome}><ScrollText /> Новое поручение</button>
          <button><MessageCircle /> Сообщения</button>
          <button><Coins /> Казна</button>
          <button><Star /> Свои Мастера</button>
          <button><Settings /> Настройки</button>
        </nav>
        <div className="dashboard-side-bottom"><button onClick={onOpenLibrary}><BookOpen /> Библиотека</button><button onClick={onLogout}><LogOut /> Выйти</button></div>
      </aside>
      <button className="dashboard-menu" onClick={() => setMenuOpen(true)}><Menu /></button>

      <main>
        <header className="dashboard-welcome"><div><span>Палаты Искателя</span><h1>С возвращением, {firstName}</h1><p>Свитки, отклики Мастеров и вести собраны в одном месте.</p></div><button className="learning-gold-button" onClick={() => setOrderOpen(true)}><Plus /> Создать поручение</button></header>
        <section className="dashboard-alert"><ScrollText /><div><h2>Выберите мастера для учебной работы</h2><p>Получено 7 предложений · срок выбора сегодня</p></div><button>Сравнить предложения <ArrowRight /></button></section>
        <div className="dashboard-layout">
          <div>
            <section className="dashboard-stats">
              <article><ScrollText /><span><small>Активные заказы</small><b>{orders.filter(o => o.status === "active").length}</b></span></article>
              <article><Clock3 /><span><small>Ждут решения</small><b>{orders.filter(o => o.status === "review").length}</b></span></article>
              <article><CheckCircle2 /><span><small>Завершено</small><b>{Math.max(18, orders.filter(o => o.status === "done").length)}</b></span></article>
            </section>
            <section className="dashboard-contracts">
              <h2>Мои поручения</h2>
              <div className="dashboard-tabs"><button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Активные</button><button className={filter === "review" ? "active" : ""} onClick={() => setFilter("review")}>На проверке</button><button className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>Завершённые</button></div>
              <div className="dashboard-order-list">{visible.length ? visible.map(order => <article key={order.id}><span className="order-icon"><ScrollText /></span><div><h3>{order.title}</h3><p>{order.master ? `Мастер: ${order.master}` : `${order.subject} · поиск мастера`}</p><small>Срок: {order.deadline} · {order.budget}</small></div><button>{order.master ? "Открыть заказ" : "Выбрать мастера"} <ArrowRight /></button></article>) : <p className="dashboard-empty">В этом разделе пока нет заказов.</p>}</div>
            </section>
          </div>
          <aside className="dashboard-rail">
            <article className="dashboard-path"><span>Путь Искателя</span><img className="dashboard-son" src={`${BASE}learning/characters/zurk-reader.webp`} alt="Профессор Зурк" /><h2>Хранитель печати</h2><b>840 / 1000</b><div><i style={{ width: "84%" }} /></div><p>Зурк рядом: ещё 160 Искр знаний до нового ранга.</p></article>
            <article className="dashboard-messages"><h2>Последние сообщения</h2><p><b>Алексей Р.</b><span>Приступил к выполнению задания…</span></p><p><b>Анна С.</b><span>Прикрепляю первые материалы…</span></p><button><MessageCircle /> Все сообщения</button></article>
          </aside>
        </div>
      </main>
      {orderOpen && <LearningOrderModal onClose={() => setOrderOpen(false)} onCreate={createOrder} />}
    </section>
  );
}

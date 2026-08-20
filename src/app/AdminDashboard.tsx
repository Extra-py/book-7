import { type ReactNode, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity, AlertTriangle, BadgeRussianRuble, BarChart3, Bell, BookOpen, Boxes,
  CheckCircle2, ChevronRight, CircleDollarSign, ClipboardCheck, Clock3, Database,
  Download, Eye, FileCheck2, FileText, Flag, Gavel, KeyRound, LayoutDashboard,
  ListChecks, LockKeyhole, LogOut, Menu, MessageCircle, MoreHorizontal, Search,
  Send, Settings2, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, UserCog,
  UserRound, Users, WalletCards, X,
} from "lucide-react";
import { AuthSession, loadUsers, UserRecord } from "./auth";
import { addSupportMessage, loadSupportChats } from "./support";

type AdminDashboardProps = { session: AuthSession; onLogout: () => void };
type AdminView = "dashboard" | "users" | "orders" | "moderation" | "arbitration" | "finance" | "content" | "configuration" | "audit" | "support";

const navGroups = [
  { label: "Операционный контур", items: [
    { id: "dashboard", label: "Обзор", icon: LayoutDashboard },
    { id: "users", label: "Пользователи", icon: Users },
    { id: "orders", label: "Заказы и сделки", icon: FileText },
  ] },
  { label: "Очереди Хранителей", items: [
    { id: "moderation", label: "Модерация", icon: ClipboardCheck, badge: 14 },
    { id: "arbitration", label: "Суд Хранителей", icon: Gavel, badge: 4 },
    { id: "finance", label: "Финансовый контур", icon: WalletCards, badge: 3 },
    { id: "support", label: "Поддержка", icon: MessageCircle },
  ] },
  { label: "Настройка платформы", items: [
    { id: "content", label: "Каталоги и CMS", icon: Boxes },
    { id: "configuration", label: "Конфигурация", icon: SlidersHorizontal },
    { id: "audit", label: "Аудит и безопасность", icon: ShieldCheck },
  ] },
] satisfies Array<{ label: string; items: Array<{ id: AdminView; label: string; icon: typeof Users; badge?: number }> }>;

const formatDate = (value: string) => new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
}).format(new Date(value));

const queueData = [
  { name: "Анкеты мастеров", count: 12, overdue: 2, sla: "48 ч", tone: "amber" },
  { name: "Контент поручений", count: 31, overdue: 6, sla: "12 ч", tone: "red" },
  { name: "Отзывы и жалобы", count: 8, overdue: 0, sla: "72 ч", tone: "green" },
  { name: "Нарушения чата", count: 14, overdue: 3, sla: "24 ч", tone: "amber" },
  { name: "Споры", count: 4, overdue: 1, sla: "24 ч", tone: "red" },
  { name: "Выводы средств", count: 7, overdue: 0, sla: "1 день", tone: "green" },
];

const orderRows = [
  { id: "ES-3841", title: "Курсовая по экономике", customer: "Мария К.", master: "Алексей Р.", amount: "12 500 ₽", status: "В работе", risk: "Низкий" },
  { id: "ES-3837", title: "Лабораторная по Python", customer: "Илья Н.", master: "Анна С.", amount: "6 800 ₽", status: "На проверке", risk: "Низкий" },
  { id: "ES-3824", title: "Презентация по истории", customer: "София Л.", master: "—", amount: "3 200 ₽", status: "Модерация", risk: "Средний" },
  { id: "ES-3792", title: "Дипломный проект", customer: "Денис В.", master: "Олег П.", amount: "48 000 ₽", status: "Спор", risk: "Высокий" },
];

const auditRows = [
  { time: "Сегодня, 12:41", actor: "А. Миронова", action: "Одобрена анкета мастера", object: "master_1287", ip: "10.24.3.18" },
  { time: "Сегодня, 12:33", actor: "П. Ветров", action: "Открыта переписка по спору", object: "case_0421", ip: "10.24.3.11" },
  { time: "Сегодня, 12:08", actor: "test1", action: "Экспорт статистики", object: "users_registry", ip: "10.24.1.04" },
  { time: "Сегодня, 11:52", actor: "Е. Волкова", action: "Изменён шаблон уведомления", object: "template_18", ip: "10.24.4.27" },
];

export default function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const users = loadUsers();
  const roleTitle = session.username === "test1" ? "Старший Хранитель" : "Администратор системы";
  const openView = (next: AdminView) => { setView(next); setMobileNav(false); setNotice(""); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" })); };
  const announce = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3200); };

  return (
    <main className="guardians-admin">
      <aside className={`guardians-sidebar ${mobileNav ? "open" : ""}`}>
        <header className="guardians-brand"><span><ShieldCheck size={26} /></span><div><b>Палаты Хранителей</b><small>внутренний контур EduStories</small></div><button onClick={() => setMobileNav(false)} aria-label="Закрыть меню"><X size={19} /></button></header>
        <nav aria-label="Разделы панели администратора">
          {navGroups.map((group) => <section key={group.label}><p>{group.label}</p>{group.items.map((item) => { const Icon = item.icon; return <button className={view === item.id ? "active" : ""} key={item.id} onClick={() => openView(item.id)}><Icon size={18} /><span>{item.label}</span>{item.badge ? <em>{item.badge}</em> : null}</button>; })}</section>)}
        </nav>
        <footer><span className="guardians-avatar">{session.displayName.slice(0, 1).toUpperCase()}</span><div><b>{session.displayName}</b><small>{roleTitle}</small></div><button onClick={onLogout} aria-label="Выйти"><LogOut size={17} /></button></footer>
      </aside>
      {mobileNav && <button className="guardians-nav-shade" onClick={() => setMobileNav(false)} aria-label="Закрыть меню" />}
      <section className="guardians-workspace">
        <header className="guardians-topbar"><button className="guardians-menu" onClick={() => setMobileNav(true)} aria-label="Открыть меню"><Menu size={20} /></button><div><span className="guardians-secure"><LockKeyhole size={14} /> Защищённый контур</span><i /><span>Сессия: 07:42:18</span></div><div className="guardians-top-actions"><button aria-label="Системные уведомления"><Bell size={18} /><em>3</em></button><button onClick={() => openView("configuration")} aria-label="Настройки"><Settings2 size={18} /></button></div></header>
        <div className="guardians-main">
          {notice && <motion.div className="guardians-toast" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><CheckCircle2 size={17} /> {notice}</motion.div>}
          {view === "dashboard" && <DashboardView users={users} onOpen={openView} onExport={() => downloadStatistics(users)} />}
          {view === "users" && <UsersView users={users} onExport={() => downloadStatistics(users)} onAction={announce} />}
          {view === "orders" && <OrdersView onAction={announce} />}
          {view === "moderation" && <ModerationView onAction={announce} />}
          {view === "arbitration" && <ArbitrationView onAction={announce} />}
          {view === "finance" && <FinanceView onAction={announce} />}
          {view === "content" && <ContentView onAction={announce} />}
          {view === "configuration" && <ConfigurationView onAction={announce} />}
          {view === "audit" && <AuditView />}
          {view === "support" && <AdminSupportInbox />}
        </div>
      </section>
    </main>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="guardians-heading"><div><span><Sparkles size={13} /> {eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function DashboardView({ users, onOpen, onExport }: { users: UserRecord[]; onOpen: (view: AdminView) => void; onExport: () => void }) {
  const activeUsers = users.filter((user) => Date.now() - new Date(user.lastLoginAt).getTime() < 30 * 24 * 60 * 60 * 1000).length;
  return <>
    <PageHeading eyebrow="Оперативный центр" title="Добрый день, Хранитель" description="Сводка состояния платформы на 20 августа 2026 года. Данные демоверсии обновляются локально." action={<button className="guardians-primary" onClick={onExport}><Download size={16} /> Экспорт отчёта</button>} />
    <div className="guardians-alert"><span><AlertTriangle size={20} /></span><div><b>Обнаружена бизнес-аномалия</b><p>Конверсия оплаты снизилась на 22% день к дню. Порог оповещения: 20%.</p></div><button onClick={() => onOpen("finance")}>Открыть отчёт <ChevronRight size={16} /></button></div>
    <section className="guardians-kpis"><Kpi icon={Users} label="Регистрации" value={String(users.length)} meta={`${activeUsers} активны за 30 дней`} change="+12%" /><Kpi icon={FileCheck2} label="Оплаченные сделки" value="184" meta="за последние 7 дней" change="+8,4%" /><Kpi icon={CircleDollarSign} label="GMV" value="2,48 млн ₽" meta="комиссия 286 400 ₽" change="+5,1%" /><Kpi icon={Gavel} label="Открытые споры" value="4" meta="1 с просроченным SLA" change="−2" danger /></section>
    <section className="guardians-dashboard-grid">
      <article className="guardians-panel guardians-queues"><header><div><h2>Здоровье очередей</h2><p>Задачи, требующие внимания команды</p></div><button onClick={() => onOpen("moderation")}>Все очереди <ChevronRight size={15} /></button></header><div>{queueData.map((queue) => <button key={queue.name} onClick={() => onOpen(queue.name === "Споры" ? "arbitration" : queue.name === "Выводы средств" ? "finance" : "moderation")}><span className={`queue-signal ${queue.tone}`}><Clock3 size={16} /></span><span><b>{queue.name}</b><small>SLA {queue.sla}</small></span><strong>{queue.count}</strong><em className={queue.overdue ? "late" : ""}>{queue.overdue ? `${queue.overdue} просрочено` : "в срок"}</em><ChevronRight size={15} /></button>)}</div></article>
      <article className="guardians-panel guardians-funnel"><header><div><h2>Воронка поручений</h2><p>Последние 30 дней</p></div><span><BarChart3 size={18} /></span></header><div className="funnel-steps"><Funnel label="Опубликовано" value="1 284" width="100%" /><Funnel label="Получен отклик" value="1 041" width="81%" /><Funnel label="Оплачено" value="642" width="50%" /><Funnel label="Принято" value="518" width="40%" /></div><div className="funnel-total"><span>Конверсия в оплату</span><b>50,0%</b><small>−3,2 п.п. к прошлому периоду</small></div></article>
    </section>
    <section className="guardians-panel guardians-activity"><header><div><h2>Последние действия</h2><p>Записи защищённого журнала</p></div><button onClick={() => onOpen("audit")}>Открыть аудит <ChevronRight size={15} /></button></header><div>{auditRows.slice(0, 3).map((row) => <div key={row.time + row.actor}><span><Activity size={15} /></span><p><b>{row.actor}</b> · {row.action}<small>{row.object} · {row.time}</small></p></div>)}</div></section>
  </>;
}

function Kpi({ icon: Icon, label, value, meta, change, danger }: { icon: typeof Users; label: string; value: string; meta: string; change: string; danger?: boolean }) {
  return <motion.article whileHover={{ y: -3 }}><header><span><Icon size={19} /></span><em className={danger ? "danger" : ""}>{change}</em></header><p>{label}</p><b>{value}</b><small>{meta}</small></motion.article>;
}

function Funnel({ label, value, width }: { label: string; value: string; width: string }) { return <div><span><b>{label}</b><em>{value}</em></span><i><u style={{ width }} /></i></div>; }

function UsersView({ users, onExport, onAction }: { users: UserRecord[]; onExport: () => void; onAction: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return needle ? users.filter((user) => `${user.username} ${user.displayName} ${user.email || ""}`.toLowerCase().includes(needle)) : users; }, [query, users]);
  return <>
    <PageHeading eyebrow="Реестр платформы" title="Пользователи" description="Профили 360°, роли, статусы, санкции и история взаимодействий." action={<button className="guardians-secondary" onClick={onExport}><Download size={16} /> CSV</button>} />
    <section className="guardians-panel guardians-registry"><header className="registry-tools"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, ник, email или телефон" /></label><button><SlidersHorizontal size={16} /> Фильтры</button><span>{filtered.length} записей</span></header><div className="guardians-table-wrap"><table><thead><tr><th>Пользователь</th><th>Роль</th><th>Регистрация</th><th>Последний вход</th><th>Уровень</th><th>Статус</th><th /></tr></thead><tbody>{filtered.map((user) => <tr key={user.username}><td><span className="registry-avatar">{user.displayName.slice(0, 1).toUpperCase()}</span><span><b>{user.displayName}</b><small>@{user.username} · {user.email || "email не указан"}</small></span></td><td>Студент</td><td>{formatDate(user.registeredAt)}</td><td>{formatDate(user.lastLoginAt)}</td><td>{user.level} · {user.xp} XP</td><td><span className="status-pill green">Активен</span></td><td><button onClick={() => setSelected(user)} aria-label="Открыть карточку"><Eye size={16} /></button></td></tr>)}</tbody></table></div>{!filtered.length && <Empty icon={UserRound} title="Пользователи не найдены" text="Измените поисковый запрос или фильтры." />}</section>
    {selected && <div className="guardian-drawer-shade" onClick={() => setSelected(null)}><aside className="guardian-drawer" onClick={(event) => event.stopPropagation()}><header><div><span className="registry-avatar large">{selected.displayName.slice(0, 1).toUpperCase()}</span><h2>{selected.displayName}</h2><p>@{selected.username} · ID usr_{selected.username}</p></div><button onClick={() => setSelected(null)}><X size={18} /></button></header><section><h3>Профиль 360°</h3><dl><div><dt>Опыт</dt><dd>{selected.xp} XP</dd></div><div><dt>Пройдено точек</dt><dd>{selected.completedMaps}</dd></div><div><dt>Сохранено ответов</dt><dd>{selected.answersCount}</dd></div><div><dt>Санкции</dt><dd>Нет</dd></div></dl></section><section><h3>Безопасность</h3><p><ShieldCheck size={16} /> Активных сессий: 1</p><p><KeyRound size={16} /> 2FA не подключена</p></section><footer><button onClick={() => onAction("Предупреждение добавлено в журнал аудита")}>Предупреждение</button><button className="danger" onClick={() => onAction("Запрос на блокировку отправлен на подтверждение")}>Ограничить функции</button></footer></aside></div>}
  </>;
}

function OrdersView({ onAction }: { onAction: (message: string) => void }) {
  return <><PageHeading eyebrow="Контур сделок" title="Заказы и сделки" description="Хронология поручений, статусы эскроу, файлы, отчёты и связанные споры." action={<button className="guardians-secondary"><Download size={16} /> Выгрузить</button>} /><section className="guardians-panel guardians-registry"><header className="registry-tools"><label><Search size={17} /><input placeholder="Номер заказа или участник" /></label><button><SlidersHorizontal size={16} /> Все статусы</button><span>4 демонстрационные записи</span></header><div className="guardians-table-wrap"><table><thead><tr><th>Поручение</th><th>Заказчик</th><th>Мастер</th><th>Сумма</th><th>Статус</th><th>Риск</th><th /></tr></thead><tbody>{orderRows.map((row) => <tr key={row.id}><td><b>{row.title}</b><small>{row.id}</small></td><td>{row.customer}</td><td>{row.master}</td><td><b>{row.amount}</b></td><td><span className={`status-pill ${row.status === "Спор" ? "red" : row.status === "Модерация" ? "amber" : "green"}`}>{row.status}</span></td><td>{row.risk}</td><td><button onClick={() => onAction(`Карточка ${row.id} открыта в режиме просмотра`)}><ChevronRight size={16} /></button></td></tr>)}</tbody></table></div></section></>;
}

function ModerationView({ onAction }: { onAction: (message: string) => void }) {
  const [selectedQueue, setSelectedQueue] = useState(queueData[1]);
  return <><PageHeading eyebrow="Очереди с SLA" title="Центр модерации" description="Решение задач по единому процессу с классификатором причин и автоматическим переходом." /><section className="moderation-layout"><aside className="guardians-panel queue-list"><header><h2>Очереди</h2><span>76 задач</span></header>{queueData.slice(0, 4).map((queue) => <button className={selectedQueue.name === queue.name ? "active" : ""} key={queue.name} onClick={() => setSelectedQueue(queue)}><span className={`queue-signal ${queue.tone}`}><ListChecks size={16} /></span><span><b>{queue.name}</b><small>SLA {queue.sla}</small></span><strong>{queue.count}</strong></button>)}</aside><article className="guardians-panel moderation-task"><header><span><Flag size={16} /> Задача MOD-2026-0819-447</span><em>В работе у вас</em></header><div className="moderation-object"><span><FileText size={27} /></span><div><small>Поручение · автоматически обнаружено</small><h2>«Помогите выполнить курсовую полностью»</h2><p>В описании найдено совпадение со стоп-словарём: предложение выполнения работы вместо образовательной помощи.</p></div></div><div className="moderation-context"><article><span>Автор</span><b>student_4821</b><small>1 предупреждение · 14 заказов</small></article><article><span>Совпадение</span><b>«выполнить полностью»</b><small>Уверенность классификатора: 94%</small></article><article><span>SLA</span><b>Осталось 02:18</b><small>Очередь: {selectedQueue.name}</small></article></div><label className="moderation-reason"><span>Причина решения</span><select defaultValue="prohibited"><option value="prohibited">Нарушение правил размещения</option><option value="contact">Попытка обмена контактами</option><option value="clean">Нарушений не обнаружено</option></select><textarea placeholder="Внутренний комментарий Хранителя" /></label><footer><button onClick={() => onAction("Материал одобрен, открыта следующая задача")}><CheckCircle2 size={16} /> Одобрить</button><button onClick={() => onAction("Материал скрыт и автор уведомлён")}><Eye size={16} /> Скрыть</button><button className="danger" onClick={() => onAction("Санкция создана и записана в аудит")}><ShieldAlert size={16} /> Скрыть + санкция</button></footer></article></section></>;
}

function ArbitrationView({ onAction }: { onAction: (message: string) => void }) {
  return <><PageHeading eyebrow="Суд Хранителей" title="Арбитраж" description="Споры, апелляции и библиотека прецедентов с контролем конфликта интересов." /><section className="guardians-kpis compact"><Kpi icon={Gavel} label="Новые дела" value="4" meta="1 требует старшего" change="+1" danger /><Kpi icon={Clock3} label="Среднее решение" value="18 ч" meta="целевой SLA 24 ч" change="−2 ч" /><Kpi icon={CheckCircle2} label="Примирение" value="61%" meta="за последние 30 дней" change="+4%" /></section><section className="guardians-panel case-card"><header><div><span>Дело AR-0421 · сумма 10 000 ₽</span><h2>Несоответствие результата согласованному объёму</h2></div><span className="status-pill red">SLA 03:14</span></header><div className="case-timeline"><span className="done">Заказ создан</span><span className="done">Эскроу funded</span><span className="done">Работа передана</span><span className="active">Открыт спор</span></div><div className="case-parties"><article><small>Студент</small><b>Мария К.</b><p>Запрашивает возврат 70%</p></article><article><small>Мастер</small><b>Алексей Р.</b><p>Согласен на возврат 20%</p></article><article><small>Предлагаемое решение</small><b>50% / 50%</b><p>По медиане похожих дел</p></article></div><textarea placeholder="Обоснование решения — не менее 200 знаков" /><footer><button className="guardians-secondary" onClick={() => onAction("Материалы дела открыты в режиме read-only")}>Изучить материалы</button><button className="guardians-primary" onClick={() => onAction("Проект решения сохранён")}>Сохранить решение</button></footer></section></>;
}

function FinanceView({ onAction }: { onAction: (message: string) => void }) {
  return <><PageHeading eyebrow="Ledger и расчёты" title="Финансовый контур" description="Выводы, возвраты, сверка, комиссии и операции по правилу четырёх глаз." action={<button className="guardians-secondary"><Download size={16} /> Реестр XLSX</button>} /><section className="guardians-kpis compact"><Kpi icon={BadgeRussianRuble} label="GMV за месяц" value="8,74 млн ₽" meta="комиссия 1,02 млн ₽" change="+7,3%" /><Kpi icon={WalletCards} label="Ожидают вывода" value="184 500 ₽" meta="7 заявок" change="3 риска" danger /><Kpi icon={Database} label="Сверка ledger" value="99,98%" meta="расхождение 1 240 ₽" change="Проверить" danger /></section><section className="guardians-panel finance-queue"><header><div><h2>Заявки на вывод</h2><p>Антифрод-скоринг и ручная проверка</p></div><button onClick={() => onAction("Все зелёные заявки одобрены")}>Одобрить зелёные</button></header>{[{ name: "Анна С.", amount: "24 600 ₽", score: "Зелёный", note: "Постоянные реквизиты" }, { name: "Олег П.", amount: "58 000 ₽", score: "Красный", note: "Новые реквизиты 14 ч назад" }, { name: "Ирина Т.", amount: "17 300 ₽", score: "Жёлтый", note: "Первый вывод" }].map((item) => <article key={item.name}><span className={`risk-dot ${item.score.toLowerCase()}`} /><div><b>{item.name}</b><small>{item.note}</small></div><strong>{item.amount}</strong><em>{item.score}</em><button onClick={() => onAction(`Заявка ${item.name} открыта`)}><ChevronRight size={16} /></button></article>)}</section></>;
}

function ContentView({ onAction }: { onAction: (message: string) => void }) {
  const cards = [{ icon: BookOpen, title: "Страницы и блоки", text: "Главная, правила, FAQ и лендинги", count: "28 блоков" }, { icon: MessageCircle, title: "Реплики маскотов", text: "Сон, Зурк, Кси и Глосса", count: "64 реплики" }, { icon: FileText, title: "Шаблоны Вестника", text: "Email, push и системные сообщения", count: "31 шаблон" }, { icon: ClipboardCheck, title: "Банки испытаний", text: "Вопросы и настройки по дисциплинам", count: "1 842 вопроса" }, { icon: SlidersHorizontal, title: "Стоп-словари", text: "Антиконтакт и запрещённые темы", count: "418 правил" }, { icon: Boxes, title: "Каталоги", text: "Дисциплины, типы работ и единицы", count: "126 записей" }];
  return <><PageHeading eyebrow="Методический контур" title="Каталоги и CMS" description="Управление содержанием платформы без выпуска новой версии сайта." /><section className="content-admin-grid">{cards.map(({ icon: Icon, title, text, count }) => <motion.button whileHover={{ y: -4 }} key={title} onClick={() => onAction(`${title}: открыт редактор демонстрационной версии`)}><span><Icon size={23} /></span><div><h2>{title}</h2><p>{text}</p><small>{count}</small></div><ChevronRight size={17} /></motion.button>)}</section></>;
}

function ConfigurationView({ onAction }: { onAction: (message: string) => void }) {
  return <><PageHeading eyebrow="Управление без релиза" title="Конфигурация платформы" description="Параметры, фиче-флаги, интеграции и режим обслуживания." /><section className="config-layout"><article className="guardians-panel config-list"><header><h2>Ключевые параметры</h2><span>Версия 2026.08.20</span></header>{[{ key: "order.autoclose_days", title: "Автоприёмка заказа", value: "5 дней", critical: false }, { key: "withdrawal.daily_limit", title: "Лимит вывода", value: "150 000 ₽", critical: true }, { key: "commission.volkhv", title: "Комиссия ранга Волхва", value: "10%", critical: true }, { key: "spark.exchange_rate", title: "Курс Искр", value: "100 = 1 ₽", critical: false }].map((item) => <div key={item.key}><span><b>{item.title}</b><small>{item.key}</small></span><strong>{item.value}</strong>{item.critical && <em><LockKeyhole size={12} /> 4 глаза</em>}<button onClick={() => onAction(`Параметр «${item.title}» открыт для новой версии`)}><MoreHorizontal size={17} /></button></div>)}</article><article className="guardians-panel feature-flags"><header><h2>Фиче-флаги</h2><span><Flag size={17} /></span></header>{[{ name: "Цифирная палата", audience: "25% пользователей", on: true }, { name: "Новый поиск мастеров", audience: "Только сотрудники", on: true }, { name: "Групповые поручения", audience: "Выключено", on: false }, { name: "Новая экономика Искр", audience: "Список ID", on: true }].map((flag) => <label key={flag.name}><span><b>{flag.name}</b><small>{flag.audience}</small></span><input type="checkbox" defaultChecked={flag.on} onChange={() => onAction(`Изменение «${flag.name}» сохранено в аудит`)} /><i /></label>)}</article></section></>;
}

function AuditView() {
  return <><PageHeading eyebrow="Append-only журнал" title="Аудит и безопасность" description="Входы, раскрытия данных, переписки, изменения и операции четырёх глаз." action={<button className="guardians-secondary"><Download size={16} /> Выгрузить журнал</button>} /><section className="guardians-kpis compact"><Kpi icon={ShieldCheck} label="События сегодня" value="1 284" meta="все подписаны" change="Норма" /><Kpi icon={ShieldAlert} label="Алерты" value="3" meta="1 требует внимания" change="+1" danger /><Kpi icon={UserCog} label="Ревизия прав" value="94%" meta="3 сотрудника не проверены" change="До 31.08" /></section><section className="guardians-panel guardians-registry"><header className="registry-tools"><label><Search size={17} /><input placeholder="Сотрудник, действие или объект" /></label><button><SlidersHorizontal size={16} /> Тип события</button><span>Хранение: 3 года</span></header><div className="guardians-table-wrap"><table><thead><tr><th>Время</th><th>Сотрудник</th><th>Действие</th><th>Объект</th><th>IP</th><th>Подпись</th></tr></thead><tbody>{auditRows.map((row) => <tr key={row.time + row.actor}><td>{row.time}</td><td><b>{row.actor}</b></td><td>{row.action}</td><td><code>{row.object}</code></td><td>{row.ip}</td><td><span className="status-pill green">Проверена</span></td></tr>)}</tbody></table></div></section></>;
}

function AdminSupportInbox() {
  const [version, setVersion] = useState(0);
  const chats = useMemo(() => loadSupportChats().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [version]);
  const [selectedId, setSelectedId] = useState<string | null>(chats[0]?.id || null);
  const [reply, setReply] = useState("");
  const selected = chats.find((chat) => chat.id === selectedId) || null;
  const openCount = chats.filter((chat) => chat.status === "open").length;
  const answer = () => { if (!selected || !reply.trim()) return; addSupportMessage(selected.id, "admin", reply.trim()); setReply(""); setVersion((value) => value + 1); };
  return <><PageHeading eyebrow="Служба заботы" title="Обращения поддержки" description="История диалогов пользователей и ответы Хранителей." /><section className="guardians-panel admin-support-section" id="admin-support"><div className="admin-support-head"><h2><MessageCircle size={20} /> Входящие обращения</h2><span>{openCount} ожидают ответа</span></div><div className="admin-support-layout"><div className="admin-support-list">{chats.map((chat) => <button className={chat.id === selectedId ? "active" : ""} key={chat.id} onClick={() => { setSelectedId(chat.id); setReply(""); }}><b>{chat.subject}</b><span>{chat.displayName} · @{chat.username}</span><small>{chat.messages.at(-1)?.text}</small></button>)}{!chats.length && <Empty icon={MessageCircle} title="Обращений пока нет" text="Новые чаты появятся здесь." />}</div>{selected ? <div className="admin-support-dialog"><header><h3>{selected.subject}</h3><p>{selected.displayName} · {formatDate(selected.createdAt)}</p></header><div className="support-messages">{selected.messages.map((message) => <div className={`support-message ${message.sender}`} key={message.id}><b>{message.sender === "admin" ? "Хранитель поддержки" : selected.displayName}</b><p>{message.text}</p><time>{formatDate(message.createdAt)}</time></div>)}</div><form className="support-reply" onSubmit={(event) => { event.preventDefault(); answer(); }}><textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Написать ответ пользователю…" rows={2} maxLength={1200} /><button disabled={!reply.trim()} aria-label="Отправить ответ"><Send size={17} /></button></form></div> : <div className="admin-support-placeholder"><MessageCircle size={42} /><b>Выберите обращение</b><p>Переписка и форма ответа появятся здесь.</p></div>}</div></section></>;
}

function Empty({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) { return <div className="admin-empty"><Icon size={30} /><b>{title}</b><p>{text}</p></div>; }

function downloadStatistics(users: UserRecord[]) {
  const heading = ["Логин", "Имя", "Email", "Дата регистрации", "Последний вход", "XP", "Уровень", "Пройдено точек", "Сохранено ответов"];
  const rows = users.map((user) => [user.username, user.displayName, user.email || "", formatDate(user.registeredAt), formatDate(user.lastLoginAt), user.xp, user.level, user.completedMaps, user.answersCount]);
  const csv = [heading, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `edustories-users-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
}

import { useState } from "react";
import { ArrowRight, Bell, BookOpen, Calculator, CheckCircle2, Clock3, Code2, Compass, FileText, FlaskConical, GraduationCap, Menu, Moon, Presentation, ScrollText, ShieldCheck, Sigma, Sparkles, Star, Sun, Users, WandSparkles, X, Zap } from "lucide-react";
import LearningOrderModal from "./LearningOrderModal";
import { LearningOrder, loadLearningOrders, saveLearningOrders } from "./learning";

const BASE = import.meta.env.BASE_URL;
type Props = { isAuthenticated:boolean; username?:string; displayName?:string; theme:"light"|"dark"; onToggleTheme:()=>void; onOpenPortal:()=>void; onOpenLibrary:()=>void; onOpenDashboard:()=>void; onOpenCalculator:()=>void; onRequireAuth:()=>void };

const services = [
  [ScrollText,"Учебные работы","Курсовые, отчёты и исследования с понятной структурой."],
  [Code2,"Программирование","Разбор задач, создание и отладка кода на разных языках."],
  [Presentation,"Презентации","Ясные слайды с акцентом на содержание и оформление."],
  [Sigma,"Точные науки","Расчёты, формулы, чертежи и подробный ход решения."],
  [FileText,"Тексты и гуманитарные науки","Анализ источников, редактура и работа с аргументацией."],
  [Zap,"Помощь до рассвета","Срочные поручения, когда песок в часах почти закончился."],
] as const;

const board = [
  ["Решить задачи по теоретической механике","Физика","до 4 500 ₽","3 дня"],
  ["Проверить курсовую по экономике","Экономика","до 6 000 ₽","5 дней"],
  ["Создать презентацию о Серебряном веке","Литература","до 2 800 ₽","2 дня"],
];

export default function LearningHome(props: Props) {
  const [orderOpen,setOrderOpen]=useState(false); const [menuOpen,setMenuOpen]=useState(false); const [faq,setFaq]=useState(0);
  const openOrder=()=>props.isAuthenticated?setOrderOpen(true):props.onRequireAuth();
  const createOrder=(order:LearningOrder)=>{const key=props.username||"guest";saveLearningOrders(key,[order,...loadLearningOrders(key)]);setOrderOpen(false);props.onOpenDashboard()};

  return <section className="learning-site learning-world">
    <header className="learning-header academy-header">
      <button className="learning-brand" onClick={props.onOpenPortal}><img src={`${BASE}brand/edustories-logo.webp`} alt=""/><span><b>EduStories</b><small>Училище-на-Перекрёстке миров</small></span></button>
      <nav className={menuOpen?"open":""}>
        <button onClick={()=>document.getElementById("learning-board")?.scrollIntoView({behavior:"smooth"})}>Доска поручений</button>
        <button onClick={()=>document.getElementById("learning-masters")?.scrollIntoView({behavior:"smooth"})}>Мастера</button>
        <button onClick={props.onOpenCalculator}>Цифирная палата</button>
        <button onClick={()=>document.getElementById("learning-how")?.scrollIntoView({behavior:"smooth"})}>Как это работает</button>
        <button onClick={props.onOpenLibrary}>Библиотека</button>
      </nav>
      <button className="theme-toggle section-theme-toggle" onClick={props.onToggleTheme} aria-label={props.theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}>
        <span className={props.theme === "light" ? "active" : ""}><Sun size={16}/></span><span className={props.theme === "dark" ? "active" : ""}><Moon size={16}/></span>
      </button>
      <button className="academy-notice" aria-label="Вестник"><Bell size={18}/></button>
      <button className="learning-gold-button learning-create-top" onClick={openOrder}>Создать поручение</button>
      <button className="learning-menu-button" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Меню">{menuOpen?<X/>:<Menu/>}</button>
    </header>

    <main>
      <section className="academy-hero">
        <div className="academy-hero-copy"><span className="learning-eyebrow"><Sparkles size={14}/> Доска поручений</span><h1>Задание найдёт<br/><em>своего мастера</em></h1><p>Принеси свиток в Училище. Проверенные Мастера предложат решение, объяснят сложное и помогут получить новые знания.</p><div className="academy-zurk-dialog"><b>Профессор Зурк покажет дорогу</b><span>Я слышу твои вопросы. Начнём с описания задачи?</span></div><div className="learning-hero-actions"><button className="learning-gold-button" onClick={openOrder}>Создать поручение <ArrowRight size={18}/></button><button onClick={()=>document.getElementById("learning-masters")?.scrollIntoView({behavior:"smooth"})}><Users size={18}/> Найти Мастера</button></div><div className="academy-stats"><span><b>2 400</b> мастеров</span><span><b>18 000</b> поручений</span><span><b>4,9 ★</b> средняя Слава</span></div></div>
        <div className="academy-hero-characters"><img className="academy-son" src={`${BASE}learning/characters/son-hero.webp`} alt="Исследователь Сон с компасом знаний"/><img className="academy-zurk" src={`${BASE}learning/characters/zurk-guide.webp`} alt="Профессор Зурк со свитком"/></div>
        <aside className="academy-quick"><span className="learning-eyebrow"><ScrollText size={14}/> Быстрый старт</span><h2>Какой свиток принесёшь?</h2><button onClick={openOrder}><FileText/><span><b>Учебная работа</b><small>Курсовая, отчёт, исследование</small></span><ArrowRight/></button><button onClick={openOrder}><Code2/><span><b>Задача по программированию</b><small>Код, алгоритм, лабораторная</small></span><ArrowRight/></button><button onClick={props.onOpenCalculator}><Calculator/><span><b>Нужен расчёт</b><small>Открыть бесплатную Цифирную палату</small></span><ArrowRight/></button><small><ShieldCheck size={14}/> Оберег сделки защищает оплату</small></aside>
      </section>

      <section className="academy-services" id="learning-services"><div className="section-title"><span>Шесть путей к решению</span><h2>Чем помогут Мастера</h2><p>Выбери направление — подходящий специалист увидит поручение на Доске.</p></div><div>{services.map(([Icon,title,copy])=><article key={title}><span><Icon/></span><h3>{title}</h3><p>{copy}</p><button onClick={openOrder}>Создать свиток <ArrowRight size={14}/></button></article>)}</div></section>

      <section className="academy-how" id="learning-how"><div className="section-title"><span>Путь Искателя</span><h2>Как это работает</h2></div><div className="academy-steps"><img src={`${BASE}learning/characters/zurk-reader.webp`} alt="Профессор Зурк объясняет первые шаги"/>{[["1","Опиши поручение","Укажи требования, предмет, срок и бюджет."],["2","Получи отклики","Мастера предложат план, цену и срок."],["3","Выбери Мастера","Сравни Славу, ранг, сказания и опыт."],["4","Прими работу","Проверь результат и оставь Сказание."]].map(([n,t,c],i)=><article className={i>1?"zurk-step":""} key={n}><b>{n}</b><h3>{t}</h3><p>{c}</p></article>)}<img src={`${BASE}learning/characters/son-hero.webp`} alt="Исследователь Сон сопровождает выбор и проверку"/></div></section>

      <section className="academy-chamber"><div><span className="learning-eyebrow"><CogIcon/> Лаборатория Исследователя Сона</span><h2>Цифирная палата</h2><p>Считай сам: готовые рецепты по математике, физике и студенческому быту показывают не только ответ, но и ход решения.</p><ul><li>Готовые формулы и единицы измерения</li><li>Летопись последних вычислений</li><li>Мостик из расчёта в поручение</li></ul><button className="learning-gold-button" onClick={props.onOpenCalculator}>Открыть Цифирную палату <ArrowRight size={18}/></button></div><div className="chamber-machine"><span>v = s / t</span><span>D = b² − 4ac</span><Calculator/><strong>72 км/ч = 20 м/с</strong><small>Точность — вежливость чародеев</small></div><img src={`${BASE}learning/characters/son-calculator.webp`} alt="Исследователь Сон настраивает счётную машину"/></section>

      <section className="academy-guard"><div className="section-title"><span>Гарантии Училища</span><h2>Оберег сделки</h2></div><div>{[[ShieldCheck,"Деньги под защитой","Оплата хранится в Казне до принятия результата."],[CheckCircle2,"Проверка качества","Механические руки Сона помогают проверить оригинальность."],[Clock3,"Круги правок","Условия и число бесплатных правок известны заранее."],[Sparkles,"Тайна личности","Личные данные и контакты участников защищены."]].map(([Icon,t,c]:any)=><article key={t}><Icon/><h3>{t}</h3><p>{c}</p></article>)}</div></section>

      <section className="academy-board" id="learning-board"><div className="section-title"><span>Новые свитки</span><h2>Живая Доска поручений</h2></div><div>{board.map(([t,s,p,d])=><article key={t}><ScrollText/><span><b>{t}</b><small>{s} · опубликовано недавно</small></span><strong>{p}</strong><em>{d}</em><button onClick={()=>props.isAuthenticated?props.onOpenDashboard():props.onRequireAuth()}>Подробнее</button></article>)}</div></section>

      <section className="academy-masters" id="learning-masters"><div className="section-title"><span>Проверено Исследователем Соном</span><h2>Лучшие Мастера недели</h2></div><div>{[["Алексей Р.","Архимастер","Программирование","4,98","184"],["Анна С.","Мастер","История · тексты","4,94","127"],["Мария В.","Волхв","Математика · физика","5,00","246"]].map(([n,r,s,rate,count])=><article key={n}><span className="master-avatar">{n[0]}</span><div><small>{r}</small><h3>{n}</h3><p>{s}</p><b><Star size={14}/> {rate} · {count} поручений</b></div><button onClick={openOrder}>Поручить</button></article>)}</div></section>

      <section className="academy-testimonials"><div className="section-title"><span>Голоса Искателей</span><h2>Сказания об Училище</h2></div><div>{["Мастер не просто решил задачу, а объяснил каждый шаг. На защите я действительно понимала свою работу.","Цифирная палата помогла проверить расчёт, а профессор Зурк вовремя подсказал позвать Мастера.","Оберег сделки снимает тревогу: условия, сроки и правки видны до начала работы."].map((q,i)=><blockquote key={q}><p>«{q}»</p><footer>{["Елена · экономика","Илья · физика","Мария · дизайн"][i]} <span>★★★★★</span></footer></blockquote>)}</div></section>

      <section className="academy-master-cta"><img src={`${BASE}learning/characters/son-hero.webp`} alt="Исследователь Сон приглашает Мастеров"/><div><span className="learning-eyebrow"><WandSparkles size={14}/> Испытание Сона</span><h2>Исследователь Сон ищет таланты</h2><p>Докажи знания, пройди предметное испытание и вступи в Гильдию Мастеров. Начни с ранга Подмастерья и расти до Волхва.</p><button className="learning-gold-button" onClick={()=>props.isAuthenticated?props.onOpenDashboard():props.onRequireAuth()}>Стать Мастером <ArrowRight size={18}/></button></div></section>

      <section className="academy-faq"><div className="section-title"><span>Свитки мудрости</span><h2>Частые вопросы</h2></div><div className="faq-layout"><img src={`${BASE}learning/characters/zurk-reader.webp`} alt="Профессор Зурк отвечает на вопросы"/><div>{[["Что такое Оберег сделки?","Оплата остаётся в Казне Училища и передаётся Мастеру только после принятия результата."],["Можно сначала узнать стоимость?","Да. Создайте поручение или воспользуйтесь бесплатной Цифирной палатой — отклики ни к чему не обязывают."],["Как проверяются Мастера?","Документы, предметные Испытания Сона, портфолио, Слава и Сказания предыдущих Искателей."],["Что делать, если возник спор?","Обратитесь на Заставу: Хранители изучат переписку, файлы и условия поручения."]].map(([q,a],i)=><article className={faq===i?"open":""} key={q}><button onClick={()=>setFaq(faq===i?-1:i)}>{q}<span>{faq===i?"−":"+"}</span></button>{faq===i&&<p>{a}</p>}</article>)}</div></div></section>
    </main>
    {orderOpen&&<LearningOrderModal onClose={()=>setOrderOpen(false)} onCreate={createOrder}/>} 
  </section>;
}

function CogIcon(){return <FlaskConical size={15}/>}

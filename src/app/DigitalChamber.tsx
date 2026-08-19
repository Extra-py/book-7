import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Calculator, CheckCircle2, Clock3, Cog, FlaskConical, GraduationCap, Save, ScrollText, Sigma, Sparkles, WandSparkles } from "lucide-react";
import LearningOrderModal from "./LearningOrderModal";
import { LearningOrder, loadLearningOrders, saveLearningOrders } from "./learning";

const BASE = import.meta.env.BASE_URL;
type Hall = "math" | "physics" | "student";
type Result = { title: string; answer: string; steps: string[] };
type HistoryItem = Result & { id: string; date: string };

const halls = [
  { id: "math" as Hall, title: "Зал Математики", copy: "Уравнения, проценты, матрицы и алгебра", icon: Sigma },
  { id: "physics" as Hall, title: "Зал Физики", copy: "Механика, электричество и единицы СИ", icon: Cog },
  { id: "student" as Hall, title: "Студенческий быт", copy: "Дедлайны, объём работ и стоимость", icon: GraduationCap },
];

export default function DigitalChamber({ isAuthenticated, username, onBack, onRequireAuth, onOpenDashboard }: { isAuthenticated: boolean; username?: string; onBack: () => void; onRequireAuth: () => void; onOpenDashboard: () => void }) {
  const [hall, setHall] = useState<Hall>("math");
  const [values, setValues] = useState({ a: "1", b: "-5", c: "6", speed: "72", deadline: "", pages: "30" });
  const [result, setResult] = useState<Result | null>(null);
  const [changes, setChanges] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);
  const historyKey = isAuthenticated ? `edustories_calc_history_${username}` : "edustories_calc_guest_history";
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse((isAuthenticated ? localStorage : sessionStorage).getItem(historyKey) || "[]"); } catch { return []; }
  });

  const updateValue = (key: keyof typeof values, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
    setChanges(current => current + 1);
  };

  const calculate = () => {
    let next: Result;
    if (hall === "math") {
      const a = Number(values.a.replace(",", ".")); const b = Number(values.b.replace(",", ".")); const c = Number(values.c.replace(",", "."));
      if (![a,b,c].every(Number.isFinite) || a === 0) { setResult({ title: "Шестерёнки заклинило", answer: "Проверь коэффициенты", steps: ["Коэффициент a не может быть равен нулю.", "Исследователь Сон просит использовать числа в каждом поле."] }); return; }
      const d = b*b - 4*a*c;
      const answer = d < 0 ? "Действительных корней нет" : d === 0 ? `x = ${(-b/(2*a)).toFixed(2)}` : `x₁ = ${((-b+Math.sqrt(d))/(2*a)).toFixed(2)}, x₂ = ${((-b-Math.sqrt(d))/(2*a)).toFixed(2)}`;
      next = { title: "Квадратное уравнение", answer, steps: [`D = b² − 4ac = (${b})² − 4·${a}·${c} = ${d}`, d < 0 ? "D < 0 — действительных корней нет" : "x = (−b ± √D) / 2a", answer] };
    } else if (hall === "physics") {
      const speed = Number(values.speed.replace(",", "."));
      if (!Number.isFinite(speed)) { setResult({ title: "Шестерёнки заклинило", answer: "Введите скорость числом", steps: ["Допустимы точка и запятая как десятичный разделитель."] }); return; }
      const ms = speed / 3.6;
      next = { title: "Перевод скорости", answer: `${ms.toFixed(2)} м/с`, steps: ["1 км = 1000 м, 1 ч = 3600 с", `${speed} км/ч × 1000 / 3600`, `${speed} / 3,6 = ${ms.toFixed(2)} м/с`] };
    } else {
      const target = values.deadline ? new Date(`${values.deadline}T23:59:59`) : null;
      const days = target ? Math.max(1, Math.ceil((target.getTime() - Date.now()) / 86400000)) : 0;
      const pages = Math.max(1, Number(values.pages) || 1);
      if (!target || target.getTime() < Date.now()) { setResult({ title: "Песок на исходе", answer: "Выберите будущую дату", steps: ["Укажите срок, чтобы Сон составил план."] }); return; }
      next = { title: "План до рассвета", answer: `${Math.ceil(pages/days)} стр. в день`, steps: [`До срока: ${days} дн.`, `Объём: ${pages} стр.`, `${pages} / ${days} = ${Math.ceil(pages/days)} стр. в день`, "Оставьте последний день на проверку и оформление."] };
    }
    setResult(next);
    const item = { ...next, id: `calc-${Date.now()}`, date: new Date().toISOString() };
    const limit = isAuthenticated ? 100 : 5;
    const updated = [item, ...history].slice(0, limit);
    setHistory(updated);
    (isAuthenticated ? localStorage : sessionStorage).setItem(historyKey, JSON.stringify(updated));
  };

  const formula = useMemo(() => hall === "math" ? "ax² + bx + c = 0" : hall === "physics" ? "vₘ/ₛ = vₖₘ/ч ÷ 3,6" : "объём ÷ дни = темп", [hall]);
  const createOrder = (order: LearningOrder) => {
    const key = username || "guest"; saveLearningOrders(key, [order, ...loadLearningOrders(key)]); setOrderOpen(false); onOpenDashboard();
  };

  return <section className="chamber-page">
    <header className="chamber-header">
      <button className="learning-brand" onClick={onBack}><img src={`${BASE}brand/edustories-logo.webp`} alt="" /><span><b>EduStories</b><small>Цифирная палата</small></span></button>
      <button className="chamber-back" onClick={onBack}><ArrowLeft size={17} /> К Доске поручений</button>
      <span><Sparkles size={15} /> Бесплатно для всех Искателей</span>
    </header>
    <section className="chamber-hero">
      <div><span className="learning-eyebrow"><Calculator size={15} /> Счётная машина Сона</span><h1>Цифирная палата</h1><p>Выберите готовый рецепт, получите не только ответ, но и полный ход решения. Точность — вежливость чародеев.</p><div className="chamber-badges"><span>Гостю — 5 расчётов</span><span>Пошаговое решение</span><span>Автосохранение</span></div></div>
      <img src={`${BASE}learning/characters/son-calculator.webp`} alt="Исследователь Сон — хранитель Цифирной палаты" />
    </section>
    <main className="chamber-main">
      <section className="chamber-halls"><div className="section-title"><span>Залы вычислений</span><h2>Выбери область знаний</h2></div><div>{halls.map(item => { const Icon=item.icon; return <button className={hall===item.id?"active":""} key={item.id} onClick={()=>{setHall(item.id);setResult(null)}}><Icon/><span><b>{item.title}</b><small>{item.copy}</small></span></button>})}<button disabled><FlaskConical/><span><b>Зал Химии</b><small>Скоро откроется</small></span></button></div></section>
      <section className="chamber-workspace">
        <div className="chamber-form">
          <span className="learning-eyebrow"><ScrollText size={14}/> Готовый рецепт</span><h2>{hall === "math" ? "Квадратное уравнение" : hall === "physics" ? "Перевод скорости" : "План до дедлайна"}</h2><div className="chamber-formula">{formula}</div>
          {hall === "math" && <div className="chamber-inputs"><label>a<input value={values.a} onChange={e=>updateValue("a",e.target.value)}/></label><label>b<input value={values.b} onChange={e=>updateValue("b",e.target.value)}/></label><label>c<input value={values.c} onChange={e=>updateValue("c",e.target.value)}/></label></div>}
          {hall === "physics" && <div className="chamber-inputs one"><label>Скорость, км/ч<input value={values.speed} onChange={e=>updateValue("speed",e.target.value)}/></label></div>}
          {hall === "student" && <div className="chamber-inputs two"><label>Срок<input type="date" value={values.deadline} onChange={e=>updateValue("deadline",e.target.value)}/></label><label>Объём, страниц<input value={values.pages} onChange={e=>updateValue("pages",e.target.value)}/></label></div>}
          <button className="learning-gold-button chamber-calc" onClick={calculate}><Cog size={19}/> Запустить шестерёнки</button>
          {changes >= 3 && <div className="son-hint"><img src={`${BASE}learning/characters/zurk-guide.webp`} alt="Профессор Зурк"/><p><b>Профессор Зурк заметил затруднение.</b> Похоже, задача упрямится. Показать её Мастерам?</p><button onClick={()=>isAuthenticated?setOrderOpen(true):onRequireAuth()}>Позвать Мастера</button></div>}
        </div>
        <div className="chamber-result">
          {result ? <><span><CheckCircle2 size={16}/> Расчёт завершён</span><h2>{result.title}</h2><strong>{result.answer}</strong><ol>{result.steps.map((step,index)=><li key={`${step}-${index}`}>{step}</li>)}</ol><div><button onClick={()=>isAuthenticated?localStorage.setItem(`edustories_saved_scroll_${Date.now()}`,JSON.stringify(result)):onRequireAuth()}><Save size={16}/> Сохранить свиток</button><button onClick={()=>isAuthenticated?setOrderOpen(true):onRequireAuth()}><WandSparkles size={16}/> Позвать Мастера</button></div></> : <div className="chamber-empty"><Cog/><h2>Механизм ждёт данных</h2><p>Заполните поля и запустите шестерёнки. Здесь появятся формула, подстановка и ответ.</p></div>}
        </div>
      </section>
      <section className="chamber-history"><div className="section-title"><span>Летопись вычислений</span><h2>Последние расчёты</h2></div><div>{history.length?history.slice(0,5).map(item=><article key={item.id}><Clock3/><span><b>{item.title}</b><small>{new Date(item.date).toLocaleString("ru-RU")}</small></span><strong>{item.answer}</strong></article>):<p><BookOpen/> История пока пуста. Первый расчёт откроет эту страницу летописи.</p>}</div></section>
    </main>
    {orderOpen && <LearningOrderModal onClose={()=>setOrderOpen(false)} onCreate={createOrder}/>} 
  </section>;
}

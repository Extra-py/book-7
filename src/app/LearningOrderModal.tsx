import { useState } from "react";
import { Calculator, CheckCircle2, X } from "lucide-react";
import { LearningOrder } from "./learning";

export default function LearningOrderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (order: LearningOrder) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Курсовая работа");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const valid = title.trim() && subject.trim() && deadline && budget.trim();

  return (
    <div className="learning-modal-backdrop" role="presentation" onClick={onClose}>
      <form className="learning-order-modal" onSubmit={(event) => {
        event.preventDefault();
        if (!valid) return;
        onCreate({ id: `order-${Date.now()}`, title: title.trim(), category, subject: subject.trim(), deadline, budget: budget.trim(), status: "active" });
      }} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="learning-modal-close" onClick={onClose} aria-label="Закрыть"><X size={20} /></button>
        <span className="learning-eyebrow"><Calculator size={15} /> Новое поручение</span>
        <h2>Создать заказ</h2>
        <p>Опишите задачу — мастера предложат сроки, стоимость и план выполнения.</p>
        <label>Название задания<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, презентация по биологии" required /></label>
        <div className="learning-form-row">
          <label>Тип работы<select value={category} onChange={(e) => setCategory(e.target.value)}><option>Курсовая работа</option><option>Программирование</option><option>Презентация</option><option>Репетиторство</option><option>Другое</option></select></label>
          <label>Предмет<input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Предмет" required /></label>
        </div>
        <div className="learning-form-row">
          <label>Срок<input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required /></label>
          <label>Бюджет<input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Например, до 3 000 ₽" required /></label>
        </div>
        <button className="learning-gold-button" type="submit" disabled={!valid}><CheckCircle2 size={18} /> Опубликовать заказ</button>
        <small>Данные демонстрационной версии сохраняются в этом браузере.</small>
      </form>
    </div>
  );
}

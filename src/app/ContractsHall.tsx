import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileSignature,
  Hourglass,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type ContractTab = "available" | "active" | "completed" | "expired";
type ContractId = "tracker" | "glossa";

type ContractsHallProps = {
  theme: "light" | "dark";
  storageKey: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onOpenJourney: () => void;
};

const availableContracts = [
  {
    id: "tracker" as ContractId,
    number: "147",
    title: "Путь Следопыта",
    source: "Братство Дальних Троп",
    difficulty: 2,
    deadline: "7 дней",
    conditions: ["Прочитать 3 главы", "Ответить на 5 вопросов"],
    rewards: ["Эссенция Приключения ×5", "150 XP", "Значок «Юный Следопыт»"],
    special: false,
  },
  {
    id: "glossa" as ContractId,
    number: "Особый",
    title: "Секретное поручение Глоссы",
    source: "Бабушка Глосса",
    difficulty: 5,
    deadline: "Срок откроется после подписания",
    conditions: ["Прочитать особый рассказ", "Оставить свободный отзыв"],
    rewards: ["Фрагмент утраченного лора", "Эссенция Молчания ×10"],
    special: true,
  },
];

export default function ContractsHall({ theme, storageKey, isAuthenticated, onRequireAuth, onOpenJourney }: ContractsHallProps) {
  const [tab, setTab] = useState<ContractTab>("available");
  const [signed, setSigned] = useState<ContractId[]>(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}_signed`) || "[]"); }
    catch { return []; }
  });
  const [notaryWords, setNotaryWords] = useState("Добро пожаловать в Зал Контрактов. Здесь слова обретают вес, а обещания становятся связывающей силой.");
  const [signing, setSigning] = useState<ContractId | null>(null);

  useEffect(() => { localStorage.setItem(`${storageKey}_signed`, JSON.stringify(signed)); }, [signed, storageKey]);

  const visibleAvailable = useMemo(() => availableContracts.filter((contract) => !signed.includes(contract.id)), [signed]);

  const signContract = (id: ContractId) => {
    if (!isAuthenticated) {
      setNotaryWords("Подпись должна принадлежать Книгочею. Войдите в Библиотеку — и я подготовлю чернила.");
      onRequireAuth();
      return;
    }
    if (signed.length >= 2) {
      setNotaryWords("Осторожнее. Даже решительный герой не должен держать больше обещаний, чем способен унести.");
      return;
    }
    setSigning(id);
    window.setTimeout(() => {
      setSigned((items) => [...items, id]);
      setSigning(null);
      setNotaryWords("Контракт скреплён. Ваше слово принято Библиотекой — берегите его.");
      setTab("active");
    }, 900);
  };

  return (
    <section className="contracts-page">
      <header className="contracts-heading">
        <span><FileSignature size={16} /> Обязательства Книгочея</span>
        <h1>Зал Контрактов</h1>
        <p>Каждое обещание, данное книге, возвращается историей.</p>
      </header>

      <div className="contracts-layout">
        <aside className="notary-card">
          <div className="notary-portrait">
            <img src={`${import.meta.env.BASE_URL}contracts/${theme === "light" ? "notary-pergament-light-v2.webp" : "notary-pergament.webp"}`} alt="Нотариус Пергамент — хранитель контрактов" width="800" height="1334" loading="eager" />
          </div>
          <div className="notary-copy">
            <small>Хранитель контрактов</small>
            <h2>Нотариус Пергамент</h2>
            <blockquote>«{notaryWords}»</blockquote>
          </div>
        </aside>

        <main className="contracts-board">
          <section className="contract-summary" aria-label="Статистика контрактов">
            <div><ScrollText size={25} /><span><small>Активные</small><b>{1 + signed.length} / 3</b></span></div>
            <div><CheckCircle2 size={25} /><span><small>Выполнено</small><b>23</b></span></div>
            <div><ShieldCheck size={25} /><span><small>Репутация</small><b>Надёжный</b></span></div>
          </section>

          <nav className="contract-tabs" aria-label="Категории контрактов">
            <button className={tab === "available" ? "active" : ""} onClick={() => setTab("available")}>Доступные <b>{visibleAvailable.length}</b></button>
            <button className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>Активные <b>{1 + signed.length}</b></button>
            <button className={tab === "completed" ? "active" : ""} onClick={() => setTab("completed")}>Выполненные <b>23</b></button>
            <button className={tab === "expired" ? "active" : ""} onClick={() => setTab("expired")}>Просроченные <b>2</b></button>
          </nav>

          {tab === "available" && (
            <div className="contract-paper-grid">
              {visibleAvailable.length ? visibleAvailable.map((contract) => (
                <article className={`contract-paper ${contract.special ? "special" : ""} ${signing === contract.id ? "signing" : ""}`} key={contract.id}>
                  <span className="wax-seal">{contract.special ? "✦" : "✣"}</span>
                  <small>{contract.special ? "Особый контракт" : `Контракт № ${contract.number}`}</small>
                  <h2>{contract.title}</h2>
                  <p className="contract-source">{contract.source}</p>
                  <div className="contract-details">
                    <div><b>Сложность</b><span className="contract-stars">{"★".repeat(contract.difficulty)}{"☆".repeat(5 - contract.difficulty)}</span></div>
                    <div><b>Срок</b><span><Hourglass size={14} /> {contract.deadline}</span></div>
                    <div><b>Условия</b>{contract.conditions.map((item) => <span key={item}>• {item}</span>)}</div>
                    <div><b>Награды</b>{contract.rewards.map((item) => <span key={item}>✦ {item}</span>)}</div>
                  </div>
                  <button onClick={() => signContract(contract.id)} disabled={signing === contract.id}>
                    <FileSignature size={17} /> {signing === contract.id ? "Ставим печать…" : "Подписать контракт"}
                  </button>
                </article>
              )) : <EmptyContracts text="Все доступные контракты уже подписаны. Пергамент готовит новые документы." />}
            </div>
          )}

          {tab === "active" && (
            <div className="active-contracts">
              <article>
                <div className="active-contract-icon"><BookOpen size={29} /></div>
                <div><small>Контракт №142 · в процессе</small><h2>Загадка запечатанной двери</h2><p>Осталось пройти финальный тест по четвёртой главе.</p><div className="contract-progress"><i><b style={{ width: "70%" }} /></i><strong>70%</strong></div></div>
                <aside><span><Clock3 size={16} /> 2 дня 6 часов</span><button onClick={onOpenJourney}>Продолжить →</button></aside>
              </article>
              {signed.map((id) => {
                const contract = availableContracts.find((item) => item.id === id)!;
                return (
                  <article key={id}>
                    <div className="active-contract-icon"><FileSignature size={29} /></div>
                    <div><small>Контракт №{contract.number} · только начат</small><h2>{contract.title}</h2><p>{contract.conditions[0]} и выполнить оставшиеся условия.</p><div className="contract-progress"><i><b style={{ width: "5%" }} /></i><strong>5%</strong></div></div>
                    <aside><span><Clock3 size={16} /> {contract.deadline}</span><button onClick={onOpenJourney}>Начать →</button></aside>
                  </article>
                );
              })}
            </div>
          )}

          {tab === "completed" && (
            <div className="contract-archive">
              <article><Award size={28} /><div><small>Выполнено за 5 дней из 7</small><h2>Путь Следопыта</h2><p>Награда получена: 150 XP и значок «Юный Следопыт».</p></div><CheckCircle2 size={27} /></article>
              <article><Award size={28} /><div><small>Выполнено за 10 дней из 10</small><h2>Тайна Молчаливых Строк</h2><p>Награда получена: редкая эссенция и запись в архиве.</p></div><CheckCircle2 size={27} /></article>
            </div>
          )}

          {tab === "expired" && (
            <div className="contract-archive expired">
              <article><Clock3 size={28} /><div><small>Срок истёк</small><h2>Хроники забытого королевства</h2><p>Контракт можно заключить заново после 24 часов ожидания.</p></div><button onClick={() => setNotaryWords("Не всякое обещание удаётся сдержать. Отдохните — и возвращайтесь к нему осознанно.")}>Подробнее</button></article>
              <article><Clock3 size={28} /><div><small>Срок истёк</small><h2>Три страницы до рассвета</h2><p>Награда не получена. Повторная попытка станет доступна завтра.</p></div><button onClick={() => setNotaryWords("Репутация складывается из мелочей, но одна ошибка ещё не определяет весь путь.")}>Подробнее</button></article>
            </div>
          )}
        </main>
      </div>

      <footer className="contracts-note"><Sparkles size={17} /><span>Контракт — не просто задание. Это данное слово, а слово в Библиотеке обладает силой.</span></footer>
    </section>
  );
}

function EmptyContracts({ text }: { text: string }) {
  return <div className="contracts-empty"><ScrollText size={34} /><h2>Новые свитки уже в пути</h2><p>{text}</p></div>;
}

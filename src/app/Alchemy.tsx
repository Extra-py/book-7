import { useEffect, useMemo, useState } from "react";
import {
  Beaker,
  BookOpen,
  Check,
  FlaskConical,
  LibraryBig,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

type EssenceId = "mystery" | "adventure" | "magic" | "chronicle" | "passion" | "silence";
type BrewState = "idle" | "brewing" | "success" | "odd";

type Essence = {
  id: EssenceId;
  name: string;
  source: string;
  count: number;
  color: string;
  glyph: string;
};

type Recipe = {
  id: string;
  level: string;
  name: string;
  formula: Partial<Record<EssenceId, number>>;
  effect: string;
};

const initialEssences: Essence[] = [
  { id: "mystery", name: "Эссенция Тайны", source: "детективные истории", count: 12, color: "#48c9e8", glyph: "◈" },
  { id: "adventure", name: "Эссенция Приключения", source: "квесты дальних странствий", count: 8, color: "#e9904d", glyph: "✦" },
  { id: "magic", name: "Эссенция Магии", source: "фэнтезийные сюжеты", count: 15, color: "#a97af2", glyph: "✧" },
  { id: "chronicle", name: "Эссенция Хроники", source: "исторические тексты", count: 5, color: "#63d09b", glyph: "⌛" },
  { id: "passion", name: "Эссенция Страсти", source: "драматические истории", count: 3, color: "#ef7181", glyph: "♥" },
  { id: "silence", name: "Эссенция Молчания", source: "поэзия и созерцание", count: 20, color: "#d9e5ec", glyph: "○" },
];

const recipes: Recipe[] = [
  {
    id: "attentive",
    level: "Базовый рецепт",
    name: "Зелье внимательного читателя",
    formula: { mystery: 3, silence: 2 },
    effect: "+20% к обнаружению скрытых деталей в текстах на неделю.",
  },
  {
    id: "energy",
    level: "Базовый рецепт",
    name: "Бодрость читателя",
    formula: { adventure: 2, chronicle: 1 },
    effect: "+15% опыта за следующее прочтение.",
  },
  {
    id: "midnight",
    level: "Базовый рецепт",
    name: "Свеча полуночника",
    formula: { silence: 3, magic: 1 },
    effect: "Открывает доступ к ночным событиям.",
  },
  {
    id: "mirror",
    level: "Продвинутый рецепт",
    name: "Зеркало жанров",
    formula: { mystery: 2, magic: 2, passion: 1 },
    effect: "Открывает задания другой гильдии на 48 часов.",
  },
  {
    id: "prophecy",
    level: "Продвинутый рецепт",
    name: "Чернила пророчества",
    formula: { chronicle: 3, silence: 3 },
    effect: "Даёт бережную подсказку к следующему сюжетному повороту.",
  },
];

const keyFor = (formula: Partial<Record<EssenceId, number>>) =>
  Object.entries(formula).sort(([a], [b]) => a.localeCompare(b)).map(([id, count]) => `${id}:${count}`).join("|");

function selectionToFormula(selected: EssenceId[]) {
  return selected.reduce<Partial<Record<EssenceId, number>>>((result, id) => {
    result[id] = (result[id] || 0) + 1;
    return result;
  }, {});
}

type AlchemyProps = {
  theme: "light" | "dark";
  storageKey: string;
  onOpenTavern: () => void;
};

export default function Alchemy({ theme, storageKey, onOpenTavern }: AlchemyProps) {
  const [selected, setSelected] = useState<EssenceId[]>([]);
  const [inventory, setInventory] = useState<Record<EssenceId, number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`${storageKey}_inventory`) || "{}");
      return Object.fromEntries(initialEssences.map((item) => [item.id, stored[item.id] ?? item.count])) as Record<EssenceId, number>;
    } catch {
      return Object.fromEntries(initialEssences.map((item) => [item.id, item.count])) as Record<EssenceId, number>;
    }
  });
  const [discovered, setDiscovered] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}_recipes`) || '["attentive","energy"]'); }
    catch { return ["attentive", "energy"]; }
  });
  const [created, setCreated] = useState(() => Number(localStorage.getItem(`${storageKey}_created`)) || 0);
  const [failed, setFailed] = useState(() => Number(localStorage.getItem(`${storageKey}_failed`)) || 0);
  const [brewState, setBrewState] = useState<BrewState>("idle");
  const [message, setMessage] = useState("А, читатель! Заходи, только ничего не трогай… то есть трогай, но осторожно!");

  useEffect(() => { localStorage.setItem(`${storageKey}_inventory`, JSON.stringify(inventory)); }, [inventory, storageKey]);
  useEffect(() => { localStorage.setItem(`${storageKey}_recipes`, JSON.stringify(discovered)); }, [discovered, storageKey]);
  useEffect(() => { localStorage.setItem(`${storageKey}_created`, String(created)); }, [created, storageKey]);
  useEffect(() => { localStorage.setItem(`${storageKey}_failed`, String(failed)); }, [failed, storageKey]);

  const selectedDetails = useMemo(
    () => selected.map((id) => initialEssences.find((item) => item.id === id)!),
    [selected],
  );

  const addEssence = (id: EssenceId) => {
    if (selected.length >= 7 || selected.filter((item) => item === id).length >= inventory[id]) return;
    setSelected((items) => [...items, id]);
    setBrewState("idle");
    setMessage("Так… хорошее начало. Теперь бы не забыть, что мы собирались получить.");
  };

  const chooseRecipe = (recipe: Recipe) => {
    const next = Object.entries(recipe.formula).flatMap(([id, count]) => Array(count || 0).fill(id as EssenceId));
    const hasEnough = next.every((id) => next.filter((item) => item === id).length <= inventory[id]);
    if (!hasEnough) {
      setMessage("Для этой формулы не хватает эссенций. Похоже, пора снова отправляться к историям!");
      return;
    }
    setSelected(next);
    setBrewState("idle");
    setMessage(`Формула «${recipe.name}» в котле. Проверь пропорции и начинай варку!`);
    document.getElementById("alchemy-cauldron")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const brew = () => {
    if (!selected.length || brewState === "brewing") return;
    setBrewState("brewing");
    setMessage("Тише! Истории знакомятся друг с другом… надеюсь, без взрыва.");
    window.setTimeout(() => {
      const recipe = recipes.find((item) => keyFor(item.formula) === keyFor(selectionToFormula(selected)));
      if (recipe) {
        setInventory((current) => {
          const next = { ...current };
          selected.forEach((id) => { next[id] = Math.max(0, next[id] - 1); });
          return next;
        });
        setDiscovered((items) => items.includes(recipe.id) ? items : [...items, recipe.id]);
        setCreated((value) => value + 1);
        setBrewState("success");
        setMessage(`Да! Получилось! «${recipe.name}» отправляется в твой гримуар.`);
      } else {
        setFailed((value) => value + 1);
        setBrewState("odd");
        setMessage("Это тоже результат! Наука не знает поражений — только неожиданные открытия. Эксперимент №247.");
      }
      setSelected([]);
    }, 1050);
  };

  return (
    <section className="alchemy-page">
      <header className="alchemy-hero">
        <div className="alchemy-hero-copy">
          <span className="alchemy-overline"><FlaskConical size={16} /> Подвал таверны «Последняя глава»</span>
          <h1>Алхимическая <em>лаборатория</em></h1>
          <p>Смешивай эссенции прочитанных историй, открывай рецепты и превращай читательский опыт в редкие артефакты.</p>
          <div className="alchemy-stats" aria-label="Прогресс лаборатории">
            <span><b>{discovered.length}</b><small>из {recipes.length} рецептов</small></span>
            <span><b>{created}</b><small>предметов создано</small></span>
            <span><b>{Object.values(inventory).reduce((sum, value) => sum + value, 0)}</b><small>эссенций в запасе</small></span>
          </div>
        </div>
        <div className="flyagius-portrait">
          <img src={`${import.meta.env.BASE_URL}alchemy/${theme === "light" ? "master-flyagius-light-v2.webp" : "master-flyagius.webp"}`} alt="Мастер Флягиус в алхимической лаборатории" width="900" height="1499" loading="eager" />
          <div><small>Хранитель лаборатории</small><strong>Мастер Флягиус</strong></div>
        </div>
      </header>

      <nav className="alchemy-tabs" aria-label="Разделы лаборатории">
        <a href="#alchemy-ingredients"><Beaker size={17} /> Ингредиенты</a>
        <a href="#alchemy-recipes"><BookOpen size={17} /> Рецепты</a>
        <a href="#alchemy-cauldron"><FlaskConical size={17} /> Котёл</a>
        <a href="#alchemy-grimoire"><LibraryBig size={17} /> Гримуар</a>
      </nav>

      <div className="alchemy-lab">
        <aside className="flyagius-dialogue">
          <div className="flyagius-dialogue-title"><i /> Флягиус говорит</div>
          <blockquote>«{message}»</blockquote>
          <p><Sparkles size={17} /> Смешивая разные истории, мы на мгновение воссоздаём единство Библиотеки Вечности.</p>
          <button onClick={onOpenTavern}>Заглянуть в таверну <span>→</span></button>
        </aside>

        <section className={`alchemy-cauldron-panel ${brewState}`} id="alchemy-cauldron">
          <header>
            <div><small>Зона крафта</small><h2>Котёл историй</h2></div>
            <button onClick={() => { setSelected([]); setBrewState("idle"); }}><RotateCcw size={15} /> Очистить</button>
          </header>
          <div className="alchemy-cauldron" aria-label="Алхимический котёл">
            <div className="alchemy-runes"><span>ᚱ</span><span>ᛟ</span><span>ᚲ</span><span>ᛇ</span><span>ᛃ</span><span>ᚾ</span></div>
            <div className="alchemy-bowl"><i /><b>⚗</b><span /><span /><span /></div>
          </div>
          <div className="alchemy-selection">
            <small>Выбрано: {selected.length} из 7</small>
            <div>
              {selectedDetails.length ? selectedDetails.map((item, index) => (
                <button
                  key={`${item.id}-${index}`}
                  style={{ "--essence": item.color } as React.CSSProperties}
                  onClick={() => setSelected((items) => items.filter((_, position) => position !== index))}
                  aria-label={`Убрать ${item.name}`}
                >
                  {item.glyph}<X size={10} />
                </button>
              )) : <span>Добавь эссенции из запаса ниже</span>}
            </div>
          </div>
          <button className="alchemy-brew-button" onClick={brew} disabled={!selected.length || brewState === "brewing"}>
            <FlaskConical size={18} />
            {brewState === "brewing" ? "Истории смешиваются…" : "Начать варку"}
          </button>
          {brewState === "success" && <p className="alchemy-result"><Check size={15} /> Предмет создан и записан в гримуар.</p>}
          {brewState === "odd" && <p className="alchemy-result odd"><Sparkles size={15} /> Получился забавный побочный эффект.</p>}
        </section>

        <aside className="alchemy-weekly">
          <span>Рецепт недели</span>
          <div className="weekly-potion">⚗<i>✦</i></div>
          <small>Базовый рецепт</small>
          <h2>{recipes[0].name}</h2>
          <Formula formula={recipes[0].formula} />
          <p><b>Эффект:</b> {recipes[0].effect}</p>
          <button onClick={() => chooseRecipe(recipes[0])}>Добавить в котёл</button>
        </aside>
      </div>

      <section className="alchemy-section" id="alchemy-ingredients">
        <div className="alchemy-section-heading">
          <div><span>Запас алхимика</span><h2>Жанровые эссенции</h2></div>
          <p>Получай их за чтение книг и задания гильдий. Чем разнообразнее твой путь, тем богаче лаборатория.</p>
        </div>
        <div className="essence-grid">
          {initialEssences.map((item) => (
            <article className="essence-card" key={item.id} style={{ "--essence": item.color } as React.CSSProperties}>
              <div className="essence-glyph">{item.glyph}</div>
              <div><h3>{item.name}</h3><p>Источник: {item.source}</p></div>
              <strong>× {inventory[item.id]}</strong>
              <button onClick={() => addEssence(item.id)} disabled={inventory[item.id] <= selected.filter((id) => id === item.id).length || selected.length >= 7} aria-label={`Добавить ${item.name}`}><Plus size={17} /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="alchemy-section" id="alchemy-recipes">
        <div className="alchemy-section-heading">
          <div><span>Листы гримуара</span><h2>Открытые рецепты</h2></div>
          <p>{discovered.length} из {recipes.length} формул уже восстановлено.</p>
        </div>
        <div className="alchemy-recipe-list">
          {recipes.map((recipe, index) => {
            const open = discovered.includes(recipe.id);
            return (
              <article className={open ? "" : "locked"} key={recipe.id}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <div><small>{open ? recipe.level : "Неизвестный рецепт"}</small><h3>{open ? recipe.name : "Запечатанная формула"}</h3>{open ? <Formula formula={recipe.formula} compact /> : <p>??? + ??? + ???</p>}</div>
                <p>{open ? recipe.effect : "Продолжай экспериментировать, чтобы открыть эту страницу."}</p>
                <button disabled={!open} onClick={() => chooseRecipe(recipe)}>{open ? "Сварить" : "Закрыто"} <span>→</span></button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="alchemy-grimoire" id="alchemy-grimoire">
        <LibraryBig size={34} />
        <div><span>Мой гримуар</span><h2>Летопись экспериментов</h2><p>Здесь сохраняются открытые формулы и результаты каждой варки.</p></div>
        <dl>
          <div><dt>Открыто</dt><dd>{discovered.length} / {recipes.length}</dd></div>
          <div><dt>Создано</dt><dd>{created}</dd></div>
          <div><dt>Неожиданных опытов</dt><dd>{failed}</dd></div>
        </dl>
      </section>
    </section>
  );
}

function Formula({ formula, compact = false }: { formula: Partial<Record<EssenceId, number>>; compact?: boolean }) {
  return (
    <div className={`alchemy-formula ${compact ? "compact" : ""}`}>
      {Object.entries(formula).map(([id, count], index) => {
        const essence = initialEssences.find((item) => item.id === id)!;
        return (
          <span key={id}>
            {index > 0 && <i>+</i>}
            <b style={{ "--essence": essence.color } as React.CSSProperties}>{essence.glyph} × {count}</b>
          </span>
        );
      })}
    </div>
  );
}

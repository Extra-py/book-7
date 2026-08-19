import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Clock3, History, MessageCircle, Plus, Send, X } from "lucide-react";
import { AuthSession } from "./auth";
import { addSupportMessage, createSupportChat, getSupportIdentity, loadSupportChats, SupportChat } from "./support";

type SupportCenterProps = {
  session: AuthSession | null;
  accent?: "default" | "learning";
};

const formatTime = (value: string) => new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(value));

export default function SupportCenter({ session, accent = "default" }: SupportCenterProps) {
  const identity = useMemo(() => getSupportIdentity(session), [session]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"history" | "new" | "thread">("history");
  const [selected, setSelected] = useState<SupportChat | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState(0);
  const chats = useMemo(
    () => loadSupportChats().filter((chat) => chat.username === identity.username).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [identity.username, version],
  );

  const openThread = (chat: SupportChat) => {
    setSelected(chat);
    setMessage("");
    setView("thread");
  };

  const submitNew = (event: FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    const chat = createSupportChat(identity, subject.trim(), message.trim());
    setSubject("");
    setMessage("");
    setVersion((value) => value + 1);
    openThread(chat);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    const updated = addSupportMessage(selected.id, "user", message.trim());
    if (updated) setSelected(updated);
    setMessage("");
    setVersion((value) => value + 1);
  };

  return (
    <>
      <motion.button
        className={`support-fab ${accent === "learning" ? "support-fab-learning" : ""}`}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: .96 }}
        aria-label="Открыть поддержку"
      >
        <img src={`${import.meta.env.BASE_URL}support/support-icon.webp`} alt="" />
        <span>Поддержка</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside className="support-panel" initial={{ opacity: 0, y: 28, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .97 }}>
            <header>
              <div><img src={`${import.meta.env.BASE_URL}support/support-icon.webp`} alt="" /><span><b>Поддержка EduStories</b><small>Хранители ответят в этом чате</small></span></div>
              <button onClick={() => setOpen(false)} aria-label="Закрыть поддержку"><X size={18} /></button>
            </header>

            {view === "history" && (
              <section className="support-history">
                <div className="support-actions">
                  <button onClick={() => { setView("new"); setMessage(""); }}><Plus size={17} /> Создать новый чат</button>
                  <span><History size={14} /> История обращений</span>
                </div>
                <div className="support-chat-list">
                  {chats.map((chat) => (
                    <button key={chat.id} onClick={() => openThread(chat)}>
                      <span className={`support-status ${chat.status}`} />
                      <span><b>{chat.subject}</b><small>{chat.messages.at(-1)?.text}</small></span>
                      <time>{formatTime(chat.updatedAt)}</time>
                    </button>
                  ))}
                  {!chats.length && <div className="support-empty"><MessageCircle size={29} /><b>Обращений пока нет</b><p>Создайте чат, и сообщение появится здесь.</p></div>}
                </div>
              </section>
            )}

            {view === "new" && (
              <form className="support-new" onSubmit={submitNew}>
                <button className="support-back" type="button" onClick={() => setView("history")}><ArrowLeft size={16} /> История</button>
                <h3>Новое обращение</h3>
                <p>Опишите вопрос — ответ администратора сохранится в истории.</p>
                <label><span>Тема</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Например, не сохраняется ответ" maxLength={80} /></label>
                <label><span>Сообщение</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Расскажите подробнее…" rows={6} maxLength={1200} /></label>
                <button className="support-send" disabled={!subject.trim() || !message.trim()}><Send size={16} /> Отправить</button>
              </form>
            )}

            {view === "thread" && selected && (
              <section className="support-thread">
                <div className="support-thread-title">
                  <button className="support-back" onClick={() => { setView("history"); setVersion((value) => value + 1); }}><ArrowLeft size={16} /> Все чаты</button>
                  <h3>{selected.subject}</h3>
                  <small><Clock3 size={12} /> {formatTime(selected.createdAt)}</small>
                </div>
                <div className="support-messages">
                  {selected.messages.map((item) => (
                    <div className={`support-message ${item.sender}`} key={item.id}>
                      <b>{item.sender === "admin" ? "Поддержка" : identity.displayName}</b>
                      <p>{item.text}</p>
                      <time>{formatTime(item.createdAt)}</time>
                    </div>
                  ))}
                </div>
                <form className="support-reply" onSubmit={sendMessage}>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Написать сообщение…" rows={2} maxLength={1200} />
                  <button disabled={!message.trim()} aria-label="Отправить сообщение"><Send size={17} /></button>
                </form>
              </section>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

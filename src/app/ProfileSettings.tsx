import { ChangeEvent, FormEvent, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Check, Eye, EyeOff, Mail, Phone, Save, Settings, UserRound, X } from "lucide-react";
import { AuthSession, getUser, passwordHash, saveSession, updateUserAccount } from "./auth";

type ProfileSettingsProps = {
  session: AuthSession;
  onClose: () => void;
};

export default function ProfileSettings({ session, onClose }: ProfileSettingsProps) {
  const account = getUser(session.username);
  const [displayName, setDisplayName] = useState(account?.displayName || session.displayName);
  const [email, setEmail] = useState(account?.email || "");
  const [phone, setPhone] = useState(account?.phone || "");
  const [avatar, setAvatar] = useState(account?.avatar || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Выберите изображение в формате PNG, JPG или WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Изображение должно быть меньше 2 МБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 420 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        setAvatar(canvas.toDataURL("image/webp", .84));
        setError("");
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    const nickname = displayName.trim();
    if (nickname.length < 2) {
      setError("Ник должен содержать не меньше двух символов.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Проверьте адрес электронной почты.");
      return;
    }

    const patch: Parameters<typeof updateUserAccount>[1] = {
      displayName: nickname,
      email: email.trim(),
      phone: phone.trim(),
      avatar,
    };
    if (newPassword) {
      if (!account || passwordHash(currentPassword) !== account.passwordHash) {
        setError("Текущий пароль указан неверно.");
        return;
      }
      if (newPassword.length < 6) {
        setError("Новый пароль должен содержать не меньше 6 символов.");
        return;
      }
      patch.passwordHash = passwordHash(newPassword);
    }

    const updated = updateUserAccount(session.username, patch);
    if (!updated) {
      setError("Не удалось обновить профиль.");
      return;
    }
    saveSession({ ...session, displayName: updated.displayName });
    setCurrentPassword("");
    setNewPassword("");
    setSaved(true);
  };

  return (
    <motion.div className="profile-settings-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.section className="profile-settings" initial={{ y: 25, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .97 }} onClick={(event) => event.stopPropagation()}>
        <button className="profile-settings-close" onClick={onClose} aria-label="Закрыть настройки"><X size={19} /></button>
        <span className="profile-settings-kicker"><Settings size={14} /> Личный кабинет</span>
        <h2>Настройки профиля</h2>
        <p>Обновите данные, которые будут видны в дневнике читателя.</p>

        <form onSubmit={submit}>
          <div className="profile-avatar-editor">
            <span>{avatar ? <img src={avatar} alt="Аватар профиля" /> : <UserRound size={44} />}</span>
            <label><Camera size={16} /> Добавить изображение<input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseAvatar} /></label>
            {avatar && <button type="button" onClick={() => setAvatar("")}>Удалить</button>}
          </div>

          <div className="profile-settings-grid">
            <label><span><UserRound size={14} /> Ник</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={40} /></label>
            <label><span><Mail size={14} /> Электронная почта</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="reader@example.ru" /></label>
            <label><span><Phone size={14} /> Номер телефона</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 900 000-00-00" /></label>
            <label><span><UserRound size={14} /> Логин</span><input value={session.username} disabled /></label>
          </div>

          <div className="profile-password">
            <h3>Смена пароля</h3>
            <p>Оставьте поля пустыми, если пароль менять не нужно.</p>
            <div>
              <label><span>Текущий пароль</span><input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
              <label><span>Новый пароль</span><input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
              <button type="button" onClick={() => setShowPasswords((visible) => !visible)} aria-label={showPasswords ? "Скрыть пароли" : "Показать пароли"}>{showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>

          <AnimatePresence>
            {error && <motion.p className="profile-settings-error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
            {saved && <motion.p className="profile-settings-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Check size={15} /> Данные сохранены. Изменения имени появятся после обновления страницы.</motion.p>}
          </AnimatePresence>
          <button className="profile-settings-save"><Save size={17} /> Сохранить изменения</button>
        </form>
      </motion.section>
    </motion.div>
  );
}

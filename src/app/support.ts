import { AuthSession } from "./auth";

export type SupportMessage = {
  id: string;
  sender: "user" | "admin";
  text: string;
  createdAt: string;
};

export type SupportChat = {
  id: string;
  username: string;
  displayName: string;
  subject: string;
  status: "open" | "answered" | "closed";
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

const SUPPORT_KEY = "edustories_support_chats";
const GUEST_KEY = "edustories_guest_support_id";

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function loadSupportChats(): SupportChat[] {
  try {
    const chats = JSON.parse(localStorage.getItem(SUPPORT_KEY) || "[]");
    return Array.isArray(chats) ? chats : [];
  } catch {
    return [];
  }
}

export function saveSupportChats(chats: SupportChat[]) {
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(chats));
}

export function getSupportIdentity(session: AuthSession | null) {
  if (session?.role === "user") return { username: session.username, displayName: session.displayName };
  let guestId = localStorage.getItem(GUEST_KEY);
  if (!guestId) {
    guestId = `guest-${makeId()}`;
    localStorage.setItem(GUEST_KEY, guestId);
  }
  return { username: guestId, displayName: "Гость" };
}

export function createSupportChat(identity: { username: string; displayName: string }, subject: string, text: string) {
  const now = new Date().toISOString();
  const chat: SupportChat = {
    id: makeId(),
    username: identity.username,
    displayName: identity.displayName,
    subject,
    status: "open",
    createdAt: now,
    updatedAt: now,
    messages: [{ id: makeId(), sender: "user", text, createdAt: now }],
  };
  saveSupportChats([chat, ...loadSupportChats()]);
  return chat;
}

export function addSupportMessage(chatId: string, sender: "user" | "admin", text: string) {
  const chats = loadSupportChats();
  const index = chats.findIndex((chat) => chat.id === chatId);
  if (index < 0) return null;
  const now = new Date().toISOString();
  chats[index] = {
    ...chats[index],
    updatedAt: now,
    status: sender === "admin" ? "answered" : "open",
    messages: [...chats[index].messages, { id: makeId(), sender, text, createdAt: now }],
  };
  saveSupportChats(chats);
  return chats[index];
}

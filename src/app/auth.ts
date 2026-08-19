export type UserRole = "user" | "admin";

export type AuthSession = {
  username: string;
  displayName: string;
  role: UserRole;
};

export type UserRecord = {
  username: string;
  displayName: string;
  passwordHash: string;
  registeredAt: string;
  lastLoginAt: string;
  xp: number;
  level: number;
  completedMaps: number;
  answersCount: number;
  email?: string;
  phone?: string;
  avatar?: string;
};

const USERS_KEY = "edustories_registered_users";
const SESSION_KEY = "edustories_auth_session";

export const demoAdmins = [
  { username: "admin", password: "admin1986", displayName: "Администратор EduStories" },
];

export function passwordHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function loadUsers(): UserRecord[] {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const records: UserRecord[] = Array.isArray(users) ? users : [];
    if (!records.some((user) => user.username === "test")) {
      const now = new Date().toISOString();
      records.push({
        username: "test",
        displayName: "Тестовый Книгочей",
        passwordHash: passwordHash("test1986"),
        registeredAt: now,
        lastLoginAt: now,
        xp: 240,
        level: 1,
        completedMaps: 0,
        answersCount: 0,
        email: "test@edustories.local",
        phone: "",
      });
      saveUsers(records);
    }
    return records;
  } catch {
    return [];
  }
}

export function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadSession(): AuthSession | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    return session?.username && session?.role ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null) {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

export function updateUserProgress(username: string, progress: Pick<UserRecord, "xp" | "level" | "completedMaps" | "answersCount">) {
  const users = loadUsers();
  const index = users.findIndex((user) => user.username === username);
  if (index < 0) return;
  users[index] = { ...users[index], ...progress };
  saveUsers(users);
}

export function getUser(username: string) {
  return loadUsers().find((user) => user.username === username) || null;
}

export function updateUserAccount(username: string, patch: Partial<Pick<UserRecord, "displayName" | "email" | "phone" | "avatar" | "passwordHash">>) {
  const users = loadUsers();
  const index = users.findIndex((user) => user.username === username);
  if (index < 0) return null;
  users[index] = { ...users[index], ...patch };
  saveUsers(users);
  return users[index];
}

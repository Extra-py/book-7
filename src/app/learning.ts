export type LearningOrder = {
  id: string;
  title: string;
  category: string;
  subject: string;
  deadline: string;
  budget: string;
  status: "active" | "review" | "done";
  master?: string;
};

export const seedOrders: LearningOrder[] = [
  { id: "demo-course", title: "Курсовая работа по экономике", category: "Курсовая работа", subject: "Экономика", deadline: "18 августа", budget: "от 4 500 ₽", status: "active" },
  { id: "demo-python", title: "Лабораторная по Python", category: "Программирование", subject: "Информатика", deadline: "14 августа", budget: "2 800 ₽", status: "active", master: "Алексей Р." },
  { id: "demo-history", title: "Презентация по истории", category: "Презентация", subject: "История", deadline: "На проверке", budget: "1 600 ₽", status: "review", master: "Анна С." },
];

export function loadLearningOrders(username = "guest") {
  try {
    const stored = JSON.parse(localStorage.getItem(`edustories_learning_orders_${username}`) || "null");
    return Array.isArray(stored) ? stored as LearningOrder[] : seedOrders;
  } catch { return seedOrders; }
}

export function saveLearningOrders(username: string, orders: LearningOrder[]) {
  localStorage.setItem(`edustories_learning_orders_${username}`, JSON.stringify(orders));
}

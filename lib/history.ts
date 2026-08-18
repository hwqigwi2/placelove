export interface HistoryItem {
  id: string;
  title: string;
  reward: number;
  completedAt: string;
}

/**
 * История выполненных заданий.
 * На этом этапе выполнение заданий не реализовано и история в БД не хранится,
 * поэтому у всех пользователей она пустая. Когда появится механика выполнения,
 * функция начнёт читать данные из Supabase.
 */
export function getHistoryItems(): HistoryItem[] {
  return [];
}

const NBSP = " ";

/**
 * Форматирует вознаграждение: «+ 2 500 ₽»
 * Разделитель тысяч — неразрывный пробел.
 */
export function formatReward(amount: number): string {
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `+${NBSP}${grouped}${NBSP}₽`;
}

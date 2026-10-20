export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

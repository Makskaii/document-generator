export function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatMoney(value?: string | number | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function contractTypeLabel(value?: string | null) {
  const labels: Record<string, string> = {
    CRM: 'CRM-система',
    SITE: 'Сайт',
    TRAINING: 'Обучение',
  };

  return value ? labels[value] ?? value : '—';
}

export function paymentTypeLabel(value?: string | null) {
  const labels: Record<string, string> = {
    SINGLE: 'Одна оплата',
    DOUBLE: 'Две оплаты',
  };

  return value ? labels[value] ?? value : '—';
}

export function legalTypeLabel(value?: string | null) {
  const labels: Record<string, string> = {
    OOO: 'ООО',
    IP: 'ИП',
  };

  return value ? labels[value] ?? value : '—';
}

export function booleanLabel(value?: boolean | null) {
  if (value === true) {
    return 'Да';
  }

  if (value === false) {
    return 'Нет';
  }

  return '—';
}

export function statusLabel(value?: string | null) {
  const labels: Record<string, string> = {
    PENDING: 'Ожидает',
    PROCESSING: 'В работе',
    SUCCESS: 'Успешно',
    FAILED: 'Ошибка',
  };

  return value ? labels[value] ?? value : '—';
}

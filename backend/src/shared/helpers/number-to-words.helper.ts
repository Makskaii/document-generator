const onesMale = [
  '',
  'один',
  'два',
  'три',
  'четыре',
  'пять',
  'шесть',
  'семь',
  'восемь',
  'девять',
];

const onesFemale = [
  '',
  'одна',
  'две',
  'три',
  'четыре',
  'пять',
  'шесть',
  'семь',
  'восемь',
  'девять',
];

const teens = [
  'десять',
  'одиннадцать',
  'двенадцать',
  'тринадцать',
  'четырнадцать',
  'пятнадцать',
  'шестнадцать',
  'семнадцать',
  'восемнадцать',
  'девятнадцать',
];

const tens = [
  '',
  '',
  'двадцать',
  'тридцать',
  'сорок',
  'пятьдесят',
  'шестьдесят',
  'семьдесят',
  'восемьдесят',
  'девяносто',
];

const hundreds = [
  '',
  'сто',
  'двести',
  'триста',
  'четыреста',
  'пятьсот',
  'шестьсот',
  'семьсот',
  'восемьсот',
  'девятьсот',
];

export function numberToWords(value: number) {
  if (value === 0) {
    return 'ноль';
  }

  const integer = Math.floor(Math.abs(value));
  const parts: string[] = [];
  const millions = Math.floor(integer / 1_000_000);
  const thousands = Math.floor((integer % 1_000_000) / 1000);
  const rest = integer % 1000;

  if (millions) {
    parts.push(`${tripletToWords(millions, false)} ${pluralize(millions, ['миллион', 'миллиона', 'миллионов'])}`);
  }

  if (thousands) {
    parts.push(`${tripletToWords(thousands, true)} ${pluralize(thousands, ['тысяча', 'тысячи', 'тысяч'])}`);
  }

  if (rest) {
    parts.push(tripletToWords(rest, false));
  }

  return parts.join(' ');
}

export function moneyToWords(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  const rubles = Math.floor(Math.abs(normalized));
  const kopecks = Math.round((Math.abs(normalized) - rubles) * 100);
  const rubleText = `${numberToWords(rubles)} ${pluralize(rubles, ['рубль', 'рубля', 'рублей'])}`;
  const kopeckText = `${String(kopecks).padStart(2, '0')} ${pluralize(kopecks, ['копейка', 'копейки', 'копеек'])}`;

  return `${rubleText} ${kopeckText}`;
}

function tripletToWords(value: number, female: boolean) {
  const words: string[] = [];
  const hundred = Math.floor(value / 100);
  const ten = Math.floor((value % 100) / 10);
  const one = value % 10;

  if (hundred) {
    words.push(hundreds[hundred]);
  }

  if (ten === 1) {
    words.push(teens[one]);
    return words.join(' ');
  }

  if (ten) {
    words.push(tens[ten]);
  }

  if (one) {
    words.push((female ? onesFemale : onesMale)[one]);
  }

  return words.join(' ');
}

function pluralize(value: number, forms: [string, string, string]) {
  const normalized = Math.abs(value) % 100;
  const lastDigit = normalized % 10;

  if (normalized > 10 && normalized < 20) {
    return forms[2];
  }

  if (lastDigit === 1) {
    return forms[0];
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1];
  }

  return forms[2];
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Adds months, clamping the day (31 Jan + 1 month → 28/29 Feb). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Local-time `YYYY-MM-DD`, used as a stable key and DOM hook. */
export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** First day of the week for a locale: 0 (Sunday) … 6 (Saturday). */
export function firstDayOfWeek(locale: string): number {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
    if (firstDay) return firstDay % 7;
  } catch {
    /* fall through */
  }
  return /^(en-US|en-CA|ja|he|pt-BR|zh)/.test(locale) || locale === 'en' ? 0 : 1;
}

type Part = 'day' | 'month' | 'year';

function partOrder(locale: string): Part[] {
  return new Intl.DateTimeFormat(locale)
    .formatToParts(new Date(2001, 10, 22))
    .map((part) => part.type)
    .filter((type): type is Part => type === 'day' || type === 'month' || type === 'year');
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** A hint like `дд.мм.гггг` built from the locale's own order and separators. */
export function datePattern(locale: string): string {
  const letters = locale.startsWith('ru')
    ? { day: 'дд', month: 'мм', year: 'гггг' }
    : { day: 'dd', month: 'mm', year: 'yyyy' };
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(new Date(2001, 10, 22))
    .map((part) =>
      part.type === 'day' || part.type === 'month' || part.type === 'year'
        ? letters[part.type]
        : part.value,
    )
    .join('');
}

/** Parses text typed in the locale's numeric order. Returns `null` when it is not a real date. */
export function parseDate(text: string, locale: string): Date | null {
  const numbers = text.match(/\d+/g)?.map(Number);
  if (!numbers || numbers.length !== 3) return null;
  const order = partOrder(locale);
  const values = { day: 0, month: 0, year: 0 };
  order.forEach((part, index) => (values[part] = numbers[index]));
  if (values.year < 100) values.year += 2000;
  const date = new Date(values.year, values.month - 1, values.day);
  const valid =
    date.getFullYear() === values.year &&
    date.getMonth() === values.month - 1 &&
    date.getDate() === values.day;
  return valid ? date : null;
}

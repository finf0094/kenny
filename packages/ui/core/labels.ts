import { computed, inject, InjectionToken, isSignal, Provider, Signal } from '@angular/core';

/**
 * Every piece of text the components render themselves: accessible names of built-in
 * buttons, placeholders, empty states. Grouped by component.
 */
export interface KnLabels {
  avatar: { online: string; away: string; busy: string; offline: string };
  breadcrumbs: { label: string };
  chip: { remove: string };
  alert: { close: string };
  combobox: { clear: string; toggle: string; options: string; empty: string };
  commandPalette: {
    label: string;
    placeholder: string;
    commands: string;
    empty: (query: string) => string;
    navigate: string;
    run: string;
  };
  datePicker: {
    dialog: string;
    choose: string;
    change: (date: string) => string;
    previousMonth: string;
    nextMonth: string;
    day: string;
    month: string;
    year: string;
  };
  dialog: { close: string };
  numberInput: { increment: string; decrement: string };
  pagination: {
    label: string;
    previous: string;
    next: string;
    page: (page: number) => string;
  };
  progress: { label: string };
  select: { placeholder: string };
  sidebar: { label: string };
  spinner: { label: string };
  splitter: { label: string };
  stepper: { label: string; done: string; current: string };
  table: { selectAll: string; selectRow: (row: number) => string; empty: string };
  toast: { region: string; close: string };
}

/** A partial set of labels: override a single string without repeating the rest. */
export type KnLabelsOverride = { [K in keyof KnLabels]?: Partial<KnLabels[K]> };

/** English labels — the default. */
export const knLabelsEn: KnLabels = {
  avatar: { online: 'online', away: 'away', busy: 'busy', offline: 'offline' },
  breadcrumbs: { label: 'Breadcrumb' },
  chip: { remove: 'Remove' },
  alert: { close: 'Dismiss' },
  combobox: {
    clear: 'Clear',
    toggle: 'Show options',
    options: 'Options',
    empty: 'Nothing found',
  },
  commandPalette: {
    label: 'Command palette',
    placeholder: 'Search commands and pages',
    commands: 'Commands',
    empty: (query) => `Nothing found for “${query}”`,
    navigate: 'navigate',
    run: 'run',
  },
  datePicker: {
    dialog: 'Choose date',
    choose: 'Choose date',
    change: (date) => `Change date, ${date}`,
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    day: 'dd',
    month: 'mm',
    year: 'yyyy',
  },
  dialog: { close: 'Close' },
  numberInput: { increment: 'Increase', decrement: 'Decrease' },
  pagination: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    page: (page) => `Page ${page}`,
  },
  progress: { label: 'Progress' },
  select: { placeholder: 'Select…' },
  sidebar: { label: 'Main navigation' },
  spinner: { label: 'Loading' },
  splitter: { label: 'Resize panels' },
  stepper: { label: 'Steps', done: 'completed', current: 'current' },
  table: {
    selectAll: 'Select all rows',
    selectRow: (row) => `Select row ${row}`,
    empty: 'No data',
  },
  toast: { region: 'Notifications', close: 'Dismiss notification' },
};

/** Russian labels. */
export const knLabelsRu: KnLabels = {
  avatar: { online: 'в сети', away: 'отошёл', busy: 'занят', offline: 'не в сети' },
  breadcrumbs: { label: 'Навигационная цепочка' },
  chip: { remove: 'Убрать' },
  alert: { close: 'Скрыть' },
  combobox: {
    clear: 'Очистить',
    toggle: 'Показать варианты',
    options: 'Варианты',
    empty: 'Ничего не найдено',
  },
  commandPalette: {
    label: 'Командная палитра',
    placeholder: 'Поиск команд и разделов',
    commands: 'Команды',
    empty: (query) => `Ничего не нашлось по запросу «${query}»`,
    navigate: 'выбрать',
    run: 'выполнить',
  },
  datePicker: {
    dialog: 'Выбор даты',
    choose: 'Выбрать дату',
    change: (date) => `Изменить дату, ${date}`,
    previousMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    day: 'дд',
    month: 'мм',
    year: 'гггг',
  },
  dialog: { close: 'Закрыть' },
  numberInput: { increment: 'Увеличить', decrement: 'Уменьшить' },
  pagination: {
    label: 'Страницы',
    previous: 'Предыдущая страница',
    next: 'Следующая страница',
    page: (page) => `Страница ${page}`,
  },
  progress: { label: 'Прогресс' },
  select: { placeholder: 'Выберите…' },
  sidebar: { label: 'Основная навигация' },
  spinner: { label: 'Загрузка' },
  splitter: { label: 'Изменить размер панелей' },
  stepper: { label: 'Шаги', done: 'выполнен', current: 'текущий' },
  table: {
    selectAll: 'Выбрать все строки',
    selectRow: (row) => `Выбрать строку ${row}`,
    empty: 'Нет данных',
  },
  toast: { region: 'Уведомления', close: 'Закрыть уведомление' },
};

export const KN_LABELS = new InjectionToken<Signal<KnLabels>>('KN_LABELS', {
  providedIn: 'root',
  factory: () => computed(() => knLabelsEn),
});

function merge(override: KnLabelsOverride): KnLabels {
  const result = {} as Record<string, object>;
  for (const key of Object.keys(knLabelsEn) as (keyof KnLabels)[]) {
    result[key] = { ...knLabelsEn[key], ...override[key] };
  }
  return result as unknown as KnLabels;
}

/**
 * Sets the language of built-in texts. Pass a ready set (`knLabelsRu`), a partial override,
 * or a function returning either — it runs in an injection context, so it may `inject()`
 * a language service and return a signal: the components follow it without a reload.
 *
 * ```ts
 * provideKnLabels(knLabelsRu)
 * provideKnLabels({ dialog: { close: 'Dismiss' } })
 * provideKnLabels(() => inject(Language).labels) // Signal<KnLabelsOverride>
 * ```
 *
 * Anything left out falls back to English.
 */
export function provideKnLabels(
  labels: KnLabelsOverride | (() => KnLabelsOverride | Signal<KnLabelsOverride>),
): Provider {
  return {
    provide: KN_LABELS,
    useFactory: (): Signal<KnLabels> => {
      const source = typeof labels === 'function' ? labels() : labels;
      return isSignal(source) ? computed(() => merge(source())) : computed(() => merge(source));
    },
  };
}

/** The current labels as a signal. Call in an injection context (a field initialiser). */
export function injectKnLabels(): Signal<KnLabels> {
  return inject(KN_LABELS);
}

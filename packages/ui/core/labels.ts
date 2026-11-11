import {
  computed,
  inject,
  InjectionToken,
  isSignal,
  LOCALE_ID,
  Provider,
  Signal,
} from '@angular/core';

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
    rangeDialog: string;
    rangePlaceholder: string;
    rangeStart: string;
    rangeEnd: string;
    clear: string;
    day: string;
    month: string;
    year: string;
  };
  dialog: { close: string };
  fileUpload: {
    browse: string;
    browseMany: string;
    drop: string;
    files: string;
    remove: (name: string) => string;
    added: (count: number) => string;
    removed: (name: string) => string;
    type: (name: string) => string;
    size: (name: string) => string;
    count: (name: string) => string;
  };
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
  timePicker: { hours: string; minutes: string; period: string };
  tagInput: {
    selected: string;
    remove: (tag: string) => string;
    added: (tag: string) => string;
    removed: (tag: string) => string;
    marked: (tag: string) => string;
    duplicate: (tag: string) => string;
    limit: (tag: string) => string;
    invalid: (tag: string) => string;
  };
  toast: { region: string; close: string };
}

/** A partial set of labels: override a single string without repeating the rest. */
export type KnLabelsOverride = { [K in keyof KnLabels]?: Partial<KnLabels[K]> };

/** English labels — used for every locale that has no set of its own. */
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
    rangeDialog: 'Choose a period',
    rangePlaceholder: 'Start – end',
    rangeStart: 'Choose the first day',
    rangeEnd: 'Choose the last day',
    clear: 'Clear',
    day: 'dd',
    month: 'mm',
    year: 'yyyy',
  },
  dialog: { close: 'Close' },
  fileUpload: {
    browse: 'Choose a file',
    browseMany: 'Choose files',
    drop: 'or drop here',
    files: 'Chosen files',
    remove: (name) => `Remove ${name}`,
    added: (count) => `Files added: ${count}`,
    removed: (name) => `${name} removed`,
    type: (name) => `${name}: this type is not accepted`,
    size: (name) => `${name}: the file is too large`,
    count: (name) => `${name}: too many files`,
  },
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
  timePicker: { hours: 'Hours', minutes: 'Minutes', period: 'AM or PM' },
  tagInput: {
    selected: 'Selected',
    remove: (tag) => `Remove ${tag}`,
    added: (tag) => `${tag} added`,
    removed: (tag) => `${tag} removed`,
    marked: (tag) => `${tag}. Backspace removes it`,
    duplicate: (tag) => `${tag} is already in the list`,
    limit: () => 'No more can be added',
    invalid: (tag) => `${tag} cannot be added`,
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
    rangeDialog: 'Выбор периода',
    rangePlaceholder: 'Начало – конец',
    rangeStart: 'Выберите первый день',
    rangeEnd: 'Выберите последний день',
    clear: 'Очистить',
    day: 'дд',
    month: 'мм',
    year: 'гггг',
  },
  dialog: { close: 'Закрыть' },
  fileUpload: {
    browse: 'Выберите файл',
    browseMany: 'Выберите файлы',
    drop: 'или перетащите сюда',
    files: 'Выбранные файлы',
    remove: (name) => `Убрать ${name}`,
    added: (count) => `Добавлено файлов: ${count}`,
    removed: (name) => `${name} убран`,
    type: (name) => `${name}: такой тип не принимается`,
    size: (name) => `${name}: файл слишком большой`,
    count: (name) => `${name}: слишком много файлов`,
  },
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
  timePicker: { hours: 'Часы', minutes: 'Минуты', period: 'До или после полудня' },
  tagInput: {
    selected: 'Выбрано',
    remove: (tag) => `Убрать ${tag}`,
    added: (tag) => `${tag} добавлено`,
    removed: (tag) => `${tag} убрано`,
    marked: (tag) => `${tag}. Backspace — убрать`,
    duplicate: (tag) => `${tag} уже есть в списке`,
    limit: () => 'Больше добавить нельзя',
    invalid: (tag) => `${tag} нельзя добавить`,
  },
  toast: { region: 'Уведомления', close: 'Закрыть уведомление' },
};

/**
 * The set that ships for a locale: the language of the application is already declared
 * once, through `LOCALE_ID`, and the built-in texts follow it. English for everything else.
 */
export function knLabelsFor(locale: string): KnLabels {
  return locale.toLowerCase().startsWith('ru') ? knLabelsRu : knLabelsEn;
}

export const KN_LABELS = new InjectionToken<Signal<KnLabels>>('KN_LABELS', {
  providedIn: 'root',
  factory: () => {
    const labels = knLabelsFor(inject(LOCALE_ID));
    return computed(() => labels);
  },
});

function merge(base: KnLabels, override: KnLabelsOverride): KnLabels {
  const result = {} as Record<string, object>;
  for (const key of Object.keys(base) as (keyof KnLabels)[]) {
    result[key] = { ...base[key], ...override[key] };
  }
  return result as unknown as KnLabels;
}

/**
 * Changes built-in texts. Without it they follow `LOCALE_ID`: Russian for `ru`, English
 * otherwise. Pass a ready set, a partial override, or a function returning either — it
 * runs in an injection context, so it may `inject()` a language service and return a
 * signal: the components follow it without a reload.
 *
 * ```ts
 * provideKnLabels({ dialog: { close: 'Dismiss' } })
 * provideKnLabels(knLabelsEn)                       // English whatever the locale
 * provideKnLabels(() => inject(Language).labels)    // Signal<KnLabelsOverride>
 * ```
 *
 * Anything left out keeps the text of the locale's own set.
 */
export function provideKnLabels(
  labels: KnLabelsOverride | (() => KnLabelsOverride | Signal<KnLabelsOverride>),
): Provider {
  return {
    provide: KN_LABELS,
    useFactory: (): Signal<KnLabels> => {
      const base = knLabelsFor(inject(LOCALE_ID));
      const source = typeof labels === 'function' ? labels() : labels;
      return isSignal(source)
        ? computed(() => merge(base, source()))
        : computed(() => merge(base, source));
    },
  };
}

/** The current labels as a signal. Call in an injection context (a field initialiser). */
export function injectKnLabels(): Signal<KnLabels> {
  return inject(KN_LABELS);
}

import { data } from '../../generated/date-picker';
import { ComponentDoc } from '../core/doc-types';
import Range from '../demos/date-picker/range.demo';

export default {
  slug: 'date-range-picker',
  title: 'Date Range Picker',
  entry: 'date-picker',
  apiClasses: ['KnDateRangePicker'],
  description:
    'Выбор периода двумя нажатиями в одном календаре. Значение — объект с началом и концом; пока выбран только первый день, оно не меняется.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'range',
      title: 'Период с готовыми вариантами',
      description:
        'presets добавляет список быстрых периодов, clearable — кнопку очистки. Дни можно нажимать в любом порядке: раньше станет началом.',
      component: Range,
    },
  ],
  keyboard: [
    { keys: ['Enter', 'Пробел', '↓'], action: 'На поле — открывает календарь.' },
    { keys: ['←', '→', '↑', '↓'], action: 'Перемещают день; период тянется за фокусом.' },
    { keys: ['Page Up', 'Page Down'], action: 'Предыдущий и следующий месяц.' },
    { keys: ['Enter', 'Пробел'], action: 'Первое нажатие — начало периода, второе — конец.' },
    { keys: ['Esc'], action: 'Закрывает календарь; незавершённый выбор отбрасывается.' },
  ],
  a11y: [
    'Поле — кнопка с aria-haspopup="dialog"; её имя включает подпись и выбранный период.',
    'Календарь — модальный диалог с сеткой по паттерну APG Date Picker Dialog; фокус заперт внутри и возвращается на поле.',
    'Под календарём role="status" подсказывает шаг: «Выберите первый день», «Выберите последний день».',
    'Концы периода отмечены aria-selected; закраска между ними — только зрительная подсказка, поэтому период читается из имени поля.',
    'Готовые периоды — кнопки с aria-pressed.',
  ],
} satisfies ComponentDoc;

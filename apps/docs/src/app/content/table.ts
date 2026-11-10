import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnColumn, KnTable } from '@kenny/ui/table';
import { data } from '../../generated/table';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/table/basic.demo';

interface Row {
  id: number;
  name: string;
  role: string;
  tasks: number;
}

@Component({
  imports: [DocsPlayground, KnTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-table
        aria-label="Участники"
        trackBy="id"
        style="max-block-size: 13rem"
        [data]="empty.value() ? [] : rows"
        [columns]="columns"
        [size]="size.value()"
        [selectable]="selectable.value()"
        [stickyHeader]="sticky.value()"
        [(selection)]="selection"
      />
    </docs-playground>
  `,
})
class Playground {
  protected readonly rows: Row[] = [
    { id: 1, name: 'Анна Орлова', role: 'Дизайнер', tasks: 12 },
    { id: 2, name: 'Борис Ким', role: 'Разработчик', tasks: 7 },
    { id: 3, name: 'Вера Соколова', role: 'Менеджер', tasks: 21 },
    { id: 4, name: 'Глеб Назаров', role: 'Разработчик', tasks: 4 },
    { id: 5, name: 'Дина Ахметова', role: 'Аналитик', tasks: 9 },
  ];
  protected readonly columns: KnColumn<Row>[] = [
    { key: 'name', header: 'Имя', sortable: true },
    { key: 'role', header: 'Роль', sortable: true },
    { key: 'tasks', header: 'Задачи', sortable: true, align: 'end' },
  ];
  protected readonly selection = signal<readonly Row[]>([]);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly selectable = toggle('selectable', true);
  protected readonly sticky = toggle('stickyHeader', true);
  protected readonly empty = toggle('Без данных');
  protected readonly controls = [this.size, this.selectable, this.sticky, this.empty];
  protected readonly code = computed(
    () =>
      `<kn-table aria-label="Участники" trackBy="id" [data]="rows" [columns]="columns"${attrs({
        size: [this.size.value(), 'md'],
        selectable: [this.selectable.value()],
        stickyHeader: [this.sticky.value()],
      })}${this.selectable.value() ? ' [(selection)]="selected"' : ''} />`,
  );
}

export default {
  slug: 'table',
  title: 'Table',
  entry: 'table',
  description:
    'Таблица данных на нативном <table>: колонки описываются массивом, ячейки при необходимости — шаблонами. Сортировка и выбор строк встроены.',
  api: data.api,
  sources: data.sources,
  imports: ['KnTable', 'KnCell', 'KnColumn', 'KnSort'],
  demos: [
    {
      source: 'basic',
      title: 'Счета: сортировка, выбор, шаблоны ячеек',
      description:
        'Сортировка сравнивает числа как числа, даты как даты, строки — по правилам локали. Колонка «Статус» сортируется по тексту из value.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    {
      name: 'ng-template[knCell]="key"',
      description: 'Шаблон ячейки колонки. Контекст: строка ($implicit), value и index.',
    },
    { name: 'knTableEmpty', description: 'Разметка пустого состояния вместо текста emptyText.' },
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Перемещается по кнопкам сортировки и флажкам строк.' },
    {
      keys: ['Enter', 'Пробел'],
      action:
        'На заголовке: меняет сортировку по кругу — по возрастанию, по убыванию, без сортировки.',
    },
    { keys: ['Пробел'], action: 'На флажке: выбирает строку или все строки.' },
  ],
  a11y: [
    'Настоящая таблица: <th scope="col">, скринридер читает заголовок колонки вместе с ячейкой.',
    'Сортируемый заголовок — кнопка внутри <th> с aria-sort (ascending, descending, none).',
    'Флажок в шапке показывает частичный выбор состоянием mixed; у каждого флажка строки своё имя.',
    'Строки появляются каскадом (stagger), задержка ограничена двенадцатью строками, чтобы длинные таблицы не «ехали».',
    'При ширине меньше содержимого таблица прокручивается по горизонтали внутри своей поверхности.',
  ],
} satisfies ComponentDoc;

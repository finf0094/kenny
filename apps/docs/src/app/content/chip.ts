import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnChip } from '@kenny/ui/chip';
import { data } from '../../generated/chip';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/chip/basic.demo';
import Filters from '../demos/chip/filters.demo';

@Component({
  imports: [DocsPlayground, KnChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-chip
        [tone]="tone.value()"
        [size]="size.value()"
        [selectable]="selectable.value()"
        [removable]="removable.value()"
        [disabled]="disabled.value()"
        [(selected)]="selected"
      >
        {{ label.value() }}
      </kn-chip>
    </docs-playground>
  `,
})
class Playground {
  protected readonly selected = signal(true);
  protected readonly label = text('Текст', 'Дизайн');
  protected readonly tone = choice('tone', ['neutral', 'accent', 'success', 'warning', 'danger']);
  protected readonly size = choice('size', ['sm', 'md'], 'md');
  protected readonly selectable = toggle('selectable', true);
  protected readonly removable = toggle('removable');
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [
    this.label,
    this.tone,
    this.size,
    this.selectable,
    this.removable,
    this.disabled,
  ];
  protected readonly code = computed(
    () =>
      `<kn-chip${attrs({
        tone: [this.tone.value(), 'neutral'],
        size: [this.size.value(), 'md'],
        selectable: [this.selectable.value()],
        removable: [this.removable.value()],
        disabled: [this.disabled.value()],
      })}${this.selectable.value() ? ' [(selected)]="active"' : ''}${
        this.removable.value() ? ' (removed)="remove()"' : ''
      }>${this.label.value()}</kn-chip>`,
  );
}

export default {
  slug: 'chip',
  title: 'Chip',
  entry: 'chip',
  description:
    'Компактное значение, с которым можно что-то сделать: убрать адресата, включить фильтр. Для статуса без действий подойдёт Badge.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Метки и удаляемые значения',
      description: 'Чип не исчезает сам — список меняет приложение по событию removed.',
      component: Basic,
    },
    {
      source: 'filters',
      title: 'Фильтры',
      description:
        'С selectable тело чипа — кнопка с aria-pressed. Выбранный чип получает галочку, а не только цвет.',
      component: Filters,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Текст чипа.' }],
  keyboard: [
    { keys: ['Tab'], action: 'Переходит к чипу-переключателю и к кнопке удаления.' },
    { keys: ['Enter', 'Пробел'], action: 'Переключает выбор или убирает значение.' },
  ],
  a11y: [
    'Обычный чип — текст без роли. Переключаемый — нативная кнопка с aria-pressed.',
    'Кнопка удаления называется вместе с текстом чипа: «Убрать Анна Орлова», а не десять одинаковых «Убрать».',
    'Зона нажатия кнопки удаления — 28 пикселей при видимом размере 20.',
    'Набор чипов оберните в role="group" с aria-label, чтобы было понятно, к чему они относятся.',
    'После удаления фокус пропадает вместе с кнопкой — верните его на соседний чип или на поле ввода.',
  ],
} satisfies ComponentDoc;

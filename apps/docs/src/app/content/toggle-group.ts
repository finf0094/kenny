import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnToggle, KnToggleGroup } from '@kenny/ui/toggle-group';
import { data } from '../../generated/toggle-group';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/toggle-group/basic.demo';

@Component({
  imports: [DocsPlayground, KnToggleGroup, KnToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      @if (multiple.value()) {
        <kn-toggle-group
          aria-label="Начертание"
          multiple
          [size]="size.value()"
          [disabled]="disabled.value()"
          [(value)]="marks"
        >
          <button kn-toggle value="bold">Жирный</button>
          <button kn-toggle value="italic">Курсив</button>
          <button kn-toggle value="underline">Подчёркнутый</button>
        </kn-toggle-group>
      } @else {
        <kn-toggle-group
          aria-label="Выравнивание"
          [size]="size.value()"
          [disabled]="disabled.value()"
          [requireSelection]="required.value()"
          [(value)]="align"
        >
          <button kn-toggle value="left">Слева</button>
          <button kn-toggle value="center">По центру</button>
          <button kn-toggle value="right">Справа</button>
        </kn-toggle-group>
      }
    </docs-playground>
  `,
})
class Playground {
  protected readonly align = signal<string | null>('left');
  protected readonly marks = signal<string[]>(['bold']);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly multiple = toggle('multiple');
  protected readonly required = toggle('requireSelection');
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.size, this.multiple, this.required, this.disabled];
  protected readonly code = computed(() => {
    const multiple = this.multiple.value();
    const options = multiple
      ? [
          ['bold', 'Жирный'],
          ['italic', 'Курсив'],
          ['underline', 'Подчёркнутый'],
        ]
      : [
          ['left', 'Слева'],
          ['center', 'По центру'],
          ['right', 'Справа'],
        ];
    return `<kn-toggle-group aria-label="${multiple ? 'Начертание' : 'Выравнивание'}" [(value)]="${
      multiple ? 'marks' : 'align'
    }"${attrs({
      multiple: [multiple],
      requireSelection: [!multiple && this.required.value()],
      size: [this.size.value(), 'md'],
      disabled: [this.disabled.value()],
    })}>\n${options
      .map(([value, label]) => `  <button kn-toggle value="${value}">${label}</button>`)
      .join('\n')}\n</kn-toggle-group>`;
  });
}

export default {
  slug: 'toggle-group',
  title: 'Toggle Group',
  entry: 'toggle-group',
  description:
    'Набор кнопок-переключателей: один вариант из нескольких или несколько сразу. Меняет режим на месте — для переключения между разделами с собственным содержимым нужны Tabs.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Одиночный и множественный выбор',
      description:
        'requireSelection не даёт снять единственный выбор. В режиме multiple значение — массив.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Кнопки button[kn-toggle].' }],
  keyboard: [
    { keys: ['Tab'], action: 'Входит в группу — на выбранную кнопку — и выходит из неё.' },
    { keys: ['←', '→'], action: 'Переводят фокус между кнопками. В RTL — наоборот.' },
    { keys: ['Home', 'End'], action: 'Первая и последняя кнопка.' },
    { keys: ['Пробел', 'Enter'], action: 'Переключает кнопку в фокусе.' },
  ],
  a11y: [
    'role="group" с обязательным именем (aria-label или aria-labelledby), внутри — нативные кнопки с aria-pressed.',
    'Группа занимает одну позицию в порядке табуляции. Стрелки только переводят фокус: значение меняется по нажатию, а не по наведению фокуса.',
    'Кнопке с одной иконкой нужен aria-label.',
    'Работает с Reactive Forms и signal forms; touched выставляется, когда фокус покидает группу.',
  ],
} satisfies ComponentDoc;

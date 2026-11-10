import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnSplitter, KnSplitterHandle, KnSplitterPanel } from '@kenny/ui/splitter';
import { data } from '../../generated/splitter';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range } from '../core/playground';
import Basic from '../demos/splitter/basic.demo';

@Component({
  imports: [DocsPlayground, KnSplitter, KnSplitterPanel, KnSplitterHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-splitter class="frame" [orientation]="orientation.value()">
        <kn-splitter-panel [min]="min.value()" [max]="max.value()" [(size)]="size">
          <div class="pane">{{ size() }}%</div>
        </kn-splitter-panel>
        <kn-splitter-handle aria-label="Размер первой панели" [step]="step.value()" />
        <kn-splitter-panel><div class="pane">остальное</div></kn-splitter-panel>
      </kn-splitter>
    </docs-playground>
  `,
  styles: `
    .frame {
      inline-size: 22rem;
      block-size: 12rem;
    }

    .pane {
      display: grid;
      place-content: center;
      block-size: 100%;
      border-radius: var(--kn-radius-md);
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-glass-rim);
      font-variant-numeric: tabular-nums;
    }
  `,
})
class Playground {
  protected readonly size = signal<number | undefined>(40);
  protected readonly orientation = choice('orientation', ['horizontal', 'vertical']);
  protected readonly min = range('min, %', 20, 0, 40, 5);
  protected readonly max = range('max, %', 80, 60, 100, 5);
  protected readonly step = range('step, %', 2, 1, 10);
  protected readonly controls = [this.orientation, this.min, this.max, this.step];
  protected readonly code = computed(
    () =>
      `<kn-splitter${attrs({ orientation: [this.orientation.value(), 'horizontal'] })}>\n  <kn-splitter-panel [(size)]="size"${attrs({
        min: [this.min.value(), 10],
        max: [this.max.value(), 90],
      })}>…</kn-splitter-panel>\n  <kn-splitter-handle aria-label="Размер первой панели"${attrs({ step: [this.step.value(), 2] })} />\n  <kn-splitter-panel>…</kn-splitter-panel>\n</kn-splitter>`,
  );
}

export default {
  slug: 'splitter',
  title: 'Splitter',
  entry: 'splitter',
  description:
    'Панели, размер которых пользователь меняет сам: список и содержимое, редактор и предпросмотр. Сплиттеры можно вкладывать.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Вложенные сплиттеры',
      description: 'Размеры в процентах привязаны через [(size)] — их легко сохранить и восстановить.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    { name: '(по умолчанию, kn-splitter)', description: 'Чередование <kn-splitter-panel> и <kn-splitter-handle>.' },
    { name: '(по умолчанию, kn-splitter-panel)', description: 'Содержимое панели; при переполнении прокручивается.' },
  ],
  keyboard: [
    { keys: ['←', '→'], action: 'Горизонтальный сплиттер: сдвигает разделитель на шаг (в RTL наоборот).' },
    { keys: ['↑', '↓'], action: 'Вертикальный сплиттер: сдвигает разделитель на шаг.' },
    { keys: ['Shift', 'стрелка'], action: 'Шаг в пять раз больше.' },
    { keys: ['Home', 'End'], action: 'Минимальный и максимальный размер предыдущей панели.' },
    { keys: ['Двойной щелчок'], action: 'Возвращает исходные размеры.' },
  ],
  a11y: [
    'Паттерн APG Window Splitter: разделитель — фокусируемый role="separator" с aria-valuenow/min/max и aria-controls.',
    'Каждому разделителю нужен aria-label, объясняющий, что он меняет.',
    'Перетаскивание идёт через Pointer Events с захватом указателя: работает мышью, пером и пальцем.',
    'Изменение размера — прямое управление, а не анимация: панели следуют за указателем без задержки.',
  ],
} satisfies ComponentDoc;

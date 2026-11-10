import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnSlider } from '@kenny/ui/slider';
import { data } from '../../generated/slider';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, toggle } from '../core/playground';
import Basic from '../demos/slider/basic.demo';

@Component({
  imports: [DocsPlayground, KnSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <div style="inline-size: 16rem; display: grid; gap: 0.5rem; text-align: center">
        <kn-slider
          aria-label="Громкость"
          [size]="size.value()"
          [min]="min.value()"
          [max]="max.value()"
          [step]="step.value()"
          [disabled]="disabled.value()"
          [(value)]="value"
        />
        <output>{{ value() }}</output>
      </div>
    </docs-playground>
  `,
})
class Playground {
  protected readonly value = signal(40);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly min = range('min', 0, 0, 50, 10);
  protected readonly max = range('max', 100, 50, 200, 10);
  protected readonly step = range('step', 1, 1, 25);
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.size, this.min, this.max, this.step, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-slider aria-label="Громкость" [(value)]="volume"${attrs({
        size: [this.size.value(), 'md'],
        min: [this.min.value(), 0],
        max: [this.max.value(), 100],
        step: [this.step.value(), 1],
        disabled: [this.disabled.value()],
      })} />`,
  );
}

export default {
  slug: 'slider',
  title: 'Slider',
  entry: 'slider',
  description:
    'Ползунок для приблизительного выбора числа из диапазона: громкость, яркость, масштаб. Для точных значений добавьте рядом числовое поле.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Диапазоны, шаг и размеры',
      description: 'formatValue превращает число в текст для скринридера, например «64 процента».',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['←', '↓'], action: 'Уменьшает значение на шаг (в RTL ← увеличивает).' },
    { keys: ['→', '↑'], action: 'Увеличивает значение на шаг.' },
    { keys: ['PageDown', 'PageUp'], action: 'Изменяет значение крупным шагом.' },
    { keys: ['Home', 'End'], action: 'Минимум и максимум.' },
  ],
  a11y: [
    'Внутри нативный <input type="range"> с ролью slider: клавиатуру, RTL и aria-valuenow обеспечивает браузер.',
    'Имя берётся из aria-label или подписи <kn-field>.',
    'Бегунок и заливка позиционируются через transform в единицах контейнера (cqi) — без измерений в JavaScript.',
    'Область захвата совпадает с высотой бегунка: 24 px по умолчанию, 30 px для size="lg".',
  ],
} satisfies ComponentDoc;

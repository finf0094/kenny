import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnIcon } from '@kenny/ui/icon';
import { KnSlider } from '@kenny/ui/slider';

@Component({
  imports: [KnSlider, KnField, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <kn-icon name="sun" [size]="18" />
      <kn-slider aria-label="Яркость" [(value)]="brightness" [formatValue]="percent" />
      <output>{{ brightness() }}%</output>
    </div>

    <kn-field label="Размер шрифта" [hint]="fontSize() + ' px, шаг 2'">
      <kn-slider [min]="12" [max]="24" [step]="2" [(value)]="fontSize" />
    </kn-field>

    <kn-field label="Маленький"><kn-slider size="sm" [value]="30" /></kn-field>
    <kn-field label="Большой"><kn-slider size="lg" [value]="70" /></kn-field>
    <kn-field label="Отключён"><kn-slider [value]="45" disabled /></kn-field>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 24rem;
    }

    .panel {
      display: grid;
      grid-template-columns: auto 1fr 3.25rem;
      align-items: center;
      gap: var(--kn-space-3);
      padding: var(--kn-space-3) var(--kn-space-4);
      border-radius: var(--kn-radius-control);
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-shadow-glass-md);
    }

    output {
      font-variant-numeric: tabular-nums;
      text-align: end;
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class SliderBasicDemo {
  protected readonly brightness = signal(64);
  protected readonly fontSize = signal(16);
  protected readonly percent = (value: number) => `${value} процентов`;
}

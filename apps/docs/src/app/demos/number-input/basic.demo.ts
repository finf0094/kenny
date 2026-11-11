import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnNumber } from '@kenny/ui/motion';
import { KnNumberInput } from '@kenny/ui/number-input';

const PRICE = 1490;

@Component({
  imports: [KnNumberInput, KnField, KnNumber],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Мест в команде" hint="От 1 до 50. Стрелки ↑ ↓ меняют значение на шаг.">
      <kn-number-input [min]="1" [max]="50" [(value)]="seats" />
    </kn-field>

    <kn-field label="Скидка" hint="Шаг 0,5 %">
      <kn-number-input
        [min]="0"
        [max]="30"
        [step]="0.5"
        [format]="{ style: 'unit', unit: 'percent' }"
        [(value)]="discount"
      />
    </kn-field>

    <p class="total">
      Итого в месяц:
      <strong><kn-number [value]="total()" [options]="money" /></strong>
    </p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 20rem;
    }

    .total {
      margin: 0;
      color: var(--kn-color-text-muted);
    }

    strong {
      color: var(--kn-color-text);
      font-size: var(--kn-text-xl);
      font-weight: var(--kn-weight-semibold);
    }
  `,
})
export default class NumberInputBasicDemo {
  protected readonly seats = signal<number | null>(5);
  protected readonly discount = signal<number | null>(10);
  protected readonly money: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  };
  protected readonly total = computed(
    () => (this.seats() ?? 0) * PRICE * (1 - (this.discount() ?? 0) / 100),
  );
}

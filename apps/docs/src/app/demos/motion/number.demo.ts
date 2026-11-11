import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnNumber } from '@kenny/ui/motion';

const PERIODS = [
  { name: 'Сентябрь', revenue: 1_284_500, invoices: 18, share: 0.62 },
  { name: 'Октябрь', revenue: 1_931_000, invoices: 23, share: 0.78 },
  { name: 'Ноябрь', revenue: 2_406_300, invoices: 31, share: 0.845 },
];

@Component({
  imports: [KnNumber, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="stats">
      <div>
        <dt>Выручка</dt>
        <dd><kn-number [value]="period().revenue" [options]="money" /></dd>
      </div>
      <div>
        <dt>Счетов</dt>
        <dd><kn-number [value]="period().invoices" /></dd>
      </div>
      <div>
        <dt>Оплачено в срок</dt>
        <dd><kn-number [value]="period().share" [options]="percent" /></dd>
      </div>
    </dl>
    <div class="row">
      <button kn-button variant="outline" tone="neutral" (click)="next()">Следующий месяц</button>
      <span class="period" aria-live="polite">{{ period().name }}</span>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-8);
      margin: 0;
    }

    dt {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    dd {
      margin: var(--kn-space-1) 0 0;
      font-size: var(--kn-text-3xl, 1.875rem);
      font-weight: var(--kn-weight-semibold);
      letter-spacing: var(--kn-tracking-tight);
    }

    .row {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
    }

    .period {
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class MotionNumberDemo {
  private readonly index = signal(0);
  protected readonly period = () => PERIODS[this.index()];
  protected readonly money: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  };
  protected readonly percent: Intl.NumberFormatOptions = {
    style: 'percent',
    maximumFractionDigits: 1,
  };

  protected next(): void {
    this.index.update((index) => (index + 1) % PERIODS.length);
  }
}

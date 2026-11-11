import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnBadge } from '@kenny/ui/badge';
import { KnCell, KnColumn, KnSort, KnTable } from '@kenny/ui/table';

interface Payment {
  id: number;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

const CLIENTS = ['Орбита', 'Полярная звезда', 'Гринфилд', 'Фабрика идей', 'Северный мост'];
const STATUSES: Payment['status'][] = ['paid', 'paid', 'paid', 'pending', 'failed'];
const STATUS = {
  paid: { label: 'Оплачен', tone: 'success' },
  pending: { label: 'Ожидает', tone: 'warning' },
  failed: { label: 'Отклонён', tone: 'danger' },
} as const;

// Deterministic data: the same ten thousand rows on the server and in the browser
const PAYMENTS: Payment[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: 100_000 + i,
  client: CLIENTS[(i * 7) % CLIENTS.length],
  amount: 1_500 + ((i * 7919) % 480) * 250,
  status: STATUSES[(i * 13) % STATUSES.length],
}));

@Component({
  imports: [KnTable, KnCell, KnBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-table
      class="table"
      virtual
      stickyHeader
      size="sm"
      aria-label="Платежи"
      trackBy="id"
      [rowHeight]="40"
      [data]="payments"
      [columns]="columns"
      [(sort)]="sort"
    >
      <ng-template knCell="amount" let-value="value">{{ money.format(value) }}</ng-template>
      <ng-template knCell="status" let-row>
        @let state = statusOf(row);
        <kn-badge [tone]="state.tone" dot>{{ state.label }}</kn-badge>
      </ng-template>
    </kn-table>
    <p class="note">
      В таблице {{ payments.length.toLocaleString('ru') }} строк, в DOM — только те, что видны, и
      несколько соседних. Сортировка работает по всем данным.
    </p>
  `,
  styles: `
    .table {
      block-size: 20rem;
    }

    .note {
      margin: var(--kn-space-3) 0 0;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }
  `,
})
export default class TableVirtualDemo {
  protected readonly payments = PAYMENTS;
  protected readonly sort = signal<KnSort | null>(null);
  protected readonly money = new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });
  protected statusOf(payment: Payment) {
    return STATUS[payment.status];
  }

  protected readonly columns: KnColumn<Payment>[] = [
    { key: 'id', header: 'Номер', sortable: true },
    { key: 'client', header: 'Клиент', sortable: true },
    { key: 'status', header: 'Статус' },
    { key: 'amount', header: 'Сумма', sortable: true, align: 'end' },
  ];
}

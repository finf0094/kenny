import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnAvatar } from '@kenny/ui/avatar';
import { KnBadge } from '@kenny/ui/badge';
import { KnCell, KnColumn, KnSort, KnTable } from '@kenny/ui/table';

interface Invoice {
  id: string;
  client: string;
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
  due: Date;
}

const STATUS = {
  paid: { label: 'Оплачен', tone: 'success' },
  pending: { label: 'Ожидает', tone: 'warning' },
  overdue: { label: 'Просрочен', tone: 'danger' },
} as const;

@Component({
  imports: [KnTable, KnCell, KnBadge, KnAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-table
      aria-label="Счета"
      selectable
      trackBy="id"
      [data]="invoices"
      [columns]="columns"
      [(sort)]="sort"
      [(selection)]="selected"
    >
      <ng-template knCell="client" let-row>
        <span class="client"><kn-avatar size="sm" [name]="row.client" /> {{ row.client }}</span>
      </ng-template>
      <ng-template knCell="status" let-row>
        <kn-badge dot [tone]="status[row.status].tone">{{ status[row.status].label }}</kn-badge>
      </ng-template>
      <ng-template knCell="amount" let-value="value">{{ money.format(value) }}</ng-template>
      <ng-template knCell="due" let-value="value">{{ date.format(value) }}</ng-template>
    </kn-table>
    <p>{{ summary() }}</p>
  `,
  styles: `
    .client {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
    }

    p {
      margin: var(--kn-space-3) 0 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class TableBasicDemo {
  protected readonly status = STATUS as Record<
    string,
    { label: string; tone: 'success' | 'warning' | 'danger' }
  >;
  protected readonly money = new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });
  protected readonly date = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });
  protected readonly sort = signal<KnSort | null>({ key: 'due', direction: 'asc' });
  protected readonly selected = signal<readonly Invoice[]>([]);

  /** One sentence under the table: what is selected and how the rows are ordered. */
  protected readonly summary = computed(() => {
    const sort = this.sort();
    const column = this.columns.find((item) => item.key === sort?.key);
    const order = sort?.direction === 'asc' ? 'по возрастанию' : 'по убыванию';
    const sorting = column ? `, сортировка: «${column.header}» ${order}` : ', без сортировки';
    return `Выбрано строк: ${this.selected().length}${sorting}`;
  });

  protected readonly columns: KnColumn<Invoice>[] = [
    { key: 'client', header: 'Клиент', sortable: true },
    { key: 'status', header: 'Статус', sortable: true, value: (row) => STATUS[row.status].label },
    { key: 'due', header: 'Срок', sortable: true },
    { key: 'amount', header: 'Сумма', sortable: true, align: 'end' },
  ];

  protected readonly invoices: Invoice[] = [
    {
      id: 'INV-1042',
      client: 'Орбита',
      status: 'paid',
      amount: 184000,
      due: new Date(2026, 10, 3),
    },
    {
      id: 'INV-1043',
      client: 'Северный ветер',
      status: 'pending',
      amount: 42500,
      due: new Date(2026, 10, 14),
    },
    {
      id: 'INV-1044',
      client: 'Лаборатория Ч',
      status: 'overdue',
      amount: 9800,
      due: new Date(2026, 9, 28),
    },
    {
      id: 'INV-1045',
      client: 'Гринфилд',
      status: 'pending',
      amount: 310000,
      due: new Date(2026, 10, 21),
    },
    { id: 'INV-1046', client: 'Мост', status: 'paid', amount: 76300, due: new Date(2026, 10, 9) },
  ];
}

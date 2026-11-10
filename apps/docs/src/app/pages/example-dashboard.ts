import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnAvatar } from '@kenny/ui/avatar';
import { KnBadge } from '@kenny/ui/badge';
import { KnBreadcrumb, KnBreadcrumbs } from '@kenny/ui/breadcrumbs';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnEmptyState } from '@kenny/ui/empty-state';
import { KnIcon } from '@kenny/ui/icon';
import { KnInput, KnInputGroup } from '@kenny/ui/input';
import { KnMenu, KnMenuItem, KnMenuSeparator, KnMenuTrigger } from '@kenny/ui/menu';
import { KnPagination } from '@kenny/ui/pagination';
import { KnPanel } from '@kenny/ui/panel';
import { KnProgress } from '@kenny/ui/progress';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnSidebar, KnSidebarGroup, KnSidebarItem } from '@kenny/ui/sidebar';
import { KnCell, KnColumn, KnSort, KnTable } from '@kenny/ui/table';
import { KnToaster } from '@kenny/ui/toast';
import { KnTooltip } from '@kenny/ui/tooltip';

type Status = 'paid' | 'pending' | 'overdue';

interface Invoice {
  id: string;
  client: string;
  manager: string;
  status: Status;
  amount: number;
  due: Date;
}

const STATUS: Record<Status, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  paid: { label: 'Оплачен', tone: 'success' },
  pending: { label: 'Ожидает', tone: 'warning' },
  overdue: { label: 'Просрочен', tone: 'danger' },
};

const CLIENTS = [
  'Орбита',
  'Северный ветер',
  'Лаборатория Ч',
  'Гринфилд',
  'Мост',
  'Атлас',
  'Полярная звезда',
  'Квант',
  'Берег',
  'Фабрика идей',
  'Маяк',
  'Сигнал',
];
const MANAGERS = ['Анна Орлова', 'Борис Ким', 'Вера Соколова', 'Глеб Назаров'];
const STATUSES: Status[] = ['paid', 'pending', 'paid', 'overdue', 'paid', 'pending'];

/** Deterministic sample data: the same on the server and in the browser. */
function makeInvoices(): Invoice[] {
  return Array.from({ length: 23 }, (_, i) => ({
    id: `INV-${1042 + i}`,
    client: CLIENTS[i % CLIENTS.length],
    manager: MANAGERS[(i * 3) % MANAGERS.length],
    status: STATUSES[(i * 5) % STATUSES.length],
    amount: 9800 + ((i * 37_300) % 310_000),
    due: new Date(2026, 9 + (i % 3), 3 + ((i * 7) % 25)),
  }));
}

const WEEKS = [
  { label: '29 сен', value: 412 },
  { label: '6 окт', value: 530 },
  { label: '13 окт', value: 478 },
  { label: '20 окт', value: 644 },
  { label: '27 окт', value: 590 },
  { label: '3 ноя', value: 720 },
  { label: '10 ноя', value: 381 },
];

const PAGE_SIZE = 6;

@Component({
  imports: [
    RouterLink,
    KnSidebar,
    KnSidebarGroup,
    KnSidebarItem,
    KnIcon,
    KnButton,
    KnBreadcrumbs,
    KnBreadcrumb,
    KnCard,
    KnBadge,
    KnPanel,
    KnProgress,
    KnTable,
    KnCell,
    KnPagination,
    KnInput,
    KnInputGroup,
    KnSelect,
    KnOption,
    KnAvatar,
    KnMenu,
    KnMenuItem,
    KnMenuSeparator,
    KnMenuTrigger,
    KnTooltip,
    KnEmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app">
      <kn-sidebar class="side" aria-label="Разделы кабинета" [(collapsed)]="collapsed">
        <button
          knSidebarHeader
          kn-icon-button
          variant="ghost"
          tone="neutral"
          [attr.aria-label]="collapsed() ? 'Развернуть меню' : 'Свернуть меню'"
          [attr.aria-expanded]="!collapsed()"
          (click)="collapsed.set(!collapsed())"
        >
          <kn-icon name="panel-left" />
        </button>
        <kn-sidebar-group label="Финансы">
          <button kn-sidebar-item type="button" active>
            <kn-icon knSidebarIcon name="chart" /> Обзор
          </button>
          <button kn-sidebar-item type="button">
            <kn-icon knSidebarIcon name="file" /> Счета
            <kn-badge knSidebarEnd tone="accent">{{ invoices().length }}</kn-badge>
          </button>
          <button kn-sidebar-item type="button">
            <kn-icon knSidebarIcon name="user" /> Клиенты
          </button>
        </kn-sidebar-group>
        <kn-sidebar-group label="Система">
          <a kn-sidebar-item routerLink="/examples/settings"
            ><kn-icon knSidebarIcon name="sliders" /> Настройки</a
          >
          <a kn-sidebar-item routerLink="/examples"
            ><kn-icon knSidebarIcon name="arrow-left" /> Все примеры</a
          >
        </kn-sidebar-group>
      </kn-sidebar>

      <main id="content" class="main">
        <header class="head">
          <div>
            <kn-breadcrumbs>
              <kn-breadcrumb><a routerLink="/examples">Примеры</a></kn-breadcrumb>
              <kn-breadcrumb current>Дашборд</kn-breadcrumb>
            </kn-breadcrumbs>
            <h1>Обзор за ноябрь</h1>
          </div>
          <div class="head-actions">
            <kn-select class="period" size="sm" aria-label="Период" [(value)]="period">
              <kn-option value="month">Этот месяц</kn-option>
              <kn-option value="quarter">Квартал</kn-option>
              <kn-option value="year">Год</kn-option>
            </kn-select>
            <button kn-button size="sm" variant="glass" tone="neutral" (click)="exportReport()">
              <kn-icon name="download" /> Экспорт
            </button>
          </div>
        </header>

        <section class="metrics" aria-label="Ключевые показатели">
          @for (metric of metrics(); track metric.label) {
            <kn-card>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value">{{ metric.value }}</div>
              <kn-badge [tone]="metric.tone">{{ metric.delta }}</kn-badge>
            </kn-card>
          }
        </section>

        <div class="panels">
          <kn-panel heading="Выручка по неделям" description="Тысячи рублей" [headingLevel]="2">
            <div class="chart" role="img" [attr.aria-label]="chartLabel">
              @for (week of weeks; track week.label) {
                <div class="bar-col">
                  <span class="bar-value">{{ week.value }}</span>
                  <div class="bar" [style.--_h]="week.value / maxWeek"></div>
                  <span class="bar-label">{{ week.label }}</span>
                </div>
              }
            </div>
          </kn-panel>

          <kn-panel heading="Цели квартала" [headingLevel]="2" [expanded]="true">
            <button
              knPanelActions
              kn-icon-button
              size="sm"
              variant="ghost"
              tone="neutral"
              aria-label="Обновить цели"
              knTooltip="Обновить"
              (click)="refreshGoals()"
            >
              <kn-icon name="refresh" />
            </button>
            <div class="goals">
              @for (goal of goals(); track goal.label) {
                <div class="goal">
                  <div class="goal-head">
                    <span>{{ goal.label }}</span
                    ><span>{{ goal.value }}%</span>
                  </div>
                  <kn-progress
                    [aria-label]="goal.label"
                    [value]="goal.value"
                    [tone]="goal.value >= 100 ? 'success' : goal.value < 40 ? 'warning' : 'accent'"
                  />
                </div>
              }
            </div>
          </kn-panel>
        </div>

        <kn-panel
          heading="Счета"
          [headingLevel]="2"
          [description]="filtered().length + ' из ' + invoices().length"
        >
          <div class="filters">
            <kn-input-group size="sm" class="search">
              <kn-icon knPrefix name="search" [size]="16" />
              <input
                knInput
                knSize="sm"
                type="search"
                aria-label="Поиск по клиенту или номеру"
                placeholder="Клиент или номер"
                [value]="query()"
                (input)="setQuery($any($event.target).value)"
              />
            </kn-input-group>
            <kn-select
              class="status"
              size="sm"
              aria-label="Статус"
              [value]="status()"
              (valueChange)="setStatus($event)"
            >
              <kn-option value="all">Все статусы</kn-option>
              <kn-option value="paid">Оплачен</kn-option>
              <kn-option value="pending">Ожидает</kn-option>
              <kn-option value="overdue">Просрочен</kn-option>
            </kn-select>
            <span class="grow"></span>
            @if (selected().length) {
              <span class="selected-note">Выбрано: {{ selected().length }}</span>
              <button kn-button size="sm" variant="soft" (click)="markPaid(selected())">
                Отметить оплаченными
              </button>
            }
          </div>

          <kn-table
            class="table"
            aria-label="Счета"
            selectable
            trackBy="id"
            size="sm"
            [data]="pageRows()"
            [columns]="columns"
            sortMode="manual"
            [(sort)]="sort"
            [(selection)]="selected"
          >
            <ng-template knCell="client" let-row>
              <span class="client"
                ><kn-avatar size="sm" [name]="row.client" /> {{ row.client }}</span
              >
            </ng-template>
            <ng-template knCell="status" let-row>
              <kn-badge dot [tone]="statusOf(row).tone">{{ statusOf(row).label }}</kn-badge>
            </ng-template>
            <ng-template knCell="amount" let-value="value">{{ money.format(value) }}</ng-template>
            <ng-template knCell="due" let-value="value">{{ date.format(value) }}</ng-template>
            <ng-template knCell="actions" let-row>
              <button
                kn-icon-button
                size="sm"
                variant="ghost"
                tone="neutral"
                [attr.aria-label]="'Действия со счётом ' + row.id"
                [knMenuTrigger]="rowMenu"
                [knMenuData]="{ $implicit: row }"
              >
                <kn-icon name="more" />
              </button>
            </ng-template>
            <kn-empty-state
              knTableEmpty
              icon="filter"
              heading="Счета не найдены"
              description="Измените запрос или сбросьте фильтр по статусу."
            >
              <button kn-button size="sm" variant="soft" (click)="resetFilters()">
                Сбросить фильтры
              </button>
            </kn-empty-state>
          </kn-table>

          <div class="table-foot">
            <span>Страница {{ page() }} из {{ pageCount() }}</span>
            <kn-pagination
              size="sm"
              [total]="filtered().length"
              [pageSize]="pageSize"
              [(page)]="page"
            />
          </div>
        </kn-panel>
      </main>
    </div>

    <ng-template #rowMenu let-row>
      <kn-menu>
        <button kn-menu-item (triggered)="markPaid([row])">
          <kn-icon name="check" [size]="16" /> Отметить оплаченным
        </button>
        <button kn-menu-item (triggered)="remind(row)">
          <kn-icon name="mail" [size]="16" /> Напомнить клиенту
        </button>
        <kn-menu-separator />
        <button kn-menu-item tone="danger" (triggered)="remove(row)">
          <kn-icon name="trash" [size]="16" /> Удалить
        </button>
      </kn-menu>
    </ng-template>
  `,
  styles: `
    .app {
      display: flex;
      align-items: flex-start;
      gap: var(--kn-space-4);
      max-inline-size: 87rem;
      margin-inline: auto;
      padding: 0 var(--kn-space-6) var(--kn-space-8);
    }

    .side {
      position: sticky;
      inset-block-start: 5.5rem;
      flex: none;
      --kn-sidebar-width: 14rem;
      block-size: calc(100dvh - 7rem);
    }

    .main {
      display: grid;
      gap: var(--kn-space-4);
      flex: 1;
      min-inline-size: 0;
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--kn-space-4);
      padding: var(--kn-space-2) var(--kn-space-2) 0;
    }

    h1 {
      margin: var(--kn-space-2) 0 0;
      font-size: var(--kn-text-3xl);
      font-weight: 650;
      letter-spacing: var(--kn-tracking-tight);
      line-height: var(--kn-leading-tight);
    }

    .head-actions {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
    }

    .period {
      inline-size: 10.5rem;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: var(--kn-space-4);
    }

    .metric-label {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .metric-value {
      font-size: var(--kn-text-3xl);
      font-weight: 650;
      letter-spacing: var(--kn-tracking-tight);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .metrics kn-badge {
      justify-self: start;
      align-self: flex-start;
    }

    .panels {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      align-items: start;
      gap: var(--kn-space-4);
    }

    .chart {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      align-items: end;
      gap: var(--kn-space-3);
      block-size: 11rem;
      padding-block-start: var(--kn-space-2);
    }

    .bar-col {
      display: grid;
      grid-template-rows: auto 1fr auto;
      justify-items: center;
      gap: var(--kn-space-1);
      block-size: 100%;
      font-size: var(--kn-text-xs);
      color: var(--kn-color-text-muted);
      font-variant-numeric: tabular-nums;
    }

    .bar {
      align-self: end;
      inline-size: min(100%, 2.5rem);
      block-size: 100%;
      border-radius: var(--kn-radius-xs) var(--kn-radius-xs) 2px 2px;
      background: var(--kn-color-accent);
      box-shadow: inset 0 1px 0 0 rgb(255 255 255 / 0.25);
      transform: scaleY(var(--_h));
      transform-origin: 50% 100%;
      animation: bar-grow var(--kn-duration-slower) var(--kn-ease-spring) backwards;
    }

    .bar-col:last-child .bar {
      background: var(--kn-color-accent-soft-hover);
    }

    @keyframes bar-grow {
      from {
        transform: scaleY(0);
      }
    }

    .goals {
      display: grid;
      gap: var(--kn-space-4);
    }

    .goal {
      display: grid;
      gap: var(--kn-space-2);
    }

    .goal-head {
      display: flex;
      justify-content: space-between;
      font-size: var(--kn-text-sm);
      font-variant-numeric: tabular-nums;
    }

    .goal-head span:last-child {
      color: var(--kn-color-text-muted);
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-2);
      margin-block-end: var(--kn-space-3);
    }

    .search {
      inline-size: 15rem;
    }

    .status {
      inline-size: 10rem;
    }

    .grow {
      flex: 1;
    }

    .selected-note {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .table {
      --kn-table-bg: transparent;
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      backdrop-filter: none;
    }

    .client {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
    }

    .table-foot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-3);
      margin-block-start: var(--kn-space-3);
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    @media (max-width: 64rem) {
      .side {
        display: none;
      }

      .panels {
        grid-template-columns: minmax(0, 1fr);
      }

      .app {
        padding-inline: var(--kn-space-3);
      }
    }
  `,
})
export default class DashboardExample {
  private readonly toaster = inject(KnToaster);

  protected readonly money = new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });
  protected readonly date = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });
  protected readonly weeks = WEEKS;
  protected readonly maxWeek = Math.max(...WEEKS.map((w) => w.value));
  protected readonly chartLabel = `Выручка по неделям, тысячи рублей: ${WEEKS.map((w) => `${w.label} — ${w.value}`).join(', ')}`;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly collapsed = signal(false);
  protected readonly period = signal<string | null>('month');
  protected readonly invoices = signal(makeInvoices());
  protected readonly query = signal('');
  protected readonly status = signal<string | null>('all');
  protected readonly sort = signal<KnSort | null>({ key: 'due', direction: 'asc' });
  protected readonly page = signal(1);
  protected readonly selected = signal<readonly Invoice[]>([]);
  protected readonly goals = signal([
    { label: 'Выручка', value: 78 },
    { label: 'Новые клиенты', value: 100 },
    { label: 'Оплата в срок', value: 34 },
  ]);

  protected readonly columns: KnColumn<Invoice>[] = [
    { key: 'id', header: 'Номер', sortable: true },
    { key: 'client', header: 'Клиент', sortable: true },
    { key: 'status', header: 'Статус', sortable: true },
    { key: 'due', header: 'Срок', sortable: true },
    { key: 'amount', header: 'Сумма', sortable: true, align: 'end' },
    { key: 'actions', header: 'Действия', headerHidden: true, width: '3rem' },
  ];

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    return this.invoices().filter(
      (invoice) =>
        (status === 'all' || invoice.status === status) &&
        (!query ||
          invoice.client.toLowerCase().includes(query) ||
          invoice.id.toLowerCase().includes(query)),
    );
  });

  /** Sorting is done here (sortMode="manual") because it has to span all pages, not just the visible one. */
  private readonly sorted = computed(() => {
    const sort = this.sort();
    const rows = [...this.filtered()];
    if (!sort) return rows;
    const factor = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key as keyof Invoice;
    return rows.sort((a, b) => {
      const x = key === 'status' ? STATUS[a.status].label : a[key];
      const y = key === 'status' ? STATUS[b.status].label : b[key];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor;
      if (x instanceof Date && y instanceof Date) return (x.getTime() - y.getTime()) * factor;
      return String(x).localeCompare(String(y), 'ru', { numeric: true }) * factor;
    });
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)),
  );
  protected readonly pageRows = computed(() => {
    const page = Math.min(this.page(), this.pageCount());
    return this.sorted().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  });

  protected readonly metrics = computed(() => {
    const invoices = this.invoices();
    const sum = (status: Status) =>
      invoices.filter((i) => i.status === status).reduce((total, i) => total + i.amount, 0);
    const compact = new Intl.NumberFormat('ru', { notation: 'compact', maximumFractionDigits: 1 });
    return [
      {
        label: 'Оплачено',
        value: `${compact.format(sum('paid'))} ₽`,
        delta: '+12% к октябрю',
        tone: 'success' as const,
      },
      {
        label: 'Ожидает оплаты',
        value: `${compact.format(sum('pending'))} ₽`,
        delta: `${invoices.filter((i) => i.status === 'pending').length} счетов`,
        tone: 'warning' as const,
      },
      {
        label: 'Просрочено',
        value: `${compact.format(sum('overdue'))} ₽`,
        delta: `${invoices.filter((i) => i.status === 'overdue').length} счёта`,
        tone: 'danger' as const,
      },
      {
        label: 'Всего счетов',
        value: String(invoices.length),
        delta: 'за период',
        tone: 'neutral' as const,
      },
    ];
  });

  protected statusOf(invoice: Invoice) {
    return STATUS[invoice.status];
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.page.set(1);
  }

  protected setStatus(status: string | null): void {
    this.status.set(status);
    this.page.set(1);
  }

  protected resetFilters(): void {
    this.query.set('');
    this.status.set('all');
    this.page.set(1);
  }

  protected markPaid(rows: readonly Invoice[]): void {
    const ids = new Set(rows.map((row) => row.id));
    const before = this.invoices();
    this.invoices.update((all) =>
      all.map((i) => (ids.has(i.id) ? { ...i, status: 'paid' as const } : i)),
    );
    this.selected.set([]);
    this.toaster.show({
      tone: 'success',
      title:
        rows.length === 1
          ? `Счёт ${rows[0].id} отмечен оплаченным`
          : `Отмечено оплаченными: ${rows.length}`,
      action: { label: 'Отменить', run: () => this.invoices.set(before) },
    });
  }

  protected remind(invoice: Invoice): void {
    this.toaster.show({ title: `Напоминание отправлено: ${invoice.client}` });
  }

  protected remove(invoice: Invoice): void {
    const before = this.invoices();
    this.invoices.update((all) => all.filter((i) => i.id !== invoice.id));
    this.selected.update((rows) => rows.filter((row) => row.id !== invoice.id));
    this.toaster.show({
      title: `Счёт ${invoice.id} удалён`,
      action: { label: 'Отменить', run: () => this.invoices.set(before) },
    });
  }

  protected exportReport(): void {
    this.toaster.success('Отчёт сформирован', 'Файл report-2026-11.xlsx появится в загрузках.');
  }

  protected refreshGoals(): void {
    this.goals.update((goals) =>
      goals.map((goal) => ({ ...goal, value: Math.min(100, goal.value + 6) })),
    );
  }
}

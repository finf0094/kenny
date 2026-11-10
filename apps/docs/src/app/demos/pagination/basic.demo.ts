import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnPagination } from '@kenny/ui/pagination';

@Component({
  imports: [KnPagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-pagination [total]="total" [pageSize]="pageSize" [(page)]="page" />
    <p>Записи {{ range() }} из {{ total }}</p>
    <kn-pagination size="sm" aria-label="Страницы, компактно" [total]="48" [pageSize]="12" [page]="2" />
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
    }

    p {
      margin: 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export default class PaginationBasicDemo {
  protected readonly total = 247;
  protected readonly pageSize = 10;
  protected readonly page = signal(7);
  protected readonly range = computed(() => {
    const from = (this.page() - 1) * this.pageSize + 1;
    return `${from}–${Math.min(from + this.pageSize - 1, this.total)}`;
  });
}

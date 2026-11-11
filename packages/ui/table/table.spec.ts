import { Component, signal } from '@angular/core';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnCell, KnColumn, KnSort, KnTable } from './table';

interface Row {
  id: number;
  name: string;
  amount: number;
}

@Component({
  imports: [KnTable, KnCell],
  template: `
    <kn-table
      aria-label="Счета"
      selectable
      trackBy="id"
      [data]="data()"
      [columns]="columns"
      [(sort)]="sort"
      [(selection)]="selection"
    >
      <ng-template knCell="amount" let-row>{{ row.amount }} ₽</ng-template>
    </kn-table>
  `,
})
class Host {
  readonly data = signal<Row[]>([
    { id: 1, name: 'Бета', amount: 300 },
    { id: 2, name: 'Альфа', amount: 1200 },
    { id: 3, name: 'Гамма', amount: 90 },
  ]);
  readonly columns: KnColumn<Row>[] = [
    { key: 'name', header: 'Клиент', sortable: true },
    { key: 'amount', header: 'Сумма', sortable: true, align: 'end' },
  ];
  readonly sort = signal<KnSort | null>(null);
  readonly selection = signal<readonly Row[]>([]);
}

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[1].textContent?.trim());

describe('KnTable', () => {
  it('renders a labelled native table with headers and custom cells', async () => {
    await render(Host);
    expect(screen.getByRole('table', { name: 'Счета' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(names()).toEqual(['Бета', 'Альфа', 'Гамма']);
    expect(screen.getByText('1200 ₽')).toBeInTheDocument();
  });

  it('cycles sorting asc → desc → none and reports it with aria-sort', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    const header = screen.getByRole('columnheader', { name: /Клиент/ });
    const button = within(header).getByRole('button');

    await user.click(button);
    await stable();
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['Альфа', 'Бета', 'Гамма']);

    await user.click(button);
    await stable();
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(names()).toEqual(['Гамма', 'Бета', 'Альфа']);

    await user.click(button);
    await stable();
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(fixture.componentInstance.sort()).toBeNull();
  });

  it('sorts numbers numerically', async () => {
    await render(Host);
    await userEvent.click(
      within(screen.getByRole('columnheader', { name: /Сумма/ })).getByRole('button'),
    );
    await stable();
    expect(names()).toEqual(['Гамма', 'Бета', 'Альфа']);
  });

  it('selects rows and reflects partial selection in the header checkbox', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
    await stable();
    expect(fixture.componentInstance.selection().map((r) => r.id)).toEqual([2]);
    const all = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all rows' });
    expect(all.indeterminate).toBe(true);

    await user.click(all);
    await stable();
    expect(fixture.componentInstance.selection()).toHaveLength(3);
    await user.click(all);
    await stable();
    expect(fixture.componentInstance.selection()).toHaveLength(0);
  });

  it('shows the empty text when there is no data', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.data.set([]);
    await stable();
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeDisabled();
  });

  it('keeps a visually hidden header in the accessibility tree', async () => {
    const { container } = await render(
      `<kn-table aria-label="Счета" [data]="data" [columns]="columns" />`,
      {
        imports: [KnTable],
        componentProperties: {
          data: [{ id: 1, name: 'Бета' }],
          columns: [
            { key: 'name', header: 'Клиент' },
            { key: 'actions', header: 'Действия', headerHidden: true },
          ],
        },
      },
    );
    const header = screen.getByRole('columnheader', { name: 'Действия' });
    expect(within(header).getByText('Действия')).toHaveClass('sr-only');
    await expectNoA11yViolations(container);
  });

  it('labels the inner table, not the wrapper element', async () => {
    const { container } = await render(Host);
    await stable();
    expect(container.querySelector('kn-table')).not.toHaveAttribute('aria-label');
    expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Счета');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(Host);
    await expectNoA11yViolations(container);
  });

  describe('virtual rows', () => {
    const data = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));
    const columns = [
      { key: 'id', header: 'No', sortable: true },
      { key: 'name', header: 'Name' },
    ];
    const frame = (): Promise<void> => new Promise((done) => setTimeout(done, 50));

    async function setupVirtual() {
      const view = await render(
        `<kn-table virtual stickyHeader aria-label="Rows" trackBy="id" style="block-size: 400px"
                   [rowHeight]="40" [data]="data" [columns]="columns" />`,
        { imports: [KnTable], componentProperties: { data, columns } },
      );
      const host = view.container.querySelector<HTMLElement>('kn-table')!;
      // jsdom has no layout: give the scroll container a height to measure
      Object.defineProperty(host, 'clientHeight', { configurable: true, value: 400 });
      host.dispatchEvent(new Event('scroll'));
      await frame();
      await view.fixture.whenStable();
      return { ...view, host };
    }
    const rendered = (host: HTMLElement): HTMLElement[] =>
      Array.from(host.querySelectorAll<HTMLElement>('tbody tr:not(.spacer)'));

    it('renders a window of rows and reserves the height of the rest', async () => {
      const { host } = await setupVirtual();
      // 400 / 40 visible + 6 beyond the lower edge
      expect(rendered(host)).toHaveLength(16);
      expect(host.querySelector('tbody tr.spacer')).toHaveStyle({
        blockSize: `${(5000 - 16) * 40}px`,
      });
      expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '5001');
      expect(rendered(host)[0]).toHaveAttribute('aria-rowindex', '2');
    });

    it('moves the window with the scroll position', async () => {
      const { host, fixture } = await setupVirtual();
      host.scrollTop = 40 * 1000;
      host.dispatchEvent(new Event('scroll'));
      await frame();
      await fixture.whenStable();
      const rows = rendered(host);
      expect(rows).toHaveLength(22);
      expect(rows[0]).toHaveTextContent('Row 995');
      expect(rows[0]).toHaveAttribute('aria-rowindex', '996');
      const [before, after] = Array.from(host.querySelectorAll<HTMLElement>('tbody tr.spacer'));
      expect(before).toHaveStyle({ blockSize: `${994 * 40}px` });
      expect(after).toHaveStyle({ blockSize: `${(5000 - 1016) * 40}px` });
    });

    it('keeps sorting over the whole data set', async () => {
      const { host, fixture } = await setupVirtual();
      await userEvent.click(screen.getByRole('button', { name: /No/ }));
      await userEvent.click(screen.getByRole('button', { name: /No/ }));
      await fixture.whenStable();
      expect(rendered(host)[0]).toHaveTextContent('Row 5000');
    });
  });
});

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
});

import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnPagination, paginationRange } from './pagination';

@Component({
  imports: [KnPagination],
  template: `<kn-pagination [total]="200" [pageSize]="10" [(page)]="page" />`,
})
class Host {
  readonly page = signal(1);
}

describe('paginationRange', () => {
  it('collapses long ranges with ellipses around the current page', () => {
    expect(paginationRange(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(1, 20, 1)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(paginationRange(10, 20, 1)).toEqual([1, '…', 9, 10, 11, '…', 20]);
    expect(paginationRange(20, 20, 1)).toEqual([1, '…', 16, 17, 18, 19, 20]);
  });
});

describe('KnPagination', () => {
  it('marks the current page and disables "previous" on the first page', async () => {
    await render(Host);
    expect(screen.getByRole('navigation', { name: 'Страницы' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Страница 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Предыдущая страница' })).toBeDisabled();
  });

  it('navigates by page buttons and next/previous', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Страница 4' }));
    await stable();
    expect(fixture.componentInstance.page()).toBe(4);
    await user.click(screen.getByRole('button', { name: 'Следующая страница' }));
    await stable();
    expect(screen.getByRole('button', { name: 'Страница 5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(screen.getByRole('button', { name: 'Страница 20' }));
    await stable();
    expect(screen.getByRole('button', { name: 'Следующая страница' })).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(Host);
    await expectNoA11yViolations(container);
  });
});

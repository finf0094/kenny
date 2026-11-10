import { LOCALE_ID } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnCalendar } from './calendar';
import { KnDatePicker } from './date-picker';
import { addMonths, parseDate } from './date-utils';

const providers = [{ provide: LOCALE_ID, useValue: 'ru' }];

describe('date utils', () => {
  it('parses dates in the locale order and rejects impossible ones', () => {
    expect(parseDate('05.03.2026', 'ru')).toEqual(new Date(2026, 2, 5));
    expect(parseDate('3/5/2026', 'en-US')).toEqual(new Date(2026, 2, 5));
    expect(parseDate('31.02.2026', 'ru')).toBeNull();
    expect(parseDate('завтра', 'ru')).toBeNull();
  });

  it('clamps the day when adding months', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
  });
});

describe('KnCalendar', () => {
  async function setup() {
    const onPick = vi.fn();
    await render(`<kn-calendar [value]="value" (pick)="onPick($event)" />`, {
      imports: [KnCalendar],
      providers,
      componentProperties: { value: new Date(2026, 2, 15), onPick },
    });
    return { onPick, user: userEvent.setup() };
  }

  it('renders the month of the value with one tabbable, selected day', async () => {
    await setup();
    expect(screen.getByRole('grid', { name: /март 2026/i })).toBeInTheDocument();
    const selected = screen.getByRole('gridcell', { selected: true });
    expect(within(selected).getByRole('button')).toHaveAttribute('tabindex', '0');
    expect(
      screen.getAllByRole('button').filter((b) => b.tabIndex === 0 && b.dataset['date']),
    ).toHaveLength(1);
  });

  it('moves focus by day, week and month from the keyboard', async () => {
    const { user } = await setup();
    within(screen.getByRole('gridcell', { selected: true }))
      .getByRole('button')
      .focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-date', '2026-03-16'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-date', '2026-03-23'));
    await user.keyboard('{Home}');
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-date', '2026-03-23'));
    await user.keyboard('{End}');
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-date', '2026-03-29'));
    await user.keyboard('{PageDown}');
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-date', '2026-04-29'));
    expect(screen.getByRole('grid', { name: /апрель 2026/i })).toBeInTheDocument();
  });

  it('emits the picked date', async () => {
    const { onPick, user } = await setup();
    await user.click(screen.getByRole('button', { name: /20 марта 2026/ }));
    expect(onPick).toHaveBeenCalledWith(new Date(2026, 2, 20));
  });
});

describe('KnDatePicker', () => {
  async function setup(initial: Date | null = new Date(2026, 2, 15)) {
    const control = new FormControl<Date | null>(initial);
    const min = new Date(2026, 2, 10);
    const view = await render(
      `<kn-field label="Дата"><kn-date-picker [formControl]="control" [min]="min" /></kn-field>`,
      {
        imports: [KnDatePicker, KnField, ReactiveFormsModule],
        providers,
        componentProperties: { control, min },
      },
    );
    await stable();
    return {
      control,
      user: userEvent.setup(),
      input: screen.getByLabelText<HTMLInputElement>('Дата'),
      ...view,
    };
  }

  it('formats the value for the locale', async () => {
    const { input } = await setup();
    expect(input).toHaveValue('15.03.2026');
  });

  it('accepts typed dates and rolls back invalid or out-of-range text', async () => {
    const { control, user, input } = await setup();
    await user.clear(input);
    await user.type(input, '21.03.2026{Enter}');
    expect(control.value).toEqual(new Date(2026, 2, 21));

    await user.clear(input);
    await user.type(input, '01.03.2026');
    await user.tab();
    await stable();
    expect(control.value).toEqual(new Date(2026, 2, 21));
    expect(input).toHaveValue('21.03.2026');
  });

  it('opens a dialog, focuses the selected day and picks a date', async () => {
    const { control, user } = await setup();
    const toggle = screen.getByRole('button', { name: /Изменить дату/ });
    await user.click(toggle);
    const dialog = await screen.findByRole('dialog', { name: 'Выбор даты' });
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-date', '2026-03-15'));
    await user.click(within(dialog).getByRole('button', { name: /18 марта 2026/ }));
    expect(control.value).toEqual(new Date(2026, 2, 18));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(toggle).toHaveFocus();
  });

  it('does not pick dates before min and closes on Escape', async () => {
    const { control, user } = await setup();
    await user.click(screen.getByRole('button', { name: /Изменить дату/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /, 5 марта 2026/ }));
    expect(control.value).toEqual(new Date(2026, 2, 15));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('has no accessibility violations, closed and open', async () => {
    const { user } = await setup();
    await expectNoA11yViolations(document.body);
    await user.click(screen.getByRole('button', { name: /Изменить дату/ }));
    await screen.findByRole('dialog');
    await expectNoA11yViolations(document.body);
  });
});

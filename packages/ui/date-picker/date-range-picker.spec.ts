import { Component, LOCALE_ID, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnDateRange, KnDateRangePicker, KnDateRangePreset } from './date-range-picker';

const providers = [{ provide: LOCALE_ID, useValue: 'en-GB' }];
const day = (date: number): Date => new Date(2026, 9, date);

@Component({
  imports: [KnDateRangePicker],
  template: `<kn-date-range-picker
    aria-label="Period"
    clearable
    [presets]="presets"
    [min]="min"
    [(value)]="range"
  />`,
})
class Host {
  readonly range = signal<KnDateRange | null>({ start: day(5), end: day(9) });
  readonly min = day(3);
  readonly presets: KnDateRangePreset[] = [
    { label: 'First week', range: { start: day(5), end: day(11) } },
  ];
}

async function setup() {
  const { fixture } = await render(Host, { providers });
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: /^Period/ });
  return { host: fixture.componentInstance, user, trigger };
}

const cell = (dialog: HTMLElement, date: number): HTMLElement =>
  within(dialog).getByRole('button', { name: new RegExp(`\\b${date} October 2026`) });

describe('KnDateRangePicker', () => {
  it('shows the period in the field and marks it in the calendar', async () => {
    const { user, trigger } = await setup();
    expect(trigger).toHaveTextContent('05/10/2026 – 09/10/2026');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Choose a period' });
    expect(cell(dialog, 5)).toHaveFocus();
    expect(cell(dialog, 5).closest('td')).toHaveAttribute('data-edge', 'start');
    expect(cell(dialog, 7).closest('td')).toHaveAttribute('data-in-range');
    expect(cell(dialog, 9).closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(cell(dialog, 10).closest('td')).not.toHaveAttribute('data-in-range');
  });

  it('takes two clicks in any order and publishes only a complete period', async () => {
    const { host, user, trigger } = await setup();
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await user.click(cell(dialog, 20));
    expect(host.range()).toEqual({ start: day(5), end: day(9) });
    expect(within(dialog).getByRole('status')).toHaveTextContent('Choose the last day');
    // The range follows the pointer before the second click
    await user.hover(cell(dialog, 16));
    expect(cell(dialog, 18).closest('td')).toHaveAttribute('data-in-range');
    await user.click(cell(dialog, 14));
    expect(host.range()).toEqual({ start: day(14), end: day(20) });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('picks with the keyboard and drops an unfinished choice on Escape', async () => {
    const { host, user } = await setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('dialog');
    await user.keyboard('{ArrowRight}{Enter}');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(host.range()).toEqual({ start: day(5), end: day(9) });
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('dialog');
    await user.keyboard('{Enter}{ArrowDown}{Enter}');
    expect(host.range()).toEqual({ start: day(5), end: day(12) });
  });

  it('applies a preset, shows it as pressed, and clears', async () => {
    const { host, user, trigger } = await setup();
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    const preset = within(dialog).getByRole('button', { name: 'First week' });
    expect(preset).toHaveAttribute('aria-pressed', 'false');
    await user.click(preset);
    expect(host.range()).toEqual({ start: day(5), end: day(11) });
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(host.range()).toBeNull();
    expect(trigger).toHaveTextContent('Start – end');
  });

  it('does not let a disabled day be an end of the period', async () => {
    const { host, user, trigger } = await setup();
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await user.click(cell(dialog, 2));
    await user.click(cell(dialog, 1));
    expect(host.range()).toEqual({ start: day(5), end: day(9) });
  });

  it('works with reactive forms and inside a field', async () => {
    const control = new FormControl<KnDateRange | null>(null);
    const { container } = await render(
      `<kn-field label="Vacation"><kn-date-range-picker [formControl]="control" /></kn-field>`,
      {
        imports: [KnDateRangePicker, KnField, ReactiveFormsModule],
        componentProperties: { control },
        providers,
      },
    );
    const trigger = screen.getByRole('button', { name: 'Vacation Start – end' });
    await expectNoA11yViolations(container);
    control.setValue({ start: day(1), end: day(2) });
    await waitFor(() => expect(trigger).toHaveTextContent('01/10/2026 – 02/10/2026'));
    control.disable();
    await waitFor(() => expect(trigger).toBeDisabled());
  });
});

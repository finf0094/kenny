import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnTimePicker } from './time-picker';

@Component({
  imports: [KnTimePicker],
  template: `<kn-time-picker
    aria-label="Start"
    locale="en-GB"
    [step]="step()"
    [hourCycle]="cycle()"
    [(value)]="time"
  />`,
})
class Host {
  readonly time = signal<string | null>(null);
  readonly step = signal(1);
  readonly cycle = signal<12 | 24 | undefined>(undefined);
}

async function setup(initial: string | null = null) {
  const { fixture } = await render(Host);
  const host = fixture.componentInstance;
  host.time.set(initial);
  await fixture.whenStable();
  const user = userEvent.setup();
  const hours = screen.getByRole('spinbutton', { name: 'Hours' });
  const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });
  return { host, fixture, user, hours, minutes };
}

describe('KnTimePicker', () => {
  it('is a labelled group of spinbuttons that mirror the value', async () => {
    const { hours, minutes } = await setup('08:05');
    expect(screen.getByRole('group', { name: 'Start' })).toBeInTheDocument();
    expect(hours).toHaveValue('08');
    expect(hours).toHaveAttribute('aria-valuenow', '8');
    expect(hours).toHaveAttribute('aria-valuemax', '23');
    expect(minutes).toHaveValue('05');
  });

  it('types digits, moving on when a segment is complete', async () => {
    const { host, user, hours, minutes } = await setup();
    await user.click(hours);
    await user.keyboard('1');
    // Nothing is published until both parts are known
    expect(host.time()).toBeNull();
    await user.keyboard('4');
    expect(minutes).toHaveFocus();
    await user.keyboard('30');
    expect(host.time()).toBe('14:30');
  });

  it('jumps to the minutes after a digit that cannot start a longer hour', async () => {
    const { host, user, hours, minutes } = await setup();
    await user.click(hours);
    await user.keyboard('7');
    expect(minutes).toHaveFocus();
    await user.keyboard('5');
    expect(host.time()).toBe('07:05');
  });

  it('spins with the arrows, wrapping around and following the step', async () => {
    const { host, user, hours } = await setup('23:50');
    host.step.set(15);
    await user.click(hours);
    await user.keyboard('{ArrowUp}');
    expect(host.time()).toBe('00:50');
    await user.keyboard('{ArrowRight}{ArrowUp}');
    expect(host.time()).toBe('00:00');
    await user.keyboard('{ArrowDown}');
    expect(host.time()).toBe('00:45');
    await user.keyboard('{Home}');
    expect(host.time()).toBe('00:00');
  });

  it('clears a segment with Backspace, which makes the value incomplete', async () => {
    const { host, user, minutes } = await setup('09:15');
    await user.click(minutes);
    await user.keyboard('{Backspace}');
    expect(host.time()).toBeNull();
    expect(minutes).toHaveValue('');
    await user.keyboard('4');
    expect(host.time()).toBe('09:04');
  });

  it('shows twelve hours with a day period and keeps the value in 24 hours', async () => {
    const { host, fixture, user, hours } = await setup('15:20');
    host.cycle.set(12);
    await fixture.whenStable();
    expect(hours).toHaveValue('03');
    expect(hours).toHaveAttribute('aria-valuemax', '12');
    const period = screen.getByRole('spinbutton', { name: 'AM or PM' });
    expect(period).toHaveAttribute('aria-valuetext', expect.stringMatching(/pm/i));
    await user.click(period);
    await user.keyboard('{ArrowUp}');
    expect(host.time()).toBe('03:20');
    await user.keyboard('p');
    expect(host.time()).toBe('15:20');
    await user.click(hours);
    await user.keyboard('12');
    expect(host.time()).toBe('12:20');
  });

  it('works with reactive forms', async () => {
    const control = new FormControl<string | null>('10:00');
    const { fixture } = await render(
      `<kn-time-picker aria-label="Start" locale="en-GB" [formControl]="control" />`,
      { imports: [KnTimePicker, ReactiveFormsModule], componentProperties: { control } },
    );
    const hours = screen.getByRole('spinbutton', { name: 'Hours' });
    await userEvent.click(hours);
    await userEvent.keyboard('{ArrowUp}');
    expect(control.value).toBe('11:00');
    control.disable();
    await fixture.whenStable();
    expect(hours).toBeDisabled();
  });

  it('works with signal forms', async () => {
    @Component({
      imports: [KnTimePicker, FormField],
      template: `<kn-time-picker aria-label="Start" locale="en-GB" [formField]="f.at" />`,
    })
    class SignalHost {
      readonly model = signal<{ at: string | null }>({ at: '06:30' });
      readonly f = form(this.model);
    }
    const { fixture } = await render(SignalHost);
    await userEvent.click(screen.getByRole('spinbutton', { name: 'Minutes' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(fixture.componentInstance.model().at).toBe('06:29');
  });

  it('has no accessibility violations, alone and inside a field', async () => {
    const { container } = await render(
      `<kn-time-picker aria-label="Start" value="08:00" />
       <kn-field label="Ends at"><kn-time-picker value="17:30" /></kn-field>`,
      { imports: [KnTimePicker, KnField] },
    );
    await expectNoA11yViolations(container);
    expect(screen.getByRole('group', { name: 'Ends at' })).toBeInTheDocument();
  });
});

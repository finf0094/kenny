import { Component, signal, viewChild } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import { KnStep, KnStepper } from './stepper';

@Component({
  imports: [KnStepper, KnStep],
  template: `
    <kn-stepper [linear]="linear()" [(step)]="step">
      <kn-step label="Аккаунт">Форма аккаунта</kn-step>
      <kn-step label="Команда">Форма команды</kn-step>
      <kn-step label="Оплата">Форма оплаты</kn-step>
    </kn-stepper>
  `,
})
class Host {
  readonly step = signal(0);
  readonly linear = signal(false);
  readonly stepper = viewChild.required(KnStepper);
}

describe('KnStepper', () => {
  it('lists steps in order and shows only the active content', async () => {
    await render(Host);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Аккаунт/ })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('group', { name: /Аккаунт/ })).toHaveTextContent('Форма аккаунта');
    expect(screen.getByText('Форма команды')).not.toBeVisible();
  });

  it('jumps to any step in free mode and announces completed ones', async () => {
    const { fixture } = await render(Host);
    await userEvent.click(screen.getByRole('button', { name: /Оплата/ }));
    await stable();
    expect(fixture.componentInstance.step()).toBe(2);
    expect(screen.getByRole('button', { name: /Аккаунт.*completed/ })).toBeInTheDocument();
    expect(screen.getByText('Форма оплаты')).toBeVisible();
  });

  it('blocks skipping ahead in linear mode but allows next() and going back', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.linear.set(true);
    await stable();
    expect(screen.getByRole('button', { name: /Оплата/ })).toBeDisabled();
    fixture.componentInstance.stepper().next();
    await stable();
    expect(fixture.componentInstance.step()).toBe(1);
    await userEvent.click(screen.getByRole('button', { name: /Аккаунт/ }));
    await stable();
    expect(fixture.componentInstance.step()).toBe(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(Host);
    await expectNoA11yViolations(container);
  });
});

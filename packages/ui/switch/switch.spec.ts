import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnSwitch } from './switch';

describe('KnSwitch', () => {
  it('exposes role=switch and toggles from the keyboard', async () => {
    await render(`<kn-switch>Уведомления</kn-switch>`, { imports: [KnSwitch] });
    const toggle = screen.getByRole('switch', { name: 'Уведомления' });
    const user = userEvent.setup();
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(' ');
    expect(toggle).toBeChecked();
  });

  it('supports two-way binding', async () => {
    @Component({
      imports: [KnSwitch],
      template: `<kn-switch [(checked)]="on">Wi-Fi</kn-switch>`,
    })
    class Host {
      readonly on = signal(true);
    }
    const { fixture } = await render(Host);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(fixture.componentInstance.on()).toBe(false);
  });

  it('works with reactive forms', async () => {
    const control = new FormControl(true, { nonNullable: true });
    const { fixture } = await render(`<kn-switch [formControl]="control">A</kn-switch>`, {
      imports: [KnSwitch, ReactiveFormsModule],
      componentProperties: { control },
    });
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(control.value).toBe(false);
    control.disable();
    await fixture.whenStable();
    expect(toggle).toBeDisabled();
  });

  it('works with signal forms', async () => {
    @Component({
      imports: [KnSwitch, FormField],
      template: `<kn-switch [formField]="f.dark">Тёмная тема</kn-switch>`,
    })
    class Host {
      readonly model = signal({ dark: false });
      readonly f = form(this.model);
    }
    const { fixture } = await render(Host);
    const toggle = screen.getByRole('switch');
    await userEvent.click(toggle);
    expect(fixture.componentInstance.model().dark).toBe(true);
    fixture.componentInstance.model.set({ dark: false });
    await fixture.whenStable();
    expect(toggle).not.toBeChecked();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-switch [checked]="true">С подписью</kn-switch><kn-switch aria-label="Без подписи" />`,
      { imports: [KnSwitch] },
    );
    await expectNoA11yViolations(container);
  });
});

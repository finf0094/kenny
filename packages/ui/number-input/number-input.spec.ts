import { Component, LOCALE_ID, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnNumberInput } from './number-input';

describe('KnNumberInput', () => {
  it('is a spinbutton that exposes value and range', async () => {
    await render(`<kn-number-input aria-label="Seats" [value]="3" [min]="1" [max]="8" />`, {
      imports: [KnNumberInput],
    });
    const field = screen.getByRole('spinbutton', { name: 'Seats' });
    expect(field).toHaveValue('3');
    expect(field).toHaveAttribute('aria-valuenow', '3');
    expect(field).toHaveAttribute('aria-valuemin', '1');
    expect(field).toHaveAttribute('aria-valuemax', '8');
  });

  it('steps with arrows, pages and jumps to the bounds from the keyboard', async () => {
    @Component({
      imports: [KnNumberInput],
      template: `<kn-number-input aria-label="Qty" [(value)]="qty" [min]="0" [max]="50" />`,
    })
    class Host {
      readonly qty = signal<number | null>(5);
    }
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(host.qty()).toBe(7);
    await user.keyboard('{ArrowDown}');
    expect(host.qty()).toBe(6);
    await user.keyboard('{PageUp}');
    expect(host.qty()).toBe(16);
    await user.keyboard('{End}');
    expect(host.qty()).toBe(50);
    await user.keyboard('{ArrowUp}');
    expect(host.qty()).toBe(50);
    await user.keyboard('{Home}');
    expect(host.qty()).toBe(0);
  });

  it('steps with the buttons and disables them at the bounds', async () => {
    @Component({
      imports: [KnNumberInput],
      template: `<kn-number-input aria-label="Qty" [(value)]="qty" [min]="0" [max]="2" />`,
    })
    class Host {
      readonly qty = signal<number | null>(1);
    }
    const { fixture } = await render(Host);
    const plus = screen.getByRole('button', { name: 'Increase' });
    const minus = screen.getByRole('button', { name: 'Decrease' });
    await userEvent.click(plus);
    expect(fixture.componentInstance.qty()).toBe(2);
    expect(plus).toBeDisabled();
    await userEvent.click(minus);
    await userEvent.click(minus);
    expect(fixture.componentInstance.qty()).toBe(0);
    expect(minus).toBeDisabled();
  });

  it('parses typed text on blur, clamps it and rounds to the step', async () => {
    @Component({
      imports: [KnNumberInput],
      template: `<kn-number-input aria-label="Price" [(value)]="price" [step]="0.5" [max]="100" />`,
    })
    class Host {
      readonly price = signal<number | null>(null);
    }
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    const field = screen.getByRole('spinbutton');
    const user = userEvent.setup();
    await user.type(field, '12.34');
    await user.tab();
    expect(host.price()).toBe(12.3);
    await user.clear(field);
    await user.type(field, '250{Enter}');
    expect(host.price()).toBe(100);
    expect(field).toHaveValue('100');
    await user.clear(field);
    await user.type(field, 'abc');
    await user.tab();
    expect(host.price()).toBe(100);
    expect(field).toHaveValue('100');
    await user.clear(field);
    await user.tab();
    expect(host.price()).toBeNull();
  });

  it('reads the decimal comma and digit groups of the locale', async () => {
    @Component({
      imports: [KnNumberInput],
      template: `<kn-number-input aria-label="Сумма" [(value)]="sum" [step]="0.01" />`,
    })
    class Host {
      readonly sum = signal<number | null>(null);
    }
    const { fixture } = await render(Host, {
      providers: [{ provide: LOCALE_ID, useValue: 'ru' }],
    });
    const field = screen.getByRole('spinbutton');
    const user = userEvent.setup();
    await user.type(field, '1 234,5');
    await user.tab();
    expect(fixture.componentInstance.sum()).toBe(1234.5);
    expect(field).toHaveValue(
      new Intl.NumberFormat('ru', { maximumFractionDigits: 2 }).format(1234.5),
    );
  });

  it('works with reactive forms', async () => {
    const control = new FormControl<number | null>(4);
    const { fixture } = await render(
      `<kn-number-input aria-label="Qty" [formControl]="control" />`,
      { imports: [KnNumberInput, ReactiveFormsModule], componentProperties: { control } },
    );
    const field = screen.getByRole('spinbutton');
    expect(field).toHaveValue('4');
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(control.value).toBe(5);
    control.disable();
    await fixture.whenStable();
    expect(field).toBeDisabled();
  });

  it('works with signal forms', async () => {
    @Component({
      imports: [KnNumberInput, FormField],
      template: `<kn-number-input aria-label="Qty" [formField]="f.qty" />`,
    })
    class Host {
      readonly model = signal<{ qty: number | null }>({ qty: 1 });
      readonly f = form(this.model);
    }
    const { fixture } = await render(Host);
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(fixture.componentInstance.model().qty).toBe(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-number-input aria-label="Qty" [value]="2" [min]="0" [max]="9" />`,
      { imports: [KnNumberInput] },
    );
    await expectNoA11yViolations(container);
  });
});

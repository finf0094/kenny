import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnCheckbox } from './checkbox';

describe('KnCheckbox', () => {
  it('toggles with click and Space and emits the model', async () => {
    const onChange = vi.fn();
    await render(`<kn-checkbox (checkedChange)="onChange($event)">Согласен</kn-checkbox>`, {
      imports: [KnCheckbox],
      componentProperties: { onChange },
    });
    const box = screen.getByRole('checkbox', { name: 'Согласен' });
    const user = userEvent.setup();
    await user.click(box);
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    await user.keyboard(' ');
    expect(box).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('supports the indeterminate state and clears it on toggle', async () => {
    await render(`<kn-checkbox [indeterminate]="true">Все</kn-checkbox>`, { imports: [KnCheckbox] });
    const box = screen.getByRole<HTMLInputElement>('checkbox');
    expect(box.indeterminate).toBe(true);
    await userEvent.click(box);
    expect(box.indeterminate).toBe(false);
    expect(box).toBeChecked();
  });

  it('integrates with reactive forms: value, disabled, invalid', async () => {
    const control = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });
    const { fixture } = await render(`<kn-checkbox [formControl]="control">Условия</kn-checkbox>`, {
      imports: [KnCheckbox, ReactiveFormsModule],
      componentProperties: { control },
    });
    const box = screen.getByRole('checkbox');
    await userEvent.click(box);
    expect(control.value).toBe(true);

    control.setValue(false);
    control.markAsTouched();
    await fixture.whenStable();
    expect(box).not.toBeChecked();
    expect(box).toHaveAttribute('aria-invalid', 'true');

    control.disable();
    await fixture.whenStable();
    expect(box).toBeDisabled();
  });

  it('marks the control as touched on blur', async () => {
    const control = new FormControl(false);
    await render(`<kn-checkbox [formControl]="control">A</kn-checkbox>`, {
      imports: [KnCheckbox, ReactiveFormsModule],
      componentProperties: { control },
    });
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(control.touched).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-checkbox [checked]="true">С подписью</kn-checkbox><kn-checkbox aria-label="Выбрать строку" />`,
      { imports: [KnCheckbox] },
    );
    await expectNoA11yViolations(container);
  });
});

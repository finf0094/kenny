import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnField } from '@kenny/ui/field';
import { expectNoA11yViolations } from '../testing/a11y';
import { KnInput, KnInputGroup, KnTextarea } from './input';

describe('KnInput', () => {
  it('is labelled and described by its field', async () => {
    await render(
      `<kn-field label="Почта" hint="Только для входа"><input knInput type="email" /></kn-field>`,
      { imports: [KnInput, KnField] },
    );
    const input = screen.getByLabelText('Почта');
    expect(input).toHaveAccessibleDescription('Только для входа');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('exposes the field error as description and aria-invalid', async () => {
    await render(
      `<kn-field label="Почта" hint="Подсказка" error="Введите адрес"><input knInput /></kn-field>`,
      { imports: [KnInput, KnField] },
    );
    const input = screen.getByLabelText('Почта');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Введите адрес');
    expect(screen.queryByText('Подсказка')).not.toBeInTheDocument();
  });

  it('works with reactive forms', async () => {
    const control = new FormControl('', { nonNullable: true, validators: Validators.required });
    await render(`<input knInput aria-label="Имя" [formControl]="control" />`, {
      imports: [KnInput, ReactiveFormsModule],
      componentProperties: { control },
    });
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Кенни');
    expect(control.value).toBe('Кенни');
    control.disable();
    await screen.findByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('works with signal forms', async () => {
    @Component({
      imports: [KnInput, FormField],
      template: `<input knInput aria-label="Имя" [formField]="f.name" />`,
    })
    class Host {
      readonly model = signal({ name: 'Кенни' });
      readonly f = form(this.model, (path) => required(path.name));
    }
    const { fixture } = await render(Host);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Кенни');
    await userEvent.clear(input);
    await userEvent.type(input, 'Стэн');
    expect(fixture.componentInstance.model().name).toBe('Стэн');
  });

  it('respects a custom id', async () => {
    await render(`<label for="own">Город</label><input knInput id="own" />`, {
      imports: [KnInput],
    });
    expect(screen.getByLabelText('Город')).toHaveAttribute('id', 'own');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(
      `<kn-field label="Поиск">
         <kn-input-group><span knPrefix>@</span><input knInput /></kn-input-group>
       </kn-field>
       <kn-field label="Комментарий"><textarea knTextarea></textarea></kn-field>`,
      { imports: [KnInput, KnTextarea, KnInputGroup, KnField] },
    );
    await expectNoA11yViolations(container);
  });
});

describe('KnTextarea', () => {
  it('is a native textarea wired to the field', async () => {
    await render(`<kn-field label="Комментарий"><textarea knTextarea></textarea></kn-field>`, {
      imports: [KnTextarea, KnField],
    });
    const textarea = screen.getByLabelText('Комментарий');
    expect(textarea.tagName).toBe('TEXTAREA');
    await userEvent.type(textarea, 'Привет');
    expect(textarea).toHaveValue('Привет');
  });
});

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnIcon } from '@kenny/ui/icon';
import { KnInput, KnInputGroup } from '@kenny/ui/input';

@Component({
  imports: [KnField, KnInput, KnInputGroup, KnIcon, KnButton, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="$event.preventDefault(); submit()">
      <kn-field label="Почта" required [error]="emailError()">
        <kn-input-group>
          <kn-icon knPrefix name="mail" />
          <input knInput type="email" placeholder="you@company.ru" [formField]="signup.email" />
        </kn-input-group>
      </kn-field>

      <kn-field label="Адрес рабочего пространства" hint="Латиница, цифры и дефис">
        <kn-input-group>
          <input knInput placeholder="acme" [formField]="signup.workspace" />
          <span knSuffix>.kenny.app</span>
        </kn-input-group>
      </kn-field>

      <button kn-button type="submit">Создать пространство</button>
    </form>
  `,
  styles: `
    form {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 22rem;
      justify-items: start;
    }

    kn-field {
      inline-size: 100%;
    }
  `,
})
export default class InputValidationDemo {
  protected readonly model = signal({ email: '', workspace: '' });
  protected readonly signup = form(this.model, (path) => {
    required(path.email, { message: 'Укажите почту' });
    email(path.email, { message: 'Похоже, в адресе опечатка' });
  });

  protected readonly emailError = computed(() => {
    const field = this.signup.email();
    return field.touched() ? (field.errors()[0]?.message ?? null) : null;
  });

  protected submit(): void {
    this.signup.email().markAsTouched();
  }
}

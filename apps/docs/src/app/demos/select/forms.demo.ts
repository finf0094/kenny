import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnOption, KnSelect } from '@kenny/ui/select';

interface Role {
  id: string;
  name: string;
}

@Component({
  imports: [ReactiveFormsModule, KnSelect, KnOption, KnField, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <kn-field label="Роль участника" required [error]="roleError()">
        <kn-select formControlName="role" placeholder="Не назначена" [compareWith]="sameRole">
          @for (role of roles; track role.id) {
            <kn-option [value]="role">{{ role.name }}</kn-option>
          }
        </kn-select>
      </kn-field>
      <div class="actions">
        <button kn-button type="submit">Пригласить</button>
        <button kn-button type="button" variant="ghost" tone="neutral" (click)="form.reset(); roleError.set(null)">
          Сбросить
        </button>
      </div>
      <code>{{ form.value.role?.id ?? 'null' }}</code>
    </form>
  `,
  styles: `
    form {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 20rem;
    }

    .actions {
      display: flex;
      gap: var(--kn-space-2);
    }

    code {
      font-family: var(--kn-font-mono);
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class SelectFormsDemo {
  protected readonly roles: Role[] = [
    { id: 'viewer', name: 'Наблюдатель' },
    { id: 'editor', name: 'Редактор' },
    { id: 'admin', name: 'Администратор' },
  ];
  protected readonly form = inject(FormBuilder).group({
    role: [null as Role | null, Validators.required],
  });
  protected readonly roleError = signal<string | null>(null);
  protected readonly sameRole = (a: Role | null, b: Role | null) => a?.id === b?.id;

  protected submit(): void {
    this.form.markAllAsTouched();
    this.roleError.set(this.form.controls.role.invalid ? 'Выберите роль, чтобы отправить приглашение' : null);
  }
}

import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { KnSelect, KnOption } from '@kenny/ui/select';
import { KnSwitch } from '@kenny/ui/switch';

@Component({
  imports: [ReactiveFormsModule, FormField, KnSelect, KnOption, KnSwitch],
  template: `
    <!-- Reactive Forms -->
    <kn-select aria-label="Роль" [formControl]="role">
      <kn-option value="editor">Редактор</kn-option>
      <kn-option value="admin">Администратор</kn-option>
    </kn-select>

    <!-- Signal forms -->
    <kn-switch [formField]="settings.digest">Еженедельная сводка</kn-switch>

    <!-- Без форм: двусторонняя привязка к сигналу -->
    <kn-switch [(checked)]="beta">Бета-функции</kn-switch>
  `,
})
export class FormsExample {
  readonly role = new FormControl('editor', Validators.required);

  readonly model = signal({ digest: true });
  readonly settings = form(this.model, (path) => required(path.digest));

  readonly beta = signal(false);
}

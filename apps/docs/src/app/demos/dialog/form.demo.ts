import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import {
  KnDialog,
  KnDialogBody,
  KnDialogFooter,
  KnDialogHeader,
  KnDialogRef,
} from '@kenny/ui/dialog';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';
import { KnOption, KnSelect } from '@kenny/ui/select';

@Component({
  imports: [
    KnButton,
    KnDialogHeader,
    KnDialogBody,
    KnDialogFooter,
    KnField,
    KnInput,
    KnSelect,
    KnOption,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-button (click)="open()">Пригласить участника</button>
    @if (invited()) {
      <p>Приглашение отправлено: {{ invited() }}</p>
    }

    <ng-template #invite let-ref>
      <kn-dialog-header
        heading="Пригласить в команду"
        description="Мы отправим письмо со ссылкой"
      />
      <kn-dialog-body>
        <form id="invite-form" (submit)="$event.preventDefault(); send(ref, email.value)">
          <kn-field label="Почта">
            <input #email knInput type="email" required placeholder="colleague@company.ru" />
          </kn-field>
          <kn-field label="Роль">
            <kn-select [(value)]="role">
              <kn-option value="viewer">Наблюдатель</kn-option>
              <kn-option value="editor">Редактор</kn-option>
              <kn-option value="admin">Администратор</kn-option>
            </kn-select>
          </kn-field>
        </form>
      </kn-dialog-body>
      <kn-dialog-footer>
        <button kn-button variant="ghost" tone="neutral" (click)="ref.close()">Отмена</button>
        <button kn-button type="submit" form="invite-form">Отправить</button>
      </kn-dialog-footer>
    </ng-template>
  `,
  styles: `
    form {
      display: grid;
      gap: var(--kn-space-4);
    }

    p {
      margin: var(--kn-space-3) 0 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class DialogFormDemo {
  private readonly dialog = inject(KnDialog);
  private readonly invite = viewChild.required<TemplateRef<unknown>>('invite');
  protected readonly role = signal<string | null>('editor');
  protected readonly invited = signal('');

  protected open(): void {
    this.dialog.open(this.invite(), { width: '28rem' });
  }

  protected send(ref: KnDialogRef, email: string): void {
    this.invited.set(`${email} (${this.role()})`);
    void ref.close();
  }
}

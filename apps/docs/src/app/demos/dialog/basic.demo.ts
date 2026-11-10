import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import {
  KN_DIALOG_DATA,
  KnDialog,
  KnDialogBody,
  KnDialogClose,
  KnDialogFooter,
  KnDialogHeader,
} from '@kenny/ui/dialog';

@Component({
  imports: [KnDialogHeader, KnDialogBody, KnDialogFooter, KnDialogClose, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-dialog-header heading="Удалить проект?" [closable]="false" />
    <kn-dialog-body>
      Проект «{{ data.name }}» и все его файлы будут удалены без возможности восстановления.
    </kn-dialog-body>
    <kn-dialog-footer>
      <button kn-button variant="ghost" tone="neutral" [knDialogClose]="false">Отмена</button>
      <button kn-button tone="danger" [knDialogClose]="true">Удалить проект</button>
    </kn-dialog-footer>
  `,
})
export class DeleteProjectDialog {
  protected readonly data = inject<{ name: string }>(KN_DIALOG_DATA);
}

@Component({
  imports: [KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-button tone="danger" variant="soft" (click)="confirm()">Удалить проект…</button>
    <p>Результат: {{ result() }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-3);
      justify-items: start;
    }

    p {
      margin: 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class DialogBasicDemo {
  private readonly dialog = inject(KnDialog);
  protected readonly result = signal('окно ещё не открывали');

  protected confirm(): void {
    this.dialog
      .open<boolean>(DeleteProjectDialog, {
        data: { name: 'Сайт к запуску' },
        role: 'alertdialog',
        width: '26rem',
        closeOnBackdrop: false,
      })
      .closed.subscribe((confirmed) =>
        this.result.set(confirmed ? 'проект удалён' : 'удаление отменено'),
      );
  }
}

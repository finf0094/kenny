import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { KnDrawer } from '@kenny/ui/drawer';
import { expectNoA11yViolations } from '../testing/a11y';
import {
  KN_DIALOG_DATA,
  KnDialog,
  KnDialogBody,
  KnDialogClose,
  KnDialogFooter,
  KnDialogHeader,
  KnDialogRef,
} from './dialog';

@Component({
  imports: [KnDialogHeader, KnDialogBody, KnDialogFooter, KnDialogClose],
  template: `
    <kn-dialog-header heading="Удалить проект?" description="Это действие нельзя отменить" />
    <kn-dialog-body>Проект «{{ data.name }}» будет удалён.</kn-dialog-body>
    <kn-dialog-footer>
      <button type="button" [knDialogClose]="false">Отмена</button>
      <button type="button" (click)="ref.close(true)">Удалить</button>
    </kn-dialog-footer>
  `,
})
class ConfirmDialog {
  protected readonly data = inject<{ name: string }>(KN_DIALOG_DATA);
  protected readonly ref = inject<KnDialogRef<boolean>>(KnDialogRef);
}

@Component({
  imports: [KnDialogHeader, KnDialogBody],
  template: `
    <button type="button" (click)="open()">Открыть</button>
    <button type="button" (click)="openDrawer()">Панель</button>
    <ng-template #sheet let-ref let-data="data">
      <kn-dialog-header heading="Фильтры" />
      <kn-dialog-body>Статус: {{ data.status }} <button type="button" (click)="ref.close()">Готово</button></kn-dialog-body>
    </ng-template>
  `,
})
class Host {
  private readonly dialog = inject(KnDialog);
  private readonly drawer = inject(KnDrawer);
  private readonly sheet = viewChild.required<TemplateRef<unknown>>('sheet');
  result: boolean | undefined | null = null;

  open(): void {
    this.dialog
      .open<boolean>(ConfirmDialog, { data: { name: 'Kenny' }, role: 'alertdialog' })
      .closed.subscribe((result) => (this.result = result));
  }

  openDrawer(): void {
    this.drawer.open(this.sheet(), { side: 'end', data: { status: 'активные' } });
  }
}

describe('KnDialog', () => {
  it('opens a labelled modal dialog with data and traps focus inside', async () => {
    await render(Host);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Открыть' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('Проект «Kenny» будет удалён.');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  });

  it('returns a result and restores focus to the trigger', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    const opener = screen.getByRole('button', { name: 'Открыть' });
    await user.click(opener);
    await user.click(await screen.findByRole('button', { name: 'Удалить' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(fixture.componentInstance.result).toBe(true);
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('closes via [knDialogClose], the close button and Escape', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    const opener = screen.getByRole('button', { name: 'Открыть' });

    await user.click(opener);
    await user.click(await screen.findByRole('button', { name: 'Отмена' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(fixture.componentInstance.result).toBe(false);

    await user.click(opener);
    await user.click(await screen.findByRole('button', { name: 'Закрыть' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(fixture.componentInstance.result).toBeUndefined();

    await user.click(opener);
    await screen.findByRole('alertdialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('has no accessibility violations while open', async () => {
    await render(Host);
    await userEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    const dialog = await screen.findByRole('alertdialog');
    await expectNoA11yViolations(dialog);
  });
});

describe('KnDrawer', () => {
  it('opens a template as a side sheet with template context', async () => {
    await render(Host);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Панель' }));
    const drawer = await screen.findByRole('dialog', { name: 'Фильтры' });
    expect(drawer).toHaveAttribute('data-kind', 'drawer');
    expect(drawer).toHaveAttribute('data-side', 'end');
    expect(drawer).toHaveTextContent('Статус: активные');
    await user.click(screen.getByRole('button', { name: 'Готово' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../testing/a11y';
import { stable } from '../testing/stable';
import {
  KnContextMenuTrigger,
  KnMenu,
  KnMenuItem,
  KnMenuItemCheckbox,
  KnMenuSeparator,
  KnMenuTrigger,
} from './index';

@Component({
  imports: [
    KnMenu,
    KnMenuItem,
    KnMenuItemCheckbox,
    KnMenuSeparator,
    KnMenuTrigger,
    KnContextMenuTrigger,
  ],
  template: `
    <button type="button" [knMenuTrigger]="actions">Действия</button>
    <div data-testid="area" [knContextMenu]="actions">Область</div>

    <ng-template #actions>
      <kn-menu>
        <button kn-menu-item (triggered)="log('rename')">Переименовать</button>
        <button kn-menu-item [knMenuTrigger]="move">Переместить</button>
        <button kn-menu-item-checkbox [checked]="pinned()" (triggered)="pinned.set(!pinned())">
          Закрепить
        </button>
        <kn-menu-separator />
        <button kn-menu-item disabled (triggered)="log('archive')">Архивировать</button>
        <button kn-menu-item tone="danger" (triggered)="log('delete')">Удалить</button>
      </kn-menu>
    </ng-template>

    <ng-template #move>
      <kn-menu>
        <button kn-menu-item (triggered)="log('inbox')">Во входящие</button>
      </kn-menu>
    </ng-template>
  `,
})
class Host {
  readonly events: string[] = [];
  readonly pinned = signal(false);
  log(event: string): void {
    this.events.push(event);
  }
}

describe('KnMenu', () => {
  it('opens from the trigger with menu semantics', async () => {
    await render(Host);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Действия' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await user.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Закрепить' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('menuitem', { name: 'Архивировать' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await expectNoA11yViolations(menu);
  });

  it('navigates with arrows, activates an item and returns focus to the trigger', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    await user.tab();
    // ArrowDown rather than Enter: for Enter the CDK relies on the browser's native
    // click (it checks event.isTrusted), which synthetic events cannot reproduce.
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Переименовать' })).toHaveFocus(),
    );
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Переместить' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Переименовать' })).toHaveFocus();
    await user.click(screen.getByRole('menuitem', { name: 'Переименовать' }));
    expect(fixture.componentInstance.events).toEqual(['rename']);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Действия' })).toHaveFocus();
  });

  it('opens a submenu with ArrowRight and returns with ArrowLeft', async () => {
    await render(Host);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Действия' }));
    await screen.findByRole('menu');
    screen.getByRole('menuitem', { name: 'Переместить' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Во входящие' })).toHaveFocus(),
    );
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
  });

  it('toggles checkbox items and closes on Escape', async () => {
    const { fixture } = await render(Host);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Действия' }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Закрепить' }));
    expect(fixture.componentInstance.pinned()).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Действия' }));
    await screen.findByRole('menu');
    await stable();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Закрепить' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('opens as a context menu on right click', async () => {
    const { fixture } = await render(Host);
    fireEvent.contextMenu(screen.getByTestId('area'), { clientX: 40, clientY: 40 });
    await screen.findByRole('menu');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Удалить' }));
    expect(fixture.componentInstance.events).toEqual(['delete']);
  });
});

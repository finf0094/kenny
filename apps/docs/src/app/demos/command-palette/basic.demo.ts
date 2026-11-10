import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCommandPalette } from '@kenny/ui/command-palette';
import { KnIcon } from '@kenny/ui/icon';

@Component({
  imports: [KnButton, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-button variant="glass" tone="neutral" (click)="palette.open()">
      <kn-icon name="search" /> Открыть палитру
      <kbd>Ctrl K</kbd>
    </button>
    <p>Команды этого демо добавлены к командам сайта. Последняя выполненная: {{ last() }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-3);
      justify-items: start;
    }

    kbd {
      margin-inline-start: var(--kn-space-2);
      font-family: var(--kn-font-sans);
      font-size: var(--kn-text-xs);
      color: var(--kn-color-text-subtle);
    }

    p {
      margin: 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class CommandPaletteBasicDemo {
  protected readonly palette = inject(KnCommandPalette);
  protected readonly last = signal('—');

  constructor() {
    // Commands live as long as this component: register() returns the cleanup.
    const unregister = this.palette.register([
      { id: 'demo.invite', group: 'Демо', label: 'Пригласить участника', icon: 'user', keywords: ['команда'], run: () => this.last.set('Пригласить участника') },
      { id: 'demo.export', group: 'Демо', label: 'Экспортировать отчёт', icon: 'download', shortcut: ['⌘', 'E'], run: () => this.last.set('Экспортировать отчёт') },
      { id: 'demo.archive', group: 'Демо', label: 'Архивировать проект', icon: 'archive', run: () => this.last.set('Архивировать проект') },
    ]);
    inject(DestroyRef).onDestroy(unregister);
  }
}

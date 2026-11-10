import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnDrawer, KnDrawerBody, KnDrawerFooter, KnDrawerHeader, KnDrawerSide } from '@kenny/ui/drawer';
import { KnSwitch } from '@kenny/ui/switch';

@Component({
  imports: [KnButton, KnDrawerHeader, KnDrawerBody, KnDrawerFooter, KnSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (side of sides; track side.id) {
      <button kn-button variant="glass" tone="neutral" (click)="open(side.id)">{{ side.label }}</button>
    }

    <ng-template #settings let-ref>
      <kn-drawer-header heading="Уведомления" description="Изменения применяются сразу" />
      <kn-drawer-body>
        <div class="stack">
          <kn-switch [(checked)]="mentions">Упоминания</kn-switch>
          <kn-switch [(checked)]="reviews">Запросы на ревью</kn-switch>
          <kn-switch [(checked)]="digest">Еженедельная сводка</kn-switch>
        </div>
      </kn-drawer-body>
      <kn-drawer-footer>
        <button kn-button (click)="ref.close()">Готово</button>
      </kn-drawer-footer>
    </ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-3);
    }

    .stack {
      display: grid;
      gap: var(--kn-space-4);
    }
  `,
})
export default class DrawerBasicDemo {
  private readonly drawer = inject(KnDrawer);
  private readonly settings = viewChild.required<TemplateRef<unknown>>('settings');
  protected readonly mentions = signal(true);
  protected readonly reviews = signal(true);
  protected readonly digest = signal(false);
  protected readonly sides: { id: KnDrawerSide; label: string }[] = [
    { id: 'end', label: 'Справа' },
    { id: 'start', label: 'Слева' },
    { id: 'bottom', label: 'Снизу' },
    { id: 'top', label: 'Сверху' },
  ];

  protected open(side: KnDrawerSide): void {
    this.drawer.open(this.settings(), { side, size: side === 'top' || side === 'bottom' ? '18rem' : '22rem' });
  }
}

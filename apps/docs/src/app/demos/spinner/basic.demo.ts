import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnSpinner } from '@kenny/ui/spinner';

@Component({
  imports: [KnSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-spinner size="sm" label="Загрузка, маленький" />
    <kn-spinner label="Загрузка" />
    <kn-spinner size="lg" label="Загрузка, большой" />
    <span class="inline"><kn-spinner size="sm" decorative /> Сохраняем изменения…</span>
    <span class="accent"><kn-spinner label="Проверяем оплату" /></span>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-6);
    }

    .inline {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
      color: var(--kn-color-text-muted);
    }

    .accent {
      display: inline-flex;
      color: var(--kn-color-accent);
    }
  `,
})
export default class SpinnerBasicDemo {}

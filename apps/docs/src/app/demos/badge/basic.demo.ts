import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnBadge } from '@kenny/ui/badge';

@Component({
  imports: [KnBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <kn-badge>Черновик</kn-badge>
      <kn-badge tone="accent">Новый</kn-badge>
      <kn-badge tone="success" dot>Оплачен</kn-badge>
      <kn-badge tone="warning" dot>Ожидает</kn-badge>
      <kn-badge tone="danger" dot>Просрочен</kn-badge>
    </div>
    <div class="row">
      <kn-badge variant="solid">12</kn-badge>
      <kn-badge variant="solid" tone="accent">99+</kn-badge>
      <kn-badge variant="solid" tone="danger">3</kn-badge>
      <kn-badge variant="outline" tone="accent">Бета</kn-badge>
      <kn-badge variant="outline" tone="success">v0.2.0</kn-badge>
      <kn-badge size="lg" tone="accent">Большой</kn-badge>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-2);
    }
  `,
})
export default class BadgeBasicDemo {}

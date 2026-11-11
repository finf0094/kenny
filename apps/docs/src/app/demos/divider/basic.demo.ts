import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnDivider } from '@kenny/ui/divider';

@Component({
  imports: [KnDivider, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sign-in" aria-label="Вход">
      <button kn-button block>Войти по почте</button>
      <kn-divider spacing="4">или</kn-divider>
      <button kn-button block variant="outline" tone="neutral">Войти через SSO</button>
    </section>

    <div class="meta">
      <span>Счёт INV-1042</span>
      <kn-divider orientation="vertical" decorative />
      <span>3 октября</span>
      <kn-divider orientation="vertical" decorative />
      <span>9 800 ₽</span>
    </div>

    <div>
      <kn-divider align="start">Реквизиты</kn-divider>
      <p>ООО «Орбита», ИНН 7701234567</p>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-6);
      max-inline-size: 22rem;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    p {
      margin: var(--kn-space-3) 0 0;
    }
  `,
})
export default class DividerBasicDemo {}

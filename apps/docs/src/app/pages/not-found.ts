import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnButton } from '@kenny/ui/button';
import { KnEmptyState } from '@kenny/ui/empty-state';

@Component({
  imports: [KnEmptyState, KnButton, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="content">
      <kn-empty-state
        icon="search"
        heading="Такой страницы нет"
        description="Возможно, адрес изменился. Откройте поиск (Ctrl K) или вернитесь на главную."
        [headingLevel]="1"
      >
        <a kn-button routerLink="/">На главную</a>
        <a kn-button variant="ghost" tone="neutral" routerLink="/components/button">К компонентам</a>
      </kn-empty-state>
    </main>
  `,
  styles: `
    main {
      display: grid;
      place-items: center;
      min-block-size: 60dvh;
    }
  `,
})
export default class NotFoundPage {}

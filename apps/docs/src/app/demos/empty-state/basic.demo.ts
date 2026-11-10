import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnEmptyState } from '@kenny/ui/empty-state';
import { KnIcon } from '@kenny/ui/icon';

@Component({
  imports: [KnEmptyState, KnButton, KnCard, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-card padding="none">
      <kn-empty-state
        icon="inbox"
        heading="Во входящих пусто"
        description="Новые письма появятся здесь. Пока можно разобрать отложенные."
      >
        <button kn-button><kn-icon name="edit" /> Написать письмо</button>
        <button kn-button variant="ghost" tone="neutral">Открыть отложенные</button>
      </kn-empty-state>
    </kn-card>
  `,
  styles: `
    :host {
      display: block;
      max-inline-size: 32rem;
    }
  `,
})
export default class EmptyStateBasicDemo {}

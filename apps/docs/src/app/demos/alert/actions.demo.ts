import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnAlert } from '@kenny/ui/alert';
import { KnButton } from '@kenny/ui/button';

@Component({
  imports: [KnAlert, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <kn-alert
        variant="outline"
        tone="warning"
        heading="Подтвердите почту"
        closable
        (closed)="visible.set(false)"
      >
        Мы отправили письмо на anna&#64;orbita.example. Без подтверждения нельзя приглашать коллег.
        <ng-container knAlertActions>
          <button kn-button size="sm" variant="outline" tone="neutral">Отправить ещё раз</button>
          <button kn-button size="sm" variant="ghost" tone="neutral">Изменить адрес</button>
        </ng-container>
      </kn-alert>
    } @else {
      <button kn-button variant="outline" tone="neutral" (click)="visible.set(true)">
        Показать снова
      </button>
    }
  `,
  styles: `
    :host {
      display: block;
      max-inline-size: 36rem;
    }
  `,
})
export default class AlertActionsDemo {
  protected readonly visible = signal(true);
}

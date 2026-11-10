import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';

@Component({
  selector: 'app-invite',
  imports: [KnButton, KnField, KnInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Почта коллеги" hint="Отправим приглашение в команду">
      <input
        knInput
        type="email"
        [value]="email()"
        (input)="email.set($any($event.target).value)"
      />
    </kn-field>
    <button kn-button [disabled]="!email()" (click)="invite()">Пригласить</button>
  `,
})
export class Invite {
  protected readonly email = signal('');

  protected invite(): void {
    console.log('invite', this.email());
  }
}

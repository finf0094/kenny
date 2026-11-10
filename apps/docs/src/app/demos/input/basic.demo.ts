import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';

@Component({
  imports: [KnField, KnInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Название проекта" hint="Его увидят все участники команды">
      <input knInput placeholder="Например, «Сайт к запуску»" />
    </kn-field>
    <kn-field label="Маленькое">
      <input knInput knSize="sm" value="knSize=&quot;sm&quot;" />
    </kn-field>
    <kn-field label="Большое">
      <input knInput knSize="lg" value="knSize=&quot;lg&quot;" />
    </kn-field>
    <kn-field label="Только чтение">
      <input knInput value="kenny-prod-eu" disabled />
    </kn-field>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 22rem;
    }
  `,
})
export default class InputBasicDemo {}

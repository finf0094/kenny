import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnTextarea } from '@kenny/ui/textarea';

@Component({
  imports: [KnField, KnTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field
      label="Комментарий к релизу"
      [hint]="text().length + ' из 280'"
      [error]="text().length > 280 ? 'Сократите текст до 280 символов' : null"
    >
      <textarea
        knTextarea
        [minRows]="2"
        [maxRows]="8"
        placeholder="Что изменилось? Поле растёт вместе с текстом."
        [value]="text()"
        (input)="text.set($any($event.target).value)"
      ></textarea>
    </kn-field>

    <kn-field label="Фиксированная высота">
      <textarea knTextarea [autosize]="false" rows="3" placeholder="autosize отключён"></textarea>
    </kn-field>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 26rem;
    }
  `,
})
export default class TextareaBasicDemo {
  protected readonly text = signal(
    'Починили дрожание индикатора вкладок при быстром переключении.',
  );
}

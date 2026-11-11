import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnMultiSelect, KnOption, KnOptionGroup } from '@kenny/ui/select';

@Component({
  imports: [KnMultiSelect, KnOption, KnOptionGroup, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Кого уведомить" [hint]="hint()">
      <kn-multi-select placeholder="Никого" [(value)]="people">
        <kn-option-group label="Команда">
          <kn-option value="anna">Анна Орлова</kn-option>
          <kn-option value="boris">Борис Ким</kn-option>
          <kn-option value="vera">Вера Соколова</kn-option>
        </kn-option-group>
        <kn-option-group label="Заказчик">
          <kn-option value="gleb">Глеб Маркин</kn-option>
          <kn-option value="zoya" disabled>Зоя Мельникова — в отпуске</kn-option>
        </kn-option-group>
      </kn-multi-select>
    </kn-field>
  `,
  styles: `
    :host {
      display: block;
      max-inline-size: 22rem;
    }
  `,
})
export default class SelectMultipleDemo {
  protected readonly people = signal<string[]>(['anna', 'vera']);
  protected readonly hint = () =>
    this.people().length ? `Выбрано: ${this.people().length}` : 'Письмо не получит никто';
}

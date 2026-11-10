import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnRadio, KnRadioGroup } from '@kenny/ui/radio';

@Component({
  imports: [KnRadioGroup, KnRadio, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Кто видит проект" [hint]="hints[visibility() ?? ''] ?? ''">
      <kn-radio-group [(value)]="visibility">
        <kn-radio value="private">Только я</kn-radio>
        <kn-radio value="team">Команда</kn-radio>
        <kn-radio value="link">Все, у кого есть ссылка</kn-radio>
        <kn-radio value="public" disabled>Весь интернет</kn-radio>
      </kn-radio-group>
    </kn-field>

    <kn-field label="Плотность таблиц">
      <kn-radio-group orientation="horizontal" [(value)]="density">
        <kn-radio value="compact">Компактно</kn-radio>
        <kn-radio value="regular">Обычно</kn-radio>
        <kn-radio value="relaxed">Свободно</kn-radio>
      </kn-radio-group>
    </kn-field>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-8);
    }
  `,
})
export default class RadioBasicDemo {
  protected readonly visibility = signal<string | null>('team');
  protected readonly density = signal<string | null>('regular');
  protected readonly hints: Record<string, string> = {
    private: 'Проект не появится в поиске команды.',
    team: 'Участники смогут комментировать и редактировать.',
    link: 'Просмотр без входа в аккаунт.',
    public: '',
  };
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnAvatar, KnAvatarGroup } from '@kenny/ui/avatar';

@Component({
  imports: [KnAvatar, KnAvatarGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <kn-avatar size="sm" name="Анна Орлова" />
      <kn-avatar name="Борис Ким" status="online" />
      <kn-avatar size="lg" name="Вера Соколова" status="busy" />
      <kn-avatar name="Глеб" status="away" />
      <kn-avatar name="Недоступная картинка" src="/no-such-image.png" />
    </div>

    <div class="row">
      <kn-avatar-group aria-label="Участники проекта">
        @for (name of team; track name) {
          <kn-avatar [name]="name" />
        }
      </kn-avatar-group>
      <span>{{ team.length }} участников</span>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
    }

    .row {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
    }

    span {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class AvatarBasicDemo {
  protected readonly team = [
    'Дина Ахметова',
    'Егор Лапин',
    'Зоя Мельникова',
    'Илья Гринберг',
    'Кира Ан',
  ];
}

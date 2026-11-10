import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnAvatar } from '@kenny/ui/avatar';
import { KnCard } from '@kenny/ui/card';
import { KnSkeleton } from '@kenny/ui/skeleton';
import { KnSwitch } from '@kenny/ui/switch';

@Component({
  imports: [KnSkeleton, KnCard, KnAvatar, KnSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-switch size="sm" [(checked)]="loading">Идёт загрузка</kn-switch>

    <kn-card [attr.aria-busy]="loading()">
      @if (loading()) {
        <div class="person">
          <kn-skeleton shape="circle" />
          <kn-skeleton [lines]="2" width="10rem" />
        </div>
        <kn-skeleton [lines]="3" />
        <kn-skeleton shape="rect" height="5rem" />
      } @else {
        <div class="person">
          <kn-avatar name="Зоя Мельникова" />
          <div><strong>Зоя Мельникова</strong><br /><small>Дизайн-система</small></div>
        </div>
        <p>
          Собрала новую палитру: кобальт для акцентов, тёмно-синие чернила вместо нейтрального
          чёрного. Проверьте контраст на своих экранах.
        </p>
        <div class="preview kn-wallpaper-sm"></div>
      }
    </kn-card>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 24rem;
    }

    .person {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
    }

    small {
      color: var(--kn-color-text-muted);
    }

    p {
      margin: 0;
    }

    .preview {
      block-size: 5rem;
      border-radius: var(--kn-radius-md);
    }
  `,
})
export default class SkeletonBasicDemo {
  protected readonly loading = signal(true);
}

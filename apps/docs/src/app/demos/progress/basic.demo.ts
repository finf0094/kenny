import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnProgress } from '@kenny/ui/progress';

@Component({
  imports: [KnProgress, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="item">
      <div class="head">
        <span>Загрузка архива</span><span>{{ value() }}%</span>
      </div>
      <kn-progress
        aria-label="Загрузка архива"
        [value]="value()"
        [tone]="value() === 100 ? 'success' : 'accent'"
      />
    </div>
    <div class="actions">
      <button kn-button size="sm" variant="soft" (click)="step(-20)">−20</button>
      <button kn-button size="sm" variant="soft" (click)="step(20)">+20</button>
    </div>

    <div class="item">
      <div class="head"><span>Синхронизация</span><span>ждём сервер</span></div>
      <kn-progress aria-label="Синхронизация" />
    </div>

    <kn-progress size="sm" tone="warning" aria-label="Квота хранилища" [value]="82" />
    <kn-progress size="lg" tone="danger" aria-label="Лимит запросов" [value]="96" />
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 24rem;
    }

    .item {
      display: grid;
      gap: var(--kn-space-2);
    }

    .head {
      display: flex;
      justify-content: space-between;
      font-size: var(--kn-text-sm);
      font-variant-numeric: tabular-nums;
    }

    .head span:last-child {
      color: var(--kn-color-text-muted);
    }

    .actions {
      display: flex;
      gap: var(--kn-space-2);
    }
  `,
})
export default class ProgressBasicDemo {
  protected readonly value = signal(40);

  protected step(delta: number): void {
    this.value.update((v) => Math.min(100, Math.max(0, v + delta)));
  }
}

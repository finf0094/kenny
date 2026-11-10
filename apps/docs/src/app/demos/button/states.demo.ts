import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';

@Component({
  imports: [KnButton, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <button kn-button size="sm">Маленькая</button>
      <button kn-button>Средняя</button>
      <button kn-button size="lg">Большая</button>
    </div>
    <div class="row">
      <button kn-button variant="soft"><kn-icon name="download" /> Скачать отчёт</button>
      <a kn-button variant="glass" href="https://angular.dev" target="_blank" rel="noopener">
        Открыть angular.dev <kn-icon name="external" />
      </a>
    </div>
    <div class="row">
      <button kn-button [loading]="saving()" (click)="save()">Сохранить изменения</button>
      <button kn-button disabled>Недоступно</button>
      <button kn-button variant="soft" disabled>Недоступно</button>
    </div>
    <button kn-button block variant="glass" tone="neutral">На всю ширину</button>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 30rem;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-3);
    }
  `,
})
export default class ButtonStatesDemo {
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1600);
  }
}

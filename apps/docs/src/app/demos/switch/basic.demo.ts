import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnSwitch } from '@kenny/ui/switch';

@Component({
  imports: [KnSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list">
      <div class="row">
        <div>
          <div id="sw-wifi" class="title">Wi-Fi</div>
          <div class="note">{{ wifi() ? 'Подключено к «Kenny Guest»' : 'Выключен' }}</div>
        </div>
        <kn-switch aria-label="Wi-Fi" [(checked)]="wifi" />
      </div>
      <div class="row">
        <div>
          <div class="title">Режим полёта</div>
          <div class="note">Отключает все беспроводные сети</div>
        </div>
        <kn-switch aria-label="Режим полёта" [(checked)]="airplane" />
      </div>
      <div class="row">
        <div class="title">Раздача интернета</div>
        <kn-switch aria-label="Раздача интернета" disabled />
      </div>
    </div>

    <div class="sizes">
      <kn-switch size="sm" [checked]="true">Маленький</kn-switch>
      <kn-switch [checked]="true">Средний</kn-switch>
      <kn-switch size="lg" [checked]="true">Большой</kn-switch>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-6);
      max-inline-size: 24rem;
    }

    .list {
      border-radius: var(--kn-radius-lg);
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-shadow-glass-md);
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-4);
      padding: var(--kn-space-3) var(--kn-space-4);
    }

    .row + .row {
      border-block-start: 1px solid var(--kn-color-border);
    }

    .title {
      font-weight: var(--kn-weight-medium);
    }

    .note {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .sizes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-6);
    }
  `,
})
export default class SwitchBasicDemo {
  protected readonly wifi = signal(true);
  protected readonly airplane = signal(false);
}

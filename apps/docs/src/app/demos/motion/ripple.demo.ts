import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnRipple } from '@kenny/ui/motion';
import { KnSwitch } from '@kenny/ui/switch';
import { KnTab, KnTabs } from '@kenny/ui/tabs';

@Component({
  imports: [KnButton, KnTabs, KnTab, KnSwitch, KnRipple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-switch [(checked)]="on">Волна от нажатия</kn-switch>

    <div class="stage" [style.--kn-ripple-opacity]="on() ? 0.14 : 0">
      <div class="row">
        <button kn-button>Сохранить</button>
        <button kn-button variant="soft">Поделиться</button>
        <button kn-button variant="outline" tone="neutral">Отмена</button>
      </div>
      <kn-tabs aria-label="Период" variant="underline">
        <kn-tab value="day" label="День" />
        <kn-tab value="week" label="Неделя" />
        <kn-tab value="month" label="Месяц" />
      </kn-tabs>
      <button class="tile" type="button" knRipple>
        <strong>Свой элемент</strong>
        <span>Директива knRipple даёт ту же волну любой кнопке или ссылке.</span>
      </button>
    </div>
  `,
  styles: `
    :host,
    .stage {
      display: grid;
      gap: var(--kn-space-5);
      justify-items: start;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
    }

    .tile {
      display: grid;
      gap: var(--kn-space-1);
      max-inline-size: 22rem;
      padding: var(--kn-space-4) var(--kn-space-5);
      border: 0;
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface);
      box-shadow: var(--kn-elevation-card);
      color: var(--kn-color-text);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .tile span {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .tile:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }
  `,
})
export default class MotionRippleDemo {
  protected readonly on = signal(true);
}

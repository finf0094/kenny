import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnIcon } from '@kenny/ui/icon';
import { KnPopover, KnPopoverTrigger } from '@kenny/ui/popover';
import { KnSlider } from '@kenny/ui/slider';
import { KnSwitch } from '@kenny/ui/switch';

@Component({
  imports: [KnPopover, KnPopoverTrigger, KnButton, KnIcon, KnField, KnSlider, KnSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-button variant="glass" tone="neutral" [knPopoverTrigger]="display">
      <kn-icon name="sliders" /> Экран
    </button>

    <kn-popover #display aria-label="Настройки экрана" width="18rem">
      <div class="content">
        <kn-field label="Яркость"><kn-slider [(value)]="brightness" /></kn-field>
        <kn-switch [(checked)]="night">Ночной режим</kn-switch>
        <button kn-button size="sm" variant="soft" (click)="display.close()">Готово</button>
      </div>
    </kn-popover>

    <button kn-button variant="ghost" tone="neutral" [knPopoverTrigger]="info">Сверху по центру</button>
    <kn-popover #info placement="top" aria-label="Подробности" width="15rem">
      Панель сама перевернётся, если сверху не хватит места.
    </kn-popover>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-3);
    }

    .content {
      display: grid;
      gap: var(--kn-space-4);
      justify-items: start;
    }

    kn-field {
      inline-size: 100%;
    }
  `,
})
export default class PopoverBasicDemo {
  protected readonly brightness = signal(70);
  protected readonly night = signal(false);
}

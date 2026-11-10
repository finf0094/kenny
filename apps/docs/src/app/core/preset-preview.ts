import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { KnBadge } from '@kenny/ui/badge';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnCheckbox } from '@kenny/ui/checkbox';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnSwitch } from '@kenny/ui/switch';
import { KnTab, KnTabs } from '@kenny/ui/tabs';

/**
 * One small form built from the library. The presets page renders it once per style,
 * each time inside a block with a different `data-kn-preset` — same markup, different tokens.
 */
@Component({
  selector: 'docs-preset-preview',
  imports: [
    KnCard,
    KnBadge,
    KnField,
    KnInput,
    KnSelect,
    KnOption,
    KnTabs,
    KnTab,
    KnCheckbox,
    KnSwitch,
    KnButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-card>
      <div class="head">
        <strong>Новый проект</strong>
        <kn-badge tone="accent">Черновик</kn-badge>
      </div>
      <kn-field label="Название">
        <input knInput [value]="name()" (input)="name.set($any($event.target).value)" />
      </kn-field>
      <kn-field label="Доступ">
        <kn-select [(value)]="access">
          <kn-option value="private">Только я</kn-option>
          <kn-option value="team">Команда</kn-option>
          <kn-option value="link">Все, у кого есть ссылка</kn-option>
        </kn-select>
      </kn-field>
      <kn-tabs stretch size="sm" [aria-label]="'Срок, стиль ' + label()" [(value)]="term">
        <kn-tab value="week" label="Неделя"><span class="note">Сдача через 7 дней</span></kn-tab>
        <kn-tab value="month" label="Месяц"><span class="note">Сдача через 30 дней</span></kn-tab>
        <kn-tab value="none" label="Без срока"><span class="note">Срок не задан</span></kn-tab>
      </kn-tabs>
      <kn-checkbox [(checked)]="notify">Уведомить участников</kn-checkbox>
      <kn-switch [(checked)]="shared">Публичная ссылка</kn-switch>
      <div class="actions">
        <button kn-button variant="outline" tone="neutral">В черновики</button>
        <button kn-button>Создать</button>
      </div>
    </kn-card>
  `,
  styles: `
    :host {
      display: block;
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-3);
      font-size: var(--kn-text-lg);
    }

    .note {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--kn-space-2);
      padding-block-start: var(--kn-space-1);
    }
  `,
})
export class DocsPresetPreview {
  /** Name of the style, used to tell the four tab lists apart for assistive technology. */
  readonly label = input.required<string>();

  protected readonly name = signal('Сайт к запуску');
  protected readonly access = signal<string | null>('team');
  protected readonly term = signal<string | undefined>('week');
  protected readonly notify = signal(true);
  protected readonly shared = signal(true);
}

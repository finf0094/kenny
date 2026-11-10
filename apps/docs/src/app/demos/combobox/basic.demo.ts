import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnCombobox, KnOption } from '@kenny/ui/combobox';
import { KnField } from '@kenny/ui/field';

@Component({
  imports: [KnCombobox, KnOption, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Язык интерфейса" hint="Начните вводить — список сузится">
      <kn-combobox clearable placeholder="Выберите язык" [(value)]="language">
        @for (lang of languages; track lang.code) {
          <kn-option [value]="lang.code">{{ lang.name }}</kn-option>
        }
      </kn-combobox>
    </kn-field>
    <p>Код: {{ language() ?? '—' }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-3);
      max-inline-size: 22rem;
    }

    p {
      margin: 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class ComboboxBasicDemo {
  protected readonly language = signal<string | null>('ru');
  protected readonly languages = [
    { code: 'en', name: 'Английский' },
    { code: 'hy', name: 'Армянский' },
    { code: 'be', name: 'Белорусский' },
    { code: 'ka', name: 'Грузинский' },
    { code: 'es', name: 'Испанский' },
    { code: 'kk', name: 'Казахский' },
    { code: 'de', name: 'Немецкий' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Турецкий' },
    { code: 'fr', name: 'Французский' },
  ];
}

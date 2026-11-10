import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  HostAttributeToken,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { KN_FIELD, knDefaultSize, KnSize, KnStyleLoader, useControlStyles } from '@kenny/ui/core';

/**
 * KnInput and KnTextarea are directives (so `#ref` on the element stays the native
 * element), and directives cannot carry styles — these are loaded once, globally.
 * The well itself (fill, outline, focus, sizes) is the shared `kn-control` class.
 */
const fieldStyles = `
  .kn-input {
    display: block;
    inline-size: 100%;
    padding: 0 var(--kn-field-padding, var(--kn-space-3));
    line-height: var(--kn-leading-snug);
    appearance: none;
  }

  .kn-input::placeholder {
    color: var(--kn-color-text-subtle);
    opacity: 1;
  }

  .kn-input:where([data-size='lg']) {
    padding-inline: var(--kn-field-padding, var(--kn-space-4));
  }
`;

/** @internal Carries the global styles for the input directives; never rendered. */
@Component({
  selector: 'kn-input-styles',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [
    fieldStyles,
    `
      .kn-control.kn-textarea {
        block-size: auto;
        min-block-size: var(--_h);
        padding-block: var(--kn-space-2);
        resize: none;
        line-height: var(--kn-leading-normal);
      }

      .kn-control.kn-textarea[data-size='lg'] {
        padding-block: var(--kn-space-3);
      }
    `,
  ],
})
export class KnInputStyles {}

const host = {
  '[attr.id]': 'id',
  '[attr.data-size]': 'knSize()',
  '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
  '[attr.aria-describedby]': 'field?.describedBy() ?? null',
};

/**
 * Текстовое поле. Директива на нативном `<input>`: `type`, `placeholder`,
 * `formControlName`, `[formField]` и `ngModel` работают без обёрток.
 */
@Directive({
  selector: 'input[knInput]',
  host: { class: 'kn-control kn-input', ...host },
})
export class KnInput {
  /** Размер поля. Называется `knSize`, потому что `size` — нативный атрибут `<input>`. */
  readonly knSize = input<KnSize>(knDefaultSize());
  /** Помечает поле невалидным (`aria-invalid`). Внутри `<kn-field>` с ошибкой выставляется само. */
  readonly invalid = input(false, { transform: booleanAttribute });

  protected readonly field = inject(KN_FIELD, { optional: true });
  protected readonly id =
    inject(new HostAttributeToken('id'), { optional: true }) ?? this.field?.controlId ?? null;
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));

  constructor() {
    useControlStyles();
    inject(KnStyleLoader).load(KnInputStyles);
  }
}

/**
 * Многострочное поле на нативном `<textarea>`. По умолчанию растёт вместе с текстом
 * от `minRows` до `maxRows`.
 */
@Directive({
  selector: 'textarea[knTextarea]',
  hostDirectives: [
    {
      directive: CdkTextareaAutosize,
      inputs: [
        'cdkTextareaAutosize: autosize',
        'cdkAutosizeMinRows: minRows',
        'cdkAutosizeMaxRows: maxRows',
      ],
    },
  ],
  host: { class: 'kn-control kn-input kn-textarea', ...host },
})
export class KnTextarea {
  /** Размер поля. */
  readonly knSize = input<KnSize>(knDefaultSize());
  /** Помечает поле невалидным (`aria-invalid`). */
  readonly invalid = input(false, { transform: booleanAttribute });

  protected readonly field = inject(KN_FIELD, { optional: true });
  protected readonly id =
    inject(new HostAttributeToken('id'), { optional: true }) ?? this.field?.controlId ?? null;
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));

  constructor() {
    useControlStyles();
    inject(KnStyleLoader).load(KnInputStyles);
    inject(CdkTextareaAutosize).minRows = 3;
  }
}

/**
 * Группа поля с дополнениями: иконка, единица измерения или кнопка внутри общего
 * контура. Дополнения помечаются атрибутами `knPrefix` и `knSuffix`.
 */
@Component({
  selector: 'kn-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content select="[knPrefix]" />
    <ng-content />
    <ng-content select="[knSuffix]" />
  `,
  host: { class: 'kn-control', '[attr.data-size]': 'size()' },
  styles: `
    /* The well comes from the shared kn-control class; the group only lays its content out */
    :host(.kn-control) {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      padding: 0 var(--kn-field-padding, var(--kn-space-3));
      color: var(--kn-color-text-muted);
    }

    :host(.kn-control[data-size='lg']) {
      padding-inline: var(--kn-field-padding, var(--kn-space-4));
    }
  `,
})
export class KnInputGroup {
  /** Размер группы; вложенному полю задайте тот же `knSize`. */
  readonly size = input<KnSize>(knDefaultSize());

  constructor() {
    useControlStyles();
  }
}

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
import { KN_FIELD, KnSize, KnStyleLoader } from '@kenny/ui/core';

/**
 * The shared "field" look: a sunken, softly outlined well.
 * KnInput and KnTextarea are directives (so `#ref` on the element stays the native
 * element), and directives cannot carry styles — these are loaded once, globally.
 */
const fieldStyles = `
  .kn-input {
    --_height: var(--kn-size-md);
    --_radius: var(--kn-radius-md);

    display: block;
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: var(--kn-input-height, var(--_height));
    padding: 0 var(--kn-input-padding, var(--kn-space-3));
    border: 0;
    border-radius: var(--kn-input-radius, var(--_radius));
    background: var(--kn-input-bg, var(--kn-color-field));
    box-shadow: inset 0 0 0 1px var(--kn-input-border, var(--kn-color-field-border));
    color: var(--kn-color-text);
    font: inherit;
    font-size: var(--kn-text-md);
    line-height: var(--kn-leading-snug);
    appearance: none;
  }

  .kn-input::placeholder {
    color: var(--kn-color-text-subtle);
    opacity: 1;
  }

  @media (hover: hover) {
    .kn-input:where(:hover:not(:disabled)) {
      box-shadow: inset 0 0 0 1px var(--kn-color-field-border-hover);
    }
  }

  .kn-input:where(:focus-visible) {
    outline: var(--kn-focus-width) solid var(--kn-color-focus);
    outline-offset: -1px;
  }

  .kn-input:where([aria-invalid='true']),
  .kn-input:where(.ng-invalid.ng-touched) {
    box-shadow: inset 0 0 0 1px var(--kn-color-danger);
    background: var(--kn-color-danger-soft);
  }

  .kn-input:where([aria-invalid='true']:focus-visible),
  .kn-input:where(.ng-invalid.ng-touched:focus-visible) {
    outline-color: var(--kn-color-danger);
  }

  .kn-input:where(:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .kn-input:where([data-size='sm']) {
    --_height: var(--kn-size-sm);
    --_radius: var(--kn-radius-sm);
    font-size: var(--kn-text-sm);
  }

  .kn-input:where([data-size='lg']) {
    --_height: var(--kn-size-lg);
    font-size: var(--kn-text-lg);
    padding-inline: var(--kn-input-padding, var(--kn-space-4));
  }

  /* Inside <kn-input-group> the group draws the well. */
  kn-input-group .kn-input {
    flex: 1;
    block-size: 100%;
    padding: 0;
    background: none;
    box-shadow: none;
    outline: none;
    border-radius: 0;
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
      .kn-textarea {
        block-size: auto;
        min-block-size: var(--_height);
        padding-block: var(--kn-space-2);
        resize: none;
        line-height: var(--kn-leading-normal);
      }

      .kn-textarea[data-size='lg'] {
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
  host: { class: 'kn-input', ...host },
})
export class KnInput {
  /** Размер поля. Называется `knSize`, потому что `size` — нативный атрибут `<input>`. */
  readonly knSize = input<KnSize>('md');
  /** Помечает поле невалидным (`aria-invalid`). Внутри `<kn-field>` с ошибкой выставляется само. */
  readonly invalid = input(false, { transform: booleanAttribute });

  protected readonly field = inject(KN_FIELD, { optional: true });
  protected readonly id =
    inject(new HostAttributeToken('id'), { optional: true }) ?? this.field?.controlId ?? null;
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));

  constructor() {
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
  host: { class: 'kn-input kn-textarea', ...host },
})
export class KnTextarea {
  /** Размер поля. */
  readonly knSize = input<KnSize>('md');
  /** Помечает поле невалидным (`aria-invalid`). */
  readonly invalid = input(false, { transform: booleanAttribute });

  protected readonly field = inject(KN_FIELD, { optional: true });
  protected readonly id =
    inject(new HostAttributeToken('id'), { optional: true }) ?? this.field?.controlId ?? null;
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));

  constructor() {
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
  host: { '[attr.data-size]': 'size()' },
  styles: `
    :host {
      --_height: var(--kn-size-md);

      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      box-sizing: border-box;
      block-size: var(--kn-input-height, var(--_height));
      padding: 0 var(--kn-input-padding, var(--kn-space-3));
      border-radius: var(--kn-input-radius, var(--kn-radius-md));
      background: var(--kn-input-bg, var(--kn-color-field));
      box-shadow: inset 0 0 0 1px var(--kn-input-border, var(--kn-color-field-border));
      color: var(--kn-color-text-muted);
    }

    @media (hover: hover) {
      :host(:hover) {
        box-shadow: inset 0 0 0 1px var(--kn-color-field-border-hover);
      }
    }

    :host(:has(:is(input, textarea):focus-visible)) {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -1px;
    }

    :host(:has([aria-invalid='true'], .ng-invalid.ng-touched)) {
      box-shadow: inset 0 0 0 1px var(--kn-color-danger);
      background: var(--kn-color-danger-soft);
    }

    :host(:has(input:disabled)) {
      opacity: 0.5;
    }

    :host([data-size='sm']) {
      --_height: var(--kn-size-sm);
      border-radius: var(--kn-input-radius, var(--kn-radius-sm));
    }

    :host([data-size='lg']) {
      --_height: var(--kn-size-lg);
      padding-inline: var(--kn-input-padding, var(--kn-space-4));
    }
  `,
})
export class KnInputGroup {
  /** Размер группы; вложенному полю задайте тот же `knSize`. */
  readonly size = input<KnSize>('md');
}

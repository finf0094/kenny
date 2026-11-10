import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { KN_FIELD, KnFieldContext } from '@kenny/ui/core';

/**
 * Обёртка поля: подпись, подсказка и текст ошибки. Сама связывает `<label>`,
 * `aria-describedby` и `aria-invalid` с контролом, который в неё спроецирован.
 */
@Component({
  selector: 'kn-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: KN_FIELD, useExisting: KnField }],
  template: `
    @if (label()) {
      <label class="label" [id]="labelId" [attr.for]="controlId">
        {{ label() }}
        @if (required()) {
          <span class="required" aria-hidden="true">*</span>
        }
      </label>
    }
    <ng-content />
    <div class="message" aria-live="polite">
      @if (error()) {
        <p class="error" [id]="errorId">{{ error() }}</p>
      } @else if (hint()) {
        <p class="hint" [id]="hintId">{{ hint() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-1-5);
      min-inline-size: 0;
    }

    .label {
      justify-self: start;
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
      color: var(--kn-color-text);
    }

    .required {
      color: var(--kn-color-danger);
      margin-inline-start: var(--kn-space-0-5);
    }

    .message:empty {
      display: none;
    }

    p {
      margin: 0;
      font-size: var(--kn-text-sm);
      line-height: var(--kn-leading-snug);
      color: var(--kn-color-text-muted);
    }

    .error {
      color: var(--kn-color-danger);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }
  `,
})
export class KnField implements KnFieldContext {
  /** Подпись над полем. */
  readonly label = input<string>('');
  /** Подсказка под полем. */
  readonly hint = input<string>('');
  /** Текст ошибки. Пока он задан, поле считается невалидным и подсказка скрыта. */
  readonly error = input<string | null | undefined>(null);
  /** Показывает отметку обязательного поля рядом с подписью. */
  readonly required = input(false, { transform: booleanAttribute });

  private readonly ids = inject(_IdGenerator);
  readonly controlId = this.ids.getId('kn-field-control-');
  readonly labelId = this.ids.getId('kn-field-label-');
  protected readonly hintId = this.ids.getId('kn-field-hint-');
  protected readonly errorId = this.ids.getId('kn-field-error-');

  readonly describedBy = computed(() =>
    this.error() ? this.errorId : this.hint() ? this.hintId : null,
  );
  readonly invalid = computed(() => !!this.error());
}

import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { KnFormControl, KnSize } from '@kenny/ui/core';

/**
 * Флажок на нативном `<input type="checkbox">`: клавиатура, формы и скринридеры
 * работают как у браузерного элемента, а отметка появляется с пружинной анимацией.
 */
@Component({
  selector: 'kn-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="root">
      <input
        class="native"
        type="checkbox"
        [id]="controlId"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [required]="required()"
        [attr.name]="name() || null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        (change)="toggle($event)"
        (blur)="markTouched()"
      />
      <span class="box" aria-hidden="true">
        <svg class="mark check" viewBox="0 0 16 16"><path d="M3.5 8.4l3 3 6-6.6" /></svg>
        <svg class="mark dash" viewBox="0 0 16 16"><path d="M4 8h8" /></svg>
      </span>
      <span class="label"><ng-content /></span>
    </label>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles: `
    :host {
      --_box: 1.25rem;
      display: inline-flex;
      vertical-align: middle;
    }

    :host([data-size='sm']) {
      --_box: 1.0625rem;
      font-size: var(--kn-text-sm);
    }

    :host([data-size='lg']) {
      --_box: 1.5rem;
      font-size: var(--kn-text-lg);
    }

    .root {
      position: relative;
      display: inline-flex;
      align-items: flex-start;
      gap: var(--kn-space-2);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .native {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      inline-size: var(--_box);
      block-size: var(--_box);
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    .box {
      position: relative;
      flex: none;
      inline-size: var(--_box);
      block-size: var(--_box);
      margin-block-start: calc((1lh - var(--_box)) / 2);
      border-radius: var(--kn-checkbox-radius, var(--kn-radius-xs));
      background: var(--kn-color-field);
      box-shadow: inset 0 0 0 1.5px var(--kn-color-border-strong);
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    /* Accent fill grows from the centre: opacity + scale only */
    .box::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--kn-checkbox-color, var(--kn-color-accent));
      box-shadow: var(--kn-shadow-highlight);
      opacity: 0;
      transform: scale(0.5);
      transition:
        opacity var(--kn-duration-fast) var(--kn-ease-standard),
        transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .mark {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      fill: none;
      stroke: var(--kn-color-on-accent);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
      transform: scale(0.4);
      transition:
        opacity var(--kn-duration-fast) var(--kn-ease-standard),
        transform var(--kn-duration-slow) var(--kn-ease-spring-bouncy);
    }

    .native:checked + .box::before,
    .native:indeterminate + .box::before {
      opacity: 1;
      transform: none;
    }

    .native:checked:not(:indeterminate) + .box .check,
    .native:indeterminate + .box .dash {
      opacity: 1;
      transform: none;
    }

    .root:active .native:not(:disabled) + .box {
      transform: scale(0.9);
    }

    .native:focus-visible + .box {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .native[aria-invalid='true'] + .box {
      box-shadow: inset 0 0 0 1.5px var(--kn-color-danger);
    }

    .root:has(.native:disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .label {
      line-height: var(--kn-leading-snug);
      user-select: none;
    }

    .label:empty {
      display: none;
    }
  `,
})
export class KnCheckbox extends KnFormControl<boolean> {
  /** Отмечен ли флажок. Двусторонняя привязка: `[(checked)]`. */
  readonly checked = model(false);
  /** Промежуточное состояние («выбрано частично»). Сбрасывается при переключении. */
  readonly indeterminate = model(false);
  /** Размер. */
  readonly size = input<KnSize>('md');

  protected readonly model = this.checked;

  protected override coerce(value: boolean): boolean {
    return !!value;
  }

  protected toggle(event: Event): void {
    this.indeterminate.set(false);
    this.commit((event.target as HTMLInputElement).checked);
  }
}

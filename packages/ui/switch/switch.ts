import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { KnFormControl, KnSize } from '@kenny/ui/core';

/**
 * Переключатель для настроек, которые применяются сразу. Нативный checkbox с
 * `role="switch"`; ползунок двигается пружиной и растягивается при нажатии.
 */
@Component({
  selector: 'kn-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="root">
      <input
        class="native"
        type="checkbox"
        role="switch"
        [id]="controlId"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [required]="required()"
        [attr.name]="name() || null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        (change)="commit($any($event.target).checked)"
        (blur)="markTouched()"
      />
      <span class="track" aria-hidden="true"><span class="thumb"></span></span>
      <span class="label"><ng-content /></span>
    </label>
  `,
  host: { '[attr.data-size]': 'size()' },
  styles: `
    :host {
      --_h: 1.5rem;
      --_w: 2.625rem;
      --_gap: 2px;
      display: inline-flex;
      vertical-align: middle;
    }

    :host([data-size='sm']) {
      --_h: 1.25rem;
      --_w: 2.125rem;
      font-size: var(--kn-text-sm);
    }

    :host([data-size='lg']) {
      --_h: 1.875rem;
      --_w: 3.25rem;
      font-size: var(--kn-text-lg);
    }

    .root {
      position: relative;
      display: inline-flex;
      align-items: flex-start;
      gap: var(--kn-space-3);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .native {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      inline-size: var(--_w);
      block-size: var(--_h);
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    .track {
      position: relative;
      flex: none;
      inline-size: var(--_w);
      block-size: var(--_h);
      margin-block-start: calc((1lh - var(--_h)) / 2);
      border-radius: var(--kn-radius-full);
      background: var(--kn-color-border-strong);
      box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.08);
      overflow: hidden;
    }

    /* "On" colour fades in above the "off" track */
    .track::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--kn-switch-color, var(--kn-color-accent));
      opacity: 0;
      transition: opacity var(--kn-duration-normal) var(--kn-ease-standard);
    }

    .thumb {
      position: absolute;
      inset-block: var(--_gap);
      inset-inline-start: var(--_gap);
      inline-size: calc(var(--_h) - var(--_gap) * 2);
      border-radius: var(--kn-radius-full);
      background: #fff;
      box-shadow:
        0 1px 1px rgb(0 0 0 / 0.1),
        0 2px 6px rgb(8 12 28 / 0.22);
      transform-origin: calc(50% - 50% * var(--kn-dir)) 50%;
      transition: transform var(--kn-duration-slow) var(--kn-ease-spring);
    }

    .native:checked + .track::before {
      opacity: 1;
    }

    .native:checked + .track .thumb {
      transform: translateX(calc((var(--_w) - var(--_h)) * var(--kn-dir)));
      transform-origin: calc(50% + 50% * var(--kn-dir)) 50%;
    }

    /* Pressing stretches the thumb towards where it is about to go */
    .root:active .native:not(:disabled) + .track .thumb {
      transform: scaleX(1.18);
    }

    .root:active .native:checked:not(:disabled) + .track .thumb {
      transform: translateX(calc((var(--_w) - var(--_h)) * var(--kn-dir))) scaleX(1.18);
    }

    .native:focus-visible + .track {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .native[aria-invalid='true'] + .track {
      box-shadow: 0 0 0 1.5px var(--kn-color-danger);
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
export class KnSwitch extends KnFormControl<boolean> {
  /** Включён ли переключатель. Двусторонняя привязка: `[(checked)]`. */
  readonly checked = model(false);
  /** Размер. */
  readonly size = input<KnSize>('md');

  protected readonly model = this.checked;

  protected override coerce(value: boolean): boolean {
    return !!value;
  }
}

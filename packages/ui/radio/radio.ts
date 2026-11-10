import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { KnFormControl, KnSize } from '@kenny/ui/core';

/**
 * Группа радиокнопок: один выбор из нескольких. Владеет значением и общим именем,
 * поэтому стрелки и Tab работают по нативным правилам браузера.
 */
@Component({
  selector: 'kn-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-required]': 'required() ? "true" : null',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-orientation]': 'orientation()',
    '(focusout)': 'onFocusOut($event)',
  },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--kn-radio-gap, var(--kn-space-3));
    }

    :host([data-orientation='horizontal']) {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--kn-radio-gap, var(--kn-space-5));
    }
  `,
})
export class KnRadioGroup<T = unknown> extends KnFormControl<T | null> {
  /** Выбранное значение. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<T | null>(null);
  /** Направление раскладки. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Размер всех радиокнопок группы. */
  readonly size = input<KnSize>('md');

  protected readonly model = this.value;
  /** Shared native `name`: this is what makes the browser treat the inputs as one group. */
  readonly groupName = computed(() => this.name() || this.fallbackName);
  private readonly fallbackName = inject(_IdGenerator).getId('kn-radio-group-');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal */
  select(value: T): void {
    this.commit(value);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) {
      this.markTouched();
    }
  }
}

/** Радиокнопка. Используется только внутри `<kn-radio-group>`. */
@Component({
  selector: 'kn-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="root">
      <input
        class="native"
        type="radio"
        [name]="group.groupName()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [required]="group.required()"
        (change)="group.select(value())"
      />
      <span class="circle" aria-hidden="true"></span>
      <span class="label"><ng-content /></span>
    </label>
  `,
  host: { '[attr.data-size]': 'group.size()' },
  styles: `
    :host {
      --_box: 1.25rem;
      display: inline-flex;
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

    .circle {
      position: relative;
      flex: none;
      inline-size: var(--_box);
      block-size: var(--_box);
      margin-block-start: calc((1lh - var(--_box)) / 2);
      border-radius: 50%;
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1.5px var(--kn-color-border-strong);
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .circle::before,
    .circle::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      opacity: 0;
      transition:
        opacity var(--kn-duration-fast) var(--kn-ease-standard),
        transform var(--kn-duration-slow) var(--kn-ease-spring-bouncy);
    }

    .circle::before {
      background: var(--kn-radio-color, var(--kn-color-accent));
      box-shadow: inset 0 1px 0 0 rgb(255 255 255 / 0.22);
      transform: scale(0.5);
    }

    .circle::after {
      inset: 30%;
      background: var(--kn-color-on-accent);
      transform: scale(0.2);
    }

    .native:checked + .circle::before,
    .native:checked + .circle::after {
      opacity: 1;
      transform: none;
    }

    .root:active .native:not(:disabled) + .circle {
      transform: scale(0.9);
    }

    .native:focus-visible + .circle {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .root:has(.native:disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .label {
      line-height: var(--kn-leading-snug);
      user-select: none;
    }
  `,
})
export class KnRadio<T = unknown> {
  /** Значение, которое получит группа при выборе. */
  readonly value = input.required<T>();
  /** Отключает только эту радиокнопку. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject<KnRadioGroup<T>>(KnRadioGroup);
  protected readonly checked = computed(() => this.group.value() === this.value());
  protected readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
}

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { knDefaultSize, KnFormControl, KnSize, useRipple } from '@kenny/ui/core';

/**
 * Группа кнопок-переключателей: выравнивание текста, режим отображения, набор фильтров.
 * Одиночный выбор хранит значение, множественный (`multiple`) — массив значений.
 *
 * Стрелки переводят фокус между кнопками, Tab уходит из группы — как в панели
 * инструментов.
 */
@Component({
  selector: 'kn-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-size]': 'size()',
    '[attr.data-stretch]': 'stretch() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  styles: `
    :host {
      --_h: var(--kn-size-md);
      display: inline-flex;
      align-items: stretch;
      gap: var(--kn-toggle-group-gap, 2px);
      box-sizing: border-box;
      max-inline-size: 100%;
      padding: var(--kn-toggle-group-padding, 3px);
      border-radius: var(--kn-toggle-group-radius, var(--kn-radius-control));
      background: var(--kn-toggle-group-bg, var(--kn-color-surface-sunken));
      vertical-align: middle;
    }

    :host([data-size='sm']) {
      --_h: var(--kn-size-sm);
      font-size: var(--kn-text-sm);
    }

    :host([data-size='lg']) {
      --_h: var(--kn-size-lg);
      font-size: var(--kn-text-lg);
    }

    :host([data-stretch]) {
      display: flex;
    }

    :host([aria-invalid='true']) {
      box-shadow: inset 0 0 0 1.5px var(--kn-color-danger);
    }
  `,
})
export class KnToggleGroup<T = unknown> extends KnFormControl<T | T[] | null> {
  /**
   * Выбранное значение, а при `multiple` — массив значений.
   * Двусторонняя привязка: `[(value)]`.
   */
  readonly value = model<T | T[] | null>(null);
  /** Разрешает выбрать несколько кнопок. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** При одиночном выборе запрещает снять выбор повторным нажатием. */
  readonly requireSelection = input(false, { transform: booleanAttribute });
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());
  /** Растягивает кнопки на всю ширину контейнера. */
  readonly stretch = input(false, { transform: booleanAttribute });

  protected readonly model = this.value;
  private readonly toggles = contentChildren<KnToggle<T>>(forwardRef(() => KnToggle));
  private readonly dir = inject(Directionality, { optional: true });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** @internal */
  readonly selection = computed<readonly T[]>(() => {
    const value = this.value();
    if (value === null || value === undefined) return [];
    return this.multiple() && Array.isArray(value) ? value : [value as T];
  });

  /** @internal The one button that is in the tab order: the first pressed, else the first enabled. */
  readonly tabStop = computed(() => {
    const enabled = this.toggles().filter((toggle) => !toggle.isDisabled());
    const focused = this.focused();
    if (focused && enabled.includes(focused)) return focused;
    return enabled.find((toggle) => toggle.pressed()) ?? enabled[0];
  });
  /** @internal The button that holds the focus: the tab stop follows it while it is inside. */
  readonly focused = signal<KnToggle<T> | null>(null);

  protected override coerce(value: T | T[] | null): T | T[] | null {
    return value ?? null;
  }

  /** @internal */
  toggle(value: T): void {
    const selection = this.selection();
    const pressed = selection.includes(value);
    if (this.multiple()) {
      this.commit(pressed ? selection.filter((item) => item !== value) : [...selection, value]);
    } else if (!pressed) {
      this.commit(value);
    } else if (!this.requireSelection()) {
      this.commit(null);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const buttons = Array.from(
      this.element.querySelectorAll<HTMLButtonElement>('button[kn-toggle]:not(:disabled)'),
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const step = this.dir?.value === 'rtl' ? -1 : 1;
    let next: HTMLButtonElement | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = buttons[(index + step + buttons.length) % buttons.length];
        break;
      case 'ArrowLeft':
        next = buttons[(index - step + buttons.length) % buttons.length];
        break;
      case 'Home':
        next = buttons[0];
        break;
      case 'End':
        next = buttons[buttons.length - 1];
        break;
    }
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  protected onFocusOut(event: FocusEvent): void {
    if (this.element.contains(event.relatedTarget as Node | null)) return;
    this.focused.set(null);
    this.markTouched();
  }
}

/** Кнопка-переключатель внутри `<kn-toggle-group>`. Иконке без текста нужен `aria-label`. */
@Component({
  selector: 'button[kn-toggle]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    type: 'button',
    '[attr.aria-pressed]': 'pressed()',
    '[disabled]': 'isDisabled()',
    '[attr.tabindex]': 'tabindex()',
    '(click)': 'group.toggle(value())',
    '(focus)': 'group.focused.set(this)',
  },
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      flex: 0 1 auto;
      align-items: center;
      justify-content: center;
      gap: var(--kn-space-2);
      box-sizing: border-box;
      min-inline-size: calc(var(--_h) - 6px);
      block-size: calc(var(--_h) - 6px);
      padding: 0 var(--kn-space-3);
      border: 0;
      border-radius: var(
        --kn-toggle-radius,
        calc(var(--kn-toggle-group-radius, var(--kn-radius-control)) - 2px)
      );
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      font-weight: var(--kn-weight-medium);
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      isolation: isolate;
      -webkit-tap-highlight-color: transparent;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    :host-context(kn-toggle-group[data-stretch]) {
      flex: 1 1 0;
    }

    /* Pressed: a raised thumb fades and settles in under the label */
    :host::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background: var(--kn-toggle-thumb, var(--kn-color-surface-raised));
      box-shadow: var(
        --kn-toggle-thumb-shadow,
        var(--kn-shadow-xs),
        0 0 0 0.5px var(--kn-color-border)
      );
      opacity: 0;
      transform: scale(0.9);
      transition:
        opacity var(--kn-duration-fast) var(--kn-ease-standard),
        transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    :host([aria-pressed='true']) {
      color: var(--kn-toggle-color, var(--kn-color-text));
    }

    :host([aria-pressed='true'])::before {
      opacity: 1;
      transform: none;
    }

    @media (hover: hover) {
      :host(:hover:not(:disabled):not([aria-pressed='true'])) {
        color: var(--kn-color-text);
      }
    }

    :host(:active:not(:disabled)) {
      transform: scale(var(--kn-press-scale));
      transition-duration: var(--kn-duration-instant);
    }

    :host(:focus-visible) {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 1px;
    }

    :host(:disabled) {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `,
})
export class KnToggle<T = unknown> {
  /** Значение кнопки. */
  readonly value = input.required<T>();
  /** Отключает кнопку. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject<KnToggleGroup<T>>(KnToggleGroup);
  /** @internal */
  readonly pressed = computed(() => this.group.selection().includes(this.value()));
  /** @internal */
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
  protected readonly tabindex = computed(() => (this.group.tabStop() === this ? 0 : -1));

  constructor() {
    useRipple();
  }
}

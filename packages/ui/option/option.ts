import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  InjectionToken,
  input,
  Signal,
  signal,
} from '@angular/core';
import { _IdGenerator, Highlightable } from '@angular/cdk/a11y';
import { KnIcon } from '@kenny/ui/icon';

/** What a listbox owner (Select, Combobox) provides to its options. */
export interface KnOptionParent<T = unknown> {
  isSelected(value: T): boolean;
  /** Called when the user picks the option with a pointer. */
  pick(option: KnOption<T>): void;
  /** Called when the pointer moves over the option. */
  activate(option: KnOption<T>): void;
  /** Lower-cased text the options are filtered by; empty string disables filtering. */
  readonly filter?: Signal<string>;
}

export const KN_OPTION_PARENT = new InjectionToken<KnOptionParent>('KN_OPTION_PARENT');

/**
 * Вариант в списке Select или Combobox. Подсвечивается виртуальным фокусом
 * (`aria-activedescendant`), настоящий фокус остаётся на поле.
 */
@Component({
  selector: 'kn-option',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="text"><ng-content /></span>
    <kn-icon class="check" name="check" />
  `,
  host: {
    role: 'option',
    '[id]': 'id',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabledInput() ? "true" : null',
    '[attr.data-active]': 'active() ? "" : null',
    '[hidden]': 'hidden()',
    '(click)': 'onClick()',
    '(pointermove)': 'onPointerMove()',
  },
  styles: `
    :host {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      min-block-size: 2.125rem;
      padding: var(--kn-space-1-5) var(--kn-space-2) var(--kn-space-1-5) var(--kn-space-3);
      border-radius: var(--kn-radius-sm);
      font-size: var(--kn-text-md);
      line-height: var(--kn-leading-snug);
      color: var(--kn-color-text);
      cursor: pointer;
      user-select: none;
      scroll-margin: var(--kn-space-1-5);
    }

    :host([hidden]) {
      display: none;
    }

    :host([data-active]) {
      background: var(--kn-color-selection);
      color: var(--kn-color-on-selection);
    }

    :host([aria-disabled='true']) {
      color: var(--kn-color-text-disabled);
      cursor: not-allowed;
    }

    .text {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .check {
      --kn-icon-size: 1rem;
      opacity: 0;
      transform: scale(0.5);
      transition:
        opacity var(--kn-duration-fast) var(--kn-ease-standard),
        transform var(--kn-duration-normal) var(--kn-ease-spring-bouncy);
    }

    :host([aria-selected='true']) .check {
      opacity: 1;
      transform: none;
    }

    :host([aria-selected='true']) {
      font-weight: var(--kn-weight-medium);
    }
  `,
})
export class KnOption<T = unknown> implements Highlightable {
  /** Значение варианта. */
  readonly value = input.required<T>();
  /** Текст для поиска и отображения в поле. По умолчанию — текстовое содержимое. */
  readonly label = input<string | undefined>(undefined);
  /** Запрещает выбор варианта. */
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  private readonly parent = inject<KnOptionParent<T>>(KN_OPTION_PARENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly id = inject(_IdGenerator).getId('kn-option-');

  protected readonly active = signal(false);
  readonly selected = computed(() => this.parent.isSelected(this.value()));
  readonly hidden = computed(() => {
    const filter = this.parent.filter?.() ?? '';
    return filter !== '' && !this.text().toLowerCase().includes(filter);
  });

  /** `Highlightable` contract (a plain property, read by the CDK key manager). */
  get disabled(): boolean {
    return this.disabledInput() || this.hidden();
  }

  /** Text used for display, type-ahead and filtering. */
  text(): string {
    return this.label() ?? this.element.textContent?.trim() ?? '';
  }

  getLabel(): string {
    return this.text();
  }

  setActiveStyles(): void {
    this.active.set(true);
    this.element.scrollIntoView?.({ block: 'nearest' });
  }

  setInactiveStyles(): void {
    this.active.set(false);
  }

  protected onClick(): void {
    if (!this.disabledInput()) {
      this.parent.pick(this);
    }
  }

  protected onPointerMove(): void {
    if (!this.disabledInput() && !this.active()) {
      this.parent.activate(this);
    }
  }
}

/** Именованная группа вариантов. */
@Component({
  selector: 'kn-option-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="label" [id]="labelId">{{ label() }}</div>
    <ng-content />
  `,
  host: { role: 'group', '[attr.aria-labelledby]': 'labelId' },
  styles: `
    :host {
      display: block;
    }

    :host:not(:first-child) {
      margin-block-start: var(--kn-space-1);
      padding-block-start: var(--kn-space-1);
      border-block-start: 1px solid var(--kn-color-border);
    }

    :host(:not(:has(kn-option:not([hidden])))) {
      display: none;
    }

    .label {
      padding: var(--kn-space-1-5) var(--kn-space-3) var(--kn-space-1);
      font-size: var(--kn-text-xs);
      font-weight: var(--kn-weight-semibold);
      color: var(--kn-color-text-subtle);
    }
  `,
})
export class KnOptionGroup {
  /** Заголовок группы. */
  readonly label = input.required<string>();
  protected readonly labelId = inject(_IdGenerator).getId('kn-option-group-');
}

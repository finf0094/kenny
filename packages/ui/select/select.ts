import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  contentChildren,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  ModelSignal,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { _IdGenerator, ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import {
  KnAnchoredOverlay,
  knDefaultSize,
  KnFormControl,
  KnSize,
  useControlStyles,
  injectKnLabels,
} from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';
import { KN_OPTION_PARENT, KnOption, KnOptionParent } from '@kenny/ui/option';

/** Shared by the single and the multiple select: one look, one behaviour. */
const template = `
    <button
      #trigger
      class="trigger kn-control"
      type="button"
      role="combobox"
      [attr.data-size]="size()"
      aria-haspopup="listbox"
      [id]="controlId"
      [disabled]="isDisabled()"
      [attr.aria-expanded]="overlay.isOpen()"
      [attr.aria-controls]="overlay.isOpen() ? listId : null"
      [attr.aria-activedescendant]="overlay.isOpen() ? activeId() : null"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="labelledBy() ? labelledBy() + ' ' + valueId : null"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-invalid]="isInvalid() ? 'true' : null"
      [attr.aria-required]="required() ? 'true' : null"
      (click)="toggle()"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    >
      <span class="value" [id]="valueId" [class.placeholder]="!selectedText()">
        {{ selectedText() || (placeholder() ?? labels().select.placeholder) }}
      </span>
      <kn-icon class="chevron" name="chevrons-up-down" />
    </button>

    <ng-template #panel>
      <div
        class="panel"
        role="listbox"
        tabindex="-1"
        [id]="listId"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-multiselectable]="multiple ? 'true' : null"
        (mousedown)="$event.preventDefault()"
      >
        <ng-content />
      </div>
    </ng-template>
`;

const styles = `
    :host {
      display: block;
      min-inline-size: 0;
    }

    /* The well comes from the shared kn-control class */
    .trigger {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      inline-size: 100%;
      padding: 0 var(--kn-space-2) 0 var(--kn-field-padding, var(--kn-space-3));
      text-align: start;
      cursor: pointer;
    }

    .trigger[data-size='lg'] {
      padding-inline-start: var(--kn-field-padding, var(--kn-space-4));
    }

    .value {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .placeholder {
      color: var(--kn-color-text-subtle);
    }

    .chevron {
      --kn-icon-size: 1.125rem;
      color: var(--kn-color-text-subtle);
    }

    .panel {
      box-sizing: border-box;
      inline-size: 100%;
      max-block-size: min(20rem, 60vh);
      padding: var(--kn-space-1-5);
      overflow-y: auto;
      overscroll-behavior: contain;
      border-radius: calc(var(--kn-radius-sm) + var(--kn-space-1-5));
      background: var(--kn-select-panel-bg, var(--kn-color-surface-raised));
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-select-panel-shadow, var(--kn-elevation-popup));
      outline: none;
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .panel[data-kn-state='closing'] {
      animation: kn-pop-out var(--kn-duration-fast) var(--kn-ease-in) forwards;
      pointer-events: none;
    }
`;

/** @internal Everything the two selects have in common. */
@Directive()
export abstract class KnSelectBase<T, V> extends KnFormControl<V> implements KnOptionParent<T> {
  protected readonly labels = injectKnLabels();
  /** The public model: one value or a list of them. */
  abstract readonly value: ModelSignal<V>;
  /** Several values at once: the list stays open and the value is an array. */
  protected abstract readonly multiple: boolean;
  /** Текст, пока ничего не выбрано. По умолчанию — из `provideKnLabels`. */
  readonly placeholder = input<string>();
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());
  /** Сравнение значений; нужно, если значения — объекты. */
  readonly compareWith = input<(a: T | null, b: T | null) => boolean>(Object.is);

  protected readonly overlay = new KnAnchoredOverlay();
  private readonly ids = inject(_IdGenerator);
  protected readonly listId = this.ids.getId('kn-select-list-');
  protected readonly valueId = this.ids.getId('kn-select-value-');

  private readonly options = contentChildren<KnOption<T>>(KnOption, { descendants: true });
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly keyManager = new ActiveDescendantKeyManager(this.options, inject(Injector))
    .withHomeAndEnd()
    .withPageUpDown()
    .withTypeAhead(300);
  protected readonly activeId = signal<string | null>(null);

  /** The value as a list, whatever the mode. */
  private readonly selection = computed<readonly T[]>(() => {
    const value: unknown = this.value();
    if (value === null || value === undefined) return [];
    return this.multiple ? (value as T[]) : [value as T];
  });
  private readonly selectedOptions = computed(() =>
    this.options().filter((option) => this.isSelected(option.value())),
  );
  /** Texts of the chosen options, in the order of the list. */
  protected readonly selectedText = computed(() =>
    this.selectedOptions()
      .map((option) => option.text())
      .join(', '),
  );

  constructor() {
    super();
    useControlStyles();
    this.keyManager.change.subscribe(() => {
      const active = this.keyManager.activeItem;
      this.activeId.set(active?.id ?? null);
      // Type-ahead on a closed select changes the value directly (the match arrives debounced).
      // Not in multiple mode: there a letter must not silently add or drop a value.
      if (active && !active.disabled && !this.overlay.isOpen() && !this.multiple) {
        this.commit(active.value() as unknown as V);
      }
    });
    this.overlay.dismissed.subscribe(() => void this.close());
  }

  isSelected(value: T): boolean {
    const same = this.compareWith();
    return this.selection().some((item) => same(item, value));
  }

  pick(option: KnOption<T>): void {
    const value = option.value();
    if (!this.multiple) {
      this.commit(value as unknown as V);
      void this.close();
      return;
    }
    const same = this.compareWith();
    const selection = this.selection();
    const next = this.isSelected(value)
      ? selection.filter((item) => !same(item, value))
      : [...selection, value];
    this.commit(next as unknown as V);
  }

  activate(option: KnOption<T>): void {
    this.keyManager.setActiveItem(option);
  }

  /** Открывает список. */
  open(): void {
    if (this.overlay.isOpen() || this.isDisabled()) {
      return;
    }
    this.overlay.open({
      origin: this.trigger(),
      template: this.panel(),
      placement: 'bottom-start',
      offset: 6,
      matchWidth: true,
      transformOriginOn: '.panel',
    });
    const selected = this.selectedOptions()[0];
    if (selected) {
      this.keyManager.setActiveItem(selected);
    } else {
      this.keyManager.setFirstItemActive();
    }
  }

  /** Закрывает список. */
  async close(): Promise<void> {
    await this.overlay.close();
  }

  protected toggle(): void {
    if (this.overlay.isOpen()) {
      void this.close();
    } else {
      this.open();
    }
  }

  protected onBlur(): void {
    this.markTouched();
    void this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const { key } = event;
    const open = this.overlay.isOpen();
    const printable =
      key.length === 1 && key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(key)) {
        event.preventDefault();
        this.open();
        if (key === 'Home') this.keyManager.setFirstItemActive();
        if (key === 'End') this.keyManager.setLastItemActive();
      } else if (printable) {
        this.keyManager.onKeydown(event);
      }
      return;
    }

    if (key === 'Enter' || key === ' ' || key === 'Tab' || (key === 'ArrowUp' && event.altKey)) {
      const active = this.keyManager.activeItem;
      // Tab leaves a multiple select as it is: only Enter and Space change the selection
      const picks = key !== 'Tab' || !this.multiple;
      if (picks && active && !active.disabled && !this.keyManager.isTyping()) {
        if (key !== 'Tab') event.preventDefault();
        this.pick(active);
        return;
      }
      if (key === 'Tab') {
        void this.close();
        return;
      }
    }
    this.keyManager.onKeydown(event);
  }
}

/**
 * Выбор одного значения из списка. Реализует паттерн APG «Select-Only Combobox»:
 * фокус остаётся на поле, варианты подсвечиваются через `aria-activedescendant`,
 * работает поиск по первым буквам.
 */
@Component({
  selector: 'kn-select',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: KN_OPTION_PARENT, useExisting: KnSelect }],
  template,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles,
})
export class KnSelect<T = unknown> extends KnSelectBase<T, T | null> {
  /** Выбранное значение. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<T | null>(null);
  protected readonly model = this.value;
  protected readonly multiple = false;

  protected override coerce(value: T | null): T | null {
    return value ?? null;
  }
}

/**
 * Выбор нескольких значений из списка: значение — массив, список не закрывается после
 * выбора, выбранные перечислены в поле в порядке списка. Тот же паттерн APG, что у
 * `kn-select`, с `aria-multiselectable`.
 */
@Component({
  selector: 'kn-multi-select',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: KN_OPTION_PARENT, useExisting: KnMultiSelect }],
  template,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles,
})
export class KnMultiSelect<T = unknown> extends KnSelectBase<T, T[]> {
  /** Выбранные значения. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<T[]>([]);
  protected readonly model = this.value;
  protected readonly multiple = true;

  protected override coerce(value: T[]): T[] {
    return Array.isArray(value) ? value : [];
  }
}

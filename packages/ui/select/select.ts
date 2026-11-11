import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  Injector,
  input,
  model,
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
  template: `
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
        (mousedown)="$event.preventDefault()"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles: `
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
  `,
})
export class KnSelect<T = unknown> extends KnFormControl<T | null> implements KnOptionParent<T> {
  protected readonly labels = injectKnLabels();
  /** Выбранное значение. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<T | null>(null);
  /** Текст, пока ничего не выбрано. По умолчанию — из `provideKnLabels`. */
  readonly placeholder = input<string>();
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());
  /** Сравнение значений; нужно, если значения — объекты. */
  readonly compareWith = input<(a: T | null, b: T | null) => boolean>(Object.is);

  protected readonly model = this.value;
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

  private readonly selectedOption = computed(() =>
    this.options().find((option) => this.compareWith()(option.value(), this.value())),
  );
  protected readonly selectedText = computed(() => this.selectedOption()?.text() ?? '');

  constructor() {
    super();
    useControlStyles();
    this.keyManager.change.subscribe(() => {
      const active = this.keyManager.activeItem;
      this.activeId.set(active?.id ?? null);
      // Type-ahead on a closed select changes the value directly (the match arrives debounced).
      if (active && !active.disabled && !this.overlay.isOpen()) {
        this.commit(active.value());
      }
    });
    this.overlay.dismissed.subscribe(() => void this.close());
  }

  isSelected(value: T): boolean {
    return this.compareWith()(value, this.value());
  }

  pick(option: KnOption<T>): void {
    this.commit(option.value());
    void this.close();
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
    const selected = this.selectedOption();
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
      if (active && !active.disabled && !this.keyManager.isTyping()) {
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

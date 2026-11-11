import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
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
 * Поле с автодополнением: текст фильтрует список, значение выбирается из вариантов.
 * Паттерн APG «Editable Combobox With List Autocomplete».
 */
@Component({
  selector: 'kn-combobox',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: KN_OPTION_PARENT, useExisting: KnCombobox }],
  template: `
    <div
      #control
      class="control kn-control"
      [attr.data-size]="size()"
      [attr.data-invalid]="isInvalid() ? '' : null"
    >
      <input
        #input
        class="input"
        type="text"
        role="combobox"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        aria-autocomplete="list"
        [id]="controlId"
        [value]="displayText()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.name]="name() || null"
        [attr.aria-expanded]="overlay.isOpen()"
        [attr.aria-controls]="overlay.isOpen() ? listId : null"
        [attr.aria-activedescendant]="overlay.isOpen() ? activeId() : null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-required]="required() ? 'true' : null"
        (input)="onInput($any($event.target).value)"
        (keydown)="onKeydown($event)"
        (click)="open()"
        (blur)="onBlur()"
      />
      @if (clearable() && value() !== null && !isDisabled()) {
        <button
          class="affix"
          type="button"
          tabindex="-1"
          [attr.aria-label]="labels().combobox.clear"
          (mousedown)="$event.preventDefault()"
          (click)="clear()"
        >
          <kn-icon name="x" />
        </button>
      }
      <button
        class="affix"
        type="button"
        tabindex="-1"
        [attr.aria-label]="labels().combobox.toggle"
        [disabled]="isDisabled()"
        (mousedown)="$event.preventDefault()"
        (click)="toggle()"
      >
        <kn-icon
          class="chevron"
          name="chevron-down"
          [attr.data-open]="overlay.isOpen() ? '' : null"
        />
      </button>
    </div>

    <ng-template #panel>
      <div
        class="panel"
        role="listbox"
        [id]="listId"
        [attr.aria-label]="ariaLabel() || placeholder() || labels().combobox.options"
        (mousedown)="$event.preventDefault()"
      >
        <ng-content />
        @if (visibleCount() === 0) {
          <div class="empty">{{ emptyText() ?? labels().combobox.empty }}</div>
        }
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
    .control {
      display: flex;
      align-items: center;
      padding-inline: var(--kn-field-padding, var(--kn-space-3)) var(--kn-space-1);
    }

    .input {
      flex: 1;
      min-inline-size: 0;
      block-size: 100%;
      padding: 0;
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      outline: none;
    }

    .input::placeholder {
      color: var(--kn-color-text-subtle);
      opacity: 1;
    }

    .input:disabled {
      cursor: not-allowed;
    }

    .affix {
      display: grid;
      place-items: center;
      flex: none;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-control);
      background: none;
      color: var(--kn-color-text-subtle);
      cursor: pointer;
    }

    .affix:hover:not(:disabled) {
      color: var(--kn-color-text);
      background: var(--kn-color-hover);
    }

    .affix kn-icon {
      --kn-icon-size: 1.125rem;
    }

    .chevron {
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .chevron[data-open] {
      transform: rotate(180deg);
    }

    .panel {
      box-sizing: border-box;
      inline-size: 100%;
      max-block-size: min(20rem, 60vh);
      padding: var(--kn-space-1-5);
      overflow-y: auto;
      overscroll-behavior: contain;
      border-radius: calc(var(--kn-radius-sm) + var(--kn-space-1-5));
      background: var(--kn-combobox-panel-bg, var(--kn-color-surface-raised));
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-combobox-panel-shadow, var(--kn-elevation-popup));
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .panel[data-kn-state='closing'] {
      animation: kn-pop-out var(--kn-duration-fast) var(--kn-ease-in) forwards;
      pointer-events: none;
    }

    .empty {
      padding: var(--kn-space-4) var(--kn-space-3);
      text-align: center;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export class KnCombobox<T = unknown> extends KnFormControl<T | null> implements KnOptionParent<T> {
  protected readonly labels = injectKnLabels();
  /** Выбранное значение. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<T | null>(null);
  /** Текст, который пользователь набирает прямо сейчас (пустая строка вне ввода). Привяжите `[(query)]`, чтобы загружать варианты с сервера. */
  readonly query = model('');
  /** Подсказка в пустом поле. */
  readonly placeholder = input<string>('');
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());
  /** `auto` — варианты фильтруются по тексту сами; `manual` — список формирует приложение. */
  readonly filterMode = input<'auto' | 'manual'>('auto');
  /** Показывать кнопку очистки, когда значение выбрано. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Текст, когда ни один вариант не подошёл. */
  readonly emptyText = input<string>();
  /** Сравнение значений; нужно, если значения — объекты. */
  readonly compareWith = input<(a: T | null, b: T | null) => boolean>(Object.is);

  protected readonly model = this.value;
  protected readonly overlay = new KnAnchoredOverlay();
  protected readonly listId = inject(_IdGenerator).getId('kn-combobox-list-');

  private readonly options = contentChildren<KnOption<T>>(KnOption, { descendants: true });
  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');

  /** True from the first keystroke until the list closes: the box shows the typed text. */
  private readonly editing = signal(false);
  /** Label of the last picked option, for lists where the option is no longer rendered. */
  private readonly pickedText = signal('');
  /** What the user typed since the list opened; drives filtering. */
  private readonly typed = signal('');
  readonly filter = computed(() =>
    this.filterMode() === 'auto' ? this.typed().trim().toLowerCase() : '',
  );
  protected readonly visibleCount = computed(
    () => this.options().filter((option) => !option.hidden()).length,
  );

  private readonly keyManager = new ActiveDescendantKeyManager(this.options, inject(Injector))
    .withHomeAndEnd(false)
    .withWrap();
  protected readonly activeId = signal<string | null>(null);

  private readonly selectedOption = computed(() =>
    this.options().find((option) => this.compareWith()(option.value(), this.value())),
  );

  /**
   * Text in the box: what is being typed, otherwise the label of the selected option.
   * Evaluated from the template, i.e. after the projected options received their inputs.
   */
  protected readonly displayText = computed(() => {
    if (this.editing()) return this.query();
    if (this.value() === null) return '';
    return this.selectedOption()?.text() ?? this.pickedText();
  });

  constructor() {
    super();
    useControlStyles();
    this.keyManager.change.subscribe(() =>
      this.activeId.set(this.keyManager.activeItem?.id ?? null),
    );
    this.overlay.dismissed.subscribe(() => void this.close());
    // Highlight the first match as the list narrows.
    effect(() => {
      this.filter();
      this.options();
      if (untracked(this.overlay.isOpen) && untracked(this.typed) !== '') {
        untracked(() => this.keyManager.setFirstItemActive());
      }
    });
  }

  isSelected(value: T): boolean {
    return this.compareWith()(value, this.value());
  }

  pick(option: KnOption<T>): void {
    this.pickedText.set(option.text());
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
      origin: this.control(),
      template: this.panel(),
      placement: 'bottom-start',
      offset: 6,
      matchWidth: true,
      transformOriginOn: '.panel',
    });
    const selected = this.selectedOption();
    if (selected && !selected.hidden()) {
      this.keyManager.setActiveItem(selected);
    } else {
      this.keyManager.setActiveItem(-1);
    }
  }

  /** Закрывает список. Несохранённый текст в поле сбрасывается к выбранному значению. */
  async close(): Promise<void> {
    this.editing.set(false);
    this.typed.set('');
    if (this.query() !== '') this.query.set('');
    await this.overlay.close();
  }

  /** Сбрасывает значение и текст. */
  clear(): void {
    this.commit(null);
    this.editing.set(false);
    this.query.set('');
    this.typed.set('');
    this.inputElement().nativeElement.focus();
  }

  protected toggle(): void {
    this.inputElement().nativeElement.focus();
    if (this.overlay.isOpen()) {
      void this.close();
    } else {
      this.open();
    }
  }

  protected onInput(text: string): void {
    this.editing.set(true);
    this.query.set(text);
    this.typed.set(text);
    if (text === '' && this.value() !== null) {
      this.commit(null);
    }
    this.open();
  }

  protected onBlur(): void {
    this.markTouched();
    void this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const open = this.overlay.isOpen();
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          this.open();
          if (this.keyManager.activeItemIndex === -1) {
            if (event.key === 'ArrowDown') this.keyManager.setFirstItemActive();
            else this.keyManager.setLastItemActive();
          }
        } else {
          this.keyManager.onKeydown(event);
        }
        break;
      case 'Enter': {
        const active = this.keyManager.activeItem;
        if (open && active && !active.disabled) {
          event.preventDefault();
          this.pick(active);
        }
        break;
      }
      case 'Escape':
        if (!open && this.value() !== null) {
          event.preventDefault();
          this.clear();
        }
        break;
    }
  }
}

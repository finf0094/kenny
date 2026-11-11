import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import {
  injectKnLabels,
  knDefaultSize,
  KnFormControl,
  KnSize,
  useControlStyles,
} from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

/** Why a typed tag was not added. */
export type KnTagRejection = 'duplicate' | 'limit' | 'invalid';

/**
 * Поле со списком значений: метки, адреса, ключевые слова. Значение — массив строк.
 * Enter и запятая добавляют тег, Backspace в пустом поле убирает последний, вставка
 * текста с разделителями добавляет сразу несколько.
 */
@Component({
  selector: 'kn-tag-input',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="control kn-control"
      [attr.data-size]="size()"
      [attr.data-invalid]="isInvalid() ? '' : null"
      (click)="focus()"
    >
      <ul class="tags" role="list" [attr.aria-label]="labels().tagInput.selected">
        @for (tag of value(); track tag; let i = $index) {
          <li class="tag" [attr.data-marked]="marked() === i ? '' : null">
            <span class="tag-text">{{ tag }}</span>
            <button
              class="remove"
              type="button"
              tabindex="-1"
              [disabled]="isDisabled()"
              [attr.aria-label]="labels().tagInput.remove(tag)"
              (click)="remove(i); $event.stopPropagation()"
            >
              <kn-icon name="x" />
            </button>
          </li>
        }
      </ul>
      <input
        #input
        class="input"
        type="text"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        enterkeyhint="done"
        [id]="controlId"
        [value]="text()"
        [placeholder]="value().length ? '' : placeholder()"
        [disabled]="isDisabled()"
        [attr.name]="name() || null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-describedby]="describedBy() ? describedBy() + ' ' + statusId : statusId"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-required]="required() ? 'true' : null"
        (input)="onInput($any($event.target).value)"
        (keydown)="onKeydown($event)"
        (paste)="onPaste($event)"
        (blur)="onBlur()"
      />
    </div>
    <span class="sr" role="status" [id]="statusId">{{ announcement() }}</span>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles: `
    :host {
      position: relative;
      display: block;
      min-inline-size: 0;
    }

    /* The well comes from the shared kn-control class; it grows with the tags */
    .control {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-1);
      block-size: auto;
      min-block-size: var(--_h);
      padding: var(--kn-space-1) var(--kn-field-padding, var(--kn-space-2));
      cursor: text;
    }

    .tags {
      display: contents;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      max-inline-size: 100%;
      block-size: calc(var(--_h) - 0.625rem);
      padding-inline-start: var(--kn-space-2);
      border-radius: var(--kn-tag-radius, var(--kn-radius-sm));
      background: var(--kn-tag-bg, var(--kn-color-surface-sunken));
      color: var(--kn-tag-color, var(--kn-color-text));
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
      line-height: 1;
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }

    /* Backspace marks the last tag before removing it: a second press confirms */
    .tag[data-marked] {
      background: var(--kn-color-danger-soft);
      color: var(--kn-color-danger);
    }

    .tag-text {
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .remove {
      position: relative;
      flex: none;
      display: grid;
      place-items: center;
      inline-size: 1.375rem;
      block-size: 100%;
      padding: 0;
      border: 0;
      border-radius: inherit;
      background: none;
      color: inherit;
      cursor: pointer;
    }

    .remove:disabled {
      cursor: not-allowed;
    }

    .remove kn-icon {
      --kn-icon-size: 0.75rem;
      opacity: 0.7;
    }

    @media (hover: hover) {
      .remove:hover:not(:disabled) kn-icon {
        opacity: 1;
      }
    }

    .input {
      flex: 1 1 5rem;
      min-inline-size: 5rem;
      block-size: calc(var(--_h) - 0.625rem);
      padding: 0 var(--kn-space-1);
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

    .sr {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class KnTagInput extends KnFormControl<string[]> {
  /** Теги. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<string[]>([]);
  /** Текст в пустом поле. */
  readonly placeholder = input<string>('');
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());
  /** Наибольшее число тегов. */
  readonly max = input<number | null, unknown>(null, {
    transform: (value) => (value === null || value === undefined ? null : numberAttribute(value)),
  });
  /** Символы, которые завершают тег при вводе и разбивают вставленный текст. */
  readonly separators = input<string>(',;');
  /** Разрешает одинаковые теги. Сравнение — без учёта регистра. */
  readonly allowDuplicates = input(false, { transform: booleanAttribute });
  /** Проверка тега перед добавлением: верните `false`, чтобы отклонить. */
  readonly validate = input<(tag: string) => boolean>(() => true);
  /** Тег не добавлен: дубликат, превышен лимит или не прошёл проверку. */
  readonly rejected = output<{ tag: string; reason: KnTagRejection }>();

  protected readonly model = this.value;
  protected readonly labels = injectKnLabels();
  protected readonly text = signal('');
  /** Index of the tag that the next Backspace will remove. */
  protected readonly marked = signal<number | null>(null);
  protected readonly announcement = signal('');
  protected readonly statusId = inject(_IdGenerator).getId('kn-tag-status-');
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  private readonly splitter = computed(() => {
    const escaped = this.separators().replace(/[\\\]^-]/g, '\\$&');
    return new RegExp(`[${escaped}\\n\\t]+`);
  });

  constructor() {
    super();
    useControlStyles();
  }

  protected override coerce(value: string[]): string[] {
    return Array.isArray(value) ? value : [];
  }

  /** Переводит фокус в поле. */
  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  /** Добавляет тег. Возвращает `false`, если он отклонён. */
  add(raw: string): boolean {
    const tag = raw.trim();
    if (!tag) return false;
    const tags = this.value();
    const max = this.max();
    const reason: KnTagRejection | null =
      max !== null && tags.length >= max
        ? 'limit'
        : !this.allowDuplicates() && tags.some((item) => item.toLowerCase() === tag.toLowerCase())
          ? 'duplicate'
          : !this.validate()(tag)
            ? 'invalid'
            : null;
    if (reason) {
      this.rejected.emit({ tag, reason });
      this.announcement.set(this.labels().tagInput[reason](tag));
      return false;
    }
    this.commit([...tags, tag]);
    this.announcement.set(this.labels().tagInput.added(tag));
    return true;
  }

  /** Убирает тег по индексу. */
  remove(index: number): void {
    const tags = this.value();
    if (this.isDisabled() || index < 0 || index >= tags.length) return;
    this.commit(tags.filter((_, i) => i !== index));
    this.announcement.set(this.labels().tagInput.removed(tags[index]));
    this.marked.set(null);
  }

  protected onInput(value: string): void {
    this.marked.set(null);
    // A separator typed or dictated mid-text finishes the tags before it
    const parts = value.split(this.splitter());
    if (parts.length === 1) {
      this.text.set(value);
      return;
    }
    const rest = parts.pop() ?? '';
    const kept = parts.filter((part) => part.trim() && !this.add(part));
    this.setText([...kept, rest].join(' ').trimStart());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const text = this.text();
    if (event.key === 'Enter') {
      if (!text.trim()) return;
      // A tag in progress must not submit the form around it
      event.preventDefault();
      if (this.add(text)) this.setText('');
    } else if (
      text === '' &&
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    ) {
      // With an empty field the arrows walk over the tags and Backspace removes the marked one;
      // the first Backspace only marks the last tag, so a slip of the finger costs nothing
      const count = this.value().length;
      const marked = this.marked();
      if (!count || (marked === null && event.key !== 'Backspace' && event.key !== 'ArrowLeft')) {
        return;
      }
      event.preventDefault();
      if (event.key === 'ArrowLeft') this.mark(Math.max(0, (marked ?? count) - 1));
      else if (event.key === 'ArrowRight') this.mark(marked! + 1 < count ? marked! + 1 : null);
      else if (marked === null) this.mark(count - 1);
      else {
        this.remove(marked);
        if (this.value().length) this.mark(Math.min(marked, this.value().length - 1));
      }
    } else if (event.key === 'Escape' && this.marked() !== null) {
      event.stopPropagation();
      this.marked.set(null);
    }
  }

  private mark(index: number | null): void {
    this.marked.set(index);
    if (index !== null) this.announcement.set(this.labels().tagInput.marked(this.value()[index]));
  }

  protected onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!this.splitter().test(pasted)) return;
    event.preventDefault();
    const rejected = pasted.split(this.splitter()).filter((part) => part.trim() && !this.add(part));
    this.setText(rejected.map((part) => part.trim()).join(' '));
  }

  protected onBlur(): void {
    this.marked.set(null);
    if (this.text().trim() && this.add(this.text())) this.setText('');
    this.markTouched();
  }

  /** The text is written to the element too: `[value]` does not rewrite an unchanged binding. */
  private setText(value: string): void {
    this.text.set(value);
    this.inputRef().nativeElement.value = value;
  }
}

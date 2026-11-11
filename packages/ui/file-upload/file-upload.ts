import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { injectKnLabels, KnFormControl } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

/** Why a file was not accepted. */
export type KnFileRejection = 'type' | 'size' | 'count';

export interface KnRejectedFile {
  file: File;
  reason: KnFileRejection;
}

const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

/** Does a file satisfy an `accept` list: `.pdf`, `image/*`, `text/csv`? */
function accepted(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) =>
    rule.startsWith('.')
      ? name.endsWith(rule)
      : rule.endsWith('/*')
        ? type.startsWith(rule.slice(0, -1))
        : type === rule,
  );
}

/**
 * Выбор файлов кнопкой или перетаскиванием, с проверкой типа, размера и количества.
 * Значение — массив `File`. Компонент только собирает файлы: отправка на сервер и её
 * прогресс остаются за приложением.
 */
@Component({
  selector: 'kn-file-upload',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="zone"
      [attr.data-over]="over() ? '' : null"
      [attr.data-invalid]="isInvalid() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      (dragenter)="onDrag($event, true)"
      (dragover)="onDrag($event, true)"
      (dragleave)="onDrag($event, false)"
      (drop)="onDrop($event)"
    >
      <svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      </svg>
      <div class="text">
        <button
          #browse
          class="browse"
          type="button"
          [id]="controlId"
          [disabled]="isDisabled()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-labelledby]="labelledBy() ? labelledBy() + ' ' + controlId : null"
          [attr.aria-describedby]="describedBy() ? describedBy() + ' ' + hintId : hintId"
          [attr.aria-invalid]="isInvalid() ? 'true' : null"
          (click)="native.click()"
          (blur)="markTouched()"
        >
          {{ multiple() ? labels().fileUpload.browseMany : labels().fileUpload.browse }}
        </button>
        <span class="drop">{{ labels().fileUpload.drop }}</span>
        <span class="hint" [id]="hintId"><ng-content /></span>
      </div>
      <input
        #native
        class="native"
        type="file"
        tabindex="-1"
        aria-hidden="true"
        [accept]="accept()"
        [multiple]="multiple()"
        [disabled]="isDisabled()"
        [attr.name]="name() || null"
        (change)="add(native.files); native.value = ''"
      />
    </div>

    @if (value().length) {
      <ul class="files" [attr.aria-label]="labels().fileUpload.files">
        @for (file of value(); track file; let i = $index) {
          <li class="file">
            <svg class="file-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5" />
            </svg>
            <span class="name">{{ file.name }}</span>
            <span class="size">{{ size(file.size) }}</span>
            <button
              class="remove"
              type="button"
              [disabled]="isDisabled()"
              [attr.aria-label]="labels().fileUpload.remove(file.name)"
              (click)="remove(i)"
            >
              <kn-icon name="x" />
            </button>
          </li>
        }
      </ul>
    }
    <span class="sr" role="status">{{ announcement() }}</span>
  `,
  host: { '[attr.aria-label]': 'null' },
  styles: `
    :host {
      position: relative;
      display: grid;
      gap: var(--kn-space-2);
      min-inline-size: 0;
    }

    .zone {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--kn-space-4);
      padding: var(--kn-file-upload-padding, var(--kn-space-5));
      border-radius: var(--kn-file-upload-radius, var(--kn-radius-lg));
      background: var(--kn-file-upload-bg, var(--kn-color-field));
      /* A dashed outline says "drop here"; it has the contrast of any other control edge */
      outline: 1.5px dashed var(--kn-color-control-border);
      outline-offset: -1.5px;
      isolation: isolate;
    }

    /* While a file hovers over the zone an accent wash fades in: opacity only */
    .zone::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background: var(--kn-color-accent-soft);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    .zone[data-over] {
      outline-color: var(--kn-color-accent);
      outline-style: solid;
    }

    .zone[data-over]::before {
      opacity: 1;
    }

    .zone[data-invalid] {
      outline-color: var(--kn-color-danger);
    }

    .zone[data-disabled] {
      opacity: 0.55;
    }

    .glyph,
    .file-icon {
      flex: none;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .glyph {
      inline-size: 1.75rem;
      block-size: 1.75rem;
      color: var(--kn-color-text-muted);
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .zone[data-over] .glyph {
      color: var(--kn-color-accent-text);
      transform: translateY(-3px);
    }

    .text {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--kn-space-1) var(--kn-space-1-5);
      min-inline-size: 0;
      line-height: var(--kn-leading-snug);
    }

    .browse {
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-xs);
      background: none;
      color: var(--kn-color-accent-text);
      font: inherit;
      font-weight: var(--kn-weight-semibold);
      text-decoration: underline;
      text-underline-offset: 0.2em;
      cursor: pointer;
    }

    .browse:disabled {
      cursor: not-allowed;
    }

    .browse:focus-visible,
    .remove:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .drop {
      color: var(--kn-color-text-muted);
    }

    .hint {
      flex-basis: 100%;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .hint:empty {
      display: none;
    }

    .native {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      opacity: 0;
      pointer-events: none;
    }

    .files {
      display: grid;
      gap: var(--kn-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .file {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      min-inline-size: 0;
      padding: var(--kn-space-1-5) var(--kn-space-1-5) var(--kn-space-1-5) var(--kn-space-3);
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-surface-sunken);
      font-size: var(--kn-text-sm);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    .file-icon {
      inline-size: 1.125rem;
      block-size: 1.125rem;
      color: var(--kn-color-text-muted);
    }

    .name {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .size {
      flex: none;
      color: var(--kn-color-text-muted);
      font-variant-numeric: tabular-nums;
    }

    .remove {
      flex: none;
      display: grid;
      place-items: center;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-sm);
      background: none;
      color: var(--kn-color-text-muted);
      cursor: pointer;
    }

    .remove:hover:not(:disabled) {
      background: var(--kn-color-hover);
      color: var(--kn-color-text);
    }

    .remove kn-icon {
      --kn-icon-size: 1rem;
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
export class KnFileUpload extends KnFormControl<File[]> {
  /** Выбранные файлы. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<File[]>([]);
  /** Разрешает несколько файлов. Без него новый файл заменяет прежний. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Допустимые типы, как у нативного `accept`: `.pdf,image/*,text/csv`. */
  readonly accept = input<string>('');
  /** Наибольший размер одного файла в байтах. */
  readonly maxSize = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Наибольшее число файлов (при `multiple`). */
  readonly maxFiles = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Локаль для записи размеров. По умолчанию `LOCALE_ID`. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** Файлы, которые не приняты: не тот тип, слишком большой, лишний по счёту. */
  readonly rejected = output<KnRejectedFile[]>();

  protected readonly model = this.value;
  protected readonly labels = injectKnLabels();
  protected readonly over = signal(false);
  protected readonly announcement = signal('');
  protected readonly hintId = inject(_IdGenerator).getId('kn-file-hint-');
  private readonly browse = viewChild.required<ElementRef<HTMLButtonElement>>('browse');

  private readonly formats = computed(() =>
    UNITS.map(
      (unit) =>
        new Intl.NumberFormat(this.locale(), {
          style: 'unit',
          unit,
          unitDisplay: 'short',
          maximumFractionDigits: unit === 'byte' || unit === 'kilobyte' ? 0 : 1,
        }),
    ),
  );

  protected override coerce(value: File[]): File[] {
    return Array.isArray(value) ? value : [];
  }

  /** Добавляет файлы так же, как если бы их выбрал пользователь: с проверками. */
  add(list: FileList | File[] | null | undefined): void {
    const incoming = Array.from(list ?? []);
    if (!incoming.length || this.isDisabled()) return;
    const [accept, maxSize] = [this.accept(), this.maxSize()];
    const limit = this.multiple() ? (this.maxFiles() ?? Infinity) : 1;
    // A single-file control replaces its file; a multiple one appends
    const kept = this.multiple() ? [...this.value()] : [];
    const refused: KnRejectedFile[] = [];
    for (const file of incoming) {
      if (!accepted(file, accept)) refused.push({ file, reason: 'type' });
      else if (maxSize !== null && file.size > maxSize) refused.push({ file, reason: 'size' });
      else if (kept.length >= limit) refused.push({ file, reason: 'count' });
      else kept.push(file);
    }
    const added = kept.length - (this.multiple() ? this.value().length : 0);
    if (added > 0) this.commit(kept);
    if (refused.length) this.rejected.emit(refused);
    const texts = this.labels().fileUpload;
    this.announcement.set(
      [
        added > 0 ? texts.added(added) : '',
        ...refused.map(({ file, reason }) => texts[reason](file.name)),
      ]
        .filter(Boolean)
        .join('. '),
    );
  }

  /** Убирает файл по индексу. */
  remove(index: number): void {
    const files = this.value();
    if (this.isDisabled() || !files[index]) return;
    this.commit(files.filter((_, i) => i !== index));
    this.announcement.set(this.labels().fileUpload.removed(files[index].name));
    // The removed row took the focus with it
    this.browse().nativeElement.focus();
  }

  protected size(bytes: number): string {
    const power = Math.min(
      UNITS.length - 1,
      Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)),
    );
    return this.formats()[power].format(bytes / 1024 ** power);
  }

  protected onDrag(event: DragEvent, over: boolean): void {
    if (this.isDisabled() || !event.dataTransfer?.types.includes('Files')) return;
    // Without this the browser opens the file instead of handing it over
    event.preventDefault();
    const zone = event.currentTarget as HTMLElement;
    // Leaving for a child element is not leaving the zone
    if (!over && zone.contains(event.relatedTarget as Node | null)) return;
    this.over.set(over);
  }

  protected onDrop(event: DragEvent): void {
    if (this.isDisabled() || !event.dataTransfer?.files.length) return;
    event.preventDefault();
    this.over.set(false);
    this.add(event.dataTransfer.files);
  }
}

function optionalNumber(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

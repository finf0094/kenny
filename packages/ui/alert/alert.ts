import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { injectKnLabels, KnTone, playExit } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

const ICONS: Record<KnTone, string> = {
  neutral: 'info',
  accent: 'info',
  success: 'check-circle',
  warning: 'alert',
  danger: 'x-circle',
};

/**
 * Сообщение внутри страницы: подсказка, предупреждение, результат действия. В отличие
 * от тоста остаётся на месте, пока актуально.
 *
 * Действия передаются атрибутом `knAlertActions`.
 */
@Component({
  selector: 'kn-alert',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hidden()) {
      <div class="alert" [attr.role]="role()">
        @if (iconName(); as name) {
          <kn-icon class="icon" [name]="name" />
        }
        <div class="content">
          @if (heading()) {
            <div class="heading">{{ heading() }}</div>
          }
          <div class="text"><ng-content /></div>
          <div class="actions"><ng-content select="[knAlertActions]" /></div>
        </div>
        @if (closable()) {
          <button
            class="close"
            type="button"
            [attr.aria-label]="closeLabel() ?? labels().alert.close"
            (click)="close()"
          >
            <kn-icon name="x" />
          </button>
        }
      </div>
    }
  `,
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-closed]': 'hidden() ? "" : null',
  },
  styles: `
    :host {
      --_tone: var(--kn-color-text-muted);
      --_soft: var(--kn-color-surface-sunken);
      --_line: var(--kn-color-border-strong);
      display: block;
    }

    :host([data-closed]) {
      display: none;
    }

    :host([data-tone='accent']) {
      --_tone: var(--kn-color-accent-text);
      --_soft: var(--kn-color-accent-soft);
      --_line: var(--kn-color-accent);
    }

    :host([data-tone='success']) {
      --_tone: var(--kn-color-success);
      --_soft: var(--kn-color-success-soft);
      --_line: var(--kn-color-success);
    }

    :host([data-tone='warning']) {
      --_tone: var(--kn-color-warning);
      --_soft: var(--kn-color-warning-soft);
      --_line: var(--kn-color-warning);
    }

    :host([data-tone='danger']) {
      --_tone: var(--kn-color-danger);
      --_soft: var(--kn-color-danger-soft);
      --_line: var(--kn-color-danger);
    }

    .alert {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: var(--kn-space-3);
      padding: var(--kn-alert-padding, var(--kn-space-3) var(--kn-space-4));
      border-radius: var(--kn-alert-radius, var(--kn-radius-lg));
      background: var(--kn-alert-bg, var(--_soft));
      color: var(--kn-color-text);
      line-height: var(--kn-leading-snug);
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    .alert[data-kn-state='closing'] {
      animation: kn-fade-out var(--kn-duration-fast) var(--kn-ease-in) forwards;
    }

    /* Outline: a quiet surface with a coloured bar on the leading edge */
    :host([data-variant='outline']) .alert {
      background: var(--kn-alert-bg, var(--kn-color-surface));
      box-shadow: var(--kn-alert-shadow, var(--kn-elevation-card));
      overflow: hidden;
    }

    :host([data-variant='outline']) .alert::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: 3px;
      background: var(--_line);
    }

    .icon {
      --kn-icon-size: 1.25rem;
      flex: none;
      margin-block-start: 0.0625rem;
      color: var(--_tone);
    }

    .content {
      flex: 1;
      min-inline-size: 0;
    }

    .heading {
      font-weight: var(--kn-weight-semibold);
    }

    .heading + .text:not(:empty) {
      margin-block-start: var(--kn-space-0-5, 0.125rem);
      color: var(--kn-color-text-muted);
    }

    .text:empty,
    .actions:empty {
      display: none;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
      margin-block-start: var(--kn-space-3);
    }

    .close {
      position: relative;
      flex: none;
      display: grid;
      place-items: center;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      margin-block: -0.1875rem;
      margin-inline-end: -0.375rem;
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-sm);
      background: none;
      color: var(--kn-color-text-muted);
      cursor: pointer;
    }

    .close::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    .close:hover::after,
    .close:active::after {
      opacity: 1;
    }

    .close:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .close kn-icon {
      --kn-icon-size: 1rem;
    }
  `,
})
export class KnAlert {
  /** Смысловая окраска. */
  readonly tone = input<KnTone>('neutral');
  /** `soft` — тонированная плашка, `outline` — поверхность с цветной полосой. */
  readonly variant = input<'soft' | 'outline'>('soft');
  /** Заголовок. Без него сообщение — одна строка текста. */
  readonly heading = input<string>('');
  /** Имя иконки. По умолчанию подбирается по тону; пустая строка убирает иконку. */
  readonly icon = input<string | undefined>(undefined);
  /** Показывает кнопку закрытия. */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Подпись кнопки закрытия. По умолчанию — из `provideKnLabels`. */
  readonly closeLabel = input<string>();
  /**
   * Срочность для скринридера: `status` — прочитать, когда освободится, `alert` —
   * прервать речь. По умолчанию `alert` у тона `danger`, иначе `status`.
   */
  readonly live = input<'status' | 'alert' | 'off'>();
  /** Сообщение закрыто пользователем. */
  readonly closed = output<void>();

  protected readonly labels = injectKnLabels();
  protected readonly hidden = signal(false);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly iconName = computed(() => this.icon() ?? ICONS[this.tone()]);
  protected readonly role = computed(() => {
    const live = this.live() ?? (this.tone() === 'danger' ? 'alert' : 'status');
    return live === 'off' ? null : live;
  });

  /** Закрывает сообщение с анимацией. */
  async close(): Promise<void> {
    if (this.hidden()) return;
    await playExit(this.element.querySelector('.alert'));
    this.hidden.set(true);
    this.closed.emit();
  }
}

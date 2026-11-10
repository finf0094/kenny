import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { _IdGenerator, CdkTrapFocus } from '@angular/cdk/a11y';
import { KnAnchoredOverlay, KnPlacement } from '@kenny/ui/core';

/**
 * Всплывающая панель с произвольным содержимым, привязанная к элементу.
 * Немодальный диалог: фокус переходит внутрь, Escape и клик снаружи закрывают
 * панель и возвращают фокус на триггер.
 */
@Component({
  selector: 'kn-popover',
  imports: [CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-label]': 'null' },
  template: `
    <ng-template #panel>
      <div
        class="panel"
        role="dialog"
        tabindex="-1"
        cdkTrapFocus
        [id]="id"
        [attr.aria-label]="ariaLabel()"
        [style.inline-size]="width()"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: none;
    }

    .panel {
      box-sizing: border-box;
      max-inline-size: calc(100vw - 1rem);
      padding: var(--kn-popover-padding, var(--kn-space-4));
      border-radius: var(--kn-popover-radius, var(--kn-radius-lg));
      background: var(--kn-popover-bg, var(--kn-glass-bg-strong));
      backdrop-filter: var(--kn-glass-filter-strong);
      -webkit-backdrop-filter: var(--kn-glass-filter-strong);
      box-shadow: var(--kn-shadow-glass-lg);
      color: var(--kn-color-text);
      outline: none;
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .panel[data-kn-state='closing'] {
      animation: kn-pop-out var(--kn-duration-fast) var(--kn-ease-in) forwards;
      pointer-events: none;
    }
  `,
})
export class KnPopover {
  /** Положение относительно триггера. При нехватке места панель переворачивается сама. */
  readonly placement = input<KnPlacement>('bottom-start');
  /** Отступ от триггера, px. */
  readonly offset = input<number>(8);
  /** Ширина панели (CSS-значение). По умолчанию — по содержимому. */
  readonly width = input<string | null>(null);
  /** Доступное имя панели. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** Панель открылась. */
  readonly opened = output<void>();
  /** Панель закрылась. */
  readonly closed = output<void>();

  private readonly overlay = new KnAnchoredOverlay();
  private readonly injector = inject(Injector);
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private origin: HTMLElement | null = null;

  readonly id = inject(_IdGenerator).getId('kn-popover-');
  /** Открыта ли панель. */
  readonly isOpen = this.overlay.isOpen;

  constructor() {
    this.overlay.dismissed.subscribe(() => void this.close());
  }

  /** Открывает панель у элемента `origin`. */
  open(origin: HTMLElement): void {
    if (this.isOpen()) return;
    this.origin = origin;
    this.overlay.open({
      origin,
      template: this.panel(),
      placement: this.placement(),
      offset: this.offset(),
      transformOriginOn: '.panel',
    });
    this.opened.emit();
    afterNextRender(
      () => {
        const panel = this.overlay.panel;
        const target = panel?.querySelector<HTMLElement>(
          '[autofocus], button:not(:disabled), [href], input:not(:disabled), select, textarea, [tabindex="0"]:not(.cdk-focus-trap-anchor)',
        );
        (target ?? panel)?.focus();
      },
      { injector: this.injector },
    );
  }

  /** Закрывает панель и возвращает фокус на триггер. */
  async close(): Promise<void> {
    if (!this.isOpen()) return;
    if (this.overlay.panel?.contains(document.activeElement)) {
      this.origin?.focus();
    }
    await this.overlay.close();
    this.closed.emit();
  }

  /** Переключает панель. */
  toggle(origin: HTMLElement): void {
    if (this.isOpen()) void this.close();
    else this.open(origin);
  }
}

/** Делает элемент триггером панели: `<button [knPopoverTrigger]="popover">`. */
@Directive({
  selector: '[knPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'popover().isOpen()',
    '[attr.aria-controls]': 'popover().isOpen() ? popover().id : null',
    '(click)': 'popover().toggle(element)',
  },
})
export class KnPopoverTrigger {
  /** Панель, которую открывает элемент. */
  readonly popover = input.required<KnPopover>({ alias: 'knPopoverTrigger' });
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}

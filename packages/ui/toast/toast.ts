import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  Provider,
  signal,
} from '@angular/core';
import { createGlobalPositionStrategy, createOverlayRef, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { KnIcon } from '@kenny/ui/icon';

export type KnToastTone = 'neutral' | 'success' | 'warning' | 'danger';
export type KnToastPosition =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface KnToastOptions {
  /** Основной текст. */
  title: string;
  /** Дополнительное пояснение. */
  description?: string;
  /** Окраска и иконка. `danger` объявляется скринридером немедленно (`role="alert"`). */
  tone?: KnToastTone;
  /** Время показа, мс. `0` — пока пользователь не закроет. По умолчанию 5000. */
  duration?: number;
  /** Кнопка действия, например «Отменить». */
  action?: { label: string; run: () => void };
}

export interface KnToasterConfig {
  /** Угол экрана для стопки уведомлений. */
  position?: KnToastPosition;
  /** Время показа по умолчанию, мс. */
  duration?: number;
  /** Сколько уведомлений видно одновременно; более старые закрываются. */
  max?: number;
}

export const KN_TOASTER_CONFIG = new InjectionToken<KnToasterConfig>('KN_TOASTER_CONFIG');

/** Настраивает положение и длительность уведомлений для всего приложения. */
export function provideKnToaster(config: KnToasterConfig): Provider {
  return { provide: KN_TOASTER_CONFIG, useValue: config };
}

interface ToastItem extends Required<Pick<KnToastOptions, 'title' | 'tone' | 'duration'>> {
  id: number;
  description?: string;
  action?: KnToastOptions['action'];
}

/** Ссылка на показанное уведомление. */
export class KnToastRef {
  constructor(private readonly remove: () => void) {}

  /** Закрывает уведомление. */
  dismiss(): void {
    this.remove();
  }
}

const ICONS: Record<KnToastTone, string> = {
  neutral: 'info',
  success: 'check-circle',
  warning: 'alert',
  danger: 'x-circle',
};

/**
 * Показывает короткие уведомления поверх интерфейса. Таймер ставится на паузу,
 * пока курсор или фокус находятся внутри стопки.
 */
@Injectable({ providedIn: 'root' })
export class KnToaster {
  private readonly injector = inject(Injector);
  private readonly config = inject(KN_TOASTER_CONFIG, { optional: true }) ?? {};
  private overlayRef: OverlayRef | null = null;
  private nextId = 0;
  private readonly timers = new Map<
    number,
    { timer?: ReturnType<typeof setTimeout>; left: number; since: number }
  >();

  /** @internal */
  readonly items = signal<ToastItem[]>([]);
  /** @internal */
  readonly position: KnToastPosition = this.config.position ?? 'bottom-end';

  /** Показывает уведомление. */
  show(options: KnToastOptions): KnToastRef {
    const item: ToastItem = {
      id: this.nextId++,
      title: options.title,
      description: options.description,
      action: options.action,
      tone: options.tone ?? 'neutral',
      duration: options.duration ?? this.config.duration ?? 5000,
    };
    this.ensureViewport();
    const max = this.config.max ?? 4;
    const overflow = this.items().slice(0, Math.max(0, this.items().length + 1 - max));
    overflow.forEach((old) => this.dismiss(old.id));
    this.items.update((items) => [...items, item]);
    if (item.duration > 0) {
      this.timers.set(item.id, { left: item.duration, since: 0 });
      this.resume(item.id);
    }
    return new KnToastRef(() => this.dismiss(item.id));
  }

  /** Уведомление об успехе. */
  success(title: string, description?: string): KnToastRef {
    return this.show({ title, description, tone: 'success' });
  }

  /** Уведомление об ошибке. */
  error(title: string, description?: string): KnToastRef {
    return this.show({ title, description, tone: 'danger' });
  }

  /** Закрывает все уведомления. */
  clear(): void {
    this.items().forEach((item) => this.dismiss(item.id));
  }

  /** @internal */
  dismiss(id: number): void {
    clearTimeout(this.timers.get(id)?.timer);
    this.timers.delete(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  /** @internal */
  pauseAll(): void {
    for (const state of this.timers.values()) {
      clearTimeout(state.timer);
      state.left -= Date.now() - state.since;
    }
  }

  /** @internal */
  resumeAll(): void {
    for (const id of this.timers.keys()) this.resume(id);
  }

  private resume(id: number): void {
    const state = this.timers.get(id);
    if (!state) return;
    state.since = Date.now();
    state.timer = setTimeout(() => this.dismiss(id), Math.max(state.left, 800));
  }

  private ensureViewport(): void {
    if (this.overlayRef) return;
    const [block, inline] = this.position.split('-') as [
      'top' | 'bottom',
      'start' | 'center' | 'end',
    ];
    const position = createGlobalPositionStrategy(this.injector);
    if (block === 'top') position.top();
    else position.bottom();
    if (inline === 'start') position.start();
    else if (inline === 'end') position.end();
    else position.centerHorizontally();
    this.overlayRef = createOverlayRef(this.injector, {
      positionStrategy: position,
      panelClass: 'kn-toast-pane',
    });
    this.overlayRef.hostElement.style.zIndex = 'var(--kn-z-toast)';
    this.overlayRef.hostElement.style.pointerEvents = 'none';
    this.overlayRef.attach(new ComponentPortal(KnToastViewport));
  }
}

/** @internal The stack of visible toasts. */
@Component({
  selector: 'kn-toast-viewport',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toast of toaster.items(); track toast.id) {
      <div class="slot" animate.leave="leaving">
        <div class="wrap">
          <div
            class="toast"
            [attr.data-tone]="toast.tone"
            [attr.role]="toast.tone === 'danger' ? 'alert' : 'status'"
          >
            <kn-icon class="icon" [name]="icons[toast.tone]" />
            <div class="text">
              <div class="title">{{ toast.title }}</div>
              @if (toast.description) {
                <div class="description">{{ toast.description }}</div>
              }
            </div>
            @if (toast.action; as action) {
              <button
                class="action"
                type="button"
                (click)="action.run(); toaster.dismiss(toast.id)"
              >
                {{ action.label }}
              </button>
            }
            <button
              class="close"
              type="button"
              aria-label="Закрыть уведомление"
              (click)="toaster.dismiss(toast.id)"
            >
              <kn-icon name="x" />
            </button>
          </div>
        </div>
      </div>
    }
  `,
  host: {
    role: 'region',
    'aria-label': 'Уведомления',
    '[attr.data-position]': 'toaster.position',
    '(pointerenter)': 'toaster.pauseAll()',
    '(pointerleave)': 'toaster.resumeAll()',
    '(focusin)': 'toaster.pauseAll()',
    '(focusout)': 'toaster.resumeAll()',
  },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      inline-size: min(24rem, 100vw);
      padding: var(--kn-space-4);
      pointer-events: none;
    }

    :host([data-position^='top']) {
      flex-direction: column-reverse;
    }

    /* The slot collapses on leave so the rest of the stack closes the gap smoothly */
    .slot {
      display: grid;
      grid-template-rows: 1fr;
      transition:
        grid-template-rows var(--kn-duration-slow) var(--kn-ease-out),
        opacity var(--kn-duration-normal) var(--kn-ease-standard);
    }

    .slot.leaving {
      grid-template-rows: 0fr;
      opacity: 0;
    }

    .wrap {
      min-block-size: 0;
      padding-block-start: var(--kn-space-2);
    }

    .slot.leaving .wrap {
      overflow: hidden;
    }

    .toast {
      --_tone: var(--kn-color-accent-text);
      --kn-slide-x: 110%;

      display: flex;
      align-items: flex-start;
      gap: var(--kn-space-3);
      box-sizing: border-box;
      padding: var(--kn-space-3) var(--kn-space-3) var(--kn-space-3) var(--kn-space-4);
      border-radius: var(--kn-toast-radius, var(--kn-radius-lg));
      background: var(--kn-toast-bg, var(--kn-glass-bg-strong));
      backdrop-filter: var(--kn-glass-filter-strong);
      -webkit-backdrop-filter: var(--kn-glass-filter-strong);
      box-shadow: var(--kn-shadow-glass-lg);
      color: var(--kn-color-text);
      overflow: hidden;
      pointer-events: auto;
      animation: kn-slide-in var(--kn-duration-slow) var(--kn-ease-spring);
    }

    :host([data-position$='start']) .toast {
      --kn-slide-x: -110%;
    }

    :host([data-position='top-center']) .toast {
      --kn-slide-x: 0%;
      --kn-slide-y: -120%;
    }

    :host([data-position='bottom-center']) .toast {
      --kn-slide-x: 0%;
      --kn-slide-y: 120%;
    }

    .toast[data-tone='success'] {
      --_tone: var(--kn-color-success);
    }

    .toast[data-tone='warning'] {
      --_tone: var(--kn-color-warning);
    }

    .toast[data-tone='danger'] {
      --_tone: var(--kn-color-danger);
    }

    .icon {
      --kn-icon-size: 1.25rem;
      margin-block-start: 1px;
      color: var(--_tone);
    }

    .text {
      flex: 1;
      min-inline-size: 0;
    }

    .title {
      font-weight: var(--kn-weight-medium);
      line-height: var(--kn-leading-snug);
    }

    .description {
      margin-block-start: var(--kn-space-0-5);
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .action,
    .close {
      flex: none;
      border: 0;
      background: none;
      font: inherit;
      cursor: pointer;
    }

    .action {
      padding: var(--kn-space-0-5) var(--kn-space-2);
      border-radius: var(--kn-radius-full);
      color: var(--kn-color-accent-text);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-semibold);
    }

    .action:hover {
      background: var(--kn-color-accent-soft);
    }

    .close {
      display: grid;
      place-items: center;
      inline-size: 1.5rem;
      block-size: 1.5rem;
      padding: 0;
      border-radius: 50%;
      color: var(--kn-color-text-subtle);
    }

    .close:hover {
      color: var(--kn-color-text);
      background: var(--kn-color-hover);
    }

    .close kn-icon {
      --kn-icon-size: 1rem;
    }

    .action:focus-visible,
    .close:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 1px;
    }
  `,
})
export class KnToastViewport {
  protected readonly toaster = inject(KnToaster);
  protected readonly icons = ICONS;
}

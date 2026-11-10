import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  input,
  OnDestroy,
  TemplateRef,
  Type,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { CdkDialogContainer, Dialog, DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { playExit } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

export type KnDrawerSide = 'start' | 'end' | 'top' | 'bottom';

export interface KnDialogConfig<D = unknown> {
  /** Данные для содержимого: `inject(KN_DIALOG_DATA)` или `let-data="data"` в шаблоне. */
  data?: D;
  /** Ширина окна (любое CSS-значение). По умолчанию `30rem`. */
  width?: string;
  /** Доступное имя, если в содержимом нет `<kn-dialog-header>`. */
  ariaLabel?: string;
  /** `alertdialog` — для подтверждений, которые нельзя пропустить. */
  role?: 'dialog' | 'alertdialog';
  /** Закрывать по клику на подложку. По умолчанию `true`. */
  closeOnBackdrop?: boolean;
  /** Закрывать по Escape. По умолчанию `true`. */
  closeOnEscape?: boolean;
  /** Куда поставить фокус при открытии: первый фокусируемый элемент, само окно или CSS-селектор. */
  autoFocus?: 'first-tabbable' | 'dialog' | string;
}

/** How the surface is presented; set by `KnDialog` / `KnDrawer`. */
export interface KnSurfacePresentation {
  kind: 'dialog' | 'drawer';
  side?: KnDrawerSide;
  size?: string;
  /** Distance from the top of the viewport; centred vertically when omitted. */
  top?: string;
}

export const KN_DIALOG_DATA = new InjectionToken<unknown>('KN_DIALOG_DATA');
const KN_SURFACE = new InjectionToken<KnSurfacePresentation>('KN_SURFACE');

/** Ссылка на открытое окно: закрывает его и сообщает результат. */
export class KnDialogRef<R = unknown> {
  /** Срабатывает один раз после закрытия с результатом (или `undefined`). */
  readonly closed: Observable<R | undefined>;
  private closing = false;

  constructor(private readonly cdkRef: DialogRef<R>) {
    this.closed = cdkRef.closed;
  }

  /** Проигрывает анимацию выхода и закрывает окно. */
  async close(result?: R): Promise<void> {
    if (this.closing) return;
    this.closing = true;
    this.cdkRef.overlayRef.backdropElement?.classList.remove('cdk-overlay-backdrop-showing');
    await playExit((this.cdkRef.containerInstance as KnDialogContainer | null)?.element);
    this.cdkRef.close(result);
  }
}

/** @internal The surface itself: focus trap and ARIA come from the CDK container. */
@Component({
  selector: 'kn-dialog-container',
  imports: [CdkPortalOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template cdkPortalOutlet />`,
  host: {
    '[attr.data-kind]': 'surface.kind',
    '[attr.data-side]': 'surface.side ?? null',
    '[style.--_size]': 'surface.size ?? null',
  },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      color: var(--kn-color-text);
      background: var(--kn-dialog-bg, var(--kn-glass-bg-strong));
      backdrop-filter: var(--kn-glass-filter-strong);
      -webkit-backdrop-filter: var(--kn-glass-filter-strong);
      box-shadow: var(--kn-shadow-glass-xl);
      outline: none;
      overflow: hidden;
    }

    /* A projected component host (or any wrapper) must not break the column layout */
    :host ::ng-deep > :not(kn-dialog-header, kn-dialog-body, kn-dialog-footer) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-block-size: 0;
    }

    :host([data-kind='dialog']) {
      inline-size: min(var(--_size, 30rem), calc(100vw - 2rem));
      max-block-size: calc(100dvh - 3rem);
      border-radius: var(--kn-dialog-radius, var(--kn-radius-xl));
      animation: kn-rise-in var(--kn-duration-slow) var(--kn-ease-spring);
    }

    :host([data-kind='dialog'][data-kn-state='closing']) {
      animation: kn-rise-out var(--kn-duration-fast) var(--kn-ease-in) forwards;
    }

    /* Drawers float off the edge like a sheet */
    :host([data-kind='drawer']) {
      --_gap: var(--kn-space-2);
      margin: var(--_gap);
      border-radius: var(--kn-drawer-radius, var(--kn-radius-xl));
      animation: kn-slide-in var(--kn-duration-slow) var(--kn-ease-out);
    }

    :host([data-kind='drawer'][data-kn-state='closing']) {
      animation: kn-slide-out var(--kn-duration-normal) var(--kn-ease-in) forwards;
    }

    :host([data-side='start']),
    :host([data-side='end']) {
      inline-size: min(var(--_size, 24rem), calc(100vw - 3rem));
      block-size: calc(100dvh - var(--_gap) * 2);
    }

    :host([data-side='top']),
    :host([data-side='bottom']) {
      inline-size: calc(100vw - var(--_gap) * 2);
      block-size: min(var(--_size, 20rem), calc(100dvh - 3rem));
    }

    :host([data-side='start']) {
      --kn-slide-x: calc(-100% - 1rem);
    }

    :host([data-side='end']) {
      --kn-slide-x: calc(100% + 1rem);
    }

    :host([data-side='top']) {
      --kn-slide-y: calc(-100% - 1rem);
    }

    :host([data-side='bottom']) {
      --kn-slide-y: calc(100% + 1rem);
    }

    :host([data-kn-state='closing']) {
      pointer-events: none;
    }
  `,
})
export class KnDialogContainer extends CdkDialogContainer {
  protected readonly surface = inject(KN_SURFACE);

  get element(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /** @internal */
  labelledBy(id: string, add: boolean): void {
    if (add) this._addAriaLabelledBy(id);
    else this._removeAriaLabelledBy(id);
  }
}

/** @internal Shared by KnDialog and KnDrawer. */
export function openSurface<R, D>(
  dialog: Dialog,
  injector: Injector,
  content: Type<unknown> | TemplateRef<unknown>,
  config: KnDialogConfig<D>,
  surface: KnSurfacePresentation,
): KnDialogRef<R> {
  let ref!: KnDialogRef<R>;
  const position = createGlobalPositionStrategy(injector);
  if (surface.kind === 'drawer') {
    switch (surface.side) {
      case 'start':
        position.start().top();
        break;
      case 'top':
        position.top().centerHorizontally();
        break;
      case 'bottom':
        position.bottom().centerHorizontally();
        break;
      default:
        position.end().top();
    }
  } else if (surface.top) {
    position.centerHorizontally().top(surface.top);
  } else {
    position.centerHorizontally().centerVertically();
  }

  const cdkRef = dialog.open<R, D>(content, {
    container: {
      type: KnDialogContainer,
      providers: () => [{ provide: KN_SURFACE, useValue: surface }],
    },
    positionStrategy: position,
    backdropClass: 'kn-overlay-scrim',
    disableClose: true,
    restoreFocus: true,
    autoFocus: config.autoFocus ?? 'first-tabbable',
    role: config.role ?? 'dialog',
    ariaLabel: config.ariaLabel,
    data: config.data,
    ariaModal: true,
    providers: (created, _config, container) => {
      ref = new KnDialogRef<R>(created);
      return [
        { provide: KnDialogRef, useValue: ref },
        { provide: KnDialogContainer, useValue: container },
        { provide: KN_DIALOG_DATA, useValue: config.data },
      ];
    },
    templateContext: () => ({ $implicit: ref, data: config.data }),
  });

  if (config.closeOnBackdrop !== false) {
    cdkRef.backdropClick.subscribe(() => void ref.close());
  }
  if (config.closeOnEscape !== false) {
    cdkRef.keydownEvents.subscribe((event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        void ref.close();
      }
    });
  }
  return ref;
}

/**
 * Открывает модальные окна. Содержимое — компонент или `ng-template`; фокус
 * запирается внутри и возвращается на прежний элемент после закрытия.
 */
@Injectable({ providedIn: 'root' })
export class KnDialog {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);

  /** Открывает окно и возвращает ссылку на него. */
  open<R = unknown, D = unknown>(
    content: Type<unknown> | TemplateRef<unknown>,
    config: KnDialogConfig<D> = {},
  ): KnDialogRef<R> {
    return openSurface<R, D>(this.dialog, this.injector, content, config, {
      kind: 'dialog',
      size: config.width,
    });
  }

  /** Закрывает все открытые окна без анимации (например, при выходе из аккаунта). */
  closeAll(): void {
    this.dialog.closeAll();
  }
}

/** Шапка окна: заголовок связывается с окном через `aria-labelledby`. */
@Component({
  selector: 'kn-dialog-header',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text">
      <h2 class="title" [id]="titleId">{{ heading() }}</h2>
      @if (description()) {
        <p class="description">{{ description() }}</p>
      }
    </div>
    @if (closable()) {
      <button class="close" type="button" [attr.aria-label]="closeLabel()" (click)="ref.close()">
        <kn-icon name="x" />
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: var(--kn-space-4);
      padding: var(--kn-space-6) var(--kn-space-6) var(--kn-space-2);
    }

    .text {
      flex: 1;
      min-inline-size: 0;
    }

    .title {
      margin: 0;
      font-size: var(--kn-text-xl);
      font-weight: var(--kn-weight-semibold);
      letter-spacing: var(--kn-tracking-snug);
      line-height: var(--kn-leading-snug);
    }

    .description {
      margin: var(--kn-space-1) 0 0;
      color: var(--kn-color-text-muted);
    }

    .close {
      display: grid;
      place-items: center;
      flex: none;
      inline-size: 2rem;
      block-size: 2rem;
      margin: calc(var(--kn-space-1) * -1) calc(var(--kn-space-2) * -1) 0 0;
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-full);
      background: var(--kn-color-surface-sunken);
      color: var(--kn-color-text-muted);
      cursor: pointer;
    }

    .close:hover {
      color: var(--kn-color-text);
      background: var(--kn-color-pressed);
    }

    .close:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .close kn-icon {
      --kn-icon-size: 1.125rem;
    }
  `,
})
export class KnDialogHeader implements OnDestroy {
  /** Заголовок окна. */
  readonly heading = input.required<string>();
  /** Пояснение под заголовком. */
  readonly description = input<string>('');
  /** Показывать кнопку закрытия. */
  readonly closable = input(true, { transform: booleanAttribute });
  /** Подпись кнопки закрытия. */
  readonly closeLabel = input<string>('Закрыть');

  protected readonly ref = inject(KnDialogRef);
  private readonly container = inject(KnDialogContainer);
  protected readonly titleId = inject(_IdGenerator).getId('kn-dialog-title-');

  constructor() {
    this.container.labelledBy(this.titleId, true);
  }

  ngOnDestroy(): void {
    this.container.labelledBy(this.titleId, false);
  }
}

/** Прокручиваемое тело окна. */
@Component({
  selector: 'kn-dialog-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      flex: 1;
      min-block-size: 0;
      padding: var(--kn-space-3) var(--kn-space-6);
      overflow-y: auto;
      overscroll-behavior: contain;
      line-height: var(--kn-leading-relaxed);
    }

    :host(:last-child) {
      padding-block-end: var(--kn-space-6);
    }
  `,
})
export class KnDialogBody {}

/** Ряд действий внизу окна. */
@Component({
  selector: 'kn-dialog-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--kn-space-2);
      padding: var(--kn-space-4) var(--kn-space-6) var(--kn-space-6);
    }
  `,
})
export class KnDialogFooter {}

/** Закрывает окно по клику и передаёт значение как результат: `[knDialogClose]="true"`. */
@Directive({
  selector: '[knDialogClose]',
  host: { '(click)': 'ref.close(result())' },
})
export class KnDialogClose {
  /** Результат, с которым закроется окно. */
  readonly result = input<unknown>(undefined, { alias: 'knDialogClose' });
  protected readonly ref = inject(KnDialogRef);
}

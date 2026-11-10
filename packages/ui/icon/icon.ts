import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  input,
  Provider,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KN_CORE_ICONS } from './icons';

/** Additional icon maps, merged over the core set. */
export const KN_ICONS = new InjectionToken<readonly Record<string, string>[]>('KN_ICONS');

/**
 * Registers icons by name. The value is the inner markup of a 24×24 `<svg>`.
 * The markup is rendered as trusted HTML — only register icons you control.
 *
 * ```ts
 * provideKnIcons({ sun: knIconSun, moon: knIconMoon })
 * ```
 */
export function provideKnIcons(icons: Record<string, string>): Provider {
  return { provide: KN_ICONS, useValue: icons, multi: true };
}

/**
 * Иконка из реестра. По умолчанию декоративная (`aria-hidden`); если иконка несёт
 * смысл сама по себе, задайте `label`.
 */
@Component({
  selector: 'kn-icon',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[innerHTML]': 'svg()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[style.--kn-icon-size]': 'cssSize()',
  },
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      inline-size: var(--kn-icon-size, 1.25em);
      block-size: var(--kn-icon-size, 1.25em);
      vertical-align: middle;
    }

    :host ::ng-deep svg {
      inline-size: 100%;
      block-size: 100%;
      display: block;
    }
  `,
})
export class KnIcon {
  /** Имя иконки в реестре. */
  readonly name = input.required<string>();
  /** Размер: число в пикселях или любое CSS-значение. По умолчанию `1.25em`. */
  readonly size = input<number | string | null>(null);
  /** Текстовая альтернатива. Если задана, иконка получает `role="img"`. */
  readonly label = input<string>('');
  /** Толщина линии. */
  readonly strokeWidth = input<number>(1.75);

  private readonly sanitizer = inject(DomSanitizer);
  private readonly extra = inject(KN_ICONS, { optional: true }) ?? [];

  protected readonly cssSize = computed(() => {
    const size = this.size();
    return size == null ? null : typeof size === 'number' ? `${size}px` : size;
  });

  protected readonly svg = computed(() => {
    const name = this.name();
    let body = KN_CORE_ICONS[name] ?? '';
    for (const set of this.extra) {
      body = set[name] ?? body;
    }
    if (!body && typeof ngDevMode !== 'undefined' && ngDevMode) {
      console.warn(`[kenny] Icon "${name}" is not registered. Use provideKnIcons().`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${this.strokeWidth()}" stroke-linecap="round" stroke-linejoin="round" focusable="false">${body}</svg>`,
    );
  });
}

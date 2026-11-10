import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { KnSize } from '@kenny/ui/core';

/**
 * Аватар пользователя. Пока изображение не загрузилось или недоступно,
 * показывает инициалы на фоне, цвет которого стабильно выводится из имени.
 */
@Component({
  selector: 'kn-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="name()" (error)="failed.set(true)" />
    } @else {
      <span class="initials" aria-hidden="true">{{ initials() }}</span>
    }
    @if (status(); as state) {
      <span class="status" [attr.data-status]="state" aria-hidden="true"></span>
    }
  `,
  host: {
    '[attr.role]': 'src() && !failed() ? null : "img"',
    '[attr.aria-label]': 'src() && !failed() ? null : label()',
    '[attr.data-size]': 'size()',
    '[style.--_hue]': 'hue()',
  },
  styles: `
    :host {
      --_size: 2.375rem;

      position: relative;
      display: inline-grid;
      place-items: center;
      flex: none;
      inline-size: var(--kn-avatar-size, var(--_size));
      block-size: var(--kn-avatar-size, var(--_size));
      border-radius: var(--kn-avatar-radius, 50%);
      background: light-dark(oklch(0.9 0.06 var(--_hue)), oklch(0.36 0.07 var(--_hue)));
      color: light-dark(oklch(0.36 0.1 var(--_hue)), oklch(0.9 0.06 var(--_hue)));
      font-size: calc(var(--kn-avatar-size, var(--_size)) * 0.38);
      font-weight: var(--kn-weight-semibold);
      letter-spacing: var(--kn-tracking-snug);
      user-select: none;
      vertical-align: middle;
    }

    :host([data-size='sm']) {
      --_size: 1.75rem;
    }

    :host([data-size='lg']) {
      --_size: 3.25rem;
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      border-radius: inherit;
      object-fit: cover;
      animation: kn-fade-in var(--kn-duration-normal) var(--kn-ease-standard);
    }

    .status {
      position: absolute;
      inset-block-end: 0;
      inset-inline-end: 0;
      inline-size: 28%;
      block-size: 28%;
      min-inline-size: 0.5rem;
      min-block-size: 0.5rem;
      border-radius: 50%;
      background: var(--kn-color-text-subtle);
      box-shadow: 0 0 0 2px var(--kn-avatar-ring, var(--kn-color-canvas));
    }

    .status[data-status='online'] {
      background: light-dark(#1f9d63, #4fd69c);
    }

    .status[data-status='away'] {
      background: light-dark(#d68a00, #ffc260);
    }

    .status[data-status='busy'] {
      background: light-dark(#d6344a, #ff7a85);
    }

    /* Overlap inside <kn-avatar-group> */
    :host-context(kn-avatar-group) {
      box-shadow: 0 0 0 2px var(--kn-avatar-ring, var(--kn-color-canvas));
    }

    :host-context(kn-avatar-group):not(:first-child) {
      margin-inline-start: calc(var(--kn-avatar-size, var(--_size)) * -0.2);
    }
  `,
})
export class KnAvatar {
  /** Имя человека: из него берутся инициалы, цвет и текстовая альтернатива. */
  readonly name = input.required<string>();
  /** Адрес изображения. */
  readonly src = input<string | null>(null);
  /** Размер. Произвольный задаётся переменной `--kn-avatar-size`. */
  readonly size = input<KnSize>('md');
  /** Индикатор присутствия. */
  readonly status = input<'online' | 'away' | 'busy' | 'offline' | null>(null);

  protected readonly failed = signal(false);

  protected readonly initials = computed(() => {
    const words = this.name().trim().split(/\s+/).filter(Boolean);
    const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
    return letters.map((word) => word[0]?.toUpperCase() ?? '').join('');
  });

  protected readonly hue = computed(() => {
    let hash = 0;
    for (const char of this.name()) hash = (hash * 31 + char.charCodeAt(0)) % 360;
    return hash;
  });

  protected readonly label = computed(() => {
    const names = { online: 'в сети', away: 'отошёл', busy: 'занят', offline: 'не в сети' };
    const status = this.status();
    return status ? `${this.name()}, ${names[status]}` : this.name();
  });

  constructor() {
    effect(() => {
      this.src();
      this.failed.set(false);
    });
  }
}

/** Стопка аватаров с перекрытием. */
@Component({
  selector: 'kn-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { role: 'group' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class KnAvatarGroup {}

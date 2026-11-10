import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Плавно раскрывает и сворачивает содержимое любой высоты. Высота анимируется
 * через `grid-template-rows: 0fr → 1fr`, поэтому не нужно измерять контент.
 * Свёрнутое содержимое получает `inert`: оно недоступно ни с клавиатуры, ни скринридеру.
 */
@Component({
  selector: 'kn-collapse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="inner" [attr.inert]="open() ? null : ''"><ng-content /></div>`,
  host: { '[attr.data-open]': 'open() ? "" : null' },
  styles: `
    :host {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows var(--kn-duration-slow) var(--kn-ease-out);
    }

    :host([data-open]) {
      grid-template-rows: 1fr;
    }

    .inner {
      min-block-size: 0;
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity var(--kn-duration-normal) var(--kn-ease-standard),
        visibility 0s linear var(--kn-duration-slow);
    }

    :host([data-open]) .inner {
      opacity: 1;
      visibility: visible;
      transition:
        opacity var(--kn-duration-slow) var(--kn-ease-standard),
        visibility 0s;
    }
  `,
})
export class KnCollapse {
  /** Раскрыто ли содержимое. */
  readonly open = input(false, { transform: booleanAttribute });
}

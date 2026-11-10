import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Навигационная цепочка по паттерну APG Breadcrumb: `nav` со списком ссылок. */
@Component({
  selector: 'kn-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-label]': 'null' },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ol>
        <ng-content />
      </ol>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--kn-text-sm);
    }
  `,
})
export class KnBreadcrumbs {
  /** Доступное имя навигации. */
  readonly ariaLabel = input<string>('Навигационная цепочка', { alias: 'aria-label' });
}

/**
 * Звено цепочки. Внутрь кладётся ссылка; для текущей страницы — просто текст
 * и атрибут `current`.
 */
@Component({
  selector: 'kn-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="item" [attr.aria-current]="current() ? 'page' : null"
    ><ng-content
  /></span>`,
  host: { role: 'listitem', '[attr.data-current]': 'current() ? "" : null' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1);
      min-inline-size: 0;
      color: var(--kn-color-text-muted);
    }

    /* Chevron separator, drawn with a mask so it is never read aloud */
    :host:not(:first-child)::before {
      content: '';
      flex: none;
      inline-size: 1rem;
      block-size: 1rem;
      background: var(--kn-color-text-subtle);
      mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>')
        center / contain no-repeat;
    }

    :host-context([dir='rtl']):not(:first-child)::before {
      transform: scaleX(-1);
    }

    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1-5);
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host([data-current]) {
      color: var(--kn-color-text);
      font-weight: var(--kn-weight-medium);
    }

    :host ::ng-deep a {
      padding: var(--kn-space-0-5) var(--kn-space-1-5);
      border-radius: var(--kn-radius-xs);
      color: inherit;
      text-decoration: none;
    }

    :host ::ng-deep a:hover {
      color: var(--kn-color-text);
      background: var(--kn-color-hover);
    }

    :host ::ng-deep a:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 0;
    }

    :host([data-current]) .item {
      padding-inline: var(--kn-space-1-5);
    }
  `,
})
export class KnBreadcrumb {
  /** Текущая страница: получает `aria-current="page"`. */
  readonly current = input(false, { transform: booleanAttribute });
}

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

/**
 * Боковая навигация. В свёрнутом виде остаются только иконки; подписи пунктов
 * при этом продолжают читаться скринридером.
 */
@Component({
  selector: 'kn-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="header"><ng-content select="[knSidebarHeader]" /></div>
    <nav class="nav" [attr.aria-label]="ariaLabel()">
      <ng-content />
    </nav>
    <div class="footer"><ng-content select="[knSidebarFooter]" /></div>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-collapsed]': 'collapsed() ? "" : null' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      inline-size: var(--kn-sidebar-width, 16rem);
      min-block-size: 0;
      padding: var(--kn-space-3);
      border-radius: var(--kn-sidebar-radius, var(--kn-radius-lg));
      background: var(--kn-sidebar-bg, var(--kn-color-surface));
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-sidebar-shadow, var(--kn-elevation-card));
    }

    :host([data-collapsed]) {
      inline-size: var(--kn-sidebar-collapsed-width, 4rem);
    }

    .nav {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--kn-space-0-5);
      min-block-size: 0;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
    }

    .header:empty,
    .footer:empty {
      display: none;
    }

    .header {
      padding-block-end: var(--kn-space-3);
    }

    .footer {
      padding-block-start: var(--kn-space-3);
    }
  `,
})
export class KnSidebar {
  /** Свёрнута ли панель до иконок. Двусторонняя привязка: `[(collapsed)]`. */
  readonly collapsed = model(false);
  /** Доступное имя навигации. */
  readonly ariaLabel = input<string>('Основная навигация', { alias: 'aria-label' });
}

/** Группа пунктов с заголовком. */
@Component({
  selector: 'kn-sidebar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="label" [id]="labelId">{{ label() }}</div>
    <ng-content />
  `,
  host: { role: 'group', '[attr.aria-labelledby]': 'labelId' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--kn-space-0-5);
    }

    :host:not(:first-child) {
      margin-block-start: var(--kn-space-4);
    }

    .label {
      padding: 0 var(--kn-space-3) var(--kn-space-1);
      font-size: var(--kn-text-xs);
      font-weight: var(--kn-weight-semibold);
      color: var(--kn-color-text-subtle);
      white-space: nowrap;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    :host-context(kn-sidebar[data-collapsed]) .label {
      opacity: 0;
    }
  `,
})
export class KnSidebarGroup {
  /** Заголовок группы. */
  readonly label = input.required<string>();
  protected readonly labelId = inject(_IdGenerator).getId('kn-sidebar-group-');
}

/**
 * Пункт навигации на `<a>` или `<button>`. Иконка — в слот `knSidebarIcon`,
 * счётчик или бейдж — в `knSidebarEnd`. Активный пункт получает `aria-current="page"`.
 */
@Component({
  selector: 'a[kn-sidebar-item], button[kn-sidebar-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="icon"><ng-content select="[knSidebarIcon]" /></span>
    <span class="label"><ng-content /></span>
    <span class="end"><ng-content select="[knSidebarEnd]" /></span>
  `,
  host: {
    '[attr.aria-current]': 'active() ? "page" : null',
    '[attr.data-active]': 'active() ? "" : null',
  },
  styles: `
    :host {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      box-sizing: border-box;
      inline-size: 100%;
      min-block-size: 2.25rem;
      padding: var(--kn-space-1-5) var(--kn-space-3);
      border: 0;
      border-radius: var(--kn-radius-sm);
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      font-size: var(--kn-text-md);
      font-weight: var(--kn-weight-medium);
      text-align: start;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      isolation: isolate;
    }

    :host::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    @media (hover: hover) {
      :host(:hover) {
        color: var(--kn-color-text);
      }

      :host(:hover)::before {
        opacity: 1;
      }
    }

    :host([data-active]),
    :host(.active) {
      color: var(--kn-color-accent-text);
    }

    :host([data-active])::before,
    :host(.active)::before {
      background: var(--kn-color-accent-soft);
      opacity: 1;
    }

    :host(:focus-visible) {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .icon {
      display: inline-flex;
      flex: none;
    }

    .icon:empty,
    .end:empty {
      display: none;
    }

    .label {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    .end {
      display: inline-flex;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    /* Collapsed rail: labels stay in the accessibility tree but leave the layout */
    :host-context(kn-sidebar[data-collapsed]) {
      justify-content: center;
      padding-inline: 0;
    }

    :host-context(kn-sidebar[data-collapsed]) .label,
    :host-context(kn-sidebar[data-collapsed]) .end {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      opacity: 0;
    }
  `,
})
export class KnSidebarItem {
  /** Отмечает текущую страницу. С роутером удобнее `routerLinkActive="active"`. */
  readonly active = input(false, { transform: booleanAttribute });
}

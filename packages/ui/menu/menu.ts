import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  inject,
  Injectable,
  input,
} from '@angular/core';
import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuGroup,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { KnIcon } from '@kenny/ui/icon';

/**
 * Remembers the theme and the style preset of the element that opened a menu,
 * so the overlay can match them.
 */
@Injectable({ providedIn: 'root' })
class KnMenuThemeScope {
  theme: string | null = null;
  preset: string | null = null;

  capture(element: Element): void {
    this.theme = element.closest('[data-theme]')?.getAttribute('data-theme') ?? null;
    this.preset = element.closest('[data-kn-preset]')?.getAttribute('data-kn-preset') ?? null;
  }
}

/**
 * Панель меню. Клавиатура, вложенные меню, поиск по первым буквам и ARIA-роли —
 * из `@angular/cdk/menu` (паттерн APG Menu). Кладётся в `<ng-template>` и
 * открывается триггером.
 */
@Component({
  selector: 'kn-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkMenu],
  template: `<ng-content />`,
  host: { '[attr.data-theme]': 'theme', '[attr.data-kn-preset]': 'preset' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      min-inline-size: var(--kn-menu-min-width, 12rem);
      max-inline-size: 20rem;
      max-block-size: min(26rem, calc(100vh - 2rem));
      padding: var(--kn-space-1-5);
      overflow-y: auto;
      overscroll-behavior: contain;
      border-radius: calc(var(--kn-radius-sm) + var(--kn-space-1-5));
      background: var(--kn-menu-bg, var(--kn-color-surface-raised));
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-menu-shadow, var(--kn-elevation-popup));
      color: var(--kn-color-text);
      outline: none;
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }
  `,
})
export class KnMenu {
  private readonly scope = inject(KnMenuThemeScope);
  protected readonly theme = this.scope.theme;
  protected readonly preset = this.scope.preset;
}

const itemStyles = `
  :host {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--kn-space-2);
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: 2.125rem;
    padding: var(--kn-space-1-5) var(--kn-space-3);
    border: 0;
    border-radius: var(--kn-radius-sm);
    background: none;
    color: var(--kn-color-text);
    font: inherit;
    font-size: var(--kn-text-md);
    line-height: var(--kn-leading-snug);
    text-align: start;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    outline: none;
  }

  :host([data-tone='danger']) {
    color: var(--kn-color-danger);
  }

  /* One highlight for hover and keyboard focus, as in native menus */
  :host(:focus),
  :host(:hover:not([aria-disabled='true'])),
  :host([aria-expanded='true']) {
    background: var(--kn-color-selection);
    color: var(--kn-color-on-selection);
  }

  :host([data-tone='danger']:focus),
  :host([data-tone='danger']:hover:not([aria-disabled='true'])) {
    background: var(--kn-color-danger);
    color: var(--kn-color-on-danger);
  }

  :host([aria-disabled='true']) {
    color: var(--kn-color-text-disabled);
    cursor: not-allowed;
  }

  .label {
    display: flex;
    flex: 1;
    align-items: center;
    gap: var(--kn-space-2);
    min-inline-size: 0;
  }

  .mark,
  .chevron {
    --kn-icon-size: 1rem;
    flex: none;
  }

  .mark {
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity var(--kn-duration-fast) var(--kn-ease-standard),
      transform var(--kn-duration-normal) var(--kn-ease-spring-bouncy);
  }

  :host([aria-checked='true']) .mark {
    opacity: 1;
    transform: none;
  }

  .chevron {
    margin-inline-end: calc(var(--kn-space-1) * -1);
    opacity: 0.6;
  }

  :host-context([dir='rtl']) .chevron {
    transform: scaleX(-1);
  }
`;

/** Пункт меню. Событие `triggered` срабатывает по клику, Enter и пробелу. */
@Component({
  selector: '[kn-menu-item]',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  template: `
    <span class="label"><ng-content /></span>
    <ng-content select="kn-menu-shortcut" />
    @if (hasSubmenu) {
      <kn-icon class="chevron" name="chevron-right" />
    }
  `,
  host: { '[attr.data-tone]': 'tone()' },
  styles: itemStyles,
})
export class KnMenuItem {
  /** `danger` — для необратимых действий. */
  readonly tone = input<'neutral' | 'danger'>('neutral');
  protected readonly hasSubmenu = inject(CdkMenuTrigger, { optional: true, self: true }) !== null;
}

/** Пункт-флажок. Состояние хранит приложение: меняйте `checked` по событию `triggered`. */
@Component({
  selector: '[kn-menu-item-checkbox]',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkMenuItemCheckbox,
      inputs: ['cdkMenuItemChecked: checked', 'cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  template: `
    <kn-icon class="mark" name="check" />
    <span class="label"><ng-content /></span>
  `,
  styles: itemStyles,
})
export class KnMenuItemCheckbox {}

/** Пункт-переключатель внутри `<kn-menu-group>`: выбран один из группы. */
@Component({
  selector: '[kn-menu-item-radio]',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkMenuItemRadio,
      inputs: ['cdkMenuItemChecked: checked', 'cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  template: `
    <kn-icon class="mark" name="check" />
    <span class="label"><ng-content /></span>
  `,
  styles: itemStyles,
})
export class KnMenuItemRadio {}

/** Группа пунктов с необязательным заголовком. Радио-пункты внутри взаимоисключающие. */
@Component({
  selector: 'kn-menu-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkMenuGroup],
  template: `
    @if (label()) {
      <div class="label" aria-hidden="true">{{ label() }}</div>
    }
    <ng-content />
  `,
  host: { '[attr.aria-label]': 'label() || null' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }

    .label {
      padding: var(--kn-space-1-5) var(--kn-space-3) var(--kn-space-1);
      font-size: var(--kn-text-xs);
      font-weight: var(--kn-weight-semibold);
      color: var(--kn-color-text-subtle);
    }
  `,
})
export class KnMenuGroup {
  /** Заголовок группы. */
  readonly label = input<string>('');
}

/** Разделитель между группами пунктов. */
@Component({
  selector: 'kn-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: { role: 'separator' },
  styles: `
    :host {
      flex: none;
      block-size: 1px;
      margin: var(--kn-space-1) var(--kn-space-1);
      background: var(--kn-color-border);
    }
  `,
})
export class KnMenuSeparator {}

/** Подсказка о горячей клавише справа от пункта. Только визуальная. */
@Component({
  selector: 'kn-menu-shortcut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host {
      margin-inline-start: var(--kn-space-6);
      font-size: var(--kn-text-sm);
      opacity: 0.6;
    }
  `,
})
export class KnMenuShortcut {}

/**
 * Открывает меню по клику, Enter, пробелу и стрелке вниз:
 * `<button [knMenuTrigger]="menu">`. На пункте меню открывает вложенное меню.
 */
@Directive({
  selector: '[knMenuTrigger]',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: [
        'cdkMenuTriggerFor: knMenuTrigger',
        'cdkMenuPosition: knMenuPosition',
        'cdkMenuTriggerData: knMenuData',
      ],
      outputs: ['cdkMenuOpened: menuOpened', 'cdkMenuClosed: menuClosed'],
    },
  ],
  host: { '(pointerdown)': 'capture()', '(keydown)': 'capture()' },
})
export class KnMenuTrigger {
  private readonly scope = inject(KnMenuThemeScope);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    inject(CdkMenuTrigger).transformOriginSelector = 'kn-menu';
  }

  protected capture(): void {
    this.scope.capture(this.element);
  }
}

/**
 * Открывает контекстное меню по правому клику, Shift+F10 и клавише меню:
 * `<div [knContextMenu]="menu">`.
 */
@Directive({
  selector: '[knContextMenu]',
  hostDirectives: [
    {
      directive: CdkContextMenuTrigger,
      inputs: [
        'cdkContextMenuTriggerFor: knContextMenu',
        'cdkContextMenuDisabled: knContextMenuDisabled',
        'cdkContextMenuTriggerData: knContextMenuData',
      ],
      outputs: ['cdkContextMenuOpened: menuOpened', 'cdkContextMenuClosed: menuClosed'],
    },
  ],
  host: { '(pointerdown)': 'capture()', '(keydown)': 'capture()' },
})
export class KnContextMenuTrigger {
  private readonly scope = inject(KnMenuThemeScope);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    inject(CdkContextMenuTrigger).transformOriginSelector = 'kn-menu';
  }

  protected capture(): void {
    this.scope.capture(this.element);
  }
}

import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KnButton } from '@kenny/ui/button';
import { KnCommandPalette } from '@kenny/ui/command-palette';
import { KnDrawer, KnDrawerBody, KnDrawerHeader } from '@kenny/ui/drawer';
import { KnIcon } from '@kenny/ui/icon';
import { KnMenu, KnMenuGroup, KnMenuItemRadio, KnMenuTrigger } from '@kenny/ui/menu';
import { KnTooltip } from '@kenny/ui/tooltip';
import { allComponents, examples, guides } from './core/nav';
import { PRESETS, ThemeService } from './core/theme';
import { DocsNav } from './shell/docs-nav';

const THEME_LABEL = { system: 'как в системе', light: 'светлая', dark: 'тёмная' };
const THEME_ICON = { system: 'monitor', light: 'sun', dark: 'moon' };

@Component({
  selector: 'docs-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    KnButton,
    KnIcon,
    KnTooltip,
    KnDrawerHeader,
    KnDrawerBody,
    DocsNav,
    KnMenu,
    KnMenuGroup,
    KnMenuItemRadio,
    KnMenuTrigger,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip" href="#content" (click)="skip($event)">К содержимому</a>

    <header class="bar">
      <button
        class="menu"
        kn-icon-button
        variant="ghost"
        tone="neutral"
        aria-label="Открыть навигацию"
        (click)="openNav()"
      >
        <kn-icon name="menu" />
      </button>
      <a class="logo" routerLink="/" aria-label="Kenny, на главную">
        <span class="mark" aria-hidden="true"></span>
        kenny
      </a>
      <nav class="links" aria-label="Разделы сайта">
        <a routerLink="/docs" routerLinkActive="active">Документация</a>
        <a routerLink="/components" routerLinkActive="active">Компоненты</a>
        <a routerLink="/examples" routerLinkActive="active">Примеры</a>
      </nav>
      <span class="spacer"></span>
      <button class="search" type="button" (click)="palette.open()">
        <kn-icon name="search" [size]="16" />
        <span class="search-text">Поиск</span>
        <kbd>{{ hotkey() }}</kbd>
      </button>
      <button
        class="style"
        kn-button
        variant="ghost"
        tone="neutral"
        [attr.aria-label]="'Стиль: ' + presetLabel() + '. Сменить'"
        [knMenuTrigger]="styles"
      >
        <kn-icon name="grid" />
        <span class="style-text">{{ presetLabel() }}</span>
      </button>
      <button
        kn-icon-button
        variant="ghost"
        tone="neutral"
        [attr.aria-label]="'Тема: ' + themeLabel() + '. Сменить'"
        [knTooltip]="'Тема: ' + themeLabel()"
        knTooltipPlacement="bottom"
        (click)="theme.next()"
      >
        <kn-icon [name]="themeIcon()" />
      </button>
    </header>

    <router-outlet />

    <footer class="footer">
      <span>Kenny 0.1.0 — MIT</span>
      <span>Собрано из собственных компонентов на Angular 22</span>
    </footer>

    <ng-template #styles>
      <kn-menu>
        <kn-menu-group label="Стиль компонентов">
          @for (preset of presets; track preset.id) {
            <button
              kn-menu-item-radio
              [checked]="theme.preset() === preset.id"
              (triggered)="theme.preset.set(preset.id)"
            >
              <span class="style-option">
                {{ preset.label }}
                <small>{{ preset.summary }}</small>
              </span>
            </button>
          }
        </kn-menu-group>
      </kn-menu>
    </ng-template>

    <ng-template #nav let-ref>
      <kn-drawer-header heading="Навигация" />
      <kn-drawer-body><docs-nav (navigated)="ref.close()" /></kn-drawer-body>
    </ng-template>
  `,
  styles: `
    /* A column as tall as the screen, so the footer rests at the bottom on short pages */
    :host {
      display: flex;
      flex-direction: column;
      min-block-size: 100dvh;
    }

    .skip {
      position: fixed;
      inset-block-start: var(--kn-space-2);
      inset-inline-start: var(--kn-space-2);
      z-index: calc(var(--kn-z-sticky) + 1);
      padding: var(--kn-space-2) var(--kn-space-4);
      border-radius: var(--kn-radius-control);
      background: var(--kn-color-accent);
      color: var(--kn-color-on-accent);
      text-decoration: none;
      transform: translateY(-300%);
    }

    .skip:focus {
      transform: none;
    }

    /* A floating glass capsule rather than a full-width bar */
    .bar {
      position: sticky;
      inset-block-start: var(--kn-space-3);
      z-index: var(--kn-z-sticky);
      display: flex;
      align-items: center;
      gap: var(--kn-space-1);
      max-inline-size: 87rem;
      margin: var(--kn-space-3) auto var(--kn-space-4);
      inline-size: calc(100% - var(--kn-space-6) * 2);
      box-sizing: border-box;
      padding: var(--kn-space-1-5) var(--kn-space-2) var(--kn-space-1-5) var(--kn-space-4);
      /* Concentric with the controls inside: their radius plus the bar's padding */
      border-radius: calc(var(--kn-radius-control) + var(--kn-space-1-5));
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      -webkit-backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-shadow-glass-md);
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
      margin-inline-end: var(--kn-space-4);
      color: var(--kn-color-text);
      font-size: var(--kn-text-lg);
      font-weight: 700;
      letter-spacing: var(--kn-tracking-tight);
      text-decoration: none;
    }

    /* The logo is the wallpaper in miniature: a cobalt field, an amber disc, a pane of glass */
    .mark {
      position: relative;
      inline-size: 1.5rem;
      block-size: 1.5rem;
      border-radius: 0.45rem;
      background:
        radial-gradient(circle at 70% 30%, #ffb23e 0 22%, transparent 23%), var(--kn-accent-600);
      overflow: hidden;
    }

    .mark::after {
      content: '';
      position: absolute;
      inset: 42% 24% 14% 16%;
      border-radius: 0.2rem;
      background: rgb(255 255 255 / 0.82);
    }

    .links {
      display: flex;
      gap: var(--kn-space-1);
    }

    .links a {
      padding: var(--kn-space-1-5) var(--kn-space-3);
      border-radius: var(--kn-radius-control);
      color: var(--kn-color-text-muted);
      font-weight: var(--kn-weight-medium);
      text-decoration: none;
    }

    .links a:hover {
      color: var(--kn-color-text);
      background: var(--kn-color-hover);
    }

    .links a.active {
      color: var(--kn-color-text);
    }

    .spacer {
      flex: 1;
    }

    .search {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
      block-size: var(--kn-size-md);
      padding: 0 var(--kn-space-2) 0 var(--kn-space-3);
      border: 0;
      border-radius: var(--kn-radius-control);
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      color: var(--kn-color-text-muted);
      font: inherit;
      cursor: pointer;
    }

    .search:hover {
      box-shadow: inset 0 0 0 1px var(--kn-color-border-strong);
    }

    .search-text {
      min-inline-size: 7rem;
      text-align: start;
    }

    .logo:focus-visible,
    .links a:focus-visible,
    .search:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
      border-radius: var(--kn-radius-control);
    }

    .style {
      --kn-button-padding: var(--kn-space-3);
    }

    .style-option {
      display: grid;
      gap: 1px;
      padding-block: var(--kn-space-0-5);
      text-align: start;
    }

    .style-option small {
      font-size: var(--kn-text-xs);
      color: var(--kn-color-text-muted);
    }

    .menu {
      display: none;
      margin-inline-start: calc(var(--kn-space-2) * -1);
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--kn-space-2) var(--kn-space-6);
      box-sizing: border-box;
      inline-size: 100%;
      max-inline-size: 87rem;
      margin: auto auto 0;
      padding: var(--kn-space-12) var(--kn-space-6) var(--kn-space-6);
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    @media (max-width: 56rem) {
      .bar {
        inline-size: calc(100% - var(--kn-space-3) * 2);
      }

      .menu {
        display: inline-flex;
      }

      .links,
      .search-text,
      .search kbd,
      .style-text {
        display: none;
      }

      .style {
        --kn-button-padding: 0;
        inline-size: var(--kn-size-md);
      }

      .search {
        inline-size: var(--kn-size-md);
        justify-content: center;
        padding: 0;
      }
    }
  `,
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly palette = inject(KnCommandPalette);
  private readonly drawer = inject(KnDrawer);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly nav = viewChild.required<TemplateRef<unknown>>('nav');

  protected readonly themeLabel = computed(() => THEME_LABEL[this.theme.mode()]);
  protected readonly themeIcon = computed(() => THEME_ICON[this.theme.mode()]);
  protected readonly presets = PRESETS;
  protected readonly presetLabel = computed(
    () => PRESETS.find((preset) => preset.id === this.theme.preset())?.label ?? '',
  );
  protected readonly hotkey = signal('Ctrl K');

  constructor() {
    afterNextRender(() => {
      if (/Mac|iPhone|iPad/.test(this.document.defaultView?.navigator.platform ?? ''))
        this.hotkey.set('⌘K');
    });
    const go = (path: string) => () => void this.router.navigateByUrl(path);
    this.palette.register([
      ...guides.map((g) => ({
        id: g.path,
        group: 'Руководства',
        label: g.title,
        icon: g.icon,
        run: go(g.path),
      })),
      ...allComponents.map((c) => ({
        id: `/components/${c.slug}`,
        group: 'Компоненты',
        label: c.title,
        keywords: [c.slug],
        run: go(`/components/${c.slug}`),
      })),
      ...examples.map((e) => ({
        id: e.path,
        group: 'Примеры',
        label: e.title,
        icon: e.icon,
        run: go(e.path),
      })),
      ...PRESETS.map((preset) => ({
        id: `preset.${preset.id}`,
        group: 'Стиль',
        label: `Стиль «${preset.label}»`,
        icon: 'grid',
        keywords: [preset.id, 'preset', 'style', 'стиль'],
        run: () => this.theme.preset.set(preset.id),
      })),
      {
        id: 'theme.light',
        group: 'Тема',
        label: 'Светлая тема',
        icon: 'sun',
        keywords: ['light'],
        run: () => this.theme.mode.set('light'),
      },
      {
        id: 'theme.dark',
        group: 'Тема',
        label: 'Тёмная тема',
        icon: 'moon',
        keywords: ['dark'],
        run: () => this.theme.mode.set('dark'),
      },
      {
        id: 'theme.system',
        group: 'Тема',
        label: 'Тема как в системе',
        icon: 'monitor',
        keywords: ['system', 'auto'],
        run: () => this.theme.mode.set('system'),
      },
    ]);
  }

  protected openNav(): void {
    this.drawer.open(this.nav(), { side: 'start', size: '19rem' });
  }

  /** `<base href>` would turn `#content` into a navigation to the home page. */
  protected skip(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('content');
    main?.setAttribute('tabindex', '-1');
    main?.focus();
  }
}

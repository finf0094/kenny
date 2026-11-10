import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnAvatar, KnAvatarGroup } from '@kenny/ui/avatar';
import { KnBadge } from '@kenny/ui/badge';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnCheckbox } from '@kenny/ui/checkbox';
import { KnCommandPalette } from '@kenny/ui/command-palette';
import { KnIcon } from '@kenny/ui/icon';
import { KnProgress } from '@kenny/ui/progress';
import { KnSlider } from '@kenny/ui/slider';
import { KnSwitch } from '@kenny/ui/switch';
import { KnTab, KnTabs } from '@kenny/ui/tabs';
import { KnToaster } from '@kenny/ui/toast';
import { KnToolbar, KnToolbarSeparator } from '@kenny/ui/toolbar';
import { KnTooltip } from '@kenny/ui/tooltip';
import { allComponents, componentGroups } from '../core/nav';
import { ACCENTS, ThemeService } from '../core/theme';

const INSTALL = 'pnpm add @kenny/ui @kenny/tokens @angular/cdk';

const PERIODS = [
  { id: 'day', tab: 'День', minutes: 142, done: 71, label: 'Сегодня' },
  { id: 'week', tab: 'Неделя', minutes: 815, done: 58, label: 'За неделю' },
  { id: 'month', tab: 'Месяц', minutes: 3260, done: 83, label: 'За месяц' },
];

@Component({
  imports: [
    RouterLink,
    KnButton,
    KnIcon,
    KnCard,
    KnTabs,
    KnTab,
    KnSwitch,
    KnSlider,
    KnProgress,
    KnAvatar,
    KnAvatarGroup,
    KnBadge,
    KnToolbar,
    KnToolbarSeparator,
    KnTooltip,
    KnCheckbox,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="content" class="home">
      <section class="hero" aria-labelledby="hero-title">
        <div class="pitch">
          <h1 id="hero-title">Стеклянные компоненты для Angular</h1>
          <p class="lead">
            {{ count }} доступных компонентов на signals. Полупрозрачные слои, пружинная анимация,
            светлая и тёмная темы на CSS-переменных. Из зависимостей — только Angular CDK.
          </p>
          <div class="cta">
            <a kn-button size="lg" routerLink="/docs/getting-started">Начать работу</a>
            <a kn-button size="lg" variant="glass" tone="neutral" routerLink="/components/button"
              >Смотреть компоненты</a
            >
          </div>
          <button
            class="install"
            type="button"
            [attr.aria-label]="'Скопировать команду установки: ' + install"
            (click)="copy()"
          >
            <code>{{ install }}</code>
            <kn-icon [name]="copied() ? 'check' : 'copy'" [size]="16" />
          </button>
        </div>

        <!-- Not a screenshot: every control below is the real component -->
        <div class="stage" aria-label="Живой пример: панель режима фокуса">
          <kn-toolbar class="float-toolbar" aria-label="Быстрые действия">
            <button
              kn-icon-button
              size="sm"
              variant="ghost"
              tone="neutral"
              aria-label="Поиск по командам"
              knTooltip="Командная палитра"
              (click)="palette.open()"
            >
              <kn-icon name="command" />
            </button>
            <button
              kn-icon-button
              size="sm"
              variant="ghost"
              tone="neutral"
              aria-label="Показать уведомление"
              knTooltip="Показать уведомление"
              (click)="notify()"
            >
              <kn-icon name="bell" />
            </button>
            <kn-toolbar-separator />
            <button
              kn-icon-button
              size="sm"
              variant="ghost"
              tone="neutral"
              [attr.aria-label]="'Сменить тему'"
              knTooltip="Сменить тему"
              (click)="theme.next()"
            >
              <kn-icon
                [name]="
                  theme.mode() === 'dark' ? 'moon' : theme.mode() === 'light' ? 'sun' : 'monitor'
                "
              />
            </button>
          </kn-toolbar>

          <kn-card class="focus-card" padding="lg">
            <div class="row">
              <div>
                <div class="title">Режим фокуса</div>
                <div class="note">{{ focusOn() ? 'Уведомления приглушены' : 'Выключен' }}</div>
              </div>
              <kn-switch size="lg" aria-label="Режим фокуса" [(checked)]="focusOn" />
            </div>

            <kn-tabs stretch size="sm" aria-label="Период" [(value)]="period">
              @for (item of periods; track item.id) {
                <kn-tab [value]="item.id" [label]="item.tab">
                  <div class="number">
                    {{ hours(item.minutes) }}<span>ч</span> {{ item.minutes % 60 }}<span>мин</span>
                  </div>
                  <div class="note">{{ item.label }} без отвлечений</div>
                  <kn-progress
                    class="goal"
                    [aria-label]="'Доля от цели, ' + item.label.toLowerCase()"
                    [value]="item.done"
                  />
                </kn-tab>
              }
            </kn-tabs>

            <div class="row">
              <kn-icon name="sun" [size]="18" />
              <kn-slider class="grow" aria-label="Яркость экрана" [(value)]="brightness" />
              <span class="value">{{ brightness() }}%</span>
            </div>

            <div class="row">
              <kn-avatar-group aria-label="Сейчас в фокусе">
                <kn-avatar size="sm" name="Анна Орлова" />
                <kn-avatar size="sm" name="Борис Ким" />
                <kn-avatar size="sm" name="Вера Соколова" />
              </kn-avatar-group>
              <kn-badge tone="success" dot>3 в фокусе</kn-badge>
              <span class="grow"></span>
              <button kn-button size="sm" [loading]="saving()" (click)="save()">Сохранить</button>
            </div>
          </kn-card>
        </div>
      </section>

      <section class="split" aria-labelledby="motion-title">
        <div>
          <h2 id="motion-title">Движение, которое что-то сообщает</h2>
          <p>
            Пружины — там, где вы двигаете элемент сами: ползунок, галочка, индикатор вкладок. Всё
            остальное быстро и по делу. Анимируются только transform и opacity, а системная
            настройка «уменьшить движение» отключает переходы целиком.
          </p>
          <a routerLink="/docs/motion">Как устроена система движения</a>
        </div>
        <div class="tray kn-wallpaper-sm">
          <kn-switch [checked]="true">Переключатель</kn-switch>
          <kn-checkbox [checked]="true">Флажок</kn-checkbox>
          <button kn-button variant="glass" tone="neutral">Нажмите и держите</button>
        </div>
      </section>

      <section class="split reverse" aria-labelledby="theme-title">
        <div>
          <h2 id="theme-title">Тема меняется без пересборки</h2>
          <p>
            Цвета, радиусы, тени и длительности — CSS-переменные. Атрибут
            <code>data-theme</code> переключает тему для страницы или любого её блока, а шкала из
            одиннадцати значений перекрашивает акцент. Выберите цвет — перекрасится весь сайт.
          </p>
          <a routerLink="/docs/theming">Темизация и токены</a>
        </div>
        <div class="tray plain" role="group" aria-label="Акцентный цвет сайта">
          @for (accent of accents; track accent.id) {
            <button
              class="swatch"
              type="button"
              [attr.aria-pressed]="theme.accent() === accent.id"
              [style.--_color]="accent.scale ? accent.scale[6] : '#1f4bdb'"
              (click)="theme.accent.set(accent.id)"
            >
              <span class="dot" aria-hidden="true"></span>{{ accent.label }}
            </button>
          }
        </div>
      </section>

      <section class="split" aria-labelledby="a11y-title">
        <div>
          <h2 id="a11y-title">Клавиатура и скринридер — по умолчанию</h2>
          <p>
            Компоненты следуют паттернам WAI-ARIA APG: один Tab-стоп на составной виджет, стрелки
            внутри, возврат фокуса после закрытия оверлея. Флажки, переключатели и ползунки —
            настоящие элементы форм. Поведение закреплено тестами с axe-core.
          </p>
          <a routerLink="/docs/accessibility">Что именно гарантируется</a>
        </div>
        <div class="tray plain keys">
          <button kn-button variant="soft" (click)="palette.open()">
            Открыть палитру команд <kbd>Ctrl K</kbd>
          </button>
          <p>
            <kbd>Tab</kbd> между виджетами, <kbd>←</kbd> <kbd>→</kbd> внутри,
            <kbd>Esc</kbd> закрывает верхний слой.
          </p>
        </div>
      </section>

      <section class="index" aria-labelledby="index-title">
        <h2 id="index-title">Все компоненты</h2>
        <div class="columns">
          @for (group of groups; track group.label) {
            <div>
              <h3>{{ group.label }}</h3>
              <ul>
                @for (item of group.items; track item.slug) {
                  <li>
                    <a [routerLink]="['/components', item.slug]">{{ item.title }}</a>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </section>
    </main>
  `,
  styles: `
    .home {
      max-inline-size: 76rem;
      margin-inline: auto;
      padding: 0 var(--kn-space-6);
    }

    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      align-items: center;
      gap: var(--kn-space-12);
      min-block-size: min(46rem, calc(100dvh - 7rem));
      padding-block: var(--kn-space-10) var(--kn-space-16);
    }

    h1 {
      margin: 0;
      font-size: clamp(2.5rem, 6.2vw, 4.75rem);
      font-weight: 680;
      line-height: 0.98;
      letter-spacing: -0.045em;
      text-wrap: balance;
    }

    .lead {
      margin: var(--kn-space-6) 0 0;
      max-inline-size: 34rem;
      font-size: var(--kn-text-xl);
      line-height: var(--kn-leading-normal);
      color: var(--kn-color-text-muted);
      text-wrap: pretty;
    }

    .cta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-3);
      margin-block-start: var(--kn-space-8);
    }

    .install {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-3);
      max-inline-size: 100%;
      margin-block-start: var(--kn-space-6);
      padding: var(--kn-space-2) var(--kn-space-3);
      border: 0;
      border-radius: var(--kn-radius-sm);
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      cursor: pointer;
    }

    .install code {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--kn-text-sm);
    }

    .install:hover {
      color: var(--kn-color-text);
      background: var(--kn-color-hover);
    }

    .install:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    /* One orchestrated entrance for the hero, nothing else on the page animates on load */
    .stage {
      position: relative;
      justify-self: end;
      inline-size: min(100%, 25rem);
      animation: kn-rise-in var(--kn-duration-slower) var(--kn-ease-spring) backwards;
      animation-delay: 80ms;
    }

    .float-toolbar {
      position: absolute;
      inset-block-start: calc(var(--kn-space-12) * -1);
      inset-inline-end: var(--kn-space-4);
    }

    .focus-card {
      --kn-card-radius: var(--kn-radius-2xl);
      box-shadow: var(--kn-shadow-glass-xl);
    }

    .focus-card ::ng-deep .body {
      gap: var(--kn-space-5);
    }

    .row {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
    }

    .row > div:first-child {
      flex: 1;
    }

    .grow {
      flex: 1;
    }

    .title {
      font-size: var(--kn-text-lg);
      font-weight: var(--kn-weight-semibold);
      letter-spacing: var(--kn-tracking-snug);
    }

    .note {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .goal {
      margin-block-start: var(--kn-space-4);
    }

    .number {
      font-size: var(--kn-text-4xl);
      font-weight: 650;
      line-height: 1;
      letter-spacing: var(--kn-tracking-tight);
      font-variant-numeric: tabular-nums;
    }

    .number span {
      margin-inline: 0.15em 0.3em;
      font-size: var(--kn-text-lg);
      font-weight: var(--kn-weight-medium);
      letter-spacing: 0;
      color: var(--kn-color-text-muted);
    }

    .value {
      min-inline-size: 2.75rem;
      text-align: end;
      font-size: var(--kn-text-sm);
      font-variant-numeric: tabular-nums;
      color: var(--kn-color-text-muted);
    }

    .split {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: center;
      gap: var(--kn-space-12);
      padding-block: var(--kn-space-12);
    }

    .split.reverse > :first-child {
      order: 2;
    }

    h2 {
      margin: 0;
      font-size: clamp(var(--kn-text-2xl), 3.2vw, var(--kn-text-3xl));
      font-weight: 650;
      line-height: var(--kn-leading-tight);
      letter-spacing: var(--kn-tracking-tight);
      text-wrap: balance;
    }

    .split p {
      margin: var(--kn-space-4) 0;
      max-inline-size: 32rem;
      font-size: var(--kn-text-lg);
      line-height: var(--kn-leading-relaxed);
      color: var(--kn-color-text-muted);
      text-wrap: pretty;
    }

    .split a {
      font-weight: var(--kn-weight-medium);
    }

    .tray {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-6);
      min-block-size: 11rem;
      padding: var(--kn-space-8);
      border-radius: var(--kn-radius-xl);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .tray.plain {
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      -webkit-backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-shadow-glass-md);
      gap: var(--kn-space-2);
    }

    .keys {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }

    .keys p {
      margin: var(--kn-space-3) 0 0;
      font-size: var(--kn-text-md);
    }

    .keys button kbd {
      margin-inline-start: var(--kn-space-2);
    }

    .swatch {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
      block-size: var(--kn-size-lg);
      padding: 0 var(--kn-space-5) 0 var(--kn-space-4);
      border: 0;
      border-radius: var(--kn-radius-full);
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      color: var(--kn-color-text);
      font: inherit;
      font-weight: var(--kn-weight-medium);
      cursor: pointer;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .swatch:active {
      transform: scale(0.95);
    }

    .swatch[aria-pressed='true'] {
      box-shadow: inset 0 0 0 2px var(--_color);
    }

    .swatch:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .dot {
      inline-size: 1.125rem;
      block-size: 1.125rem;
      border-radius: 50%;
      background: var(--_color);
    }

    .index {
      margin-block: var(--kn-space-12) var(--kn-space-8);
      padding: clamp(var(--kn-space-6), 4vw, var(--kn-space-12));
      border-radius: var(--kn-radius-2xl);
      background: var(--kn-glass-bg-strong);
      backdrop-filter: var(--kn-glass-filter-strong);
      -webkit-backdrop-filter: var(--kn-glass-filter-strong);
      box-shadow: var(--kn-shadow-glass-md);
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: var(--kn-space-8);
      margin-block-start: var(--kn-space-8);
    }

    h3 {
      margin: 0 0 var(--kn-space-3);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-semibold);
      color: var(--kn-color-text-subtle);
    }

    .index ul {
      display: grid;
      gap: var(--kn-space-1-5);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .index a {
      color: var(--kn-color-text);
      font-weight: var(--kn-weight-medium);
      text-decoration: none;
    }

    .index a:hover {
      color: var(--kn-color-accent-text);
      text-decoration: underline;
    }

    @media (max-width: 60rem) {
      .hero,
      .split {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--kn-space-10);
      }

      .hero {
        padding-block-start: var(--kn-space-6);
      }

      .stage {
        justify-self: start;
        margin-block-start: var(--kn-space-12);
      }

      .split.reverse > :first-child {
        order: 0;
      }
    }

    @media (max-width: 40rem) {
      .home {
        padding-inline: var(--kn-space-4);
      }

      .lead {
        font-size: var(--kn-text-lg);
      }
    }
  `,
})
export default class HomePage {
  protected readonly theme = inject(ThemeService);
  protected readonly palette = inject(KnCommandPalette);
  private readonly toaster = inject(KnToaster);
  private readonly clipboard = inject(Clipboard);

  protected readonly install = INSTALL;
  protected readonly count = allComponents.length;
  protected readonly groups = componentGroups;
  protected readonly accents = ACCENTS;

  protected readonly focusOn = signal(true);
  protected readonly period = signal<string | undefined>('day');
  protected readonly brightness = signal(64);
  protected readonly saving = signal(false);
  protected readonly copied = signal(false);

  protected readonly periods = PERIODS;

  protected hours(minutes: number): number {
    return Math.floor(minutes / 60);
  }

  protected copy(): void {
    if (this.clipboard.copy(INSTALL)) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    }
  }

  protected notify(): void {
    this.toaster.show({
      title: 'Это настоящий Toast',
      description: 'Наведите курсор — таймер встанет на паузу.',
    });
  }

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.toaster.success('Настройки фокуса сохранены');
    }, 1100);
  }
}

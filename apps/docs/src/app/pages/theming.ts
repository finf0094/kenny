import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnSwitch } from '@kenny/ui/switch';
import { KnRadio, KnRadioGroup } from '@kenny/ui/radio';
import { DocsCode } from '../core/code-block';
import { ACCENTS, ThemeMode, ThemeService } from '../core/theme';

@Component({
  imports: [RouterLink, DocsCode, KnRadioGroup, KnRadio, KnButton, KnCard, KnSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Темизация</h1>
      <p class="lead">
        Тема — это значения CSS-переменных. Чтобы сменить её, не нужны ни пересборка, ни сервис:
        достаточно атрибута на элементе.
      </p>
      <p>
        На этой странице — светлая и тёмная темы, акцентный цвет и переменные отдельных компонентов.
        Материал поверхностей, форма кнопок и плотность меняются целиком — пресетом: см.
        <a routerLink="/docs/presets">Стили</a>.
      </p>

      <h2 id="themes">Светлая и тёмная</h2>
      <p>
        Семантические токены записаны через <code>light-dark()</code>, а активную половину выбирает
        <code>color-scheme</code>. Без атрибута тема следует системной настройке;
        <code>data-theme</code>
        фиксирует её. Попробуйте — переключатель меняет тему всего сайта:
      </p>
      <kn-radio-group
        orientation="horizontal"
        aria-label="Тема сайта"
        [value]="theme.mode()"
        (valueChange)="setMode($event)"
      >
        <kn-radio value="system">Как в системе</kn-radio>
        <kn-radio value="light">Светлая</kn-radio>
        <kn-radio value="dark">Тёмная</kn-radio>
      </kn-radio-group>
      <docs-code snippet="theme-attribute.html" label="Атрибут темы" />
      <p>
        Тёмная тема — не инверсия светлой. У неё свои поверхности (приподнятый слой светлее, а не
        темнее), более светлый акцент с тёмным текстом на нём и более плотные тени.
      </p>

      <h3 id="nested">Вложенные темы</h3>
      <p>
        Атрибут работает на любом элементе. Блок ниже всегда тёмный, какой бы ни была тема страницы:
      </p>
      <div class="nested kn-wallpaper-sm" data-theme="dark">
        <kn-card>
          <strong>Тёмный остров</strong>
          <kn-switch [checked]="true">Те же компоненты, другая тема</kn-switch>
          <div><button kn-button size="sm">Действие</button></div>
        </kn-card>
      </div>
      <p>
        Оверлеи, открытые изнутри такого блока (списки, поповеры, меню), наследуют его тему, хотя и
        рендерятся в конце <code>&lt;body&gt;</code>.
      </p>

      <h3 id="switcher">Переключатель в приложении</h3>
      <docs-code snippet="theme-switch.ts" label="Сервис переключения темы" />

      <h2 id="accent">Свой акцент</h2>
      <p>
        Все акцентные токены выводятся из шкалы <code>--kn-accent-50 … 950</code>. Переопределите
        шкалу — и перекрасятся кнопки, фокус, выделения и ссылки в обеих темах. Выберите пресет,
        чтобы увидеть это на всём сайте:
      </p>
      <div class="swatches" role="group" aria-label="Акцентный цвет сайта">
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
      <docs-code snippet="accent.css" label="Шкала акцента" />
      <p>
        Шаг 600 должен давать контраст не ниже 4,5:1 с белым, шаг 400 — с шагом 950: на них держится
        текст кнопок в светлой и тёмной темах.
      </p>

      <h2 id="component-vars">Переменные компонентов</h2>
      <p>
        У компонентов есть собственные переменные с префиксом имени:
        <code>--kn-button-radius</code>, <code>--kn-card-bg</code>. Они читаются с запасным
        значением из токенов, поэтому их можно задать на любом предке. Полный список — в разделе API
        на странице каждого компонента.
      </p>
      <docs-code snippet="component-vars.css" label="Переменные компонентов" />

      <h2 id="surface">Своя поверхность</h2>
      <p>
        Карточки, панели и всплывающие слои собраны из трёх ролей: цвет поверхности, то, что она
        делает с фоном под собой, и её край. Собственный блок, сделанный из тех же токенов, в любом
        стиле выглядит как часть библиотеки: в базовом это лист с рамкой, в «Стекле» —
        полупрозрачная панель с бликом.
      </p>
      <docs-code snippet="surface-recipe.css" label="Своя поверхность" />
      <p>
        Для всплывающих слоёв есть своя тройка: <code>--kn-color-surface-raised</code>,
        <code>--kn-surface-filter-raised</code> и <code>--kn-elevation-popup</code> (или
        <code>--kn-elevation-modal</code> для окон).
      </p>
    </article>
  `,
  styles: `
    .nested {
      padding: var(--kn-space-8);
      border-radius: var(--kn-radius-lg);
      color: var(--kn-color-text);
    }

    .nested kn-card {
      max-inline-size: 20rem;
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
    }

    .swatch {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
      block-size: var(--kn-size-md);
      padding: 0 var(--kn-space-4) 0 var(--kn-space-3);
      border: 0;
      border-radius: var(--kn-radius-control);
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
      color: var(--kn-color-text);
      font: inherit;
      font-weight: var(--kn-weight-medium);
      cursor: pointer;
    }

    .swatch[aria-pressed='true'] {
      box-shadow: inset 0 0 0 2px var(--_color);
    }

    .swatch:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .dot {
      inline-size: 1rem;
      block-size: 1rem;
      border-radius: 50%;
      background: var(--_color);
    }
  `,
})
export default class ThemingPage {
  protected readonly theme = inject(ThemeService);
  protected readonly accents = ACCENTS;

  protected setMode(mode: unknown): void {
    this.theme.mode.set(mode as ThemeMode);
  }
}

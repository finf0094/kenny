import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { KnPanel } from '@kenny/ui/panel';
import { presetRows } from '../../generated/presets';
import { DocsCode } from '../core/code-block';
import { DocsPresetPreview } from '../core/preset-preview';
import { PRESETS, ThemeService } from '../core/theme';

/** The handful of token groups a style is made of. */
const LEVERS: { title: string; tokens: string; text: string }[] = [
  {
    title: 'Материал',
    tokens: '--kn-color-surface, --kn-color-surface-raised, --kn-surface-filter, --kn-surface-rim',
    text: 'Чем залиты карточки, панели и всплывающие слои и что у них по краю. Полупрозрачный тон с размытием даёт стекло, непрозрачный цвет с рамкой — лист, тон без рамки — тональную поверхность.',
  },
  {
    title: 'Форма',
    tokens: '--kn-radius-xs … 2xl, --kn-radius-control, --kn-radius-badge',
    text: 'Шкала радиусов задаёт скругление полей, карточек и окон. Форма кнопок и бейджей вынесена отдельно: капсула или прямоугольник — решение стиля, а не размера.',
  },
  {
    title: 'Поля',
    tokens: '--kn-color-field, --kn-color-field-border, --kn-color-field-border-hover',
    text: 'Заливка и обводка полей ввода, списков и флажков: утопленный колодец, белое поле с рамкой или тональная заливка без рамки.',
  },
  {
    title: 'Высота',
    tokens: '--kn-shadow-xs … xl, --kn-elevation-raised … xl, --kn-shadow-highlight',
    text: 'Чем поверхность отделяется от страницы: тенью, рамкой или и тем и другим. Блик на закрашенных элементах — тоже токен, и плоские стили его выключают.',
  },
  {
    title: 'Плотность',
    tokens: '--kn-size-sm, --kn-size-md, --kn-size-lg, --kn-text-md',
    text: 'Три высоты контролов общие для кнопок, полей и вкладок, поэтому плотность всего интерфейса меняется тремя числами.',
  },
  {
    title: 'Цвет и движение',
    tokens: '--kn-color-canvas, --kn-color-text, --kn-color-border, --kn-ease-spring',
    text: 'Фон страницы, нейтральные цвета текста и линий, характер переходов. Плоским стилям пружинный перелёт не к лицу — они заменяют его обычной кривой.',
  },
];

const GROUP_TITLES: Record<string, string> = {
  color: 'Цвет и материал',
  typography: 'Типографика',
  layout: 'Размеры и радиусы',
  elevation: 'Тени',
  motion: 'Движение',
  component: 'Переменные компонентов',
};

@Component({
  imports: [RouterLink, KnButton, KnIcon, KnPanel, DocsCode, DocsPresetPreview],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Стили</h1>
      <p class="lead">
        Один набор компонентов — несколько характеров. Стиль — это файл, который даёт токенам другие
        значения; разметка, поведение и доступность компонентов остаются теми же.
      </p>

      <h2 id="gallery">Четыре стиля из коробки</h2>
      <p>
        Ниже одна и та же форма, отрисованная четыре раза. Отличается только атрибут
        <code>data-kn-preset</code> на блоке вокруг неё. Кнопка под формой применяет стиль ко всему
        сайту — выбор сохранится, а переключатель есть и в шапке.
      </p>
      <div class="gallery">
        @for (preset of presets; track preset.id) {
          <section
            class="stage kn-wallpaper-sm"
            [attr.data-kn-preset]="preset.id"
            [attr.aria-labelledby]="'preset-' + preset.id"
          >
            <h3 [id]="'preset-' + preset.id">{{ preset.label }}</h3>
            <p class="summary">{{ preset.description }}</p>
            <docs-preset-preview [label]="preset.label" />
            <button
              kn-button
              size="sm"
              variant="soft"
              [attr.aria-pressed]="theme.preset() === preset.id"
              (click)="theme.preset.set(preset.id)"
            >
              @if (theme.preset() === preset.id) {
                <kn-icon name="check" /> Применён ко всему сайту
              } @else {
                Применить ко всему сайту
              }
            </button>
          </section>
        }
      </div>

      <h2 id="install">Подключение</h2>
      <p>
        Пресеты лежат в пакете токенов. Подключите нужный файл после основных токенов и поставьте
        атрибут на <code>&lt;html&gt;</code>. Стекло — стиль по умолчанию: ему не нужны ни файл, ни
        атрибут.
      </p>
      <docs-code snippet="preset-install.css" label="Подключение пресета" />
      <docs-code snippet="preset-attribute.html" label="Атрибут стиля" />
      <p>
        Чтобы менять стиль на лету, подключите <code>presets.css</code> со всеми пресетами и
        переключайте атрибут — пересборка не нужна:
      </p>
      <docs-code snippet="preset-switch.ts" label="Сервис переключения стиля" />

      <h3 id="nested">Стиль для части страницы</h3>
      <p>
        Атрибут работает на любом элементе, как и <code>data-theme</code>: плотную таблицу можно
        поставить в стиле «Строгий» посреди страницы в другом стиле. Списки, поповеры, меню и
        подсказки, открытые изнутри такого блока, наследуют его стиль. Модальные окна, шторки и
        уведомления принадлежат странице и берут её стиль.
      </p>

      <h2 id="axes">Стиль, тема и акцент независимы</h2>
      <p>
        Это три разных переключателя. Стиль (<code>data-kn-preset</code>) отвечает за материал,
        форму и плотность. Тема (<code>data-theme</code>) выбирает светлую или тёмную половину
        каждого цвета — у всех пресетов есть обе. Акцент задаётся шкалой
        <code>--kn-accent-50 … 950</code> и перекрашивает любой стиль; «Тональный» берёт из неё ещё
        и оттенок поверхностей. Про тему и акцент — в разделе
        <a routerLink="/docs/theming">Темизация</a>.
      </p>

      <h2 id="levers">Из чего состоит стиль</h2>
      <p>
        Компоненты не знают, в каком стиле они нарисованы: они читают одни и те же токены. Пресет
        меняет шесть групп значений.
      </p>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Группа</th>
              <th scope="col">Что решает</th>
            </tr>
          </thead>
          <tbody>
            @for (lever of levers; track lever.title) {
              <tr>
                <th scope="row">{{ lever.title }}</th>
                <td>
                  {{ lever.text }}
                  <code class="names">{{ lever.tokens }}</code>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p>
        Группа токенов <code>--kn-glass-*</code> называется по стилю, в котором появилась, но
        описывает материал поверхности вообще: в «Классике» это белый лист, в «Тональном» —
        тонированный контейнер.
      </p>

      <kn-panel
        class="values"
        heading="Все значения пресетов"
        [description]="rows.length + ' токенов; прочерк — пресет оставляет значение по умолчанию'"
        [headingLevel]="3"
        [(expanded)]="showValues"
      >
        @for (group of groups; track group.id) {
          <div
            class="scroll"
            tabindex="0"
            role="region"
            [attr.aria-label]="'Значения пресетов: ' + group.title"
          >
            <table class="matrix">
              <caption>
                {{
                  group.title
                }}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Токен</th>
                  @for (preset of presets; track preset.id) {
                    <th scope="col">{{ preset.label }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of group.rows; track row.name) {
                  <tr>
                    <th scope="row">
                      <code>{{ row.name }}</code>
                    </th>
                    @for (preset of presets; track preset.id) {
                      <td>
                        @if (row.values[preset.id]; as value) {
                          <code>{{ value }}</code>
                        } @else {
                          <span class="none">—</span>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </kn-panel>

      <h2 id="custom">Свой стиль</h2>
      <p>
        Свой пресет — это такой же CSS-файл: селектор с вашим именем и значения токенов. Начинать
        проще с копии готового пресета, но хватает и трёх десятков строк. Файл ниже подключён к
        этому сайту как есть:
      </p>
      <docs-code snippet="my-preset.css" label="Свой пресет" />
      <section class="stage single" data-kn-preset="paper" aria-labelledby="preset-paper">
        <h3 id="preset-paper">Бумага</h3>
        <p class="summary">
          Стиль из файла выше: его нет в библиотеке, он целиком описан токенами.
        </p>
        <docs-preset-preview label="Бумага" />
      </section>
      <ul>
        <li>
          Цвета записывайте парами через <code>light-dark()</code> — так стиль сразу получит тёмную
          тему.
        </li>
        <li>
          Составные токены (<code>--kn-shadow-glass-*</code>, <code>--kn-surface-rim</code>)
          задавайте заново, если поменяли то, из чего они собраны: значение переменной вычисляется
          там, где она объявлена.
        </li>
        <li>
          Длительности не трогайте без нужды: их обнуляет
          <code>prefers-reduced-motion</code>, и пресет не должен это отменить. Меняйте кривые.
        </li>
        <li>
          Точечные правки одного компонента делаются его переменными (<code>--kn-card-radius</code>,
          <code>--kn-tooltip-bg</code>) — их тоже можно положить в пресет.
        </li>
        <li>
          Проверьте контраст в обеих темах. В этом репозитории
          <code>pnpm check:a11y</code> прогоняет каждую страницу в каждом встроенном стиле.
        </li>
      </ul>

      <h2 id="limits">Чего стиль не меняет</h2>
      <p>
        Пресет управляет видом, но не устройством компонентов. Разметка, анатомия, клавиатура и
        ARIA-роли одинаковы во всех стилях; поле не превратится в поле с плавающей подписью, а
        переключатель — во флажок. Если нужна другая анатомия, это уже другой компонент.
      </p>
    </article>
  `,
  styles: `
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
      gap: var(--kn-space-4);
    }

    /* Each stage is a page in miniature: its own canvas, text colour and size */
    .stage {
      display: grid;
      align-content: start;
      gap: var(--kn-space-3);
      min-inline-size: 0;
      padding: var(--kn-space-5);
      border-radius: var(--kn-radius-lg);
      background-color: var(--docs-stage);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .stage.single {
      max-inline-size: 24rem;
      background-color: var(--kn-color-canvas);
    }

    .stage h3 {
      margin: 0;
    }

    .stage .summary {
      margin: 0;
      font-size: var(--kn-text-sm);
      line-height: var(--kn-leading-normal);
      color: var(--kn-color-text-muted);
    }

    .stage > button {
      justify-self: start;
    }

    .scroll {
      overflow-x: auto;
      border-radius: var(--kn-radius-md);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .scroll:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 2px;
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-size: var(--kn-text-sm);
    }

    caption {
      padding: var(--kn-space-3) var(--kn-space-4) var(--kn-space-1);
      text-align: start;
      font-weight: var(--kn-weight-semibold);
    }

    th,
    td {
      padding: var(--kn-space-2) var(--kn-space-4);
      text-align: start;
      vertical-align: top;
    }

    thead th {
      font-weight: var(--kn-weight-medium);
      color: var(--kn-color-text-subtle);
      white-space: nowrap;
    }

    tbody tr {
      box-shadow: inset 0 1px 0 0 var(--kn-color-border);
    }

    tbody th {
      font-weight: var(--kn-weight-semibold);
      white-space: nowrap;
    }

    td {
      line-height: var(--kn-leading-normal);
    }

    .names {
      display: block;
      margin-block-start: var(--kn-space-1);
      padding: 0;
      background: none;
      color: var(--kn-color-text-muted);
      overflow-wrap: anywhere;
    }

    .values {
      margin-block-start: var(--kn-space-6);
    }

    .values .scroll + .scroll {
      margin-block-start: var(--kn-space-4);
    }

    .matrix tbody th code {
      color: var(--kn-color-accent-text);
      font-weight: var(--kn-weight-medium);
    }

    .matrix td {
      min-inline-size: 9rem;
      max-inline-size: 16rem;
    }

    .matrix td code {
      padding: 0;
      background: none;
      color: var(--kn-color-text-muted);
      overflow-wrap: anywhere;
    }

    .none {
      color: var(--kn-color-text-subtle);
    }
  `,
})
export default class PresetsPage {
  protected readonly theme = inject(ThemeService);
  protected readonly presets = PRESETS;
  protected readonly levers = LEVERS;
  protected readonly rows = presetRows;
  protected readonly showValues = signal(false);

  protected readonly groups = Object.keys(GROUP_TITLES)
    .map((id) => ({
      id,
      title: GROUP_TITLES[id],
      rows: presetRows.filter((row) => row.group === id),
    }))
    .filter((group) => group.rows.length > 0);
}

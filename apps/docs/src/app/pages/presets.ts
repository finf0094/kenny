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
    title: 'Поверхности',
    tokens: '--kn-color-canvas, --kn-color-surface, --kn-color-surface-raised, --kn-surface-filter',
    text: 'Чем залиты страница, карточки и всплывающие слои. Сплошной цвет даёт лист, оттенок акцента — тональный контейнер, полупрозрачный цвет вместе с фильтром размытия — стекло.',
  },
  {
    title: 'Край и высота',
    tokens: '--kn-surface-rim, --kn-elevation-raised | card | popup | modal, --kn-shadow-*',
    text: 'Чем поверхность отделяется от того, что под ней: рамкой, тенью, бликом или ничем. У каждого рода поверхностей своя роль — от контурной кнопки до модального окна.',
  },
  {
    title: 'Форма',
    tokens: '--kn-radius-xs … 2xl, --kn-radius-control, --kn-radius-badge, --kn-radius-field',
    text: 'Шкала радиусов задаёт скругление карточек и окон. Форма кнопок, бейджей и полей вынесена отдельно: капсула или прямоугольник — решение стиля, а не размера.',
  },
  {
    title: 'Поля',
    tokens:
      '--kn-color-field, --kn-color-field-border, --kn-field-border-width, --kn-field-underline-width',
    text: 'Вид полей ввода, списков и выбора даты: с обводкой, с заливкой или с линией снизу. Все поля рисует один общий класс, поэтому меняются они разом.',
  },
  {
    title: 'Плотность и шрифт',
    tokens: '--kn-size-sm | md | lg, --kn-text-*, --kn-font-sans',
    text: 'Три высоты контролов общие для кнопок, полей и вкладок, поэтому плотность всего интерфейса меняется тремя числами. Шрифт по умолчанию системный.',
  },
  {
    title: 'Цвет и движение',
    tokens:
      '--kn-accent-*, --kn-color-text, --kn-color-selection, --kn-ease-spring, --kn-press-scale',
    text: 'Акцентная шкала, нейтральные цвета текста и линий, цвет активной строки списка, характер переходов и отклик на нажатие.',
  },
];

const GROUP_TITLES: Record<string, string> = {
  color: 'Цвет и поверхности',
  typography: 'Типографика',
  layout: 'Размеры, радиусы, поля',
  elevation: 'Край и высота',
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
        У Kenny нет одного «фирменного» вида. Есть нейтральная основа и стили поверх неё — готовые
        или ваш собственный. Стиль меняет вид компонентов; их разметка, поведение и доступность
        остаются теми же.
      </p>

      <h2 id="gallery">Готовые стили</h2>
      <p>
        Ниже одна и та же форма, отрисованная {{ presets.length }} раз. Отличается только атрибут
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
      <p>
        Стили названы по характеру, а не по образцу. «Тональный» строит цвет от одного ключевого
        тона, «Строгий» — плотный интерфейс для данных, «Мягкий» — ощущение системного интерфейса
        телефона. Это самостоятельные стили, а не копии чужих тем; нужен вид поближе к знакомой
        системе — возьмите ближайший за основу в <a routerLink="/docs/builder">конструкторе</a>.
      </p>

      <h2 id="install">Подключение</h2>
      <p>
        Базовому стилю не нужны ни файл, ни атрибут: он записан в самих токенах. Остальные лежат в
        том же пакете. Подключите нужный файл после токенов и поставьте атрибут на
        <code>&lt;html&gt;</code>.
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
        поставить в стиле «Строгий» посреди страницы в другом стиле, а
        <code>data-kn-preset="default"</code> возвращает базовый. Списки, поповеры, меню и
        подсказки, открытые изнутри такого блока, наследуют его стиль. Модальные окна, шторки и
        уведомления принадлежат странице и берут её стиль.
      </p>

      <h2 id="axes">Стиль, тема и акцент независимы</h2>
      <p>
        Это три разных переключателя. Стиль (<code>data-kn-preset</code>) отвечает за материал,
        форму и плотность. Тема (<code>data-theme</code>) выбирает светлую или тёмную половину
        каждого цвета — у всех стилей есть обе. Акцент задаётся шкалой
        <code>--kn-accent-50 … 950</code> и перекрашивает любой стиль; «Тональный» берёт из неё ещё
        и оттенок поверхностей. Про тему и акцент — в разделе
        <a routerLink="/docs/theming">Темизация</a>.
      </p>

      <h2 id="levels">Три уровня настройки</h2>
      <p>
        Менять вид можно на трёх уровнях — от самого широкого к самому точному. Готовый пресет — это
        те же три уровня, сложенные в один файл.
      </p>

      <h3 id="level-tokens">1. Токены</h3>
      <p>
        Токен — это роль: «радиус поля», «цвет поверхности», «высота контрола». Компоненты не
        содержат собственных чисел и цветов, они читают токены, поэтому одно значение меняет всё
        сразу. Полный список — в разделе <a routerLink="/docs/tokens">Токены</a>.
      </p>
      <docs-code snippet="customize-tokens.css" label="Настройка токенами" />

      <h3 id="level-components">2. Переменные компонента</h3>
      <p>
        Когда нужно изменить один компонент, а не всю роль, у него есть собственные переменные:
        <code>--kn-switch-width</code>, <code>--kn-card-shadow</code>, <code>--kn-tabs-thumb</code>.
        Задайте их на самом компоненте или на любом предке. Список — в разделе API на странице
        каждого компонента.
      </p>
      <docs-code snippet="component-vars.css" label="Переменные компонентов" />

      <h3 id="level-parts">3. Свой CSS по частям</h3>
      <p>
        Если переменных не хватает, компонент стилизуется обычным CSS. Его внутренние элементы —
        части — имеют постоянные имена классов; они перечислены на странице компонента под таблицами
        API. Стили компонентов изолированы, поэтому начинайте свой селектор с атрибута стиля или с
        <code>:root</code> — тогда он окажется сильнее. Для состояния (<code>:hover</code>,
        <code>[aria-selected]</code>) повторите его в своём селекторе.
      </p>
      <docs-code snippet="customize-parts.css" label="Стили по частям" />

      <h3 id="defaults">Варианты по умолчанию</h3>
      <p>
        Часть характера — не в CSS, а в том, какой вариант компонента считается обычным.
        <code>provideKnDefaults()</code> задаёт значения входов <code>variant</code> и
        <code>size</code> на всё приложение или, в <code>providers</code> компонента, на его часть.
        Значение в шаблоне всегда сильнее.
      </p>
      <docs-code snippet="defaults.ts" label="Значения входов по умолчанию" />

      <h2 id="levers">Из чего состоит стиль</h2>
      <p>Компоненты не знают, в каком стиле они нарисованы. Пресет меняет шесть групп значений.</p>
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

      <kn-panel
        class="values"
        heading="Все значения пресетов"
        [description]="rows.length + ' значений; прочерк — пресет оставляет базовое'"
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
        Самый короткий путь — <a routerLink="/docs/builder">конструктор</a>: выбираете основу,
        меняете форму, плотность, вид полей и акцент, смотрите на результат и забираете готовый
        файл. Но пресет — обычный CSS, и его можно написать руками: селектор с вашим именем и
        значения токенов. Файл ниже подключён к этому сайту как есть:
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
          Токены, собранные из других токенов (<code>--kn-elevation-*</code>,
          <code>--kn-surface-rim</code>, <code>--kn-radius-field</code>), объявляйте заново, если
          поменяли то, из чего они собраны: значение переменной вычисляется там, где она объявлена.
          Встроенные пресеты и конструктор делают это сами.
        </li>
        <li>
          Длительности не трогайте без нужды: их обнуляет
          <code>prefers-reduced-motion</code>, и пресет не должен это отменить. Меняйте кривые.
        </li>
        <li>
          Переменные компонентов и правила для частей тоже можно положить в пресет — под тем же
          селектором.
        </li>
        <li>
          Проверьте контраст в обеих темах. В этом репозитории
          <code>pnpm check:a11y</code> прогоняет каждую страницу в каждом встроенном стиле.
        </li>
      </ul>

      <h2 id="limits">Чего стиль не меняет</h2>
      <p>
        Стиль управляет видом, но не устройством компонентов. Состав частей, клавиатура и ARIA-роли
        одинаковы во всех стилях: поле не превратится в поле с плавающей подписью, а переключатель —
        во флажок. Если нужна другая анатомия, это уже другой компонент.
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

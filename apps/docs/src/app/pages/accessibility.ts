import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../core/code-block';

const PATTERNS = [
  { component: 'Accordion, Panel', pattern: 'Accordion', slug: 'accordion' },
  { component: 'Breadcrumbs', pattern: 'Breadcrumb', slug: 'breadcrumbs' },
  { component: 'Combobox', pattern: 'Editable Combobox With List Autocomplete', slug: 'combobox' },
  { component: 'Command Palette', pattern: 'Dialog (Modal) + Combobox', slug: 'command-palette' },
  { component: 'DatePicker', pattern: 'Date Picker Dialog', slug: 'date-picker' },
  { component: 'Dialog, Drawer', pattern: 'Dialog (Modal)', slug: 'dialog' },
  {
    component: 'Dropdown Menu, Context Menu',
    pattern: 'Menu and Menu Button',
    slug: 'dropdown-menu',
  },
  { component: 'Radio', pattern: 'Radio Group', slug: 'radio' },
  { component: 'Select', pattern: 'Select-Only Combobox', slug: 'select' },
  { component: 'Slider', pattern: 'Slider (нативный range)', slug: 'slider' },
  { component: 'Splitter', pattern: 'Window Splitter', slug: 'splitter' },
  { component: 'Switch', pattern: 'Switch (нативный checkbox)', slug: 'switch' },
  { component: 'Table', pattern: 'Sortable Table', slug: 'table' },
  { component: 'Tabs', pattern: 'Tabs с автоматической активацией', slug: 'tabs' },
  { component: 'Toolbar', pattern: 'Toolbar', slug: 'toolbar' },
  { component: 'Tooltip', pattern: 'Tooltip', slug: 'tooltip' },
];

/** WCAG contrast ratios of the default tokens, computed from the hex values in color.css. */
const CONTRAST = [
  { pair: 'Основной текст на фоне страницы', light: '16,1', dark: '17,8' },
  { pair: 'Приглушённый текст (muted) на фоне', light: '6,7', dark: '9,0' },
  { pair: 'Вспомогательный текст (subtle) на фоне', light: '5,6', dark: '6,4' },
  { pair: 'Текст на акцентной заливке', light: '6,8', dark: '6,5' },
  { pair: 'Акцентный текст и ссылки на фоне', light: '7,3', dark: '10,2' },
  { pair: 'Текст ошибки на фоне', light: '5,9', dark: '7,9' },
  { pair: 'Кольцо фокуса на фоне (нетекстовый контраст)', light: '6,0', dark: '10,2' },
];

@Component({
  imports: [DocsCode, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Доступность</h1>
      <p class="lead">
        Каждый компонент следует паттерну из WAI-ARIA Authoring Practices и проверяется тестами на
        поведение с клавиатуры и на правила axe. Ниже — что именно гарантирует библиотека и что
        остаётся за вами.
      </p>

      <h2 id="approach">Подход</h2>
      <ul>
        <li>
          <strong>Сначала нативный элемент.</strong> Button, Checkbox, Radio, Switch, Slider, Input
          и Textarea — обёртки над настоящими элементами форм. Роли, состояния и клавиатуру
          обеспечивает браузер.
        </li>
        <li>
          <strong>Составные виджеты — на Angular CDK.</strong> Меню, диалоги, ловушка фокуса,
          навигация по спискам и живые объявления взяты из CDK, а не написаны заново.
        </li>
        <li>
          <strong>Фокус всегда виден и всегда возвращается.</strong> Единое кольцо фокуса в 2 px
          появляется при навигации с клавиатуры; закрывшийся оверлей возвращает фокус туда, откуда
          его открыли.
        </li>
        <li>
          <strong>Скрытое — скрыто для всех.</strong> Свёрнутые секции получают <code>inert</code>,
          неактивные вкладки и шаги — <code>hidden</code>.
        </li>
      </ul>

      <h2 id="patterns">Паттерны APG</h2>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Компонент</th>
              <th scope="col">Паттерн</th>
            </tr>
          </thead>
          <tbody>
            @for (row of patterns; track row.slug) {
              <tr>
                <th scope="row">
                  <a [routerLink]="['/components', row.slug]">{{ row.component }}</a>
                </th>
                <td>{{ row.pattern }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p>Клавиши и роли каждого компонента перечислены в конце его страницы.</p>

      <h2 id="keyboard">Общие правила клавиатуры</h2>
      <ul>
        <li>
          <kbd>Tab</kbd> переходит между виджетами; внутри составного виджета двигаются стрелки.
        </li>
        <li><kbd>Esc</kbd> закрывает самый верхний оверлей и только его.</li>
        <li>
          <kbd>Home</kbd> и <kbd>End</kbd> ведут к первому и последнему элементу списка, меню,
          вкладок.
        </li>
        <li>В RTL горизонтальные стрелки меняются местами — вместе с раскладкой.</li>
        <li>
          Ссылка «К содержимому» в начале этого сайта — пример: нажмите <kbd>Tab</kbd> сразу после
          загрузки.
        </li>
      </ul>

      <h2 id="contrast">Контраст</h2>
      <p>
        Коэффициенты для токенов по умолчанию. Порог WCAG 2.2 AA — 4,5:1 для текста и 3:1 для
        элементов интерфейса.
      </p>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Пара</th>
              <th scope="col">Светлая тема</th>
              <th scope="col">Тёмная тема</th>
            </tr>
          </thead>
          <tbody>
            @for (row of contrast; track row.pair) {
              <tr>
                <th scope="row">{{ row.pair }}</th>
                <td>{{ row.light }} : 1</td>
                <td>{{ row.dark }} : 1</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p>
        Стекло полупрозрачно, поэтому контраст текста на нём зависит от фона. Для поверхностей с
        текстом (диалоги, меню, поповеры) используется почти непрозрачный
        <code>--kn-color-surface-raised</code>. Если меняете акцент или кладёте стекло на пёстрый
        фон — перепроверьте контраст сами.
      </p>

      <h2 id="motion">Движение</h2>
      <p>
        При <code>prefers-reduced-motion</code> все переходы отключаются на уровне токенов. Мигающих
        и автоматически запускающихся анимаций в библиотеке нет. Подробности — в разделе
        <a routerLink="/docs/motion">Motion</a>.
      </p>

      <h2 id="testing">Как это проверяется</h2>
      <p>
        У каждого компонента есть тесты на Testing Library: они находят элементы по ролям и именам,
        как это делает скринридер, проходят сценарии с клавиатуры и запускают axe-core.
      </p>
      <docs-code snippet="a11y-test.ts" label="Пример теста доступности" />

      <h2 id="limits">Ограничения</h2>
      <ul>
        <li>
          Тесты идут в jsdom: там нет раскладки, поэтому контраст и видимость фокуса автоматически
          не проверяются. Таблица контраста выше посчитана по значениям токенов.
        </li>
        <li>Проверка с реальными скринридерами (VoiceOver, NVDA) для версии 0.1 не проводилась.</li>
        <li>
          Tooltip не показывается на сенсорных экранах — не кладите в него то, без чего нельзя
          обойтись.
        </li>
        <li>
          Доступные имена — ваша часть работы: <code>aria-label</code> у кнопок-иконок, подписи
          полей через <code>&lt;kn-field&gt;</code>, имена таблиц и панелей инструментов.
        </li>
      </ul>
    </article>
  `,
  styles: `
    .scroll {
      overflow-x: auto;
      border-radius: var(--kn-radius-md);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-size: var(--kn-text-sm);
      font-variant-numeric: tabular-nums;
    }

    th,
    td {
      padding: var(--kn-space-2) var(--kn-space-4);
      text-align: start;
    }

    thead th {
      font-weight: var(--kn-weight-medium);
      color: var(--kn-color-text-subtle);
    }

    tbody tr {
      box-shadow: inset 0 1px 0 0 var(--kn-color-border);
    }

    tbody th {
      font-weight: inherit;
    }
  `,
})
export default class AccessibilityPage {
  protected readonly patterns = PATTERNS;
  protected readonly contrast = CONTRAST;
}

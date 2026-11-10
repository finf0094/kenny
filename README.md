# Kenny

Стеклянная UI-библиотека для Angular: 36 доступных компонентов на signals, дизайн-токены на
CSS-переменных, единая система движения, светлая и тёмная темы. Из зависимостей — только Angular CDK.

[![CI](https://github.com/finf0094/kenny/actions/workflows/ci.yml/badge.svg)](https://github.com/finf0094/kenny/actions/workflows/ci.yml)

| Пакет           | Что внутри                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@kenny/ui`     | Компоненты. У каждого своя точка входа (`@kenny/ui/button`), неиспользуемое не попадает в сборку.                 |
| `@kenny/tokens` | Цвет, типографика, отступы, радиусы, тени, стекло, z-index и motion в виде CSS custom properties. Без JavaScript. |

## Что умеет

- **Angular 22**: standalone-компоненты, signal inputs/outputs и `model()`, новый control flow,
  `OnPush`, работа без zone.js, SSR и гидрация.
- **Доступность по WAI-ARIA APG**: клавиатура, управление фокусом, роли, озвучивание состояний.
  Проверяется тестами с axe-core и аудитом собранного сайта в настоящем браузере.
- **Формы**: поля работают с Reactive Forms, template-driven и signal forms через один
  `ControlValueAccessor`, а также автономно через `[(value)]` / `[(checked)]`.
- **Темы без пересборки**: `data-theme="light" | "dark"` на любом элементе, темы вкладываются.
  Акцент перекрашивается одной шкалой `--kn-accent-50 … 950`.
- **Motion**: общие токены длительностей и кривых, пружины для прямых действий, только
  `transform` и `opacity`, полное отключение при `prefers-reduced-motion`.
- **RTL и адаптивность**: логические CSS-свойства, клавиатура учитывает направление письма.

Компоненты: Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider,
DatePicker · Card, Panel, Accordion, Tabs, Sidebar, Splitter, Drawer, Toolbar · Dialog, Popover,
Tooltip, Dropdown Menu, Context Menu, Toast, Command Palette · Table, Pagination, Badge, Avatar,
Progress, Skeleton, Spinner, Empty State, Breadcrumbs, Stepper.

## Использование в приложении

Требования: Angular 22.2+, `@angular/cdk` и `@angular/forms` той же мажорной версии. Браузеры 2024
года и новее (Chrome/Edge 123, Firefox 121, Safari 17.5): библиотека опирается на `light-dark()`,
`linear()` и `:has()`.

```sh
pnpm add @kenny/ui @kenny/tokens @angular/cdk
```

Подключите токены один раз — в глобальных стилях:

```css
/* src/styles.css */
@import '@kenny/tokens/kenny.css';
```

И используйте компоненты:

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';

@Component({
  selector: 'app-invite',
  imports: [KnButton, KnField, KnInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Почта коллеги" hint="Отправим приглашение в команду">
      <input
        knInput
        type="email"
        [value]="email()"
        (input)="email.set($any($event.target).value)"
      />
    </kn-field>
    <button kn-button [disabled]="!email()" (click)="invite()">Пригласить</button>
  `,
})
export class Invite {
  protected readonly email = signal('');
  protected invite(): void {
    /* … */
  }
}
```

Шрифт библиотека не поставляет: токен `--kn-font-sans` начинается с Onest и продолжается системным
стеком. Подключите Onest (например, `@fontsource-variable/onest`) или переопределите токен.

Подробности — в документации: установка, темизация, токены, motion, доступность и страница каждого
компонента с живыми примерами, playground и таблицей API.

## Разработка

Нужны Node.js 22.22+ (или 24.15+) и pnpm 10.

```sh
pnpm install
```

| Команда               | Что делает                                                                    |
| --------------------- | ----------------------------------------------------------------------------- |
| `pnpm start`          | Сайт документации с живой перезагрузкой — http://localhost:4200               |
| `pnpm playground`     | Песочница: каждое демо отдельно, обе темы рядом — http://localhost:4300       |
| `pnpm test`           | Unit-тесты библиотеки (Vitest, Testing Library, axe-core)                     |
| `pnpm test:watch`     | То же в режиме наблюдения                                                     |
| `pnpm lint`           | ESLint, включая шаблоны и правила доступности                                 |
| `pnpm format`         | Prettier по всему репозиторию (`format:check` — только проверка)              |
| `pnpm build`          | Токены → библиотека → документация (пререндер) → песочница                    |
| `pnpm check:a11y`     | axe-core, ошибки консоли и переполнение на телефоне для каждой страницы сайта |
| `pnpm check:keyboard` | Клавиатурные сценарии в headless Chrome: палитра, диалог, меню, вкладки и др. |
| `pnpm check`          | Всё перечисленное подряд — то же, что выполняет CI                            |

`check:a11y` и `check:keyboard` работают по собранному сайту (`pnpm build:docs`) и ищут Chrome в
`/usr/bin/google-chrome`; другой путь задаётся переменной `CHROME_PATH`.

### Структура

```
packages/
  tokens/        дизайн-токены: src/*.css → dist/tokens (kenny.css, tokens.css, base.css, tokens.json)
  ui/            библиотека: одна папка = один компонент = одна точка входа
    core/        общее: базовый класс полей формы, оверлеи, motion, типы
    testing/     настройка тестов и хелперы (axe, ожидание рендера)
apps/
  docs/          сайт документации: SSR-пререндер, собран из компонентов библиотеки
    src/app/demos/     демо-файлы — единственный источник кода примеров
    src/app/content/   описание страницы каждого компонента (playground, клавиатура, a11y)
    src/app/pages/     руководства, главная и три экрана-примера
  playground/    песочница для разработки
tools/
  gen-docs.mjs   читает исходники: API из JSDoc, CSS-переменные, подсвеченный код демо
  audit.mjs      аудит доступности собранного сайта
  keyboard.mjs   клавиатурные сценарии
  shots.mjs      скриншоты страниц для визуальной проверки (темы, RTL, мобильная ширина)
```

### Принятые решения

- **pnpm workspaces + Angular CLI, без Nx.** В репозитории два пакета и два приложения; граф задач
  умещается в `package.json`, а кэш сборки Angular CLI покрывает остальное. Nx добавил бы слой
  конфигурации без выигрыша на таком масштабе.
- **Вторичные точки входа ng-packagr** на каждый компонент: импорт `@kenny/ui/button` тянет только
  кнопку и её зависимости. Корневой `@kenny/ui` намеренно почти пуст (в нём только версия), чтобы
  один импорт не мог притащить всю библиотеку.
- **Токены — отдельный CSS-пакет.** Компоненты читают только семантические переменные
  (`--kn-color-*`, `--kn-glass-*`), поэтому тема и бренд меняются без пересборки и без JavaScript.
- **Документация генерируется из исходников.** Таблицы API строятся из JSDoc-комментариев к входам и
  выходам, код примеров — из тех же файлов, что рендерятся на странице. Разойтись они не могут.
- **Тесты на поведение, а не на реализацию**: Testing Library и user-event поверх Vitest, плюс
  axe-core в каждом наборе. Контраст и раскладку jsdom не считает, поэтому их проверяет
  `check:a11y` в настоящем браузере.

### Как добавить компонент

1. Создайте `packages/ui/<name>/` с `<name>.ts`, `<name>.spec.ts` и `index.ts`; запустите
   `node tools/entries.mjs` — он добавит `ng-package.json` точки входа.
2. Напишите демо в `apps/docs/src/app/demos/<name>/*.demo.ts` и описание страницы в
   `apps/docs/src/app/content/<name>.ts`, зарегистрируйте её в `apps/docs/src/app/core/nav.ts`.
3. `pnpm check`.

## Сборка и публикация

```sh
pnpm build:tokens   # → dist/tokens
pnpm build:ui       # → dist/ui (FESM, типы, partial-компиляция Ivy)
```

Публикуются именно папки `dist/tokens` и `dist/ui`, а не исходные пакеты.

1. Убедитесь, что вам принадлежит область `@kenny` в npm (или переименуйте пакеты: поле `name` в
   `packages/*/package.json`, пути в `tsconfig.json` и импорты `@kenny/…`).
2. Поднимите версию в `packages/tokens/package.json` и `packages/ui/package.json`. Если изменилась
   версия токенов — обновите диапазон `@kenny/tokens` в `peerDependencies` библиотеки.
3. Проверьте всё: `pnpm check`.
4. Войдите в npm (`npm login`) и опубликуйте оба пакета:

   ```sh
   pnpm release
   ```

   Команда собирает токены и библиотеку и публикует сначала `@kenny/tokens`, затем `@kenny/ui`.
   Посмотреть состав пакетов без публикации: `pnpm --dir dist/ui pack --dry-run`.

### Документация

`pnpm build:docs` создаёт статический сайт в `dist/docs/browser`: все страницы пререндерены, сервер
не нужен. Папку можно выложить на любой статический хостинг. При размещении не в корне домена
соберите с базовым путём: `pnpm gen && pnpm ng build docs --base-href /kenny/`.

## Лицензия

[MIT](./LICENSE)

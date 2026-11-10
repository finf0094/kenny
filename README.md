# Kenny

UI-библиотека для Angular: 36 доступных компонентов на signals, у которых настраивается всё, что
относится к виду, — от акцентного цвета до формы переключателя. Из зависимостей — только Angular CDK.

[![CI](https://github.com/finf0094/kenny/actions/workflows/ci.yml/badge.svg)](https://github.com/finf0094/kenny/actions/workflows/ci.yml)

| Пакет           | Что внутри                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `@kenny/ui`     | Компоненты. У каждого своя точка входа (`@kenny/ui/button`), неиспользуемое не попадает в сборку. |
| `@kenny/tokens` | Дизайн-токены в виде CSS custom properties и готовые стили-пресеты. Без JavaScript.               |

## Что умеет

- **Angular 22**: standalone-компоненты, signal inputs/outputs и `model()`, новый control flow,
  `OnPush`, работа без zone.js, SSR и гидрация.
- **Стиль — ваш**: нейтральная основа, четыре готовых стиля и три уровня настройки (см. ниже).
- **Доступность по WAI-ARIA APG**: клавиатура, управление фокусом, роли, озвучивание состояний.
  Проверяется тестами с axe-core и аудитом собранного сайта в настоящем браузере — в каждом стиле.
- **Формы**: поля работают с Reactive Forms, template-driven и signal forms через один
  `ControlValueAccessor`, а также автономно через `[(value)]` / `[(checked)]`.
- **Темы без пересборки**: `data-theme="light" | "dark"` на любом элементе, темы вкладываются.
- **Motion**: общие токены длительностей и кривых, пружины для прямых действий, только
  `transform` и `opacity`, полное отключение при `prefers-reduced-motion`.
- **RTL и адаптивность**: логические CSS-свойства, клавиатура учитывает направление письма.

Компоненты: Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider,
DatePicker · Card, Panel, Accordion, Tabs, Sidebar, Splitter, Drawer, Toolbar · Dialog, Popover,
Tooltip, Dropdown Menu, Context Menu, Toast, Command Palette · Table, Pagination, Badge, Avatar,
Progress, Skeleton, Spinner, Empty State, Breadcrumbs, Stepper.

## Стили и настройка

У Kenny нет одного «фирменного» вида. Значения по умолчанию — спокойный нейтральный стиль;
остальное включается поверх него.

| Стиль     | Атрибут                  | Характер                                                       |
| --------- | ------------------------ | -------------------------------------------------------------- |
| Базовый   | —                        | Непрозрачные листы, тонкие рамки, поля с обводкой, радиус 8 px |
| Стекло    | `data-kn-preset="glass"` | Полупрозрачные поверхности с размытием, блик, кнопки-капсулы   |
| Тональный | `data-kn-preset="tonal"` | Поверхности — оттенки акцента, поля с линией снизу, без рамок  |
| Строгий   | `data-kn-preset="crisp"` | Плотный интерфейс для данных: малые радиусы, шрифт 14 px       |
| Мягкий    | `data-kn-preset="soft"`  | Группы без рамок, крупные контролы, размытые всплывающие слои  |

```css
@import '@kenny/tokens/kenny.css';
@import '@kenny/tokens/presets/tonal.css'; /* после токенов */
```

```html
<html data-kn-preset="tonal"></html>
```

Стиль, тема (`data-theme`) и акцент (`--kn-accent-50 … 950`) — три независимых переключателя.
Атрибут стиля работает и на части страницы.

Свой вид собирается на трёх уровнях — от широкого к точному:

1. **Токены** — роли вроде «радиус поля» или «цвет поверхности». Одно значение меняет все
   компоненты: `:root { --kn-radius-md: 4px; --kn-radius-control: var(--kn-radius-full); }`.
2. **Переменные компонента** — меняют один компонент:
   `kn-switch { --kn-switch-width: 3rem; --kn-switch-color: seagreen; }`.
3. **Свой CSS по частям** — у внутренних элементов постоянные имена классов:
   `:root kn-switch .thumb { border-radius: 4px; }`. Общий класс `kn-control` — у всех полей сразу.

Варианты и размеры по умолчанию задаются один раз:

```ts
provideKnDefaults({ size: 'sm', button: { variant: 'soft' }, tabs: { variant: 'underline' } });
```

В документации есть **конструктор стиля**: выбираете основу, меняете форму, плотность, вид полей,
материал и акцент — и скачиваете готовый CSS-файл.

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

| Команда               | Что делает                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm start`          | Сайт документации с живой перезагрузкой — http://localhost:4200                            |
| `pnpm playground`     | Песочница: каждое демо отдельно, обе темы рядом — http://localhost:4300                    |
| `pnpm test`           | Unit-тесты библиотеки (Vitest, Testing Library, axe-core)                                  |
| `pnpm test:watch`     | То же в режиме наблюдения                                                                  |
| `pnpm lint`           | ESLint, включая шаблоны и правила доступности                                              |
| `pnpm format`         | Prettier по всему репозиторию (`format:check` — только проверка)                           |
| `pnpm build`          | Токены → библиотека → документация (пререндер) → песочница                                 |
| `pnpm check:a11y`     | axe-core, ошибки консоли и переполнение на телефоне: каждая страница в каждом стиле и теме |
| `pnpm check:keyboard` | Клавиатурные сценарии в headless Chrome: палитра, диалог, меню, вкладки и др.              |
| `pnpm check`          | Всё перечисленное подряд — то же, что выполняет CI                                         |

`check:a11y` и `check:keyboard` работают по собранному сайту (`pnpm build:docs`) и ищут Chrome в
`/usr/bin/google-chrome`; другой путь задаётся переменной `CHROME_PATH`.

### Структура

```
packages/
  tokens/        дизайн-токены: src/*.css → dist/tokens (kenny.css, tokens.css, base.css, tokens.json)
    src/presets/ стили-пресеты: glass, tonal, crisp, soft
  ui/            библиотека: одна папка = один компонент = одна точка входа
    core/        общее: базовый класс и внешний вид полей, оверлеи, значения по умолчанию, типы
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
  (`--kn-color-*`, `--kn-elevation-*`, `--kn-radius-*`), поэтому тема, стиль и бренд меняются без
  пересборки и без JavaScript.
- **Два пакета, а не десять.** Естественные швы — CSS без JavaScript (`@kenny/tokens`) и компоненты
  (`@kenny/ui`) с точкой входа на каждый и общим `@kenny/ui/core`. Отдельные пакеты под даты или
  валидацию добавили бы версий и релизов, но их некому ставить отдельно от компонентов. Точку входа
  легко вынести в пакет, когда такая потребность появится.
- **Стиль — данные, а не код.** Пресет — CSS-файл со значениями токенов. Вид полей описан один раз
  (общий класс `kn-control`), роли поверхностей и их края — токенами, поэтому новый стиль не
  требует правки компонентов.
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

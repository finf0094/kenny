# @kenny/ui

UI-библиотека для Angular: 36 доступных компонентов на signals с настраиваемым стилем. Из
зависимостей — только Angular CDK.

```sh
pnpm add @kenny/ui @kenny/tokens @angular/cdk
```

```css
/* src/styles.css */
@import '@kenny/tokens/kenny.css';
```

```ts
import { Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';

@Component({
  selector: 'app-save',
  imports: [KnButton],
  template: `<button kn-button (click)="save()">Сохранить</button>`,
})
export class Save {
  save(): void {}
}
```

Каждый компонент лежит в своей точке входа (`@kenny/ui/button`, `@kenny/ui/dialog`, …), поэтому в
сборку приложения попадает только то, что импортировано.

## Стиль настраивается

У библиотеки нет одного «фирменного» вида: есть нейтральная основа и стили поверх неё.

- **Готовые стили** — `glass`, `tonal`, `crisp`, `soft` из `@kenny/tokens/presets/`, включаются
  атрибутом `data-kn-preset`.
- **Токены** — CSS-переменные ролей: цвет, поверхности, форма, плотность. Одно значение меняет все
  компоненты.
- **Переменные компонентов** — `--kn-switch-width`, `--kn-card-shadow`: меняют один компонент.
- **Свой CSS по частям** — у внутренних элементов компонентов постоянные имена классов.
- **`provideKnDefaults()`** — варианты и размеры по умолчанию на всё приложение.

## Компоненты

- **Основа**: Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch,
  Slider, DatePicker
- **Панели и раскладка**: Card, Panel, Accordion, Tabs, Sidebar, Splitter, Drawer, Toolbar
- **Оверлеи**: Dialog, Popover, Tooltip, Dropdown Menu, Context Menu, Toast, Command Palette
- **Данные и обратная связь**: Table, Pagination, Badge, Avatar, Progress, Skeleton, Spinner,
  Empty State, Breadcrumbs, Stepper

## Требования

- Angular 22.2+, `@angular/cdk` и `@angular/forms` той же мажорной версии
- Браузеры 2024 года и новее: Chrome/Edge 123, Firefox 121, Safari 17.5

Документация, живые примеры и исходный код: https://github.com/finf0094/kenny

## Лицензия

MIT

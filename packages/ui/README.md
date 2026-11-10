# @kenny/ui

Стеклянная UI-библиотека для Angular: доступные компоненты на signals, продуманное движение, светлая
и тёмная темы на CSS-переменных. Из зависимостей — только Angular CDK.

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

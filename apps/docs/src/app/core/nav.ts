import { ComponentDoc } from './doc-types';

export interface NavItem {
  path: string;
  title: string;
  icon?: string;
}

export interface ComponentNavItem {
  slug: string;
  title: string;
  load: () => Promise<ComponentDoc>;
}

export const guides: NavItem[] = [
  { path: '/docs/getting-started', title: 'Начало работы', icon: 'zap' },
  { path: '/docs/installation', title: 'Установка', icon: 'box' },
  { path: '/docs/presets', title: 'Стили', icon: 'grid' },
  { path: '/docs/theming', title: 'Темизация', icon: 'droplet' },
  { path: '/docs/tokens', title: 'Токены', icon: 'layers' },
  { path: '/docs/motion', title: 'Motion', icon: 'motion' },
  { path: '/docs/accessibility', title: 'Доступность', icon: 'accessibility' },
];

const c = (
  slug: string,
  title: string,
  load: () => Promise<{ default: ComponentDoc }>,
): ComponentNavItem => ({
  slug,
  title,
  load: () => load().then((m) => m.default),
});

export const componentGroups: { label: string; items: ComponentNavItem[] }[] = [
  {
    label: 'Основа',
    items: [
      c('button', 'Button', () => import('../content/button')),
      c('icon-button', 'IconButton', () => import('../content/icon-button')),
      c('input', 'Input', () => import('../content/input')),
      c('textarea', 'Textarea', () => import('../content/textarea')),
      c('select', 'Select', () => import('../content/select')),
      c('combobox', 'Combobox', () => import('../content/combobox')),
      c('checkbox', 'Checkbox', () => import('../content/checkbox')),
      c('radio', 'Radio', () => import('../content/radio')),
      c('switch', 'Switch', () => import('../content/switch')),
      c('slider', 'Slider', () => import('../content/slider')),
      c('date-picker', 'DatePicker', () => import('../content/date-picker')),
    ],
  },
  {
    label: 'Панели и раскладка',
    items: [
      c('card', 'Card', () => import('../content/card')),
      c('panel', 'Panel', () => import('../content/panel')),
      c('accordion', 'Accordion', () => import('../content/accordion')),
      c('tabs', 'Tabs', () => import('../content/tabs')),
      c('sidebar', 'Sidebar', () => import('../content/sidebar')),
      c('splitter', 'Splitter', () => import('../content/splitter')),
      c('drawer', 'Drawer', () => import('../content/drawer')),
      c('toolbar', 'Toolbar', () => import('../content/toolbar')),
    ],
  },
  {
    label: 'Оверлеи',
    items: [
      c('dialog', 'Dialog', () => import('../content/dialog')),
      c('popover', 'Popover', () => import('../content/popover')),
      c('tooltip', 'Tooltip', () => import('../content/tooltip')),
      c('dropdown-menu', 'Dropdown Menu', () => import('../content/dropdown-menu')),
      c('context-menu', 'Context Menu', () => import('../content/context-menu')),
      c('toast', 'Toast', () => import('../content/toast')),
      c('command-palette', 'Command Palette', () => import('../content/command-palette')),
    ],
  },
  {
    label: 'Данные и обратная связь',
    items: [
      c('table', 'Table', () => import('../content/table')),
      c('pagination', 'Pagination', () => import('../content/pagination')),
      c('badge', 'Badge', () => import('../content/badge')),
      c('avatar', 'Avatar', () => import('../content/avatar')),
      c('progress', 'Progress', () => import('../content/progress')),
      c('skeleton', 'Skeleton', () => import('../content/skeleton')),
      c('spinner', 'Spinner', () => import('../content/spinner')),
      c('empty-state', 'Empty State', () => import('../content/empty-state')),
      c('breadcrumbs', 'Breadcrumbs', () => import('../content/breadcrumbs')),
      c('stepper', 'Stepper', () => import('../content/stepper')),
    ],
  },
];

export const allComponents = componentGroups.flatMap((group) => group.items);

export const examples: (NavItem & { description: string })[] = [
  {
    path: '/examples/dashboard',
    title: 'Дашборд',
    icon: 'chart',
    description: 'Сворачиваемые панели, метрики и таблица счетов с сортировкой и выбором.',
  },
  {
    path: '/examples/settings',
    title: 'Настройки',
    icon: 'sliders',
    description: 'Формы на signal forms: профиль, уведомления и опасная зона с подтверждением.',
  },
  {
    path: '/examples/kanban',
    title: 'Канбан',
    icon: 'columns',
    description: 'Доска с перетаскиванием карточек и боковой панелью задачи на разделителе.',
  },
];

import { Routes } from '@angular/router';
import { allComponents } from './core/nav';

const guide = (path: string, title: string, load: () => Promise<{ default: unknown }>) => ({
  path,
  title: `${title} · Kenny`,
  loadComponent: () => load().then((m) => m.default as never),
});

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Kenny — компоненты для Angular',
    loadComponent: () => import('./pages/home'),
  },
  {
    path: 'docs',
    loadComponent: () => import('./shell/docs-layout').then((m) => m.DocsLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'getting-started' },
      guide('getting-started', 'Начало работы', () => import('./pages/getting-started')),
      guide('installation', 'Установка', () => import('./pages/installation')),
      guide('presets', 'Стили', () => import('./pages/presets')),
      guide('builder', 'Конструктор стиля', () => import('./pages/builder')),
      guide('theming', 'Темизация', () => import('./pages/theming')),
      guide('tokens', 'Токены', () => import('./pages/tokens')),
      guide('motion', 'Motion', () => import('./pages/motion')),
      guide('localization', 'Локализация', () => import('./pages/localization')),
      guide('accessibility', 'Доступность', () => import('./pages/accessibility')),
    ],
  },
  {
    path: 'components',
    loadComponent: () => import('./shell/docs-layout').then((m) => m.DocsLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'button' },
      // One static route per component, so every page is prerendered.
      ...allComponents.map((item) => ({
        path: item.slug,
        title: `${item.title} · Kenny`,
        loadComponent: () => import('./core/component-page').then((m) => m.ComponentPage),
        resolve: { doc: item.load },
      })),
    ],
  },
  {
    path: 'examples',
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Примеры · Kenny',
        loadComponent: () => import('./pages/examples'),
      },
      {
        path: 'dashboard',
        title: 'Дашборд · Kenny',
        loadComponent: () => import('./pages/example-dashboard'),
      },
      {
        path: 'settings',
        title: 'Настройки · Kenny',
        loadComponent: () => import('./pages/example-settings'),
      },
      {
        path: 'kanban',
        title: 'Канбан · Kenny',
        loadComponent: () => import('./pages/example-kanban'),
      },
      {
        path: 'chat',
        title: 'Чат с агентом · Kenny',
        loadComponent: () => import('./pages/example-chat'),
      },
    ],
  },
  {
    path: '**',
    title: 'Страница не найдена · Kenny',
    loadComponent: () => import('./pages/not-found'),
  },
];

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnBreadcrumb, KnBreadcrumbs } from '@kenny/ui/breadcrumbs';
import { data } from '../../generated/breadcrumbs';
import { ComponentDoc } from '../core/doc-types';
import { DocsPlayground, range, text } from '../core/playground';
import Basic from '../demos/breadcrumbs/basic.demo';

const PATH = ['Главная', 'Проекты', 'Kenny', 'Документация', 'Компоненты'];

@Component({
  imports: [DocsPlayground, KnBreadcrumbs, KnBreadcrumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-breadcrumbs aria-label="Навигационная цепочка, настраиваемый пример">
        @for (item of items(); track item) {
          <kn-breadcrumb
            ><a href="#" (click)="$event.preventDefault()">{{ item }}</a></kn-breadcrumb
          >
        }
        <kn-breadcrumb current>{{ current.value() }}</kn-breadcrumb>
      </kn-breadcrumbs>
    </docs-playground>
  `,
})
class Playground {
  protected readonly depth = range('Уровней до текущей страницы', 2, 1, 5);
  protected readonly current = text('Текущая страница', 'Breadcrumbs');
  protected readonly controls = [this.depth, this.current];
  protected readonly items = computed(() => PATH.slice(0, this.depth.value()));
  protected readonly code = computed(
    () =>
      `<kn-breadcrumbs>\n${this.items()
        .map((item) => `  <kn-breadcrumb><a routerLink="…">${item}</a></kn-breadcrumb>`)
        .join(
          '\n',
        )}\n  <kn-breadcrumb current>${this.current.value()}</kn-breadcrumb>\n</kn-breadcrumbs>`,
  );
}

export default {
  slug: 'breadcrumbs',
  title: 'Breadcrumbs',
  entry: 'breadcrumbs',
  description:
    'Путь от корня до текущей страницы. Помогает понять, где вы находитесь, и подняться на уровень выше; основную навигацию не заменяет.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Путь к странице',
      description: 'Первое звено может быть иконкой — тогда иконке нужен label.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    {
      name: '(по умолчанию, kn-breadcrumb)',
      description: 'Ссылка <a>; для текущей страницы — текст.',
    },
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Перемещается по ссылкам пути.' },
    { keys: ['Enter'], action: 'Переходит по ссылке.' },
  ],
  a11y: [
    'Паттерн APG Breadcrumb: <nav> с именем и упорядоченный список звеньев.',
    'Текущая страница — не ссылка, она отмечена aria-current="page".',
    'Разделители нарисованы маской в CSS и не читаются скринридером; в RTL они зеркалятся.',
  ],
} satisfies ComponentDoc;

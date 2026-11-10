import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnPagination } from '@kenny/ui/pagination';
import { data } from '../../generated/pagination';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range } from '../core/playground';
import Basic from '../demos/pagination/basic.demo';

@Component({
  imports: [DocsPlayground, KnPagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-pagination
        aria-label="Страницы, настраиваемый пример"
        [total]="total.value()"
        [pageSize]="pageSize.value()"
        [siblings]="siblings.value()"
        [size]="size.value()"
        [(page)]="page"
      />
    </docs-playground>
  `,
})
class Playground {
  protected readonly page = signal(5);
  protected readonly total = range('total', 240, 10, 500, 10);
  protected readonly pageSize = range('pageSize', 10, 5, 50, 5);
  protected readonly siblings = range('siblings', 1, 0, 3);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly controls = [this.total, this.pageSize, this.siblings, this.size];
  protected readonly code = computed(
    () =>
      `<kn-pagination [(page)]="page" [total]="${this.total.value()}"${attrs({
        pageSize: [this.pageSize.value(), 10],
        siblings: [this.siblings.value(), 1],
        size: [this.size.value(), 'md'],
      })} />`,
  );
}

export default {
  slug: 'pagination',
  title: 'Pagination',
  entry: 'pagination',
  description:
    'Переход между страницами длинного списка. Показывает первую, последнюю и соседние страницы, остальное сворачивает в многоточие.',
  api: data.api,
  sources: data.sources,
  apiClasses: ['KnPagination'],
  demos: [
    {
      source: 'basic',
      title: 'Страницы списка',
      description: 'Компонент знает только общее число записей и размер страницы; сами данные запрашивает приложение.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['Tab'], action: 'Перемещается по кнопкам страниц.' },
    { keys: ['Enter', 'Пробел'], action: 'Открывает страницу.' },
  ],
  a11y: [
    'Обёрнут в <nav> с именем «Страницы»; если на экране две пагинации, дайте им разные aria-label.',
    'Текущая страница отмечена aria-current="page", у кнопок полные имена: «Страница 5».',
    'Многоточие декоративно и скрыто от скринридера; «Назад» и «Вперёд» отключаются на краях.',
    'В RTL стрелки зеркалятся.',
  ],
} satisfies ComponentDoc;

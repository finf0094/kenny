import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnDrawer, KnDrawerBody, KnDrawerHeader } from '@kenny/ui/drawer';
import { data as dialog } from '../../generated/dialog';
import { data } from '../../generated/drawer';
import { ComponentDoc } from '../core/doc-types';
import { choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/drawer/basic.demo';

@Component({
  imports: [DocsPlayground, KnButton, KnDrawerHeader, KnDrawerBody],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button kn-button variant="glass" tone="neutral" (click)="open()">Открыть панель</button>
    </docs-playground>
    <ng-template #content>
      <kn-drawer-header heading="Панель" description="Настройки из playground применены" />
      <kn-drawer-body>Закройте её кнопкой, клавишей Esc или кликом по подложке.</kn-drawer-body>
    </ng-template>
  `,
})
class Playground {
  private readonly drawer = inject(KnDrawer);
  private readonly content = viewChild.required<TemplateRef<unknown>>('content');
  protected readonly side = choice('side', ['end', 'start', 'bottom', 'top']);
  protected readonly size = text('size', '22rem');
  protected readonly backdrop = toggle('closeOnBackdrop', true);
  protected readonly escape = toggle('closeOnEscape', true);
  protected readonly controls = [this.side, this.size, this.backdrop, this.escape];
  protected readonly code = computed(
    () =>
      `this.drawer.open(content, {\n  side: '${this.side.value()}',\n  size: '${this.size.value()}',${this.backdrop.value() ? '' : '\n  closeOnBackdrop: false,'}${this.escape.value() ? '' : '\n  closeOnEscape: false,'}\n});`,
  );

  protected open(): void {
    this.drawer.open(this.content(), {
      side: this.side.value(),
      size: this.size.value(),
      closeOnBackdrop: this.backdrop.value(),
      closeOnEscape: this.escape.value(),
    });
  }
}

export default {
  slug: 'drawer',
  title: 'Drawer',
  entry: 'drawer',
  description:
    'Панель, выезжающая от края экрана: фильтры, подробности записи, навигация на телефоне. Это модальный диалог с другим расположением.',
  api: { classes: [...data.api.classes, ...dialog.api.classes], cssVars: dialog.api.cssVars },
  sources: data.sources,
  apiClasses: ['KnDrawer', 'KnDialogRef', 'KnDialogHeader', 'KnDialogClose'],
  imports: ['KnDrawer', 'KnDrawerHeader', 'KnDrawerBody', 'KnDrawerFooter', 'KnDrawerClose'],
  cssPrefix: '--kn-d',
  demos: [
    {
      source: 'basic',
      title: 'Четыре стороны',
      description:
        'start и end учитывают направление письма. Содержимое — шаблон или компонент, как у Dialog.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    {
      name: 'kn-drawer-header',
      description: 'Заголовок, описание и кнопка закрытия. То же, что kn-dialog-header.',
    },
    { name: 'kn-drawer-body', description: 'Прокручиваемое содержимое.' },
    { name: 'kn-drawer-footer', description: 'Действия внизу панели.' },
  ],
  keyboard: [
    { keys: ['Esc'], action: 'Закрывает панель.' },
    { keys: ['Tab'], action: 'Перемещает фокус внутри панели по кругу.' },
  ],
  a11y: [
    'role="dialog" и aria-modal="true"; имя берётся из заголовка в kn-drawer-header.',
    'Фокус запирается внутри и после закрытия возвращается на элемент, который открыл панель.',
    'Панель «плавает» с отступом от края и въезжает через transform; в RTL стороны start и end зеркалятся.',
    'KnDrawerRef, KnDrawerHeader и другие части — те же классы, что у Dialog, под вторыми именами.',
  ],
} satisfies ComponentDoc;

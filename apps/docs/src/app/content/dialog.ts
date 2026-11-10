import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import {
  KnDialog,
  KnDialogBody,
  KnDialogClose,
  KnDialogFooter,
  KnDialogHeader,
} from '@kenny/ui/dialog';
import { data } from '../../generated/dialog';
import { ComponentDoc } from '../core/doc-types';
import { choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/dialog/basic.demo';
import Form from '../demos/dialog/form.demo';

@Component({
  imports: [DocsPlayground, KnButton, KnDialogHeader, KnDialogBody, KnDialogFooter, KnDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button kn-button variant="outline" tone="neutral" (click)="open()">Открыть окно</button>
    </docs-playground>
    <ng-template #content>
      <kn-dialog-header heading="Окно из playground" [closable]="closable.value()" />
      <kn-dialog-body>Ширина, роль и способы закрытия заданы настройками справа.</kn-dialog-body>
      <kn-dialog-footer><button kn-button knDialogClose>Понятно</button></kn-dialog-footer>
    </ng-template>
  `,
})
class Playground {
  private readonly dialog = inject(KnDialog);
  private readonly content = viewChild.required<TemplateRef<unknown>>('content');
  protected readonly width = text('width', '28rem');
  protected readonly role = choice('role', ['dialog', 'alertdialog']);
  protected readonly backdrop = toggle('closeOnBackdrop', true);
  protected readonly escape = toggle('closeOnEscape', true);
  protected readonly closable = toggle('Кнопка закрытия', true);
  protected readonly controls = [this.width, this.role, this.backdrop, this.escape, this.closable];
  protected readonly code = computed(
    () =>
      `this.dialog.open(content, {\n  width: '${this.width.value()}',${this.role.value() === 'dialog' ? '' : "\n  role: 'alertdialog',"}${this.backdrop.value() ? '' : '\n  closeOnBackdrop: false,'}${this.escape.value() ? '' : '\n  closeOnEscape: false,'}\n});`,
  );

  protected open(): void {
    this.dialog.open(this.content(), {
      width: this.width.value(),
      role: this.role.value(),
      closeOnBackdrop: this.backdrop.value(),
      closeOnEscape: this.escape.value(),
    });
  }
}

export default {
  slug: 'dialog',
  title: 'Dialog',
  entry: 'dialog',
  description:
    'Модальное окно для короткой задачи, которая требует внимания: подтверждение, небольшая форма. Открывается сервисом KnDialog; содержимое — компонент или шаблон.',
  api: data.api,
  sources: data.sources,
  apiClasses: ['KnDialog', 'KnDialogRef', 'KnDialogHeader', 'KnDialogClose'],
  imports: [
    'KnDialog',
    'KnDialogHeader',
    'KnDialogBody',
    'KnDialogFooter',
    'KnDialogClose',
    'KnDialogRef',
    'KN_DIALOG_DATA',
  ],
  cssPrefix: '--kn-dialog',
  demos: [
    {
      source: 'basic',
      title: 'Подтверждение с результатом',
      description:
        'Компонент окна получает данные через KN_DIALOG_DATA и возвращает результат через [knDialogClose]. role="alertdialog" и запрет закрытия по подложке — для необратимых действий.',
      component: Basic,
    },
    {
      source: 'form',
      title: 'Форма из шаблона',
      description:
        'Шаблон получает ссылку на окно как let-ref. Фокус при открытии попадает в первое поле.',
      component: Form,
    },
  ],
  playground: Playground,
  slots: [
    {
      name: 'kn-dialog-header',
      description: 'Заголовок (становится именем окна), описание и кнопка закрытия.',
    },
    { name: 'kn-dialog-body', description: 'Содержимое; прокручивается, если не помещается.' },
    { name: 'kn-dialog-footer', description: 'Кнопки действий, выровненные по концу строки.' },
  ],
  keyboard: [
    { keys: ['Tab', 'Shift', 'Tab'], action: 'Перемещает фокус между элементами окна по кругу.' },
    { keys: ['Esc'], action: 'Закрывает окно (если не отключено closeOnEscape).' },
  ],
  a11y: [
    'Паттерн APG Dialog (Modal): role="dialog" или "alertdialog", aria-modal="true", имя — из заголовка через aria-labelledby.',
    'При открытии фокус уходит на первый фокусируемый элемент, при закрытии возвращается туда, где был.',
    'Остальная страница недоступна для скринридера, пока окно открыто.',
    'Окно поднимается пружиной, подложка проявляется прозрачностью; выход короче входа.',
  ],
} satisfies ComponentDoc;

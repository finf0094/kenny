import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnToaster } from '@kenny/ui/toast';
import { data } from '../../generated/toast';
import { ComponentDoc } from '../core/doc-types';
import { choice, DocsPlayground, range, text, toggle } from '../core/playground';
import Basic from '../demos/toast/basic.demo';

@Component({
  imports: [DocsPlayground, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button kn-button variant="glass" tone="neutral" (click)="show()">Показать уведомление</button>
    </docs-playground>
  `,
})
class Playground {
  private readonly toaster = inject(KnToaster);
  protected readonly title = text('title', 'Ссылка скопирована');
  protected readonly description = text('description', '');
  protected readonly tone = choice('tone', ['neutral', 'success', 'warning', 'danger']);
  protected readonly duration = range('duration, с (0 — не закрывать)', 5, 0, 15);
  protected readonly action = toggle('Кнопка действия');
  protected readonly controls = [this.title, this.description, this.tone, this.duration, this.action];
  protected readonly code = computed(
    () =>
      `this.toaster.show({\n  title: '${this.title.value()}',${this.description.value() ? `\n  description: '${this.description.value()}',` : ''}${this.tone.value() === 'neutral' ? '' : `\n  tone: '${this.tone.value()}',`}${this.duration.value() === 5 ? '' : `\n  duration: ${this.duration.value() * 1000},`}${this.action.value() ? "\n  action: { label: 'Отменить', run: () => this.undo() }," : ''}\n});`,
  );

  protected show(): void {
    this.toaster.show({
      title: this.title.value(),
      description: this.description.value() || undefined,
      tone: this.tone.value(),
      duration: this.duration.value() * 1000,
      action: this.action.value() ? { label: 'Отменить', run: () => this.toaster.show({ title: 'Действие отменено' }) } : undefined,
    });
  }
}

export default {
  slug: 'toast',
  title: 'Toast',
  entry: 'toast',
  description:
    'Короткое уведомление о результате действия, которое не требует ответа. Появляется в углу экрана и исчезает само. Для ошибок, которые нужно исправить, показывайте сообщение рядом с полем.',
  api: data.api,
  sources: data.sources,
  imports: ['KnToaster', 'provideKnToaster'],
  demos: [
    {
      source: 'basic',
      title: 'Тоны и действие «Отменить»',
      description: 'Одновременно видно не больше четырёх уведомлений; наведите курсор на стопку — таймеры встанут на паузу.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['Tab'], action: 'Стопка стоит в конце документа: до кнопок уведомления можно дойти с клавиатуры.' },
    { keys: ['Enter', 'Пробел'], action: 'Нажимает кнопку действия или закрытия.' },
  ],
  a11y: [
    'Стопка — region с именем «Уведомления»; обычные уведомления имеют role="status", ошибки — role="alert".',
    'Таймер ставится на паузу, пока курсор или фокус внутри стопки (WCAG 2.2.1), и никогда не короче 0,8 с после возобновления.',
    'duration: 0 оставляет уведомление до явного закрытия — используйте для важных сообщений.',
    'Уходящее уведомление схлопывает свою ячейку (grid-template-rows), и остальные плавно занимают место.',
    'Положение и длительность по умолчанию задаются один раз через provideKnToaster().',
  ],
} satisfies ComponentDoc;

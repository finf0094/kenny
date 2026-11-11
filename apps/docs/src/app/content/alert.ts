import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnAlert } from '@kenny/ui/alert';
import { data } from '../../generated/alert';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Actions from '../demos/alert/actions.demo';
import Basic from '../demos/alert/basic.demo';

@Component({
  imports: [DocsPlayground, KnAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-alert
        style="inline-size: min(26rem, 100%); text-align: start"
        [tone]="tone.value()"
        [variant]="variant.value()"
        [heading]="heading.value()"
        [closable]="closable.value()"
      >
        {{ body.value() }}
      </kn-alert>
    </docs-playground>
  `,
})
class Playground {
  protected readonly heading = text('heading', 'Пробный период заканчивается');
  protected readonly body = text('Текст', 'Через 3 дня проекты станут доступны только для чтения.');
  protected readonly tone = choice(
    'tone',
    ['neutral', 'accent', 'success', 'warning', 'danger'],
    'warning',
  );
  protected readonly variant = choice('variant', ['soft', 'outline']);
  protected readonly closable = toggle('closable');
  protected readonly controls = [this.heading, this.body, this.tone, this.variant, this.closable];
  protected readonly code = computed(
    () =>
      `<kn-alert${attrs({
        tone: [this.tone.value(), 'neutral'],
        variant: [this.variant.value(), 'soft'],
        heading: [this.heading.value(), ''],
        closable: [this.closable.value()],
      })}>${this.body.value()}</kn-alert>`,
  );
}

export default {
  slug: 'alert',
  title: 'Alert',
  entry: 'alert',
  description:
    'Сообщение в потоке страницы: подсказка, предупреждение, итог действия. Остаётся на месте, пока актуально, — для коротких уведомлений поверх интерфейса есть Toast.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Тона',
      description:
        'Тон задаёт цвет и иконку. С заголовком текст становится пояснением, без него — одной строкой.',
      component: Basic,
    },
    {
      source: 'actions',
      title: 'Действия и закрытие',
      description:
        'Вариант outline — спокойная поверхность с цветной полосой. Кнопки передаются слотом knAlertActions.',
      component: Actions,
    },
  ],
  playground: Playground,
  slots: [
    { name: '(по умолчанию)', description: 'Текст сообщения.' },
    { name: '[knAlertActions]', description: 'Кнопки под текстом.' },
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Переходит к действиям и кнопке закрытия.' },
    { keys: ['Enter', 'Пробел'], action: 'На кнопке закрытия — скрывает сообщение.' },
  ],
  a11y: [
    'role="status" для обычных сообщений и role="alert" для тона danger: скринридер прочитает текст, появившийся после загрузки страницы. Срочность меняется входом live.',
    'Сообщению, которое есть на странице с самого начала и ничего не объявляет, задайте live="off".',
    'Смысл передаётся иконкой и текстом, а не только цветом.',
    'Подпись кнопки закрытия берётся из provideKnLabels и переводится вместе с остальными.',
  ],
} satisfies ComponentDoc;

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnProgress } from '@kenny/ui/progress';
import { data } from '../../generated/progress';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, toggle } from '../core/playground';
import Basic from '../demos/progress/basic.demo';

@Component({
  imports: [DocsPlayground, KnProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-progress
        style="inline-size: 16rem"
        aria-label="Загрузка"
        [value]="indeterminate.value() ? null : value.value()"
        [tone]="tone.value()"
        [size]="size.value()"
      />
    </docs-playground>
  `,
})
class Playground {
  protected readonly value = range('value', 60, 0, 100, 5);
  protected readonly indeterminate = toggle('Неопределённый (value = null)');
  protected readonly tone = choice('tone', ['accent', 'success', 'warning', 'danger', 'neutral']);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly controls = [this.value, this.indeterminate, this.tone, this.size];
  protected readonly code = computed(
    () =>
      `<kn-progress aria-label="Загрузка"${this.indeterminate.value() ? '' : ` [value]="${this.value.value()}"`}${attrs(
        {
          tone: [this.tone.value(), 'accent'],
          size: [this.size.value(), 'md'],
        },
      )} />`,
  );
}

export default {
  slug: 'progress',
  title: 'Progress',
  entry: 'progress',
  description:
    'Полоса прогресса для операций дольше пары секунд. Если доля выполнения известна — показывайте её; если нет — неопределённый режим.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Определённый и неопределённый прогресс',
      description: 'Тон может меняться вместе со смыслом: завершённая загрузка становится зелёной.',
      component: Basic,
    },
  ],
  playground: Playground,
  a11y: [
    'role="progressbar" с aria-valuenow, aria-valuemin и aria-valuemax; в неопределённом режиме значения не задаются.',
    'aria-label обязателен по смыслу: «Загрузка архива», а не просто «Прогресс».',
    'Заливка двигается через transform: translateX, в RTL — справа налево.',
    'При prefers-reduced-motion неопределённая анимация замедляется, но не исчезает: это единственный признак активности.',
  ],
} satisfies ComponentDoc;

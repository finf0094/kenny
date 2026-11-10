import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { KnTooltip } from '@kenny/ui/tooltip';
import { data } from '../../generated/tooltip';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, text } from '../core/playground';
import Basic from '../demos/tooltip/basic.demo';

const PLACEMENTS = [
  'top',
  'bottom',
  'start',
  'end',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
] as const;

@Component({
  imports: [DocsPlayground, KnButton, KnIcon, KnTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button
        kn-icon-button
        variant="glass"
        tone="neutral"
        aria-label="Напомнить"
        [knTooltip]="label.value()"
        [knTooltipPlacement]="placement.value()"
        [knTooltipDelay]="delay.value()"
      >
        <kn-icon name="bell" />
      </button>
    </docs-playground>
  `,
})
class Playground {
  protected readonly label = text('knTooltip', 'Напомнить завтра в 9:00');
  protected readonly placement = choice('knTooltipPlacement', PLACEMENTS);
  protected readonly delay = range('knTooltipDelay, мс', 500, 0, 1500, 100);
  protected readonly controls = [this.label, this.placement, this.delay];
  protected readonly code = computed(
    () =>
      `<button kn-icon-button aria-label="Напомнить"${attrs({
        knTooltip: [this.label.value()],
        knTooltipPlacement: [this.placement.value(), 'top'],
        knTooltipDelay: [this.delay.value(), 500],
      })}>\n  <kn-icon name="bell" />\n</button>`,
  );
}

export default {
  slug: 'tooltip',
  title: 'Tooltip',
  entry: 'tooltip',
  description:
    'Короткая текстовая подсказка при наведении и фокусе. Уточняет назначение элемента или показывает горячую клавишу; интерактивному содержимому место в Popover.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Подсказки к кнопкам-иконкам',
      description:
        'При наведении подсказка ждёт полсекунды, при фокусе с клавиатуры появляется сразу.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['Tab'], action: 'Фокус с клавиатуры показывает подсказку без задержки.' },
    { keys: ['Esc'], action: 'Скрывает подсказку, не снимая фокус.' },
  ],
  a11y: [
    'Текст постоянно привязан к элементу через aria-describedby (CDK AriaDescriber), а не только пока подсказка видна.',
    'Подсказка — описание, а не имя: кнопке-иконке по-прежнему нужен aria-label.',
    'Видимая подсказка не перехватывает указатель и не получает фокус.',
    'На сенсорных устройствах подсказки не показываются: не прячьте в них то, без чего нельзя обойтись.',
  ],
} satisfies ComponentDoc;

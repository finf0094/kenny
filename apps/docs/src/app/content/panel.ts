import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnPanel } from '@kenny/ui/panel';
import { data as collapse } from '../../generated/collapse';
import { data } from '../../generated/panel';
import { ComponentDoc } from '../core/doc-types';
import { attrs, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/panel/basic.demo';

@Component({
  imports: [DocsPlayground, KnPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-panel
        style="inline-size: 19rem"
        [heading]="heading.value()"
        [description]="description.value()"
        [collapsible]="collapsible.value()"
        [(expanded)]="expanded"
      >
        Содержимое панели: любая разметка, формы, списки.
      </kn-panel>
    </docs-playground>
  `,
})
class Playground {
  protected readonly expanded = signal(true);
  protected readonly heading = text('heading', 'Параметры экспорта');
  protected readonly description = text('description', 'Формат и период');
  protected readonly collapsible = toggle('collapsible', true);
  protected readonly controls = [this.heading, this.description, this.collapsible];
  protected readonly code = computed(
    () =>
      `<kn-panel${attrs({
        heading: [this.heading.value()],
        description: [this.description.value()],
      })}${this.collapsible.value() ? ' [(expanded)]="open"' : ' [collapsible]="false"'}>\n  …\n</kn-panel>`,
  );
}

export default {
  slug: 'panel',
  title: 'Panel',
  entry: 'panel',
  description:
    'Секция с заголовком, которую можно свернуть, чтобы освободить место. Для нескольких связанных секций, из которых открыта одна, используйте Accordion.',
  api: { classes: [...data.api.classes, ...collapse.api.classes], cssVars: data.api.cssVars },
  sources: data.sources,
  imports: ['KnPanel'],
  demos: [
    {
      source: 'basic',
      title: 'Сворачиваемая и статичная панели',
      description: 'Состояние управляется и изнутри (заголовок), и снаружи через [(expanded)].',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    { name: '(по умолчанию)', description: 'Содержимое панели.' },
    { name: 'knPanelActions', description: 'Кнопки в шапке справа. Находятся вне кнопки-заголовка.' },
  ],
  keyboard: [
    { keys: ['Enter', 'Пробел'], action: 'Сворачивает и разворачивает панель.' },
    { keys: ['Tab'], action: 'Заголовок → действия в шапке → содержимое (если развёрнуто).' },
  ],
  a11y: [
    'Заголовок — кнопка с aria-expanded внутри элемента с ролью heading; уровень задаётся входом headingLevel.',
    'Содержимое — region с именем заголовка. В свёрнутом виде оно inert: недоступно ни фокусу, ни скринридеру.',
    'Высота анимируется через grid-template-rows (0fr → 1fr) в <kn-collapse>; этот компонент можно использовать и отдельно.',
  ],
} satisfies ComponentDoc;

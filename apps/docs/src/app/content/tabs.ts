import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnTab, KnTabs } from '@kenny/ui/tabs';
import { data } from '../../generated/tabs';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/tabs/basic.demo';
import Variants from '../demos/tabs/variants.demo';

@Component({
  imports: [DocsPlayground, KnTabs, KnTab],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-tabs style="inline-size: 22rem" aria-label="Раздел" [variant]="variant.value()" [size]="size.value()" [stretch]="stretch.value()">
        <kn-tab value="a" label="Обзор">Сводка по проекту.</kn-tab>
        <kn-tab value="b" label="Задачи">Список задач.</kn-tab>
        <kn-tab value="c" label="Файлы" [disabled]="disabled.value()">Файлы проекта.</kn-tab>
      </kn-tabs>
    </docs-playground>
  `,
})
class Playground {
  protected readonly variant = choice('variant', ['segmented', 'underline']);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly stretch = toggle('stretch');
  protected readonly disabled = toggle('Третья вкладка disabled');
  protected readonly controls = [this.variant, this.size, this.stretch, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-tabs aria-label="Раздел" [(value)]="tab"${attrs({
        variant: [this.variant.value(), 'segmented'],
        size: [this.size.value(), 'md'],
        stretch: [this.stretch.value()],
      })}>\n  <kn-tab value="a" label="Обзор">…</kn-tab>\n  <kn-tab value="b" label="Задачи">…</kn-tab>\n  <kn-tab value="c" label="Файлы"${this.disabled.value() ? ' disabled' : ''}>…</kn-tab>\n</kn-tabs>`,
  );
}

export default {
  slug: 'tabs',
  title: 'Tabs',
  entry: 'tabs',
  description:
    'Переключение между равноправными представлениями одного контекста. Сегментированный вариант — для 2–5 коротких подписей, подчёркнутый — для разделов страницы.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Сегментированный переключатель',
      description: 'Стеклянный индикатор переезжает под активную вкладку пружиной. Значение привязано через [(value)].',
      component: Basic,
    },
    {
      source: 'variants',
      title: 'Подчёркнутые вкладки, иконки и размеры',
      component: Variants,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию, kn-tab)', description: 'Содержимое панели вкладки.' }],
  keyboard: [
    { keys: ['Tab'], action: 'Фокус на активную вкладку; следующий Tab — в панель.' },
    { keys: ['→', '←'], action: 'Следующая и предыдущая вкладка, по кругу; вкладка сразу активируется.' },
    { keys: ['Home', 'End'], action: 'Первая и последняя вкладка.' },
  ],
  a11y: [
    'Паттерн APG Tabs с автоматической активацией: tablist, tab с aria-selected и aria-controls, tabpanel с aria-labelledby.',
    'В порядке табуляции одна вкладка (roving tabindex); панель фокусируема, чтобы до текста можно было дойти с клавиатуры.',
    'Индикатор двигается FLIP-анимацией: геометрия записывается один раз, движение — только transform.',
    'В RTL стрелки меняются местами. Задайте aria-label списку вкладок, если рядом нет заголовка.',
  ],
} satisfies ComponentDoc;

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnAccordion, KnAccordionItem } from '@kenny/ui/accordion';
import { data } from '../../generated/accordion';
import { ComponentDoc } from '../core/doc-types';
import { attrs, DocsPlayground, range, toggle } from '../core/playground';
import Basic from '../demos/accordion/basic.demo';

@Component({
  imports: [DocsPlayground, KnAccordion, KnAccordionItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-accordion
        style="inline-size: 22rem"
        [multiple]="multiple.value()"
        [headingLevel]="level.value()"
      >
        <kn-accordion-item heading="Доставка" [expanded]="true"
          >Курьером за 1–2 дня или в пункт выдачи.</kn-accordion-item
        >
        <kn-accordion-item heading="Оплата">Картой, по счёту или при получении.</kn-accordion-item>
        <kn-accordion-item heading="Возврат" [disabled]="disabled.value()"
          >В течение 14 дней.</kn-accordion-item
        >
      </kn-accordion>
    </docs-playground>
  `,
})
class Playground {
  protected readonly multiple = toggle('multiple');
  protected readonly level = range('headingLevel', 3, 2, 6);
  protected readonly disabled = toggle('Третья секция disabled');
  protected readonly controls = [this.multiple, this.level, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-accordion${attrs({ multiple: [this.multiple.value()], headingLevel: [this.level.value(), 3] })}>\n  <kn-accordion-item heading="Доставка" [expanded]="true">…</kn-accordion-item>\n  <kn-accordion-item heading="Оплата">…</kn-accordion-item>\n  <kn-accordion-item heading="Возврат"${this.disabled.value() ? ' disabled' : ''}>…</kn-accordion-item>\n</kn-accordion>`,
  );
}

export default {
  slug: 'accordion',
  title: 'Accordion',
  entry: 'accordion',
  description:
    'Стопка раскрывающихся секций для содержимого, которое не нужно видеть целиком: вопросы и ответы, группы настроек.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Одна или несколько открытых секций',
      description:
        'По умолчанию открытие секции закрывает остальные; multiple снимает это ограничение.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    { name: '(по умолчанию, kn-accordion-item)', description: 'Содержимое секции.' },
    {
      name: 'knAccordionHeading',
      description: 'Разметка заголовка вместо текста из входа heading.',
    },
  ],
  keyboard: [
    { keys: ['Enter', 'Пробел'], action: 'Раскрывает или сворачивает секцию.' },
    { keys: ['↓', '↑'], action: 'Фокус на следующий или предыдущий заголовок, по кругу.' },
    { keys: ['Home', 'End'], action: 'Первый и последний заголовок.' },
    { keys: ['Tab'], action: 'Обычный порядок: заголовок, затем содержимое открытой секции.' },
  ],
  a11y: [
    'Паттерн APG Accordion: заголовок секции — heading с кнопкой, у кнопки aria-expanded и aria-controls.',
    'Содержимое — region, подписанный заголовком. Свёрнутое содержимое inert.',
    'Высота раскрывается через grid-template-rows, шеврон поворачивается пружиной — без измерений контента.',
  ],
} satisfies ComponentDoc;

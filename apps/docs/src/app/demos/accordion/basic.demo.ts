import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnAccordion, KnAccordionItem } from '@kenny/ui/accordion';
import { KnSwitch } from '@kenny/ui/switch';

@Component({
  imports: [KnAccordion, KnAccordionItem, KnSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-switch size="sm" [(checked)]="multiple">Разрешить несколько открытых секций</kn-switch>

    <kn-accordion [multiple]="multiple()">
      <kn-accordion-item heading="Нужно ли подключать тему отдельно?" [expanded]="true">
        Да. Компоненты читают CSS-переменные из <code>&#64;kenny/tokens</code>; без них останется
        только структура.
      </kn-accordion-item>
      <kn-accordion-item heading="Как анимируется высота?">
        Через <code>grid-template-rows</code>: строка сетки растёт от 0fr до 1fr, поэтому контент
        любой высоты раскрывается без измерений в JavaScript.
      </kn-accordion-item>
      <kn-accordion-item heading="Что видит скринридер в свёрнутой секции?">
        Ничего: содержимое помечается <code>inert</code> и пропадает из порядка табуляции.
      </kn-accordion-item>
      <kn-accordion-item heading="Секция в разработке" disabled>Скоро.</kn-accordion-item>
    </kn-accordion>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 34rem;
    }

    code {
      font-family: var(--kn-font-mono);
      font-size: 0.9em;
    }
  `,
})
export default class AccordionBasicDemo {
  protected readonly multiple = signal(false);
}

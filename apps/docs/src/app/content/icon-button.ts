import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { data } from '../../generated/button';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import IconButtonDemo from '../demos/button/icon-button.demo';

@Component({
  imports: [DocsPlayground, KnButton, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button
        kn-icon-button
        [attr.aria-label]="label.value()"
        [variant]="variant.value()"
        [tone]="tone.value()"
        [size]="size.value()"
        [disabled]="disabled.value()"
      >
        <kn-icon [name]="icon.value()" />
      </button>
    </docs-playground>
  `,
})
class Playground {
  protected readonly icon = choice('Иконка', ['star', 'edit', 'trash', 'search', 'bell', 'heart']);
  protected readonly label = text('aria-label', 'В избранное');
  protected readonly variant = choice('variant', ['solid', 'soft', 'outline', 'ghost'], 'outline');
  protected readonly tone = choice('tone', ['accent', 'neutral', 'danger'], 'neutral');
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [
    this.icon,
    this.label,
    this.variant,
    this.tone,
    this.size,
    this.disabled,
  ];
  protected readonly code = computed(
    () =>
      `<button kn-icon-button aria-label="${this.label.value()}"${attrs({
        variant: [this.variant.value(), 'solid'],
        tone: [this.tone.value(), 'accent'],
        size: [this.size.value(), 'md'],
        disabled: [this.disabled.value()],
      })}>\n  <kn-icon name="${this.icon.value()}" />\n</button>`,
  );
}

export default {
  slug: 'icon-button',
  title: 'IconButton',
  entry: 'button',
  description:
    'Квадратная кнопка для одной иконки — для панелей инструментов и плотных интерфейсов. Тот же KnButton с селектором kn-icon-button.',
  api: data.api,
  sources: data.sources,
  imports: ['KnButton'],
  demos: [
    {
      source: 'icon-button',
      title: 'Варианты и размеры',
      description: 'Каждой кнопке-иконке нужен aria-label: иконка не является текстом.',
      component: IconButtonDemo,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Одна иконка <kn-icon>.' }],
  keyboard: [{ keys: ['Enter', 'Пробел'], action: 'Нажимает кнопку.' }],
  a11y: [
    'Доступное имя обязательно: aria-label, aria-labelledby или title. В режиме разработки библиотека предупреждает в консоли, если имени нет.',
    'Иконка внутри декоративна (aria-hidden), имя читается с кнопки.',
    'Подсказку при наведении добавляет директива knTooltip — она дополняет имя, а не заменяет его.',
    'Минимальный размер sm — 30 px; для сенсорных экранов используйте md или lg.',
  ],
} satisfies ComponentDoc;

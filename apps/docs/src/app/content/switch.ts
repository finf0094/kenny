import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnSwitch } from '@kenny/ui/switch';
import { data } from '../../generated/switch';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/switch/basic.demo';

@Component({
  imports: [DocsPlayground, KnSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-switch [size]="size.value()" [disabled]="disabled.value()" [(checked)]="checked">
        {{ label.value() }}
      </kn-switch>
    </docs-playground>
  `,
})
class Playground {
  protected readonly checked = signal(true);
  protected readonly label = text('Подпись', 'Автосохранение');
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.label, this.size, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-switch [(checked)]="autosave"${attrs({
        size: [this.size.value(), 'md'],
        disabled: [this.disabled.value()],
      })}>${this.label.value()}</kn-switch>`,
  );
}

export default {
  slug: 'switch',
  title: 'Switch',
  entry: 'switch',
  description:
    'Переключатель для настроек, которые вступают в силу сразу. Если выбор подтверждается кнопкой формы, используйте Checkbox.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Список настроек и размеры',
      description: 'Когда подпись стоит отдельно от переключателя, имя задаётся через aria-label.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Подпись. Без неё задайте aria-label.' }],
  keyboard: [
    { keys: ['Пробел'], action: 'Переключает состояние.' },
    { keys: ['Tab'], action: 'Переводит фокус на переключатель и с него.' },
  ],
  a11y: [
    'Нативный checkbox с role="switch": скринридер объявляет «включено» и «выключено», а не «отмечено».',
    'Работает с Reactive Forms и signal forms ([formField]) как булево поле.',
    'Ползунок двигается пружиной и слегка растягивается при нажатии — только transform. В RTL направление зеркалится.',
    'Состояние передаётся не только цветом: ползунок меняет положение.',
  ],
} satisfies ComponentDoc;

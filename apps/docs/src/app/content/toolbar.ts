import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { KnToolbar, KnToolbarSeparator } from '@kenny/ui/toolbar';
import { data } from '../../generated/toolbar';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground } from '../core/playground';
import Basic from '../demos/toolbar/basic.demo';

@Component({
  imports: [DocsPlayground, KnToolbar, KnToolbarSeparator, KnButton, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-toolbar aria-label="Действия с письмом" [orientation]="orientation.value()" [variant]="variant.value()">
        <button kn-icon-button size="sm" variant="ghost" tone="neutral" aria-label="В архив"><kn-icon name="archive" /></button>
        <button kn-icon-button size="sm" variant="ghost" tone="neutral" aria-label="Отложить"><kn-icon name="clock" /></button>
        <kn-toolbar-separator />
        <button kn-icon-button size="sm" variant="ghost" tone="danger" aria-label="Удалить"><kn-icon name="trash" /></button>
      </kn-toolbar>
    </docs-playground>
  `,
})
class Playground {
  protected readonly orientation = choice('orientation', ['horizontal', 'vertical']);
  protected readonly variant = choice('variant', ['glass', 'plain']);
  protected readonly controls = [this.orientation, this.variant];
  protected readonly code = computed(
    () =>
      `<kn-toolbar aria-label="Действия с письмом"${attrs({
        orientation: [this.orientation.value(), 'horizontal'],
        variant: [this.variant.value(), 'glass'],
      })}>\n  <button kn-icon-button aria-label="В архив">…</button>\n  <kn-toolbar-separator />\n  <button kn-icon-button aria-label="Удалить">…</button>\n</kn-toolbar>`,
  );
}

export default {
  slug: 'toolbar',
  title: 'Toolbar',
  entry: 'toolbar',
  description:
    'Группа часто используемых действий в одной плавающей капсуле. Для клавиатуры это один элемент: внутрь заходят один раз, дальше двигаются стрелками.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Панель форматирования',
      description: 'Кнопки-переключатели сообщают состояние через aria-pressed. Распорка отодвигает главное действие к краю.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    {
      name: '(по умолчанию)',
      description: 'Кнопки, ссылки, <kn-toolbar-separator> и <kn-toolbar-spacer>. Любой фокусируемый элемент становится элементом панели.',
    },
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Входит в панель (на последний активный элемент) и выходит из неё.' },
    { keys: ['→', '←'], action: 'Следующий и предыдущий элемент, по кругу (↓ и ↑ для вертикальной панели).' },
    { keys: ['Home', 'End'], action: 'Первый и последний элемент.' },
  ],
  a11y: [
    'Паттерн APG Toolbar: role="toolbar", roving tabindex, отключённые элементы пропускаются.',
    'Панели нужен aria-label, особенно если на странице их несколько.',
    'Текстовые поля внутри панели сохраняют свои стрелки: навигация не перехватывает их.',
    'В RTL стрелки меняются местами.',
  ],
} satisfies ComponentDoc;

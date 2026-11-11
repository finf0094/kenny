import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnTagInput } from '@kenny/ui/tag-input';
import { data } from '../../generated/tag-input';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, toggle } from '../core/playground';
import Basic from '../demos/tag-input/basic.demo';

@Component({
  imports: [DocsPlayground, KnTagInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-tag-input
        style="inline-size: min(20rem, 100%)"
        aria-label="Метки"
        placeholder="Новая метка"
        [size]="size.value()"
        [max]="max.value()"
        [allowDuplicates]="duplicates.value()"
        [disabled]="disabled.value()"
        [(value)]="tags"
      />
    </docs-playground>
  `,
})
class Playground {
  protected readonly tags = signal(['дизайн', 'бэкенд']);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly max = range('max', 6, 1, 12);
  protected readonly duplicates = toggle('allowDuplicates');
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.size, this.max, this.duplicates, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-tag-input aria-label="Метки" [(value)]="tags" [max]="${this.max.value()}"${attrs({
        size: [this.size.value(), 'md'],
        allowDuplicates: [this.duplicates.value()],
        disabled: [this.disabled.value()],
      })} />`,
  );
}

export default {
  slug: 'tag-input',
  title: 'Tag Input',
  entry: 'tag-input',
  description:
    'Поле со списком значений, которые человек вводит сам: метки, адреса, ключевые слова. Если значения выбираются из готового набора, нужен Multi Select.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Метки и адреса с проверкой',
      description:
        'validate отклоняет тег до добавления, max ограничивает количество, а событие rejected объясняет, что пошло не так. Отклонённый текст остаётся в поле.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['Enter', ','], action: 'Добавляет набранный текст как тег.' },
    {
      keys: ['Backspace'],
      action: 'В пустом поле отмечает последний тег, повторное нажатие убирает его.',
    },
    {
      keys: ['←', '→'],
      action: 'В пустом поле переходят по тегам; Backspace или Delete убирают отмеченный.',
    },
    { keys: ['Esc'], action: 'Снимает отметку с тега.' },
    { keys: ['Tab'], action: 'Уходит из поля; незавершённый текст становится тегом.' },
  ],
  a11y: [
    'Одна позиция табуляции — само поле. Теги перебираются стрелками, поэтому Tab не проходит по десятку кнопок.',
    'Каждое добавление, удаление и отказ объявляются через role="status": «дизайн добавлено», «срочно уже есть в списке».',
    'Первое нажатие Backspace только отмечает тег — случайное нажатие ничего не стирает.',
    'Кнопка удаления называется вместе с тегом: «Убрать дизайн». Все тексты берутся из provideKnLabels.',
    'Enter во время ввода тега не отправляет форму вокруг поля.',
    'Внутри kn-field получает подпись, подсказку и ошибку. Работает с Reactive Forms и signal forms.',
  ],
} satisfies ComponentDoc;

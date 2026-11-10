import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnTextarea } from '@kenny/ui/textarea';
import { data } from '../../generated/input';
import { data as demos } from '../../generated/textarea';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, toggle } from '../core/playground';
import Basic from '../demos/textarea/basic.demo';

@Component({
  imports: [DocsPlayground, KnTextarea, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-field label="Комментарий" style="inline-size: 20rem">
        <textarea
          knTextarea
          placeholder="Напишите несколько строк"
          [knSize]="size.value()"
          [autosize]="autosize.value()"
          [minRows]="minRows.value()"
          [maxRows]="maxRows.value()"
          [disabled]="disabled.value()"
        ></textarea>
      </kn-field>
    </docs-playground>
  `,
})
class Playground {
  protected readonly size = choice('knSize', ['sm', 'md', 'lg'], 'md');
  protected readonly autosize = toggle('autosize', true);
  protected readonly minRows = range('minRows', 3, 1, 6);
  protected readonly maxRows = range('maxRows', 8, 2, 12);
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [
    this.size,
    this.autosize,
    this.minRows,
    this.maxRows,
    this.disabled,
  ];
  protected readonly code = computed(
    () =>
      `<textarea knTextarea${attrs({
        knSize: [this.size.value(), 'md'],
        minRows: [this.minRows.value(), 3],
        maxRows: [this.maxRows.value()],
        disabled: [this.disabled.value()],
      })}${this.autosize.value() ? '' : ' [autosize]="false"'}></textarea>`,
  );
}

export default {
  slug: 'textarea',
  title: 'Textarea',
  entry: 'textarea',
  description:
    'Многострочное поле на нативном <textarea>. По умолчанию растёт вместе с текстом в пределах minRows и maxRows — без полос прокрутки, пока хватает места.',
  api: data.api,
  sources: demos.sources,
  apiClasses: ['KnTextarea'],
  cssPrefix: '--kn-input',
  demos: [
    {
      source: 'basic',
      title: 'Авторазмер и счётчик',
      description:
        'Высоту считает CdkTextareaAutosize. Входы autosize, minRows и maxRows пробрасываются на него.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['Tab'], action: 'Фокус на поле.' },
    { keys: ['Enter'], action: 'Новая строка.' },
  ],
  a11y: [
    'Работает с <kn-field> так же, как Input: label, aria-describedby и aria-invalid связываются автоматически.',
    'Высота меняется мгновенно: анимировать её нельзя без пересчёта раскладки на каждом кадре.',
    'Входы autosize, minRows и maxRows принадлежат CdkTextareaAutosize, поэтому в таблице API ниже их нет.',
  ],
} satisfies ComponentDoc;

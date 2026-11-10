import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';
import { data as field } from '../../generated/field';
import { data } from '../../generated/input';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/input/basic.demo';
import Validation from '../demos/input/validation.demo';

@Component({
  imports: [DocsPlayground, KnInput, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-field style="inline-size: 18rem" [label]="label.value()" [hint]="hint.value()" [error]="error.value() || null" [required]="required.value()">
        <input knInput [knSize]="size.value()" [placeholder]="placeholder.value()" [disabled]="disabled.value()" />
      </kn-field>
    </docs-playground>
  `,
})
class Playground {
  protected readonly label = text('label', 'Название');
  protected readonly placeholder = text('placeholder', 'Введите текст');
  protected readonly hint = text('hint', 'До 40 символов');
  protected readonly error = text('error', '');
  protected readonly size = choice('knSize', ['sm', 'md', 'lg'], 'md');
  protected readonly required = toggle('required');
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.label, this.placeholder, this.hint, this.error, this.size, this.required, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-field${attrs({
        label: [this.label.value()],
        hint: [this.hint.value()],
        error: [this.error.value()],
        required: [this.required.value()],
      })}>\n  <input knInput${attrs({
        knSize: [this.size.value(), 'md'],
        placeholder: [this.placeholder.value()],
        disabled: [this.disabled.value()],
      })} />\n</kn-field>`,
  );
}

export default {
  slug: 'input',
  title: 'Input',
  entry: 'input',
  description:
    'Однострочное текстовое поле. Директива на нативном <input>, поэтому type, autocomplete, Reactive Forms, ngModel и signal forms работают без адаптеров. Подпись, подсказку и ошибку добавляет <kn-field>.',
  api: { classes: [...data.api.classes, ...field.api.classes], cssVars: data.api.cssVars },
  sources: data.sources,
  apiClasses: ['KnInput', 'KnInputGroup', 'KnField'],
  imports: ['KnInput', 'KnInputGroup'],
  demos: [
    {
      source: 'basic',
      title: 'Поле с подписью',
      description: '<kn-field> сам связывает label, подсказку и поле — id и aria-describedby писать не нужно.',
      component: Basic,
    },
    {
      source: 'validation',
      title: 'Валидация и дополнения',
      description:
        'Форма на signal forms: ошибка показывается после ухода из поля. <kn-input-group> помещает иконку и суффикс внутрь общего контура.',
      component: Validation,
    },
  ],
  playground: Playground,
  slots: [
    { name: 'knPrefix (kn-input-group)', description: 'Иконка или текст перед полем.' },
    { name: 'knSuffix (kn-input-group)', description: 'Единица измерения, домен или кнопка после поля.' },
    { name: '(по умолчанию, kn-field)', description: 'Сам контрол: input, select, slider и т. д.' },
  ],
  keyboard: [{ keys: ['Tab'], action: 'Фокус на поле. Остальное — стандартное редактирование текста.' }],
  a11y: [
    'Подпись — настоящий <label for>, клик по ней ставит курсор в поле.',
    'Пока задан error, поле получает aria-invalid="true", а текст ошибки привязан через aria-describedby и объявляется в aria-live-области.',
    'С Reactive Forms поле подсвечивается по классам ng-invalid и ng-touched; текст ошибки передавайте в <kn-field>.',
    'Плейсхолдер не заменяет подпись: у него ниже контраст и он исчезает при вводе.',
  ],
} satisfies ComponentDoc;

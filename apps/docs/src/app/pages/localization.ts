import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { KnLabels, knLabelsEn, knLabelsRu, provideKnLabels } from '@kenny/ui/core';
import { KnDatePicker } from '@kenny/ui/date-picker';
import { KnOption } from '@kenny/ui/option';
import { KnPagination } from '@kenny/ui/pagination';
import { KnSelect } from '@kenny/ui/select';
import { KnSpinner } from '@kenny/ui/spinner';
import { KnToggle, KnToggleGroup } from '@kenny/ui/toggle-group';
import { DocsCode } from '../core/code-block';

type Lang = 'ru' | 'en';

@Injectable()
class DemoLanguage {
  readonly code = signal<Lang>('ru');
  readonly labels = computed(() => (this.code() === 'ru' ? knLabelsRu : knLabelsEn));
}

/** Everything inside takes its built-in texts from the language chosen above the block. */
@Component({
  selector: 'docs-labels-demo',
  imports: [KnToggleGroup, KnToggle, KnPagination, KnSelect, KnDatePicker, KnOption, KnSpinner],
  providers: [DemoLanguage, provideKnLabels(() => inject(DemoLanguage).labels)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-toggle-group
      aria-label="Язык встроенных подписей"
      size="sm"
      requireSelection
      [value]="language.code()"
      (valueChange)="set($event)"
    >
      <button kn-toggle value="ru">Русский</button>
      <button kn-toggle value="en">English</button>
    </kn-toggle-group>

    <div class="grid">
      <kn-select aria-label="Select">
        <kn-option value="1">Europe/Moscow</kn-option>
        <kn-option value="2">Asia/Almaty</kn-option>
      </kn-select>
      <kn-date-picker aria-label="Date" />
      <kn-pagination [total]="90" [pageSize]="10" [(page)]="page" />
      <span class="loading"><kn-spinner size="sm" /> {{ language.labels().spinner.label }}…</span>
    </div>
    <p class="note">
      Подписи кнопок пагинации и индикатора читает скринридер — наведите курсор или включите его,
      чтобы услышать разницу.
    </p>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: start;
      gap: var(--kn-space-5);
      padding: var(--kn-space-6);
      border-radius: var(--kn-radius-lg);
      background: var(--docs-stage);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .grid {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-4);
      inline-size: 100%;
    }

    kn-select,
    kn-date-picker {
      inline-size: 12rem;
    }

    .loading {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-2);
      color: var(--kn-color-text-muted);
    }

    .note {
      margin: 0;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }
  `,
})
class LabelsDemo {
  protected readonly language = inject(DemoLanguage);
  protected readonly page = signal(3);

  protected set(code: unknown): void {
    if (code === 'ru' || code === 'en') this.language.code.set(code);
  }
}

interface Row {
  key: string;
  en: string;
  ru: string;
}

/** A sample argument for the labels that are functions. */
const SAMPLE: Record<string, string | number> = {
  'commandPalette.empty': 'счёт',
  'datePicker.change': '3 октября 2026 г.',
  'pagination.page': 4,
  'table.selectRow': 2,
  tagInput: 'дизайн',
};

function rows(): Row[] {
  const show = (labels: KnLabels, group: string, name: string): string => {
    const value = (labels as unknown as Record<string, Record<string, unknown>>)[group][name];
    return typeof value === 'function'
      ? (value as (arg: unknown) => string)(SAMPLE[`${group}.${name}`] ?? SAMPLE[group])
      : String(value);
  };
  return Object.entries(knLabelsEn).flatMap(([group, labels]) =>
    Object.keys(labels as object).map((name) => ({
      key: `${group}.${name}`,
      en: show(knLabelsEn, group, name),
      ru: show(knLabelsRu, group, name),
    })),
  );
}

@Component({
  imports: [DocsCode, LabelsDemo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Локализация</h1>
      <p class="lead">
        У компонентов есть собственные тексты: «Закрыть» у окна, «Следующая страница» у пагинации,
        «Ничего не найдено» у списка. Все они лежат в одном наборе, идут за языком приложения и
        переопределяются по одной.
      </p>

      <h2 id="set">Язык идёт за локалью</h2>
      <p>
        Язык приложения в Angular уже объявлен — токеном <code>LOCALE_ID</code>. Подписи компонентов
        читают его сами: для <code>ru</code> берётся русский набор, для остальных локалей —
        английский. Отдельно подключать ничего не нужно.
      </p>
      <docs-code snippet="labels-app.ts" label="Язык задаётся один раз" />

      <h2 id="override">Свои формулировки и свой язык</h2>
      <p>
        <code>provideKnLabels()</code> принимает частичный набор: перечислите только то, что
        отличается, остальное останется как в наборе локали. Подписи с подстановкой — номер
        страницы, дата — это функции. Для языка, которого нет в комплекте, передайте полный набор.
      </p>
      <docs-code snippet="labels-override.ts" label="Переопределение и собственный язык" />
      <p>
        Провайдер можно указать и в <code>providers</code> компонента — тогда набор действует только
        внутри него.
      </p>

      <h2 id="runtime">Смена языка на лету</h2>
      <p>
        Передайте функцию, которая возвращает сигнал. Компоненты читают подписи через него и
        обновляются сами — без перезагрузки и без пересоздания.
      </p>
      <docs-code snippet="labels-signal.ts" label="Набор, зависящий от сигнала" />
      <docs-labels-demo />

      <h2 id="inputs">Подпись одного компонента</h2>
      <p>Там, где текст зависит от места, у компонента есть вход — он важнее общего набора.</p>
      <docs-code snippet="labels-input.html" label="Входы важнее набора" />

      <h2 id="formats">Даты и числа</h2>
      <p>
        Форматы — не подписи: их даёт <code>Intl</code> по локали. DatePicker, Number и Number Input
        берут её из <code>LOCALE_ID</code> и принимают вход <code>locale</code>, поэтому порядок дня
        и месяца, первый день недели, разделители разрядов и названия месяцев правильны без
        словарей.
      </p>

      <h2 id="reference">Все подписи</h2>
      <p>
        Тип набора — <code>KnLabels</code>. Ключи сгруппированы по компонентам; таблица построена из
        самих наборов, поэтому не расходится с кодом.
      </p>
      <div class="scroll" tabindex="0" role="region" aria-label="Все подписи">
        <table>
          <thead>
            <tr>
              <th scope="col">Ключ</th>
              <th scope="col">English</th>
              <th scope="col">Русский</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.key) {
              <tr>
                <th scope="row">
                  <code>{{ row.key }}</code>
                </th>
                <td>{{ row.en }}</td>
                <td>{{ row.ru }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `,
  styles: `
    .scroll {
      overflow-x: auto;
    }

    .scroll:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    td {
      min-inline-size: 9rem;
    }
  `,
})
export default class LocalizationPage {
  protected readonly rows = rows();
}

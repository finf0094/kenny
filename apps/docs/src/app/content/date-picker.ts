import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnDatePicker } from '@kenny/ui/date-picker';
import { data } from '../../generated/date-picker';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/date-picker/basic.demo';
import Calendar from '../demos/date-picker/calendar.demo';

@Component({
  imports: [DocsPlayground, KnDatePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-date-picker
        style="inline-size: 13rem"
        aria-label="Дата"
        [size]="size.value()"
        [locale]="locale.value()"
        [disabled]="disabled.value()"
        [invalid]="invalid.value()"
        [(value)]="value"
      />
    </docs-playground>
  `,
})
class Playground {
  protected readonly value = signal<Date | null>(new Date());
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly locale = choice('locale', ['ru', 'en-US', 'de', 'ja']);
  protected readonly disabled = toggle('disabled');
  protected readonly invalid = toggle('invalid');
  protected readonly controls = [this.size, this.locale, this.disabled, this.invalid];
  protected readonly code = computed(
    () =>
      `<kn-date-picker aria-label="Дата" [(value)]="date"${attrs({
        size: [this.size.value(), 'md'],
        locale: [this.locale.value(), 'ru'],
        disabled: [this.disabled.value()],
        invalid: [this.invalid.value()],
      })} />`,
  );
}

export default {
  slug: 'date-picker',
  title: 'DatePicker',
  entry: 'date-picker',
  description:
    'Поле даты: дату можно напечатать в формате локали или выбрать в календаре. Календарь доступен и отдельно — как <kn-calendar>.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Поле даты и ограничения',
      description:
        'min, max и dateFilter действуют и на календарь, и на ввод с клавиатуры: недопустимая дата откатывается.',
      component: Basic,
    },
    {
      source: 'calendar',
      title: 'Календарь без поля',
      description:
        'Месяц сменяется сдвигом в сторону перехода; первый день недели и названия берутся из локали.',
      component: Calendar,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['Alt', '↓'], action: 'В поле: открывает календарь.' },
    { keys: ['Enter'], action: 'В поле: применяет введённую дату. В календаре: выбирает день.' },
    { keys: ['←', '→'], action: 'Предыдущий и следующий день.' },
    { keys: ['↑', '↓'], action: 'Тот же день недели неделей раньше или позже.' },
    { keys: ['Home', 'End'], action: 'Начало и конец недели.' },
    { keys: ['PageUp', 'PageDown'], action: 'Предыдущий и следующий месяц; с Shift — год.' },
    { keys: ['Esc'], action: 'Закрывает календарь и возвращает фокус на кнопку.' },
  ],
  a11y: [
    'Паттерн APG «Date Picker Dialog»: кнопка открывает диалог с сеткой дат (role="grid"), фокус заперт внутри.',
    'В сетке один Tab-стоп — выбранный или сегодняшний день; у каждого дня полное имя: «вторник, 10 ноября 2026 г.».',
    'Кнопка календаря озвучивает текущее значение: «Изменить дату, 10 ноября 2026 г.».',
    'Формат ввода, названия месяцев и первый день недели берутся из Intl для заданной локали — без собственных словарей.',
  ],
} satisfies ComponentDoc;

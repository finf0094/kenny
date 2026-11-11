import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnTimePicker } from '@kenny/ui/time-picker';
import { data } from '../../generated/time-picker';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, toggle } from '../core/playground';
import Basic from '../demos/time-picker/basic.demo';

@Component({
  imports: [DocsPlayground, KnTimePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-time-picker
        aria-label="Время"
        [size]="size.value()"
        [step]="step.value()"
        [hourCycle]="cycle.value() === '12' ? 12 : 24"
        [disabled]="disabled.value()"
        [(value)]="time"
      />
    </docs-playground>
  `,
})
class Playground {
  protected readonly time = signal<string | null>('09:30');
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly cycle = choice('hourCycle', ['24', '12'], '24');
  protected readonly step = range('step', 5, 1, 30);
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.size, this.cycle, this.step, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-time-picker aria-label="Время" [(value)]="time"${
        this.cycle.value() === '12' ? ' [hourCycle]="12"' : ''
      }${attrs({
        step: [this.step.value(), 1],
        size: [this.size.value(), 'md'],
        disabled: [this.disabled.value()],
      })} />`,
  );
}

export default {
  slug: 'time-picker',
  title: 'Time Picker',
  entry: 'time-picker',
  description:
    'Поле времени из сегментов: часы, минуты и, в 12-часовом формате, половина дня. Значение — строка ЧЧ:ММ в 24-часовом формате.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Интервал и 12-часовой формат',
      description:
        'Вид часов берётся из локали или задаётся входом hourCycle. Пока заполнен только один сегмент, значение остаётся null.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    {
      keys: ['0–9'],
      action: 'Набирают значение сегмента; после второй цифры фокус переходит дальше.',
    },
    { keys: ['↑', '↓'], action: 'Меняют сегмент на единицу (минуты — на шаг), по кругу.' },
    { keys: ['←', '→'], action: 'Переходят между сегментами.' },
    { keys: ['Home', 'End'], action: 'Наименьшее и наибольшее значение сегмента.' },
    { keys: ['Backspace'], action: 'Очищает сегмент.' },
    { keys: ['A', 'P'], action: 'В 12-часовом формате — до и после полудня.' },
  ],
  a11y: [
    'Группа с именем поля, внутри — сегменты с role="spinbutton" и собственными именами: «Часы», «Минуты».',
    'Сегменты — настоящие поля ввода, поэтому на телефоне открывается цифровая клавиатура.',
    'Время всегда читается слева направо, в том числе на странице с письмом справа налево.',
    'Обозначения половины дня берутся из Intl для заданной локали, а в aria-valuetext попадает текст, а не число.',
    'Внутри kn-field получает подпись и текст ошибки. Работает с Reactive Forms и signal forms.',
  ],
} satisfies ComponentDoc;

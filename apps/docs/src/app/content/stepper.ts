import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnStep, KnStepper } from '@kenny/ui/stepper';
import { data } from '../../generated/stepper';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/stepper/basic.demo';

@Component({
  imports: [DocsPlayground, KnStepper, KnStep, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <div style="display: grid; gap: 1rem; justify-items: start; min-inline-size: 20rem">
        <kn-stepper #stepper [orientation]="orientation.value()" [linear]="linear.value()" [(step)]="step">
          <kn-step label="Корзина">Проверьте состав заказа.</kn-step>
          <kn-step label="Доставка" [invalid]="invalid.value()">Укажите адрес.</kn-step>
          <kn-step label="Оплата">Выберите способ оплаты.</kn-step>
        </kn-stepper>
        <div style="display: flex; gap: 0.5rem">
          <button kn-button size="sm" variant="soft" tone="neutral" (click)="stepper.previous()">Назад</button>
          <button kn-button size="sm" (click)="stepper.next()">Далее</button>
        </div>
      </div>
    </docs-playground>
  `,
})
class Playground {
  protected readonly step = signal(1);
  protected readonly orientation = choice('orientation', ['horizontal', 'vertical']);
  protected readonly linear = toggle('linear');
  protected readonly invalid = toggle('Второй шаг invalid');
  protected readonly controls = [this.orientation, this.linear, this.invalid];
  protected readonly code = computed(
    () =>
      `<kn-stepper [(step)]="step"${attrs({
        orientation: [this.orientation.value(), 'horizontal'],
        linear: [this.linear.value()],
      })}>\n  <kn-step label="Корзина">…</kn-step>\n  <kn-step label="Доставка"${this.invalid.value() ? ' invalid' : ''}>…</kn-step>\n  <kn-step label="Оплата">…</kn-step>\n</kn-stepper>`,
  );
}

export default {
  slug: 'stepper',
  title: 'Stepper',
  entry: 'stepper',
  description:
    'Разбивает длинную задачу на последовательные шаги и показывает, сколько осталось. Подходит для оформления заказа, регистрации, мастеров настройки.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Линейный мастер с проверкой',
      description:
        'В линейном режиме вперёд ведёт только next() — приложение вызывает его после проверки шага. Назад можно вернуться кликом по шапке.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию, kn-step)', description: 'Содержимое шага; видно, пока шаг активен.' }],
  keyboard: [
    { keys: ['Tab'], action: 'Перемещается по доступным шагам в шапке, затем в содержимое.' },
    { keys: ['Enter', 'Пробел'], action: 'Переходит к шагу в фокусе.' },
  ],
  a11y: [
    'Шапка — упорядоченный список: скринридер сообщает «шаг 2 из 3». Текущий шаг отмечен aria-current="step".',
    'К названию пройденного шага добавляется скрытый текст «выполнен», к текущему — «текущий».',
    'В линейном режиме недоступные шаги — отключённые кнопки, а не скрытые элементы: структура процесса видна целиком.',
    'Линия между шагами заполняется через transform: scaleX, отметка выполненного шага появляется пружиной.',
  ],
} satisfies ComponentDoc;

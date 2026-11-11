import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';
import { KnReveal } from '@kenny/ui/motion';

const STEPS = [
  { title: 'Заявка', text: 'Клиент оставляет заявку на сайте или пишет менеджеру.' },
  { title: 'Счёт', text: 'Счёт формируется из заявки и уходит на почту.' },
  { title: 'Оплата', text: 'Банк присылает подтверждение, статус меняется сам.' },
  { title: 'Закрытие', text: 'Акт подписывается электронной подписью.' },
];

@Component({
  imports: [KnReveal, KnCard, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #scroller class="scroller" tabindex="0" role="region" aria-label="Этапы сделки">
      <p class="lead">Прокрутите область: карточки появляются, когда доходят до края.</p>
      @for (run of [runs()]; track run) {
        <div class="grid">
          @for (step of steps; track step.title; let i = $index) {
            <kn-card knReveal [knRevealIndex]="i % 2">
              <strong>{{ step.title }}</strong>
              <p>{{ step.text }}</p>
            </kn-card>
          }
        </div>
      }
    </div>
    <button kn-button variant="outline" tone="neutral" (click)="replay(scroller)">
      Показать ещё раз
    </button>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      justify-items: start;
    }

    .scroller {
      inline-size: 100%;
      max-inline-size: 34rem;
      block-size: 15rem;
      padding: var(--kn-space-4);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface-subtle);
      overflow-y: auto;
      box-sizing: border-box;
    }

    .scroller:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .lead {
      margin: 0 0 12rem;
      color: var(--kn-color-text-muted);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--kn-space-3);
    }

    p {
      margin: var(--kn-space-1) 0 0;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }
  `,
})
export default class MotionRevealDemo {
  protected readonly steps = STEPS;
  protected readonly runs = signal(0);

  protected replay(scroller: HTMLElement): void {
    scroller.scrollTop = 0;
    this.runs.update((runs) => runs + 1);
  }
}

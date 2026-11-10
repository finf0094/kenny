import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnInput } from '@kenny/ui/input';
import { KnRadio, KnRadioGroup } from '@kenny/ui/radio';
import { KnStep, KnStepper } from '@kenny/ui/stepper';

@Component({
  imports: [KnStepper, KnStep, KnButton, KnField, KnInput, KnRadioGroup, KnRadio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-stepper #stepper linear aria-label="Создание пространства" [(step)]="step">
      <kn-step label="Пространство" description="Название и адрес">
        <kn-field label="Название" [error]="nameError()">
          <input
            knInput
            placeholder="Acme"
            [value]="name()"
            (input)="name.set($any($event.target).value)"
          />
        </kn-field>
      </kn-step>
      <kn-step label="Тариф" description="Можно сменить позже">
        <kn-radio-group aria-label="Тариф" [(value)]="plan">
          <kn-radio value="free">Бесплатный — до 3 участников</kn-radio>
          <kn-radio value="team">Команда — 490 ₽ за участника</kn-radio>
        </kn-radio-group>
      </kn-step>
      <kn-step label="Готово">
        <p>
          Пространство «{{ name() }}» на тарифе «{{ plan() === 'team' ? 'Команда' : 'Бесплатный' }}»
          создано.
        </p>
      </kn-step>
    </kn-stepper>

    <div class="actions">
      <button
        kn-button
        variant="ghost"
        tone="neutral"
        [disabled]="step() === 0"
        (click)="stepper.previous()"
      >
        Назад
      </button>
      @if (step() < 2) {
        <button kn-button (click)="next(stepper)">Продолжить</button>
      } @else {
        <button kn-button variant="soft" (click)="step.set(0); name.set('')">Начать заново</button>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 36rem;
    }

    kn-field {
      max-inline-size: 20rem;
    }

    p {
      margin: 0;
    }

    .actions {
      display: flex;
      gap: var(--kn-space-2);
    }
  `,
})
export default class StepperBasicDemo {
  protected readonly step = signal(0);
  protected readonly name = signal('');
  protected readonly plan = signal<string | null>('free');
  protected readonly nameError = signal<string | null>(null);

  protected next(stepper: KnStepper): void {
    if (this.step() === 0 && !this.name().trim()) {
      this.nameError.set('Дайте пространству название');
      return;
    }
    this.nameError.set(null);
    stepper.next();
  }
}

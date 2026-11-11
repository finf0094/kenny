import { injectKnLabels } from '@kenny/ui/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { KnIcon } from '@kenny/ui/icon';

/**
 * Пошаговый процесс. Шапка — упорядоченный список шагов, текущий отмечен
 * `aria-current="step"`; содержимое активного шага показывается ниже.
 * В линейном режиме вперёд можно пройти только через `next()`.
 */
@Component({
  selector: 'kn-stepper',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="steps" [attr.aria-label]="ariaLabel() ?? labels().stepper.label">
      @for (item of steps(); track item.id; let i = $index; let last = $last) {
        <li class="step" [attr.data-state]="state(i)">
          <button
            class="trigger"
            type="button"
            [id]="item.id + '-trigger'"
            [disabled]="!canGo(i)"
            [attr.aria-current]="i === step() ? 'step' : null"
            (click)="step.set(i)"
          >
            <span class="marker" aria-hidden="true">
              @if (state(i) === 'done') {
                <kn-icon name="check" />
              } @else if (item.invalid()) {
                <kn-icon name="alert" />
              } @else {
                {{ i + 1 }}
              }
            </span>
            <span class="text">
              <span class="label">{{ item.label() }}</span>
              @if (item.description()) {
                <span class="description">{{ item.description() }}</span>
              }
              <span class="sr">{{ statusText(i) }}</span>
            </span>
          </button>
          @if (!last) {
            <span class="line" aria-hidden="true"><span class="line-fill"></span></span>
          }
        </li>
      }
    </ol>
    <ng-content />
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-orientation]': 'orientation()' },
  styles: `
    :host {
      display: block;
    }

    .steps {
      display: flex;
      gap: var(--kn-space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .step {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      min-inline-size: 0;
    }

    .step:not(:last-child) {
      flex: 1;
    }

    .trigger {
      /* Containing block for the visually hidden status text */
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      padding: var(--kn-space-1);
      padding-inline-end: var(--kn-space-2);
      border: 0;
      border-radius: var(--kn-radius-control);
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .trigger:disabled {
      cursor: default;
    }

    .trigger:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 1px;
    }

    .marker {
      position: relative;
      display: grid;
      place-items: center;
      flex: none;
      inline-size: 2rem;
      block-size: 2rem;
      border-radius: 50%;
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1.5px var(--kn-color-border-strong);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-semibold);
      font-variant-numeric: tabular-nums;
      isolation: isolate;
    }

    .marker::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: 50%;
      background: var(--kn-stepper-color, var(--kn-color-accent));
      box-shadow: var(--kn-shadow-highlight);
      opacity: 0;
      transform: scale(0.5);
      transition:
        opacity var(--kn-duration-fast) var(--kn-ease-standard),
        transform var(--kn-duration-slow) var(--kn-ease-spring);
    }

    .marker kn-icon {
      --kn-icon-size: 1rem;
      animation: kn-pop-in var(--kn-duration-slow) var(--kn-ease-spring-bouncy);
    }

    .step[data-state='active'] .marker,
    .step[data-state='done'] .marker {
      color: var(--kn-color-on-accent);
    }

    .step[data-state='active'] .marker::before,
    .step[data-state='done'] .marker::before {
      opacity: 1;
      transform: none;
    }

    .step[data-state='active'] .trigger,
    .step[data-state='done'] .trigger {
      color: var(--kn-color-text);
    }

    .text {
      display: grid;
      min-inline-size: 0;
    }

    .label {
      font-weight: var(--kn-weight-medium);
      white-space: nowrap;
    }

    .description {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .sr {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .line {
      flex: 1;
      min-inline-size: var(--kn-space-4);
      block-size: 2px;
      border-radius: 2px;
      background: var(--kn-color-border-strong);
      overflow: hidden;
    }

    .line-fill {
      display: block;
      block-size: 100%;
      background: var(--kn-stepper-color, var(--kn-color-accent));
      transform: scaleX(0);
      transform-origin: calc(50% - 50% * var(--kn-dir)) 50%;
      transition: transform var(--kn-duration-slow) var(--kn-ease-out);
    }

    .step[data-state='done'] .line-fill {
      transform: none;
    }

    /* Vertical */
    :host([data-orientation='vertical']) .steps {
      flex-direction: column;
      gap: 0;
    }

    :host([data-orientation='vertical']) .step {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }

    :host([data-orientation='vertical']) .line {
      flex: none;
      inline-size: 2px;
      block-size: var(--kn-space-6);
      min-inline-size: 0;
      margin-inline-start: calc(var(--kn-space-1) + 1rem - 1px);
    }

    :host([data-orientation='vertical']) .line-fill {
      transform: scaleY(0);
      transform-origin: 50% 0;
    }

    :host([data-orientation='vertical']) .step[data-state='done'] .line-fill {
      transform: none;
    }
  `,
})
export class KnStepper {
  protected readonly labels = injectKnLabels();
  /** Индекс активного шага. Двусторонняя привязка: `[(step)]`. */
  readonly step = model(0);
  /** Линейный режим: нельзя перепрыгнуть вперёд через незавершённые шаги. */
  readonly linear = input(false, { transform: booleanAttribute });
  /** Расположение шапки. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Доступное имя списка шагов. По умолчанию — из `provideKnLabels`. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  protected readonly steps = contentChildren(forwardRef(() => KnStep));

  /** Переходит к следующему шагу. */
  next(): void {
    this.step.set(Math.min(this.step() + 1, this.steps().length - 1));
  }

  /** Возвращается к предыдущему шагу. */
  previous(): void {
    this.step.set(Math.max(this.step() - 1, 0));
  }

  /** @internal */
  indexOf(step: KnStep): number {
    return this.steps().indexOf(step);
  }

  protected state(index: number): 'done' | 'active' | 'upcoming' {
    const current = this.step();
    return index < current ? 'done' : index === current ? 'active' : 'upcoming';
  }

  protected canGo(index: number): boolean {
    return !this.linear() || index <= this.step();
  }

  protected statusText(index: number): string {
    const labels = this.labels().stepper;
    return { done: `, ${labels.done}`, active: `, ${labels.current}`, upcoming: '' }[
      this.state(index)
    ];
  }
}

/** Шаг: подпись в шапке и содержимое, которое видно, пока шаг активен. */
@Component({
  selector: 'kn-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'group',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'id + "-trigger"',
    '[hidden]': '!active()',
  },
  styles: `
    :host {
      display: block;
      padding-block-start: var(--kn-stepper-gap, var(--kn-space-5));
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    :host([hidden]) {
      display: none;
    }
  `,
})
export class KnStep {
  /** Название шага. */
  readonly label = input.required<string>();
  /** Пояснение под названием. */
  readonly description = input<string>('');
  /** Отмечает шаг как содержащий ошибку. */
  readonly invalid = input(false, { transform: booleanAttribute });

  private readonly stepper = inject(KnStepper);
  readonly id = inject(_IdGenerator).getId('kn-step-');
  protected readonly active = computed(() => this.stepper.indexOf(this) === this.stepper.step());
}

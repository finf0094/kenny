import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnTagInput, KnTagRejection } from '@kenny/ui/tag-input';

const REASONS: Record<KnTagRejection, string> = {
  duplicate: 'уже есть в списке',
  limit: 'не поместился: можно не больше пяти',
  invalid: 'не похож на адрес почты',
};

@Component({
  imports: [KnTagInput, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field
      label="Метки задачи"
      hint="Enter или запятая добавляют метку, Backspace убирает последнюю"
    >
      <kn-tag-input placeholder="Например, дизайн" [(value)]="labels" />
    </kn-field>

    <kn-field
      label="Копия письма"
      hint="До пяти адресов. Можно вставить список через запятую или с новой строки."
      [error]="problem()"
    >
      <kn-tag-input
        placeholder="anna@orbita.example"
        [max]="5"
        [validate]="isEmail"
        [(value)]="emails"
        (rejected)="problem.set('«' + $event.tag + '» ' + reasons[$event.reason])"
        (valueChange)="problem.set(null)"
      />
    </kn-field>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 28rem;
    }
  `,
})
export default class TagInputBasicDemo {
  protected readonly labels = signal(['дизайн', 'срочно']);
  protected readonly emails = signal(['boris@orbita.example']);
  protected readonly problem = signal<string | null>(null);
  protected readonly reasons = REASONS;
  protected readonly isEmail = (tag: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag);
}

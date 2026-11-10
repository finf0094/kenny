import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';

@Component({
  imports: [KnCard, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-card>
      <h3 knCardHeader>Поверхность</h3>
      <p>Вариант по умолчанию: лежит на странице, а её край рисует выбранный стиль.</p>
      <div knCardFooter>
        <button kn-button size="sm">Открыть</button>
        <button kn-button size="sm" variant="ghost" tone="neutral">Позже</button>
      </div>
    </kn-card>

    <kn-card variant="raised">
      <h3 knCardHeader>Приподнятая</h3>
      <p>Парит над страницей, как всплывающий слой: для того, что должно выделяться.</p>
    </kn-card>

    <kn-card variant="outline">
      <h3 knCardHeader>Контур</h3>
      <p>Самый тихий вариант — когда карточек много и важен только ритм.</p>
    </kn-card>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
      gap: var(--kn-space-4);
    }

    h3 {
      margin: 0;
      font-size: var(--kn-text-lg);
      letter-spacing: var(--kn-tracking-snug);
    }

    p {
      margin: 0;
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class CardBasicDemo {}

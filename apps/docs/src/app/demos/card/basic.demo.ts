import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCard } from '@kenny/ui/card';

@Component({
  imports: [KnCard, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-card>
      <h3 knCardHeader>Стекло</h3>
      <p>Вариант по умолчанию: размывает то, что под ним, и ловит блик по верхней кромке.</p>
      <div knCardFooter>
        <button kn-button size="sm">Открыть</button>
        <button kn-button size="sm" variant="ghost" tone="neutral">Позже</button>
      </div>
    </kn-card>

    <kn-card variant="solid">
      <h3 knCardHeader>Сплошная</h3>
      <p>Непрозрачная поверхность для длинного текста и плотных данных.</p>
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

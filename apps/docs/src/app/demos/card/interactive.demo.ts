import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnCard } from '@kenny/ui/card';
import { KnIcon } from '@kenny/ui/icon';

@Component({
  imports: [KnCard, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of items; track item.title) {
      <a kn-card interactive [href]="item.href" target="_blank" rel="noopener">
        <kn-icon [name]="item.icon" [size]="22" />
        <strong>{{ item.title }}</strong>
        <span>{{ item.text }}</span>
      </a>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: var(--kn-space-4);
    }

    kn-icon {
      color: var(--kn-color-accent-text);
    }

    span {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class CardInteractiveDemo {
  protected readonly items = [
    { icon: 'book', title: 'Руководство', text: 'С чего начать в Angular', href: 'https://angular.dev/overview' },
    { icon: 'accessibility', title: 'APG', text: 'Паттерны доступности W3C', href: 'https://www.w3.org/WAI/ARIA/apg/' },
    { icon: 'layers', title: 'CDK', text: 'Примитивы, на которых стоит Kenny', href: 'https://material.angular.dev/cdk' },
  ];
}

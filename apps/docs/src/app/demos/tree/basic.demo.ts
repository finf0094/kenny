import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnBadge } from '@kenny/ui/badge';
import { KnTree, KnTreeNode, KnTreeNodeTemplate } from '@kenny/ui/tree';

const NODES: KnTreeNode<{ count?: number }>[] = [
  {
    id: 'clients',
    label: 'Клиенты',
    icon: 'user',
    children: [
      {
        id: 'orbita',
        label: 'Орбита',
        icon: 'folder',
        children: [
          { id: 'orbita-contract', label: 'Договор № 14', icon: 'file' },
          { id: 'orbita-invoices', label: 'Счета', icon: 'file', data: { count: 6 } },
        ],
      },
      { id: 'star', label: 'Полярная звезда', icon: 'folder', data: { count: 2 } },
      { id: 'greenfield', label: 'Гринфилд — архив', icon: 'archive', disabled: true },
    ],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    icon: 'chart',
    children: [
      { id: 'q3', label: 'Третий квартал', icon: 'file' },
      { id: 'q4', label: 'Четвёртый квартал', icon: 'file' },
    ],
  },
  { id: 'templates', label: 'Шаблоны писем', icon: 'mail' },
];

@Component({
  imports: [KnTree, KnTreeNodeTemplate, KnBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-tree
      aria-label="Разделы"
      [nodes]="nodes"
      [(selected)]="selected"
      [(expanded)]="expanded"
      (activated)="opened.set($event.label)"
    />
    <p class="note" aria-live="polite">
      {{ opened() ? 'Открыто: ' + opened() : 'Выберите раздел' }}
    </p>

    <kn-tree aria-label="Разделы со счётчиками" [nodes]="nodes" [expanded]="['clients']">
      <ng-template knTreeNode let-node>
        <span class="grow">{{ node.label }}</span>
        @if (node.data?.count; as count) {
          <kn-badge tone="accent">{{ count }}</kn-badge>
        }
      </ng-template>
    </kn-tree>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: var(--kn-space-4) var(--kn-space-8);
      align-items: start;
    }

    .note {
      grid-row: 2;
      margin: 0;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .grow {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export default class TreeBasicDemo {
  protected readonly nodes = NODES;
  protected readonly selected = signal<string | null>('orbita-invoices');
  protected readonly expanded = signal(['clients', 'orbita']);
  protected readonly opened = signal<string | null>(null);
}

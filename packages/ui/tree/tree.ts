import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { useRipple } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

/** Узел дерева. `id` уникален в пределах всего дерева. */
export interface KnTreeNode<T = unknown> {
  id: string;
  label: string;
  /** Имя иконки перед подписью. */
  icon?: string;
  children?: KnTreeNode<T>[];
  disabled?: boolean;
  /** Что угодно своё: приходит обратно в событиях и в шаблон узла. */
  data?: T;
}

interface Row<T> {
  node: KnTreeNode<T>;
  level: number;
  index: number;
  size: number;
  parent: string | null;
  expandable: boolean;
  expanded: boolean;
}

/** Шаблон содержимого узла: `<ng-template knTreeNode let-node let-level="level">`. */
@Directive({ selector: 'ng-template[knTreeNode]' })
export class KnTreeNodeTemplate {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Дерево по паттерну APG Tree View: разворачиваемые ветки, один выбранный узел,
 * стрелки, Home и End, поиск по первым буквам. Данные — массив узлов; какие ветки
 * раскрыты и что выбрано, хранит приложение через `[(expanded)]` и `[(selected)]`.
 */
@Component({
  selector: 'kn-tree',
  imports: [KnIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (row of rows(); track row.node.id) {
      <div
        class="row"
        role="treeitem"
        [id]="idOf(row.node)"
        [attr.data-id]="row.node.id"
        [style.--_level]="row.level"
        [attr.aria-level]="row.level"
        [attr.aria-posinset]="row.index"
        [attr.aria-setsize]="row.size"
        [attr.aria-expanded]="row.expandable ? row.expanded : null"
        [attr.aria-selected]="row.node.id === selected()"
        [attr.aria-disabled]="row.node.disabled ? 'true' : null"
        [tabindex]="row.node.id === tabStop() ? 0 : -1"
        (click)="activate(row)"
        (focus)="focused.set(row.node.id)"
      >
        @if (row.expandable) {
          <kn-icon
            class="chevron"
            name="chevron-right"
            [attr.data-open]="row.expanded ? '' : null"
            (click)="toggle(row); $event.stopPropagation()"
          />
        } @else {
          <span class="chevron" aria-hidden="true"></span>
        }
        @if (template(); as custom) {
          <ng-container
            [ngTemplateOutlet]="custom.template"
            [ngTemplateOutletContext]="{
              $implicit: row.node,
              level: row.level,
              expanded: row.expanded,
            }"
          />
        } @else {
          @if (row.node.icon; as icon) {
            <kn-icon class="icon" [name]="icon" />
          }
          <span class="label">{{ row.node.label }}</span>
        }
      </div>
    }
  `,
  host: {
    role: 'tree',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby()',
    '(keydown)': 'onKeydown($event)',
  },
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }

    .row {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--kn-space-1-5);
      min-block-size: var(--kn-tree-row, 2rem);
      padding-inline: calc(var(--kn-space-1) + (var(--_level) - 1) * var(--kn-tree-indent, 1.25rem))
        var(--kn-space-2);
      border-radius: var(--kn-tree-radius, var(--kn-radius-sm));
      color: var(--kn-color-text);
      line-height: var(--kn-leading-snug);
      cursor: pointer;
      user-select: none;
      isolation: isolate;
      -webkit-tap-highlight-color: transparent;
    }

    /* Hover and selection are layers under the content: opacity only */
    .row::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    @media (hover: hover) {
      .row:hover:not([aria-disabled='true'])::before {
        opacity: 1;
      }
    }

    .row[aria-selected='true'] {
      color: var(--kn-tree-selected-color, var(--kn-color-accent-text));
      font-weight: var(--kn-weight-medium);
    }

    .row[aria-selected='true']::before {
      background: var(--kn-tree-selected-bg, var(--kn-color-accent-soft));
      opacity: 1;
    }

    .row[aria-disabled='true'] {
      color: var(--kn-color-text-disabled);
      cursor: not-allowed;
    }

    .row:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .chevron {
      --kn-icon-size: 1rem;
      flex: none;
      inline-size: 1.25rem;
      block-size: 1.25rem;
      display: grid;
      place-items: center;
      border-radius: var(--kn-radius-xs);
      color: var(--kn-color-text-muted);
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .chevron[data-open] {
      transform: rotate(90deg);
    }

    :host-context([dir='rtl']) .chevron:not([data-open]) {
      transform: scaleX(-1);
    }

    .icon {
      --kn-icon-size: 1.125rem;
      flex: none;
      color: var(--kn-color-text-muted);
    }

    .row[aria-selected='true'] .icon {
      color: inherit;
    }

    .label {
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class KnTree<T = unknown> {
  /** Узлы верхнего уровня. */
  readonly nodes = input.required<KnTreeNode<T>[]>();
  /** `id` выбранного узла. Двусторонняя привязка: `[(selected)]`. */
  readonly selected = model<string | null>(null);
  /** `id` раскрытых веток. Двусторонняя привязка: `[(expanded)]`. */
  readonly expanded = model<string[]>([]);
  /** Доступное имя дерева. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** `id` элемента с видимым названием дерева. */
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  /** Узел выбран нажатием или клавишей Enter — время открыть то, что он обозначает. */
  readonly activated = output<KnTreeNode<T>>();

  protected readonly template = contentChild(KnTreeNodeTemplate);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dir = inject(Directionality, { optional: true });
  private readonly prefix = inject(_IdGenerator).getId('kn-tree-');
  protected readonly focused = signal<string | null>(null);
  private typed = '';
  private typedAt = 0;

  /** Visible nodes in document order: the tree as a flat list, which is how it is navigated. */
  protected readonly rows = computed(() => {
    const open = new Set(this.expanded());
    const rows: Row<T>[] = [];
    const walk = (nodes: KnTreeNode<T>[], level: number, parent: string | null): void => {
      nodes.forEach((node, i) => {
        const expandable = !!node.children?.length;
        const expanded = expandable && open.has(node.id);
        rows.push({ node, level, index: i + 1, size: nodes.length, parent, expandable, expanded });
        if (expanded) walk(node.children!, level + 1, node.id);
      });
    };
    walk(this.nodes(), 1, null);
    return rows;
  });

  /** One tab stop: the focused node, else the selected one, else the first that is enabled. */
  protected readonly tabStop = computed(() => {
    const rows = this.rows();
    const visible = (id: string | null): boolean => rows.some((row) => row.node.id === id);
    if (visible(this.focused())) return this.focused();
    if (visible(this.selected())) return this.selected();
    return rows.find((row) => !row.node.disabled)?.node.id ?? null;
  });

  constructor() {
    useRipple('.row');
  }

  protected idOf(node: KnTreeNode<T>): string {
    return `${this.prefix}-${node.id}`;
  }

  /** Раскрывает или сворачивает ветку. */
  toggle(row: { node: KnTreeNode<T>; expandable: boolean; expanded: boolean }): void {
    if (!row.expandable || row.node.disabled) return;
    const id = row.node.id;
    this.expanded.update((ids) =>
      row.expanded ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }

  protected activate(row: Row<T>): void {
    if (row.node.disabled) return;
    this.selected.set(row.node.id);
    this.toggle(row);
    this.activated.emit(row.node);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rows = this.rows();
    const index = rows.findIndex(
      (row) => row.node.id === (event.target as HTMLElement).dataset['id'],
    );
    if (index < 0) return;
    const row = rows[index];
    const rtl = this.dir?.value === 'rtl';
    const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const outward = rtl ? 'ArrowRight' : 'ArrowLeft';
    const enabled = (candidate: Row<T> | undefined): boolean =>
      !!candidate && !candidate.node.disabled;
    let target: Row<T> | undefined;
    switch (event.key) {
      case 'ArrowDown':
        target = rows.slice(index + 1).find(enabled);
        break;
      case 'ArrowUp':
        target = rows.slice(0, index).reverse().find(enabled);
        break;
      case 'Home':
        target = rows.find(enabled);
        break;
      case 'End':
        target = [...rows].reverse().find(enabled);
        break;
      case inward:
        // Closed: open. Open: step into the first child.
        if (row.expandable && !row.expanded) this.toggle(row);
        else if (row.expanded) target = rows.slice(index + 1).find(enabled);
        break;
      case outward:
        // Open: close. Otherwise: step out to the parent.
        if (row.expanded) this.toggle(row);
        else target = rows.find((candidate) => candidate.node.id === row.parent);
        break;
      case 'Enter':
      case ' ':
        this.activate(row);
        break;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        // Type-ahead: letters typed in quick succession form a prefix
        const now = Date.now();
        this.typed = now - this.typedAt > 600 ? event.key : this.typed + event.key;
        this.typedAt = now;
        const prefix = this.typed.toLowerCase();
        const from = this.typed.length > 1 ? index : index + 1;
        target = [...rows.slice(from), ...rows.slice(0, from)].find(
          (candidate) =>
            enabled(candidate) && candidate.node.label.toLowerCase().startsWith(prefix),
        );
        if (!target) return;
      }
    }
    event.preventDefault();
    if (target) this.focusNode(target.node.id);
  }

  private focusNode(id: string): void {
    this.focused.set(id);
    this.element
      .querySelector<HTMLElement>(`#${CSS.escape(this.idOf({ id } as KnTreeNode<T>))}`)
      ?.focus();
  }
}

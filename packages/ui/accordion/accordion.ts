import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { KnCollapse } from '@kenny/ui/collapse';
import { KnIcon } from '@kenny/ui/icon';

/**
 * Список раскрывающихся секций по паттерну APG Accordion. По умолчанию открыта
 * одна секция; `multiple` разрешает несколько.
 */
@Component({
  selector: 'kn-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '(keydown)': 'onKeydown($event)' },
  styles: `
    :host {
      display: block;
      border-radius: var(--kn-accordion-radius, var(--kn-radius-lg));
      background: var(--kn-accordion-bg, var(--kn-color-surface));
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-accordion-shadow, var(--kn-elevation-card));
      overflow: hidden;
    }
  `,
})
export class KnAccordion {
  /** Разрешает держать открытыми несколько секций одновременно. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Уровень заголовков секций (`aria-level`). */
  readonly headingLevel = input(3, { transform: numberAttribute });

  private readonly items = contentChildren(forwardRef(() => KnAccordionItem));
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** @internal */
  opened(item: KnAccordionItem): void {
    if (this.multiple()) return;
    for (const other of this.items()) {
      if (other !== item) other.expanded.set(false);
    }
  }

  /** Arrow keys move between headers; Home/End jump to the first/last one. */
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (!target.matches('[data-kn-accordion-trigger]')) return;
    const triggers = Array.from(
      this.element.querySelectorAll<HTMLElement>('[data-kn-accordion-trigger]:not(:disabled)'),
    ).filter((el) => el.closest('kn-accordion') === this.element);
    const index = triggers.indexOf(target);
    const next = {
      ArrowDown: triggers[(index + 1) % triggers.length],
      ArrowUp: triggers[(index - 1 + triggers.length) % triggers.length],
      Home: triggers[0],
      End: triggers[triggers.length - 1],
    }[event.key];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  }
}

/** Секция аккордеона. */
@Component({
  selector: 'kn-accordion-item',
  imports: [KnCollapse, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="heading" role="heading" [attr.aria-level]="accordion.headingLevel()">
      <button
        class="trigger"
        type="button"
        data-kn-accordion-trigger
        [id]="triggerId"
        [disabled]="disabled()"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="panelId"
        (click)="toggle()"
      >
        <span class="title"
          ><ng-content select="[knAccordionHeading]">{{ heading() }}</ng-content></span
        >
        <kn-icon class="chevron" name="chevron-down" />
      </button>
    </div>
    <kn-collapse [open]="expanded()">
      <div class="panel" role="region" [id]="panelId" [attr.aria-labelledby]="triggerId">
        <ng-content />
      </div>
    </kn-collapse>
  `,
  host: { '[attr.data-expanded]': 'expanded() ? "" : null' },
  styles: `
    :host {
      display: block;
    }

    :host + :host {
      border-block-start: 1px solid var(--kn-color-border);
    }

    .trigger {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-3);
      box-sizing: border-box;
      inline-size: 100%;
      padding: var(--kn-space-4);
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-weight: var(--kn-weight-medium);
      text-align: start;
      cursor: pointer;
    }

    .trigger::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    @media (hover: hover) {
      .trigger:hover:not(:disabled)::before {
        opacity: 1;
      }
    }

    .trigger:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -3px;
      border-radius: var(--kn-radius-md);
    }

    .trigger:disabled {
      color: var(--kn-color-text-disabled);
      cursor: not-allowed;
    }

    .title,
    .chevron {
      position: relative;
    }

    .chevron {
      --kn-icon-size: 1.125rem;
      color: var(--kn-color-text-subtle);
      transition: transform var(--kn-duration-slow) var(--kn-ease-spring);
    }

    :host([data-expanded]) .chevron {
      transform: rotate(180deg);
    }

    .panel {
      padding: 0 var(--kn-space-4) var(--kn-space-4);
      color: var(--kn-color-text-muted);
      line-height: var(--kn-leading-relaxed);
    }
  `,
})
export class KnAccordionItem {
  /** Заголовок секции. Для сложной разметки используйте слот `knAccordionHeading`. */
  readonly heading = input<string>('');
  /** Раскрыта ли секция. Двусторонняя привязка: `[(expanded)]`. */
  readonly expanded = model(false);
  /** Запрещает раскрывать и сворачивать секцию. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly accordion = inject(KnAccordion);
  private readonly ids = inject(_IdGenerator);
  protected readonly triggerId = this.ids.getId('kn-accordion-trigger-');
  protected readonly panelId = this.ids.getId('kn-accordion-panel-');

  protected toggle(): void {
    const next = !this.expanded();
    this.expanded.set(next);
    if (next) this.accordion.opened(this);
  }
}

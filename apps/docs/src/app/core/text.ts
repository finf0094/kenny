import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Text with inline code. Descriptions come from JSDoc comments in the library sources,
 * where identifiers are wrapped in backticks; here they become `<code>` elements.
 */
@Component({
  selector: 'docs-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Elements, not bare interpolations: whitespace between them is dropped by the compiler,
  // so a formatter can never introduce a space next to a bracket or a full stop.
  template: `
    @for (part of parts(); track $index) {
      @if (part.code) {
        <code>{{ part.text }}</code>
      } @else {
        <span>{{ part.text }}</span>
      }
    }
  `,
  styles: `
    :host {
      display: contents;
    }

    code {
      padding: 0.1em 0.35em;
      border-radius: var(--kn-radius-xs);
      background: var(--kn-color-surface-sunken);
      font-size: 0.92em;
      overflow-wrap: anywhere;
    }
  `,
})
export class DocsText {
  readonly text = input.required<string>();

  /** Odd segments of a split by backticks are code. An unpaired backtick stays literal. */
  protected readonly parts = computed(() => {
    const segments = this.text().split('`');
    if (segments.length % 2 === 0) return [{ code: false, text: this.text() }];
    return segments
      .map((text, index) => ({ code: index % 2 === 1, text }))
      .filter((part) => part.text !== '');
  });
}

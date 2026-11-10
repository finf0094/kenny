import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { KnTooltip } from '@kenny/ui/tooltip';
import { snippets } from '../../generated/snippets';
import { DemoSource } from './doc-types';

/**
 * Code with a copy button. Takes either a generated source (highlighted at build time)
 * or the name of a file from `app/snippets`, or plain text for computed code.
 */
@Component({
  selector: 'docs-code',
  imports: [KnButton, KnIcon, KnTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (html(); as markup) {
      <div
        class="code"
        tabindex="0"
        role="region"
        [attr.aria-label]="label()"
        [innerHTML]="markup"
      ></div>
    } @else {
      <pre
        class="code plain"
        tabindex="0"
        role="region"
        [attr.aria-label]="label()"
      ><code>{{ text() }}</code></pre>
    }
    <button
      class="copy"
      kn-icon-button
      size="sm"
      variant="glass"
      tone="neutral"
      [attr.aria-label]="copied() ? 'Скопировано' : 'Скопировать код'"
      [knTooltip]="copied() ? 'Скопировано' : 'Скопировать'"
      (click)="copy()"
    >
      <kn-icon [name]="copied() ? 'check' : 'copy'" />
    </button>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      border-radius: var(--kn-radius-md);
      background: var(--kn-color-surface-sunken);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .code {
      margin: 0;
      max-block-size: var(--docs-code-max, 28rem);
      padding: var(--kn-space-4) var(--kn-space-12) var(--kn-space-4) var(--kn-space-4);
      overflow: auto;
      border-radius: inherit;
      font-family: var(--kn-font-mono);
      font-size: var(--kn-text-sm);
      line-height: 1.6;
      tab-size: 2;
      /* Code reads left to right in every locale */
      direction: ltr;
      text-align: left;
    }

    .code:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .code ::ng-deep pre {
      margin: 0;
      background: none !important;
      font: inherit;
    }

    .code ::ng-deep code,
    .plain code {
      font: inherit;
      padding: 0;
      background: none;
    }

    .copy {
      position: absolute;
      inset-block-start: var(--kn-space-2);
      inset-inline-end: var(--kn-space-2);
    }
  `,
})
export class DocsCode {
  /** Highlighted source generated from a real file. */
  readonly source = input<DemoSource | null>(null);
  /** File name in `app/snippets`. */
  readonly snippet = input<string>('');
  /** Plain code computed at runtime (playground output). */
  readonly code = input<string>('');
  readonly label = input<string>('Пример кода');

  private readonly sanitizer = inject(DomSanitizer);
  private readonly clipboard = inject(Clipboard);
  protected readonly copied = signal(false);

  private readonly resolved = computed(() => this.source() ?? snippets[this.snippet()] ?? null);
  protected readonly text = computed(() => this.resolved()?.code ?? this.code());
  /** Markup is produced by the build script from repository files, so it is trusted. */
  protected readonly html = computed(() => {
    const source = this.resolved();
    return source ? this.sanitizer.bypassSecurityTrustHtml(source.html) : null;
  });

  protected copy(): void {
    if (this.clipboard.copy(this.text())) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    }
  }
}
